const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'apps/web/src');

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

const files = getAllFiles(directoryPath);
let modifiedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // Replace all remaining rounded variants
    content = content.replace(/\brounded-(full)\b/g, 'rounded-none');
    content = content.replace(/\brounded-(t|b|l|r)-(sm|md|lg|xl|2xl|3xl|full)\b/g, 'rounded-none');
    content = content.replace(/\brounded-(tl|tr|bl|br)-(sm|md|lg|xl|2xl|3xl|full)\b/g, 'rounded-none');

    // Specific border colors that make up the cards that were missed in initial pass if any
    content = content.replace(/\bborder-gray-200\b/g, 'border-black');

    // Specific text colors
    content = content.replace(/\bgray-900\b/g, 'black');
    content = content.replace(/\bgray-700\b/g, 'black');
    content = content.replace(/\bgray-600\b/g, 'neutral-600');
    content = content.replace(/\bgray-500\b/g, 'neutral-500');

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        modifiedCount++;
        console.log(`Updated: ${file.replace(__dirname, '')}`);
    }
});

console.log(`Total files modified in 2nd pass: ${modifiedCount}`);
