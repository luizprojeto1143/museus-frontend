const fs = require('fs');
const path = require('path');

const basePath = 'C:\\Users\\luiza\\Documents\\PicWish\\Cultura Viva\\museus-frontend';

function addLucideIcons(relativePath, iconsToAdd) {
    const fullPath = path.join(basePath, relativePath);
    if (!fs.existsSync(fullPath)) return;
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Find lucide-react import
    const lucideRegex = /import\s+\{\s*([\s\S]*?)\}\s+from\s+["']lucide-react["'];/m;
    const match = content.match(lucideRegex);
    
    if (match) {
        const existingIcons = match[1];
        const newIcons = existingIcons.trimEnd() + (existingIcons.trim().endsWith(',') ? '' : ',') + '\n    ' + iconsToAdd.join(', ') + ',\n';
        content = content.replace(lucideRegex, `import {\n${newIcons}} from "lucide-react";`);
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Fixed lucide-react in ${relativePath}`);
    } else {
        // Add import at the top
        content = `import { ${iconsToAdd.join(', ')} } from "lucide-react";\n` + content;
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Added lucide-react to ${relativePath}`);
    }
}

function replaceInFile(relativePath, replacements) {
    const fullPath = path.join(basePath, relativePath);
    if (!fs.existsSync(fullPath)) return;
    let content = fs.readFileSync(fullPath, 'utf8');
    for (const [from, to] of replacements) {
        content = content.split(from).join(to);
    }
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Fixed simple replaces in ${relativePath}`);
}

addLucideIcons('src/modules/master/pages/MasterAccessibilityRequests.tsx', ['RefreshCw']);
addLucideIcons('src/modules/master/pages/MasterAchievementForm.tsx', ['RefreshCw']);
addLucideIcons('src/modules/master/pages/MasterPlans.tsx', ['User', 'Code']);
addLucideIcons('src/modules/master/pages/MasterSystemHealth.tsx', ['Activity']);
replaceInFile('src/modules/master/pages/MasterSystemHealth.tsx', [['<CloudPulse', '<Activity']]);
addLucideIcons('src/modules/master/pages/MasterUsers.tsx', ['Crown']);
addLucideIcons('src/modules/master/pages/TenantForm.tsx', ['Calendar']);
addLucideIcons('src/modules/producer/ProducerLayout.tsx', ['QrCode']);
addLucideIcons('src/modules/provider/ProviderSettings.tsx', ['Mail', 'Briefcase', 'DollarSign']);

replaceInFile('src/modules/master/pages/MasterMessages.tsx', [
    ['<History', '<div'],
    ['</History>', '</div>']
]);

console.log('Lucide TS fixes applied.');
