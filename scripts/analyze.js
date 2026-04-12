const fs = require('fs');
let content = fs.readFileSync('public/OffswitchFormatted.xml', 'utf8');
const lines = content.split('\n');

const paths = lines.map((line, idx) => {
    const dMatch = line.match(/d="([^"]+)"/);
    if (!dMatch) return null;
    let d = dMatch[1];
    
    // Naively extract all numbers
    let nums = [...d.matchAll(/(-?\d+\.?\d*)/g)].map(m => parseFloat(m[1]));
    if(nums.length === 0) return null;
    
    let minX = Infinity, maxX = -Infinity
    
    // Very rough heuristic to estimate X position, assuming m starts with X and moves are somewhat horizontal
    const firstX = nums[0];
    
    return { 
        id: idx + 1, 
        firstX,
        fill: line.match(/fill="([^"]+)"/)?.[1], 
        stroke: line.match(/stroke="([^"]+)"/)?.[1] || "none",
        isWireLike: d.includes('c') ? false : (nums.length <= 10 && line.includes('stroke') ? true : false)
    };
}).filter(Boolean);

paths.sort((a,b) => a.firstX - b.firstX);
console.table(paths.map(p => ({
    Line: p.id,
    X: Math.round(p.firstX),
    Fill: p.fill,
    Stroke: p.stroke,
    WireEst: p.isWireLike
})));
