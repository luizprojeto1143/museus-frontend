const fs = require('fs');
const path = require('path');

const directoryPath = 'c:/Users/luiza/Documents/PicWish/museus-frontend/src/modules/admin/pages';

const replacements = {
    // Backgrounds
    'bg-white': 'bg-zinc-900/40',
    'bg-slate-50': 'bg-zinc-900/60',
    'bg-slate-100': 'bg-zinc-800/50',
    'bg-slate-200': 'bg-zinc-800',
    'bg-gray-50': 'bg-zinc-900/60',
    'bg-gray-100': 'bg-zinc-800/50',

    // Text Colors
    'text-slate-900': 'text-white',
    'text-slate-800': 'text-white',
    'text-slate-700': 'text-zinc-200',
    'text-slate-600': 'text-zinc-300',
    'text-slate-500': 'text-zinc-400',
    'text-slate-400': 'text-zinc-500',
    'text-gray-900': 'text-white',
    'text-gray-800': 'text-white',
    'text-gray-700': 'text-zinc-200',
    'text-gray-600': 'text-zinc-300',
    'text-gray-500': 'text-zinc-400',

    // Borders
    'border-slate-100': 'border-white/5',
    'border-slate-200': 'border-white/10',
    'border-slate-300': 'border-white/20',
    'border-gray-100': 'border-white/5',
    'border-gray-200': 'border-white/10',

    // Divides
    'divide-slate-100': 'divide-white/5',
    'divide-slate-200': 'divide-white/10',
    'divide-gray-100': 'divide-white/5',

    // Specific patterns that often pair with bg-white
    'shadow-sm': 'shadow-md shadow-black/20',

    // Accent colors adjustment (optional, mostly making sure indigo fits the dark theme or swapping to gold)
    'text-indigo-600': 'text-gold-light',
    'text-indigo-500': 'text-gold',
    'bg-indigo-50': 'bg-gold/10',
    'bg-indigo-100': 'bg-gold/20',
    'bg-indigo-500': 'bg-gold',
    'bg-indigo-600': 'bg-gold-dark',
    'border-indigo-100': 'border-gold/20',
    'border-indigo-500': 'border-gold',
};

fs.readdir(directoryPath, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }

    const tsxFiles = files.filter(f => f.endsWith('.tsx') && f.startsWith('Admin'));
    let filesModified = 0;

    tsxFiles.forEach(file => {
        const filePath = path.join(directoryPath, file);
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;

        // Apply exact replacements
        // Use regex with word boundaries for safe replacement of tailwind classes
        Object.keys(replacements).forEach(search => {
            const replace = replacements[search];
            // Regex explains: match the exact class name (bounded by space, quote, or backtick)
            const regex = new RegExp(`(?<=[\\s"'\\\`])${search}(?=[\\s"'\\\`])`, 'g');
            content = content.replace(regex, replace);
        });

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated theme classes in ${file}`);
            filesModified++;
        }
    });

    console.log(`\nFinished! Modified ${filesModified} files.`);
});
