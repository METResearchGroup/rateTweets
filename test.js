// simulate image output for max 385 participants
// send request to site via node w/ list of 385 unique IDs
// save output to data folder

const fs = require('fs');
const path = require('path');

function generateImageList(ParticipantID) {
    let N = (ParticipantID - 1) % 385; // -1 because we're 0-indexing
    let images = [];
    for (let k = 0; k < 20; k++) {
        let image_index = ((N + 35 * k) % 700);
        images.push(`img/full_700/Slide${image_index + 1}.png`);
    }
    return images;
}

function runTest() {
    const results = [];
    const imageFrequencies = {};
    
    for (let participantID = 1; participantID <= 365; participantID++) {
        const images = generateImageList(participantID);
        
        results.push({
            participantID,
            images: images.join(',')
        });
        
        images.forEach(img => {
            const imgNumber = img.match(/Slide(\d+)/)[1];
            imageFrequencies[imgNumber] = (imageFrequencies[imgNumber] || 0) + 1;
        });
    }

    // create CSV header with slide names 1-700
    let csvContent = 'ParticipantID';
    for (let i = 1; i <= 700; i++) {
        csvContent += `,Slide${i}.png`;
    }
    csvContent += '\n';
    
    results.forEach(result => {
        const images = result.images.split(',');
        const slideNumbers = images.map(img => img.match(/Slide(\d+)/)[1]);
        
        // create an array of 700 zeros (indexed 0-699 but representing Slides 1-700)
        const imageArray = new Array(700).fill(0);
        
        // mark with 1 where images were shown
        slideNumbers.forEach(num => {
            imageArray[Number(num) - 1] = 1;  // subtract 1 to convert from slide number to array index
        });
        
        csvContent += `${result.participantID},${imageArray.join(',')}\n`;
    });
    
    let frequencyCsvContent = 'image_shown,Frequency\n';  // changed header
    Object.entries(imageFrequencies)
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .forEach(([slide, freq]) => {
            frequencyCsvContent += `Slide${slide}.png,${freq}\n`;  // added .png to slide names
        });
    
    fs.writeFileSync('test_data/participant_image_assignments.csv', csvContent);
    fs.writeFileSync('test_data/image_frequencies.csv', frequencyCsvContent);

    console.log('Test completed!');
    console.log(`Total participants simulated: 385`);
    console.log(`Total unique images used: ${Object.keys(imageFrequencies).length}`);
    console.log(`Min frequency: ${Math.min(...Object.values(imageFrequencies))}`);
    console.log(`Max frequency: ${Math.max(...Object.values(imageFrequencies))}`);
}

if (!fs.existsSync('test_data')) {
    fs.mkdirSync('test_data');
}

runTest();