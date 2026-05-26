
const fs = require('fs');
const path = 'C:\\Users\\luiza\\Documents\\PicWish\\Cultura Viva\\museus-frontend\\src\\styles.css';
let content = fs.readFileSync(path, 'utf8');

const btnMatches = content.match(/\.btn\s*\{[^}]+\}/g);
console.log('Button definitions:', btnMatches);

