import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.resolve(__dirname, '../src/modules');

const walk = (dir, callback) => {
    fs.readdirSync(dir).forEach(file => {
        const filepath = path.join(dir, file);
        if (fs.statSync(filepath).isDirectory()) {
            walk(filepath, callback);
        } else if (filepath.endsWith('.tsx') && !filepath.includes('node_modules')) {
            callback(filepath);
        }
    });
};

const regexReplacements = [
    {
        pattern: /#d4af37|#b8941f|#e6c86a/gi,
        replace: 'var(--accent-primary)'
    },
    {
        pattern: /#cd7f32|#a05a18|#e3bba3/gi,
        replace: 'var(--accent-secondary)'
    },
    {
        pattern: /#3b82f6|#2563eb|#1d4ed8/gi,
        replace: 'var(--accent-primary)'
    },
    {
       pattern: /text-blue-500|text-blue-600/g,
       replace: 'text-[var(--accent-primary)]'
    },
    {
       pattern: /bg-blue-500|bg-blue-600/g,
       replace: 'bg-[var(--accent-primary)]'
    },
    {
       pattern: /className=["']btn[\s]+btn-primary["']/g,
       replace: 'className="inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wider transition-colors cursor-pointer border bg-[var(--accent-primary)] text-[var(--fg-inverse)] border-transparent shadow-[var(--shadow-glow)] text-[13px] px-5 py-2.5 rounded-[var(--radius-md)]"'
    },
    {
       pattern: /className=["']btn[\s]+btn-secondary["']/g,
       replace: 'className="inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wider transition-colors cursor-pointer border bg-[var(--glass-bg-light)] text-[var(--fg-main)] border-[var(--border-default)] backdrop-blur-sm text-[13px] px-5 py-2.5 rounded-[var(--radius-md)]"'
    },
    {
       pattern: /className=["']btn[\s]+btn-danger["']/g,
       replace: 'className="inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wider transition-colors cursor-pointer border bg-red-600 text-[var(--fg-main)] border-transparent hover:bg-red-700 text-[13px] px-5 py-2.5 rounded-[var(--radius-md)]"'
    },
    {
       pattern: /className=["']btn[\s]+btn-outline["']/g,
       replace: 'className="inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wider transition-colors cursor-pointer border bg-transparent text-[var(--accent-primary)] border-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-[var(--fg-inverse)] text-[13px] px-5 py-2.5 rounded-[var(--radius-md)]"'
    },
    {
       pattern: /className=["']btn["']/g,
       replace: 'className="inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wider transition-colors cursor-pointer border bg-[var(--bg-surface-hover)] text-[var(--fg-main)] border-[var(--border-default)] text-[13px] px-5 py-2.5 rounded-[var(--radius-md)]"'
    },
    {
       pattern: /className=["']card["']/g,
       replace: 'className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-surface)] rounded-[var(--radius-lg)] p-6 transition-colors"'
    },
    {
       pattern: / className=["']stat-value["']/g,
       replace: ' className="tabular-nums tracking-tight font-bold text-3xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent"'
    },
    {
       pattern: / className=["']stat-card["']/g,
       replace: ' className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-surface)] rounded-[var(--radius-lg)] p-6 mb-4"'
    }
];

let filesModifiedCount = 0;

walk(SRC_DIR, (file) => {
    let content = fs.readFileSync(file, 'utf8');
    let hasChanges = false;
    
    // Run simple string and regex replacements
    regexReplacements.forEach(rule => {
        if (content.match(rule.pattern)) {
            content = content.replace(rule.pattern, rule.replace);
            hasChanges = true;
        }
    });

    if (hasChanges) {
        fs.writeFileSync(file, content, 'utf8');
        filesModifiedCount++;
        console.log(`Updated patterns in: ${path.relative(__dirname, file)}`);
    }
});

console.log(`\nMigration completed. ${filesModifiedCount} files updated successfully.`);
