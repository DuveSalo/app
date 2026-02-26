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
    // Skip components/ui and components/common which we already tuned manually if we want, or just let regex run
    // Actually, let's run it everywhere to catch stragglers, but avoid re-replacing our specific tailwind
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // Replace border-radius classes
    content = content.replace(/\brounded-(sm|md|lg|xl|2xl|3xl)\b/g, 'rounded-none');

    // Replace soft shadows
    content = content.replace(/\bshadow-(sm|md|lg|xl|2xl)\b/g, 'shadow-none');

    // Specific border colors that make up the cards
    content = content.replace(/\bborder-gray-200\b/g, 'border-black');

    // Specific bg grays in cards
    content = content.replace(/\bbg-gray-50\b/g, 'bg-neutral-100');

    // Specific text colors
    content = content.replace(/\btext-gray-900\b/g, 'text-black');
    content = content.replace(/\bgray-600\b/g, 'neutral-600');
    content = content.replace(/\bgray-500\b/g, 'neutral-500');

    // Ensure border width on cards isn't overridden, though border-black is enough
    // Many feature cards have classes like: className="bg-white rounded-xl border border-gray-200 p-6"
    // If we change roundness and gray, we get: className="bg-white rounded-none border border-black p-6" which looks correct for brutalism

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        modifiedCount++;
        console.log(`Updated: ${file.replace(__dirname, '')}`);
    }
});

console.log(`Total files modified: ${modifiedCount}`);
