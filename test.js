const fs = require('fs');
const path = require('path');

const slideNumbers = require('./public/slide_numbers.js');

function generateImageList(ParticipantID, politicalParty) {
    let baseFolder;
    let numImages;
    let availableSlides;
    
    if (politicalParty === 'democrat' || politicalParty === 'lean_democrat') {
        baseFolder = 'dem';
        numImages = 20;  // changed to 20 images per participant
        availableSlides = slideNumbers.dem;
    } else if (politicalParty === 'republican' || politicalParty === 'lean_republican') {
        baseFolder = 'rep';
        numImages = 20;  // changed to 20 images per participant
        availableSlides = slideNumbers.rep;
    } else {
        console.error('Invalid political party');
        return [];
    }

    let images = [];
    for (let k = 0; k < numImages; k++) {
        let array_index = ((ParticipantID - 1 + 20 * k) % availableSlides.length);
        const actualSlideNumber = availableSlides[array_index];
        images.push(`img/${baseFolder}/Slide${actualSlideNumber}.png`);
    }
    
    return images;
}

function runTest() {
    const results = [];
    const imageFrequencies = {};
    
    // test with more participants than images to show cycling
    const numParticipantsToTest = 200; // testing with 400 participants to show pattern
    
    // simulate dem participants
    for (let participantID = 1; participantID <= numParticipantsToTest; participantID++) {
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

    // simulate rep participants
    for (let participantID = 1; participantID <= numParticipantsToTest; participantID++) {
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

    // CSV for participant assignments
    let csvContent = 'ParticipantID,Party';
    // add headers for dem images
    slideNumbers.dem.forEach(num => {
        csvContent += `,dem/Slide${num}.png`;
    });
    // add headers for rep images
    slideNumbers.rep.forEach(num => {
        csvContent += `,rep/Slide${num}.png`;
    });
    csvContent += '\n';
    
    results.forEach(result => {
        const images = result.images.split(',');
        
        // create arrays for dem and rep images
        const demArray = new Array(slideNumbers.dem.length).fill(0);
        const repArray = new Array(slideNumbers.rep.length).fill(0);
        
        // mark inmages that were shown
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
    
    // freq CSV
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

    // summary stats
    console.log('Test completed!');
    console.log(`Total participants simulated: ${results.length}`);
    console.log('Democrat participants:', results.filter(r => r.party === 'democrat').length);
    console.log('Republican participants:', results.filter(r => r.party === 'republican').length);
    
    // freq by party
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

    // distribution 
    console.log('\nViews per image after first 200 participants:');
    const viewsAfter200 = {};
    results.slice(0, 200).forEach(result => {
        result.images.split(',').forEach(img => {
            viewsAfter200[img] = (viewsAfter200[img] || 0) + 1;
        });
    });
    
    const uniqueViewCounts = [...new Set(Object.values(viewsAfter200))];
    uniqueViewCounts.sort((a, b) => a - b);
    uniqueViewCounts.forEach(count => {
        const imagesWithCount = Object.entries(viewsAfter200)
            .filter(([_, freq]) => freq === count).length;
        console.log(`${imagesWithCount} images viewed ${count} times`);
    });
}

runTest();