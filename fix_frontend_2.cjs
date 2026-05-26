const fs = require('fs');
const path = require('path');

const basePath = 'C:\\Users\\luiza\\Documents\\PicWish\\Cultura Viva\\museus-frontend';

function replaceRegexInFile(relativePath, regex, replacement) {
    const fullPath = path.join(basePath, relativePath);
    if (!fs.existsSync(fullPath)) return;
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(regex, replacement);
    fs.writeFileSync(fullPath, content, 'utf8');
}

// AdminTrailForm.tsx - Add useState, useEffect
replaceRegexInFile('src/modules/admin/pages/AdminTrailForm.tsx', /import \{ useTranslation \}/g, 'import React, { useState, useEffect } from "react";\nimport { useTranslation }');
// AdminTrailForm.tsx - Fix addToast
replaceRegexInFile('src/modules/admin/pages/AdminTrailForm.tsx', /addToast\(/g, 'toast.success(');
// AdminTrailForm.tsx - implicit any
replaceRegexInFile('src/modules/admin/pages/AdminTrailForm.tsx', /\(w\)/g, '(w: any)');
replaceRegexInFile('src/modules/admin/pages/AdminTrailForm.tsx', /\(sw\)/g, '(sw: any)');
replaceRegexInFile('src/modules/admin/pages/AdminTrailForm.tsx', /\(prev\)/g, '(prev: any)');
replaceRegexInFile('src/modules/admin/pages/AdminTrailForm.tsx', /\(e\)/g, '(e: any)');
replaceRegexInFile('src/modules/admin/pages/AdminTrailForm.tsx', /\(work\)/g, '(work: any)');
replaceRegexInFile('src/modules/admin/pages/AdminTrailForm.tsx', /\(work, idx\)/g, '(work: any, idx: any)');

// AdminWorkForm.tsx - toast info
replaceRegexInFile('src/modules/admin/pages/AdminWorkForm.tsx', /toast\.success\('Copiado para a área de transferência!', "info"\)/g, 'toast("Copiado para a área de transferência!", { icon: "ℹ️" })');
// AdminWorkForm.tsx - Dialog onClose
replaceRegexInFile('src/modules/admin/pages/AdminWorkForm.tsx', /onClose=\{/g, 'onOpenChange={');

// MasterMessages.tsx - History -> div size issue
replaceRegexInFile('src/modules/master/pages/MasterMessages.tsx', /<div size=\{24\}/g, '<div');

// MasterSystemHealth.tsx - Activity duplicate
replaceRegexInFile('src/modules/master/pages/MasterSystemHealth.tsx', /import \{ Activity, Activity/g, 'import { Activity');
replaceRegexInFile('src/modules/master/pages/MasterSystemHealth.tsx', /import \{ (.*?)CloudPulse(.*?) \}/g, 'import { $1Activity$2 }');
replaceRegexInFile('src/modules/master/pages/MasterSystemHealth.tsx', /import \{ Activity \} from "lucide-react";\nimport \{ Activity \} from "lucide-react";/g, 'import { Activity } from "lucide-react";');

// ProviderInvoices.tsx
replaceRegexInFile('src/modules/provider/ProviderInvoices.tsx', /const \{ id \} = useAuth\(\);/g, 'const { user } = useAuth();\nconst id = user?.id;');

// TheaterCast.tsx
replaceRegexInFile('src/modules/theater/pages/TheaterCast.tsx', /\(tag\)/g, '(tag: any)');

// AdminEventForm.tsx - Eye
replaceRegexInFile('src/modules/admin/pages/AdminEventForm.tsx', /<Eye size=\{18\}/g, '<div');
replaceRegexInFile('src/modules/admin/pages/AdminEventForm.tsx', /<Eye /g, '<div ');

// AdminEvents.tsx - Link in Button
replaceRegexInFile('src/modules/admin/pages/AdminEvents.tsx', /as=\{Link\}/g, '');

console.log('Second pass fixes applied.');
