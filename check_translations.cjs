
const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

const translationFile = path.join(__dirname, 'src/i18n/locales/pt-br.json');
const translationContent = JSON.parse(fs.readFileSync(translationFile, 'utf8'));

function getNestedValue(obj, key) {
    return key.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
}

const files = getAllFiles(path.join(__dirname, 'src/modules'));
const missingKeys = new Set();
const dynamicKeys = new Set();

const regex = /t\(['"]([a-zA-Z0-9_.]+)['"]/g;

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = regex.exec(content)) !== null) {
        const key = match[1];
        if (key.includes('${')) {
            dynamicKeys.add(key);
        } else {
            if (!getNestedValue(translationContent, key)) {
                missingKeys.add(key);
            }
        }
    }
});

console.log("--- MISSING KEYS ---");
missingKeys.forEach(key => console.log(key));
console.log("\n--- DYNAMIC KEYS (Potential Issues) ---");
dynamicKeys.forEach(key => console.log(key));
