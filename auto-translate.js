import fs from 'fs';

const pt = JSON.parse(fs.readFileSync('src/i18n/locales/pt-br.json', 'utf8'));
const en = JSON.parse(fs.readFileSync('src/i18n/locales/en.json', 'utf8'));
const es = JSON.parse(fs.readFileSync('src/i18n/locales/es.json', 'utf8'));

async function translateText(text, targetLang) {
    if (!text || typeof text !== 'string') return text;
    // Skip if it looks like a tag or interpolation
    if (text.includes('{{') || text.includes('}}')) return text;

    try {
        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=pt&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
        const data = await res.json();
        return data[0].map(item => item[0]).join('');
    } catch (e) {
        console.error('Translation error for:', text, e.message);
        return text;
    }
}

async function translateMissing(base, target, targetLang) {
    for (const key in base) {
        if (typeof base[key] === 'object' && base[key] !== null) {
            if (target[key] === undefined) target[key] = {};
            await translateMissing(base[key], target[key], targetLang);
        } else {
            if (target[key] === undefined) {
                target[key] = await translateText(base[key], targetLang);
                console.log(`Translated [${targetLang}] ${key}: ${target[key]}`);
                await new Promise(r => setTimeout(r, 150)); // Slightly longer delay
            }
        }
    }
}

async function run() {
    console.log("Translating to EN...");
    await translateMissing(pt, en, 'en');
    console.log("Translating to ES...");
    await translateMissing(pt, es, 'es');

    fs.writeFileSync('src/i18n/locales/en.json', JSON.stringify(en, null, 2));
    fs.writeFileSync('src/i18n/locales/es.json', JSON.stringify(es, null, 2));
    console.log('Translation complete!');
}

run();
