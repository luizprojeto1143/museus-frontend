import fs from 'fs';
import path from 'path';

const pagesDir = path.resolve('src/modules/admin/pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));

const replacements = [
    // Backgrounds "brancos" para "glassmorphism dark e bordas douradas sutis"
    { from: /bg-white/g, to: 'bg-zinc-900/40 border border-gold/20' },
    { from: /bg-slate-50/g, to: '' },
    { from: /bg-slate-100/g, to: 'bg-zinc-800/50' },
    { from: /bg-gray-50/g, to: '' },
    { from: /bg-gray-100/g, to: 'bg-zinc-800/50' },

    // Textos Escuros para Claros (Para contrastar no Dark Mode)
    { from: /text-slate-900/g, to: 'text-zinc-100' },
    { from: /text-slate-800/g, to: 'text-zinc-100' },
    { from: /text-slate-700/g, to: 'text-zinc-200' },
    { from: /text-slate-600/g, to: 'text-zinc-400' },
    { from: /text-slate-500/g, to: 'text-zinc-400' },

    { from: /text-gray-900/g, to: 'text-zinc-100' },
    { from: /text-gray-800/g, to: 'text-zinc-100' },
    { from: /text-gray-700/g, to: 'text-zinc-200' },
    { from: /text-gray-600/g, to: 'text-zinc-400' },
    { from: /text-gray-500/g, to: 'text-zinc-400' },

    // Bordas Claras para Escuras
    { from: /border-slate-200/g, to: 'border-zinc-800' },
    { from: /border-slate-300/g, to: 'border-zinc-700' },
    { from: /border-gray-200/g, to: 'border-zinc-800' },
    { from: /border-gray-300/g, to: 'border-zinc-700' },
];

files.forEach(file => {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Applica Replacements iterativamente
    replacements.forEach(rule => {
        content = content.replace(rule.from, rule.to);
    });

    // Enche a marca d'água de arquivo compartilhado CSS base se modificou e não tem
    if (content !== originalContent && !content.includes('AdminShared.css')) {
        const importStatement = 'import "./AdminShared.css";\n';
        const lines = content.split('\n');
        let lastImportIndex = -1;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('import ')) {
                lastImportIndex = i;
            }
        }
        if (lastImportIndex !== -1) {
            lines.splice(lastImportIndex + 1, 0, importStatement);
            content = lines.join('\n');
        } else {
            content = importStatement + content;
        }
    }

    // Só escreve os que realmente foram modificados
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated Premium Theme: ${file}`);
    }
});

console.log('✅ Migração Concluída!');
