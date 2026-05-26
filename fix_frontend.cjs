const fs = require('fs');
const path = require('path');

const basePath = 'C:\\Users\\luiza\\Documents\\PicWish\\Cultura Viva\\museus-frontend';

function replaceInFile(relativePath, replacements) {
    const fullPath = path.join(basePath, relativePath);
    if (!fs.existsSync(fullPath)) return;
    let content = fs.readFileSync(fullPath, 'utf8');
    for (const [from, to] of replacements) {
        // Can be string or regex
        content = content.split(from).join(to);
    }
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Fixed ${relativePath}`);
}

function regexReplace(relativePath, regex, to) {
    const fullPath = path.join(basePath, relativePath);
    if (!fs.existsSync(fullPath)) return;
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(regex, to);
    fs.writeFileSync(fullPath, content, 'utf8');
}

// 1. AdminWorkForm.tsx
replaceInFile('src/modules/admin/pages/AdminWorkForm.tsx', [
    ['import { useTranslation }', 'import React, { useState, useEffect } from "react";\nimport { useTranslation }'],
    ['addToast(', 'toast.success('],
    ['isOpen=', 'open='],
    ['(prev)', '(prev: any)'],
    ['(c)', '(c: any)'],
    ['(item)', '(item: any)'],
    ['(e)', '(e: any)']
]);

// 2. AdminWorks.tsx
replaceInFile('src/modules/admin/pages/AdminWorks.tsx', [
    ['icon={<', '/* icon={<'] // We will just use regex to remove icon prop
]);
regexReplace('src/modules/admin/pages/AdminWorks.tsx', /icon=\{<[^>]+>\}/g, '');

// 3. MasterAccessibilityRequests.tsx
replaceInFile('src/modules/master/pages/MasterAccessibilityRequests.tsx', [
    ['import { ', 'import { RefreshCw, ']
]);

// 4. MasterAchievementForm.tsx
replaceInFile('src/modules/master/pages/MasterAchievementForm.tsx', [
    ['import { ', 'import { RefreshCw, ']
]);

// 5. MasterMessages.tsx
replaceInFile('src/modules/master/pages/MasterMessages.tsx', [
    ['<History', '<div'],
    ['</History>', '</div>']
]);

// 6. MasterPlans.tsx
replaceInFile('src/modules/master/pages/MasterPlans.tsx', [
    ['import { ', 'import { User, Code, ']
]);

// 7. MasterSystemHealth.tsx
replaceInFile('src/modules/master/pages/MasterSystemHealth.tsx', [
    ['CloudPulse', 'Activity']
]);

// 8. MasterUsers.tsx
replaceInFile('src/modules/master/pages/MasterUsers.tsx', [
    ['import { ', 'import { Crown, ']
]);

// 9. TenantForm.tsx
replaceInFile('src/modules/master/pages/TenantForm.tsx', [
    ['import { ', 'import { Calendar, ']
]);

// 10. MunicipalSettings.tsx
regexReplace('src/modules/municipal/MunicipalSettings.tsx', /icon=\{<[^>]+>\}/g, '');

// 11. ProducerLayout.tsx
replaceInFile('src/modules/producer/ProducerLayout.tsx', [
    ['import { ', 'import { QrCode, ']
]);

// 12. ProviderInvoices.tsx
regexReplace('src/modules/provider/ProviderInvoices.tsx', /const \{ id \} = useAuth\(\);/g, 'const { user } = useAuth();\nconst id = user?.id;');

// 13. ProviderSettings.tsx
replaceInFile('src/modules/provider/ProviderSettings.tsx', [
    ['import { ', 'import { Mail, Briefcase, DollarSign, ']
]);

// 14. TheaterCast.tsx
regexReplace('src/modules/theater/pages/TheaterCast.tsx', /\(tag\)/g, '(tag: any)');

console.log('Frontend TS fixes applied.');
