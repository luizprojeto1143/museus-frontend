
const fs = require('fs');
const path = 'C:\\Users\\luiza\\Documents\\PicWish\\Cultura Viva\\museus-frontend\\src\\modules\\producer\\pages\\ProducerFinance.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/type=PROVIDER/g, 'type=PRODUCER');

fs.writeFileSync(path, content, 'utf8');
console.log('Updated ProducerFinance.tsx');

