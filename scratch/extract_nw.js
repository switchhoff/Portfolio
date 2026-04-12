const fs = require('fs');
const path = require('path');

const svgFile = 'd:/Users/61403/Documents/Developer/HoffSwitch/public/gkTJQ01.svg';
const data = fs.readFileSync(svgFile, 'utf8');
const paths = [];

// More robust regex for multi-line and single-line paths
const matches = data.match(/<path[\s\S]*?d="([\s\S]*?)"/g);

if (matches) {
    matches.forEach(m => {
        const d = m.match(/d="([\s\S]*?)"/)[1];
        paths.push(d.replace(/\s+/g, ' ').trim());
    });
}

console.log(JSON.stringify(paths, null, 2));
