// Generate placeholder PNG icons for Chrome extension
// Run: node generate-icons.cjs

const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 48, 128];

// Minimal valid PNG (1x1 blue pixel as placeholder)
// Base64 encoded PNG with blue-ish color
const placeholderPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFfwJ/Bc8LcwAAAABJRU5ErkJggg==',
  'base64'
);

console.log('='.repeat(50));
console.log('Rtrv Timezone - Icon Generation');
console.log('='.repeat(50));
console.log('');

const iconsDir = __dirname;

sizes.forEach(size => {
  const filename = path.join(iconsDir, `icon${size}.png`);
  
  if (!fs.existsSync(filename)) {
    fs.writeFileSync(filename, placeholderPng);
    console.log(`✓ Created placeholder: icon${size}.png`);
  } else {
    console.log(`○ Already exists: icon${size}.png`);
  }
});

console.log('');
console.log('To create proper icons from the SVG:');
console.log('');
console.log('Option 1: Use ImageMagick');
sizes.forEach(size => {
  console.log(`  convert -background none -resize ${size}x${size} icon.svg icon${size}.png`);
});
console.log('');
console.log('Option 2: Use an online converter like https://svgtopng.com/');
console.log('');
console.log('Done!');
