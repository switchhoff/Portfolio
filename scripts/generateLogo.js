const fs = require('fs');

try {
  let xml = fs.readFileSync('public/OffswitchFormatted.xml', 'utf8');

  xml = xml.replace(/([a-z]+)-([a-z]+)=/g, (match, p1, p2) => p1 + p2.charAt(0).toUpperCase() + p2.slice(1) + '=');
  xml = xml.replace(/class=/g, 'className=');

  xml = xml.replace(/<clipPath id="p\.0">/, '<clipPath id="p_0">');
  xml = xml.replace(/url\(#p\.0\)/, 'url(#p_0)');
  xml = xml.replace(/xmlns:xlink=/g, 'xmlnsXlink=');

  let pathCounter = 1;
  xml = xml.replace(/<path /g, () => {
    const id = "path_" + (pathCounter++);
    return "<path id=\"" + id + "\" onClick={(e: any) => console.log(e.target.id || e.target.parentNode.id)} ";
  });

  const reactComponent = '"use client";\n' +
    'import React from "react";\n\n' +
    'export default function OffswitchLogo() {\n' +
    '  return (\n' +
    '    <div style={{width: "100vw", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center"}}>\n' +
    '      ' + xml.substring(xml.indexOf('<svg')) + '\n' +
    '    </div>\n' +
    '  );\n' +
    '}\n';

  fs.writeFileSync('app/logo-preview/page.tsx', reactComponent);
  console.log('Successfully created app/logo-preview/page.tsx');
} catch(e) {
  console.error(e);
}
