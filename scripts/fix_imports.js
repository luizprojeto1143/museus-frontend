import fs from 'fs';
import path from 'path';

const pagesDir = path.resolve('src/modules/admin/pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Se o import "./AdminShared.css" foi injetado imediatamente após "import {" (com ou sem espaços/r/n)
    const badPattern1 = /import\s*\{\s*\n\s*import "\.\/AdminShared\.css";/g;
    const badPattern2 = /import\s*\{\s*\r\n\s*import "\.\/AdminShared\.css";/g;

    if (badPattern1.test(content) || badPattern2.test(content)) {
        // Remove o import daqui
        content = content.replace(badPattern1, 'import {\n');
        content = content.replace(badPattern2, 'import {\r\n');

        // Agora precisa inserir no final das importaes de verdade
        // Vamos procurar o último "} from" ou "import " que NÃO seja parte de um bloco quebrado
        const lines = content.split('\n');
        let insertIndex = -1;
        for (let i = lines.length - 1; i >= 0; i--) {
            if (lines[i].includes('} from') || lines[i].match(/^import\s+['"]/)) {
                insertIndex = i;
                break;
            }
        }

        if (insertIndex !== -1) {
            lines.splice(insertIndex + 1, 0, 'import "./AdminShared.css";');
            content = lines.join('\n');
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Corrigido sintaxe de import em: ${file}`);
        } else {
            console.log(`Não foi possível achar onde inserir em: ${file}`);
        }
    }
});
