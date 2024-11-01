const fs = require('fs');
const path = require('path');

// Import the slide numbers
const slideNumbers = require('./public/slide_numbers.js');

function generateImageList(ParticipantID, politicalParty) {
    const demImages = 560;
    const repImages = 570;
    
    let N;
    let baseFolder;
    let numImages;
    let availableSlides;
    
    if (politicalParty === 'democrat' || politicalParty === 'lean_democrat') {
        // N = (ParticipantID - 1) % 200; // 200 dem
        N = (ParticipantID - 1) % 240; // allow for 40 more dem
        baseFolder = 'dem';
        numImages = 28;  // 28 images per democrat
        availableSlides = slideNumbers.dem;  // globally available from slide_numbers.js
    } else if (politicalParty === 'republican' || politicalParty === 'lean_republican') {
        // N = (ParticipantID - 1) % 190; // 190 rep
        N = (ParticipantID - 1) % 228; // allow for 38 more rep participants
        baseFolder = 'rep';
        numImages = 30;  // 30 images per republican
        availableSlides = slideNumbers.rep;  // globally available from slide_numbers.js
    } else {
        console.error('Invalid political party');
        return [];
    }

    let images = [];
    for (let k = 0; k < numImages; k++) {
        let array_index;
        if (baseFolder === 'dem') {
            array_index = ((N + 20 * k) % availableSlides.length);
        } else {
            array_index = ((N + 19 * k) % availableSlides.length);
        }
        const actualSlideNumber = availableSlides[array_index];
        images.push(`img/${baseFolder}/Slide${actualSlideNumber}.png`);
    }
    
    return images;
}

function runTest() {
    const results = [];
    const imageFrequencies = {};
    
    // Simulate Democrat participants (including leaners)
    // for (let participantID = 1; participantID <= 200; participantID++) {
    for (let participantID = 1; participantID <= 200; participantID++) {
        const images = generateImageList(participantID, 'democrat');
        
        results.push({
            participantID,
            party: 'democrat',
            images: images.join(',')
        });
        
        images.forEach(img => {
            imageFrequencies[img] = (imageFrequencies[img] || 0) + 1;
        });
    }

    // Simulate Republican participants (including leaners)
    // for (let participantID = 201; participantID <= 190; participantID++) {
    for (let participantID = 1; participantID <= 190; participantID++) {
        const images = generateImageList(participantID, 'republican');
        
        results.push({
            participantID,
            party: 'republican',
            images: images.join(',')
        });
        
        images.forEach(img => {
            imageFrequencies[img] = (imageFrequencies[img] || 0) + 1;
        });
    }

    // Create CSV for participant assignments
    let csvContent = 'ParticipantID,Party';
    // Add headers for dem images
    slideNumbers.dem.forEach(num => {
        csvContent += `,dem/Slide${num}.png`;
    });
    // Add headers for rep images
    slideNumbers.rep.forEach(num => {
        csvContent += `,rep/Slide${num}.png`;
    });
    csvContent += '\n';
    
    results.forEach(result => {
        const images = result.images.split(',');
        
        // Create arrays for both dem and rep images
        const demArray = new Array(slideNumbers.dem.length).fill(0);
        const repArray = new Array(slideNumbers.rep.length).fill(0);
        
        // Mark images that were shown
        images.forEach(img => {
            const [folder, slideFile] = img.split('/').slice(1);
            const slideNum = parseInt(slideFile.match(/\d+/)[0]);
            if (folder === 'dem') {
                const index = slideNumbers.dem.indexOf(slideNum);
                if (index !== -1) demArray[index] = 1;
            } else {
                const index = slideNumbers.rep.indexOf(slideNum);
                if (index !== -1) repArray[index] = 1;
            }
        });
        
        csvContent += `${result.participantID},${result.party},${demArray.join(',')},${repArray.join(',')}\n`;
    });
    
    // Create frequency CSV
    let frequencyCsvContent = 'image_path,Frequency\n';
    Object.entries(imageFrequencies)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([img, freq]) => {
            frequencyCsvContent += `${img},${freq}\n`;
        });
    
    if (!fs.existsSync('test_data')) {
        fs.mkdirSync('test_data');
    }

    fs.writeFileSync('test_data/participant_image_assignments.csv', csvContent);
    fs.writeFileSync('test_data/image_frequencies.csv', frequencyCsvContent);

    // Log summary statistics
    console.log('Test completed!');
    console.log(`Total participants simulated: ${results.length}`);
    console.log('Democrat participants:', results.filter(r => r.party === 'democrat').length);
    console.log('Republican participants:', results.filter(r => r.party === 'republican').length);
    
    // Calculate frequencies by party
    const demFreq = {};
    const repFreq = {};
    Object.entries(imageFrequencies).forEach(([img, freq]) => {
        if (img.includes('dem/')) {
            demFreq[img] = freq;
        } else {
            repFreq[img] = freq;
        }
    });

    console.log('\nDemocrat Images:');
    console.log(`Total unique images: ${Object.keys(demFreq).length}`);
    console.log(`Min frequency: ${Math.min(...Object.values(demFreq))}`);
    console.log(`Max frequency: ${Math.max(...Object.values(demFreq))}`);
    
    console.log('\nRepublican Images:');
    console.log(`Total unique images: ${Object.keys(repFreq).length}`);
    console.log(`Min frequency: ${Math.min(...Object.values(repFreq))}`);
    console.log(`Max frequency: ${Math.max(...Object.values(repFreq))}`);
}

runTest();