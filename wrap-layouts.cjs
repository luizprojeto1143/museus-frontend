const fs = require('fs');
const path = require('path');

function wrapLabelsInT(filePath, prefix) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Ensure useTranslation is imported
    if (!content.includes('useTranslation')) {
        content = 'import { useTranslation } from "react-i18next";\n' + content;
    }

    // A simple regex to replace label: "Text" with label: t("prefix.key", "Text")
    // We'll generate a key from the text by camelCasing it.

    function toCamelCase(str) {
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
    }

    let keysToAdd = {};

    content = content.replace(/label:\s*"(.*?)"/g, (match, text) => {
        // if text is empty or looks like t( it's bad, but the regex won't catch t( because of quotes and spaces
        if (!text || text.match(/[\{\}]/)) return match; // skip complex things
        const key = toCamelCase(text);
        const fullKey = `${prefix}.${key}`;
        keysToAdd[fullKey] = text;
        return `label: t("${fullKey}", "${text}")`;
    });

    // Also replace hardcoded group labels
    content = content.replace(/label:\s*isCityMode \? "(.*?)" : "(.*?)"/g, (match, cityText, museumText) => {
        const cityKey = `${prefix}.${toCamelCase(cityText)}`;
        const museumKey = `${prefix}.${toCamelCase(museumText)}`;
        keysToAdd[cityKey] = cityText;
        keysToAdd[museumKey] = museumText;
        return `label: isCityMode ? t("${cityKey}", "${cityText}") : t("${museumKey}", "${museumText}")`;
    });


    fs.writeFileSync(filePath, content, 'utf8');
    return keysToAdd;
}

const adminKeys = wrapLabelsInT('src/modules/admin/AdminLayout.tsx', 'admin.sidebar');
const masterKeys = wrapLabelsInT('src/modules/master/MasterLayout.tsx', 'master.sidebar');

let allKeys = { ...adminKeys, ...masterKeys };

// Add to pt-br.json
const ptPath = 'src/i18n/locales/pt-br.json';
const pt = JSON.parse(fs.readFileSync(ptPath, 'utf8'));

if (!pt.admin.sidebar) pt.admin.sidebar = {};
if (!pt.master.sidebar) pt.master.sidebar = {};

for (const [keyPath, value] of Object.entries(adminKeys)) {
    const key = keyPath.split('.')[2];
    pt.admin.sidebar[key] = value;
}

for (const [keyPath, value] of Object.entries(masterKeys)) {
    const key = keyPath.split('.')[2];
    pt.master.sidebar[key] = value;
}

// Add MasterLayout missing texts specifically
if (fs.readFileSync('src/modules/master/MasterLayout.tsx', 'utf8').includes('Master Panel')) {
    let m = fs.readFileSync('src/modules/master/MasterLayout.tsx', 'utf8');
    m = m.replace(/>Master Panel</g, '>{t("master.layout.panel", "Master Panel")}<');
    m = m.replace(/>Gestão Global</g, '>{t("master.layout.management", "Gestão Global")}<');
    m = m.replace(/>Sair</g, '>{t("master.layout.logout", "Sair")}<');
    if (!pt.master.layout) pt.master.layout = {};
    pt.master.layout.panel = "Master Panel";
    pt.master.layout.management = "Gestão Global";
    pt.master.layout.logout = "Sair";
    fs.writeFileSync('src/modules/master/MasterLayout.tsx', m, 'utf8');
}

fs.writeFileSync(ptPath, JSON.stringify(pt, null, 2));

console.log('Saved modified layouts and pt-br.json with layout keys.');
