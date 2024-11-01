const fs = require('fs');
const path = require('path');

function getSlideNumbers(folderPath) {
    const files = fs.readdirSync(folderPath);
    const numbers = files
        .filter(file => file.startsWith('Slide') && file.endsWith('.png'))
        .map(file => parseInt(file.match(/Slide(\d+)\.png/)[1]))
        .sort((a, b) => a - b);
    
    return numbers;
}

const demNumbers = getSlideNumbers('public/img/dem');
const repNumbers = getSlideNumbers('public/img/rep');

console.log('Democrat Slide Numbers:', demNumbers);
console.log('Republican Slide Numbers:', repNumbers);

// Write to a JavaScript file instead of JSON
const jsContent = `// Generated slide numbers - DO NOT EDIT MANUALLY
const slideNumbers = {
    dem: ${JSON.stringify(demNumbers, null, 2)},
    rep: ${JSON.stringify(repNumbers, null, 2)}
};

// Make the numbers available to other files
if (typeof module !== 'undefined') {
    module.exports = slideNumbers;
}`;

fs.writeFileSync('public/slide_numbers.js', jsContent);

console.log('Slide numbers written to slide_numbers.js');