const fs = require('fs');
const path = require('path');

// Copy your new image categorization system
const imageCategories = {
    'dem_ingroup_praise': [1,2,3,4,5, 31,32,33,34,35, 61,62,63,64,65, 91,92,93,94,95, 121,122,123,124,125, 
                           151,152,153,154,155, 181,182,183,184,185, 211,212,213,214,215, 241,242,243,244,245, 271,272,273,274,275, 
                           301,302,303,304,305, 331,332,333,334,335, 361,362,363,364,365, 391,392,393,394,395, 421,422,423,424,425, 
                           451,452,453,454,455, 481,482,483,484,485, 511,512,513,514,515, 541,542,543,544,545, 571,572,573,574,575
                        ],
    
    'dem_outgroup_blame': [6,7,8,9,10, 36,37,38,39,40, 66,67,68,69,70, 96,97,98,99,100, 126,127,128,129,130, 
                           156,157,158,159,160, 186,187,188,189,190, 216,217,218,219,220, 246,247,248,249,250, 276,277,278,279,280, 
                           306,307,308,309,310, 336,337,338,339,340, 366,367,368,369,370, 396,397,398,399,400, 426,427,428,429,430, 
                           456,457,458,459,460, 486,487,488,489,490, 516,517,518,519,520, 546,547,548,549,550, 576,577,578,579,580
                        ],
    
    'rep_ingroup_praise': [21,22,23,24,25, 51,52,53,54,55, 81,82,83,84,85, 111,112,113,114,115, 141,142,143,144,145, 
                           171,172,173,174,175, 201,202,203,204,205, 231,232,233,234,235, 261,262,263,264,265, 291,292,293,294,295, 
                           321,322,323,324,325, 351,352,353,354,355, 381,382,383,384,385, 411,412,413,414,415, 441,442,443,444,445, 
                           471,472,473,474,475, 501,502,503,504,505, 531,532,533,534,535, 561,562,563,564,565, 591,592,593,594,595
                        ],
    
    'rep_outgroup_blame': [26,27,28,29,30, 56,57,58,59,60, 86,87,88,89,90, 116,117,118,119,120, 146,147,148,149,150, 
                           176,177,178,179,180, 206,207,208,209,210, 236,237,238,239,240, 266,267,268,269,270, 296,297,298,299,300, 
                           326,327,328,329,330, 356,357,358,359,360, 386,387,388,389,390, 416,417,418,419,420, 446,447,448,449,450, 
                           476,477,478,479,480, 506,507,508,509,510, 536,537,538,539,540, 566,567,568,569,570, 596,597,598,599,600
                        ],
    
    'neutral_political': [11,12,13,14,15,16,17,18,19,20, 41,42,43,44,45,46,47,48,49,50, 71,72,73,74,75,76,77,78,79,80, 
                          101,102,103,104,105,106,107,108,109,110, 131,132,133,134,135,136,137,138,139,140, 161,162,163,164,165,166,167,168,169,170, 
                          191,192,193,194,195,196,197,198,199,200, 221,222,223,224,225,226,227,228,229,230, 251,252,253,254,255,256,257,258,259,260, 
                          281,282,283,284,285,286,287,288,289,290, 311,312,313,314,315,316,317,318,319,320, 341,342,343,344,345,346,347,348,349,350, 
                          371,372,373,374,375,376,377,378,379,380, 401,402,403,404,405,406,407,408,409,410, 431,432,433,434,435,436,437,438,439,440, 
                          461,462,463,464,465,466,467,468,469,470, 491,492,493,494,495,496,497,498,499,500, 521,522,523,524,525,526,527,528,529,530, 
                          551,552,553,554,555,556,557,558,559,560, 581,582,583,584,585,586,587,588,589,590
                        ],
    
    'distractor': Array.from({length: 100}, (_, i) => 601 + i)
};

const firstFeedCategoryQuotas = {
    'dem_ingroup_praise': 14,
    'dem_outgroup_blame': 14, 
    'rep_ingroup_praise': 14,
    'rep_outgroup_blame': 14,
    'neutral_political': 29,
    'distractor': 15
};

// Copy your new sorting functions
function getImageCategory(fileName) {
    const slideNumber = parseInt(fileName.replace('Slide', '').replace('.png', ''));
    
    for (const [category, slides] of Object.entries(imageCategories)) {
        if (slides.includes(slideNumber)) {
            return category;
        }
    }
    return 'unknown';
}

function selectBalancedFirstFeed(participantId) {
    let selectedImages = [];
    
    Object.entries(firstFeedCategoryQuotas).forEach(([category, quota]) => {
        const categoryImages = imageCategories[category];
        const startIndex = (participantId - 1) % categoryImages.length;
        
        for (let i = 0; i < quota; i++) {
            const imageIndex = (startIndex + i) % categoryImages.length;
            const slideNumber = categoryImages[imageIndex];
            selectedImages.push(`img/full_700/Slide${slideNumber}.png`);
        }
    });
    
    return selectedImages.sort(() => Math.random() - 0.5);
}

// Simulate realistic interaction patterns
function getInteractionProbability(category) {
    const rates = {
        'dem_ingroup_praise': 0.15,
        'dem_outgroup_blame': 0.12,
        'rep_ingroup_praise': 0.15,
        'rep_outgroup_blame': 0.12,
        'neutral_political': 0.08,
        'distractor': 0.05
    };
    return rates[category] || 0.1;
}

function simulateInteractions(images, participantId) {
    const likedImages = [];
    const sharedImages = [];
    
    const participantBias = 0.5 + (participantId % 10) * 0.1;
    
    images.forEach(image => {
        const fileName = image.split('/').pop();
        const category = getImageCategory(fileName);
        const baseRate = getInteractionProbability(category);
        const adjustedRate = Math.min(baseRate * participantBias, 0.4);
        
        if (Math.random() < adjustedRate) {
            likedImages.push(image);
        }
        if (Math.random() < adjustedRate * 0.3) {
            sharedImages.push(image);
        }
    });
    
    return { likedImages, sharedImages };
}

function selectPersonalizedSecondFeed(participantId, firstFeedImages, interactions) {
    // Algorithm accuracy parameter - 90% personalized, 10% random noise
    const ALGORITHM_ACCURACY = 0.90;
    
    const { likedImages, sharedImages } = interactions;
    const interactedImages = [...new Set([...likedImages, ...sharedImages])];
    
    const allImages = [];
    for (let i = 1; i <= 700; i++) {
        allImages.push(`img/full_700/Slide${i}.png`);
    }
    const availableImages = allImages.filter(img => !firstFeedImages.includes(img));
    
    // Group available images by category
    const availableByCategory = {};
    Object.keys(imageCategories).forEach(category => {
        availableByCategory[category] = [];
    });
    
    availableImages.forEach(imagePath => {
        const fileName = imagePath.split('/').pop();
        const category = getImageCategory(fileName);
        if (availableByCategory[category]) {
            availableByCategory[category].push(imagePath);
        }
    });
    
    const interactionCounts = {};
    interactedImages.forEach(image => {
        const fileName = image.split('/').pop();
        const category = getImageCategory(fileName);
        interactionCounts[category] = (interactionCounts[category] || 0) + 1;
    });
    
    const personalizedImages = [];
    const totalInteractions = interactedImages.length;
    
    if (totalInteractions > 0) {
        Object.entries(interactionCounts).forEach(([category, count]) => {
            const proportion = count / totalInteractions;
            const targetPersonalizedCount = Math.round(proportion * 50);
            
            // Apply 90/10 algorithm accuracy - some selections will be random instead of personalized
            for (let i = 0; i < targetPersonalizedCount; i++) {
                if (Math.random() < ALGORITHM_ACCURACY) {
                    // 90% chance: Select from the preferred category (personalized)
                    const categoryImages = availableByCategory[category] || [];
                    if (categoryImages.length > 0) {
                        const shuffled = categoryImages.sort(() => Math.random() - 0.5);
                        const selected = shuffled[0];
                        if (selected && !personalizedImages.includes(selected)) {
                            personalizedImages.push(selected);
                            // Remove from available to avoid duplicates
                            const index = availableByCategory[category].indexOf(selected);
                            if (index > -1) {
                                availableByCategory[category].splice(index, 1);
                            }
                        }
                    }
                } else {
                    // 10% chance: Select randomly from any category (algorithm "mistake")
                    const allAvailable = Object.values(availableByCategory).flat();
                    const randomlyAvailable = allAvailable.filter(img => !personalizedImages.includes(img));
                    if (randomlyAvailable.length > 0) {
                        const shuffled = randomlyAvailable.sort(() => Math.random() - 0.5);
                        const selected = shuffled[0];
                        personalizedImages.push(selected);
                        
                        // Remove from appropriate category to avoid duplicates
                        const fileName = selected.split('/').pop();
                        const selectedCategory = getImageCategory(fileName);
                        const catImages = availableByCategory[selectedCategory];
                        if (catImages) {
                            const index = catImages.indexOf(selected);
                            if (index > -1) {
                                catImages.splice(index, 1);
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Fill remaining personalized slots if needed
    const remainingPersonalized = 50 - personalizedImages.length;
    if (remainingPersonalized > 0) {
        const unusedImages = Object.values(availableByCategory).flat().filter(img => !personalizedImages.includes(img));
        const shuffled = unusedImages.sort(() => Math.random() - 0.5);
        personalizedImages.push(...shuffled.slice(0, remainingPersonalized));
    }
    
    // Select community images (50 images) - random from remaining unseen
    const communityImages = [];
    const remainingForCommunity = Object.values(availableByCategory).flat().filter(img => !personalizedImages.includes(img));
    const shuffledCommunity = remainingForCommunity.sort(() => Math.random() - 0.5);
    communityImages.push(...shuffledCommunity.slice(0, 50));
    
    return [...personalizedImages, ...communityImages];
}

function runTest() {
    const results = [];
    const imageFrequencies = {};
    const categoryStats = {};
    const interactionStats = [];
    
    const numParticipantsToTest = 200;
    
    // Initialize category tracking
    Object.keys(imageCategories).forEach(category => {
        categoryStats[category] = { firstFeed: 0, secondFeed: 0, total: 0 };
    });
    
    console.log(`=== NEW EXPERIMENT SIMULATION (${numParticipantsToTest} participants) ===\n`);
    
    // Simulate each participant
    for (let participantID = 1; participantID <= numParticipantsToTest; participantID++) {
        // First feed - balanced selection
        const firstFeedImages = selectBalancedFirstFeed(participantID);
        
        // Simulate interactions with first feed
        const interactions = simulateInteractions(firstFeedImages, participantID);
        
        // Second feed - personalized based on interactions
        const secondFeedImages = selectPersonalizedSecondFeed(participantID, firstFeedImages, interactions);
        
        // Combine all images for this participant
        const allParticipantImages = [...firstFeedImages, ...secondFeedImages];
        
        // Track overall frequency
        allParticipantImages.forEach(img => {
            imageFrequencies[img] = (imageFrequencies[img] || 0) + 1;
        });
        
        // Track category stats
        firstFeedImages.forEach(img => {
            const fileName = img.split('/').pop();
            const category = getImageCategory(fileName);
            categoryStats[category].firstFeed++;
            categoryStats[category].total++;
        });
        
        secondFeedImages.forEach(img => {
            const fileName = img.split('/').pop();
            const category = getImageCategory(fileName);
            categoryStats[category].secondFeed++;
            categoryStats[category].total++;
        });
        
        // Store participant results
        results.push({
            participantID,
            firstFeedImages: firstFeedImages.length,
            secondFeedImages: secondFeedImages.length,
            totalImages: allParticipantImages.length,
            interactions: interactions.likedImages.length + interactions.sharedImages.length,
            likes: interactions.likedImages.length,
            shares: interactions.sharedImages.length,
            firstFeedList: firstFeedImages.join(','),
            secondFeedList: secondFeedImages.join(',')
        });
        
        // Store interaction stats
        interactionStats.push({
            participantID,
            totalInteractions: interactions.likedImages.length + interactions.sharedImages.length,
            likedCount: interactions.likedImages.length,
            sharedCount: interactions.sharedImages.length
        });
        
        if (participantID % 50 === 0) {
            console.log(`Processed ${participantID} participants...`);
        }
    }
    
    // Generate comprehensive CSVs
    generateCSVs(results, imageFrequencies, categoryStats, interactionStats, numParticipantsToTest);
    
    // Print analysis
    printAnalysis(results, imageFrequencies, categoryStats, interactionStats, numParticipantsToTest);
}

function generateCSVs(results, imageFrequencies, categoryStats, interactionStats, numParticipants) {
    if (!fs.existsSync('test_data')) {
        fs.mkdirSync('test_data');
    }
    
    // 1. Participant Summary CSV
    let participantCSV = 'ParticipantID,First_Feed_Images,Second_Feed_Images,Total_Images,Total_Interactions,Likes,Shares\n';
    results.forEach(p => {
        participantCSV += `${p.participantID},${p.firstFeedImages},${p.secondFeedImages},${p.totalImages},${p.interactions},${p.likes},${p.shares}\n`;
    });
    
    // 2. Image Frequency CSV 
    let imageFreqCSV = 'Image,Category,Total_Frequency,Percentage_of_Participants\n';
    for (let i = 1; i <= 700; i++) {
        const image = `img/full_700/Slide${i}.png`;
        const fileName = image.split('/').pop();
        const category = getImageCategory(fileName);
        const totalFreq = imageFrequencies[image] || 0;
        const percentage = ((totalFreq / numParticipants) * 100).toFixed(2);
        
        imageFreqCSV += `${image},${category},${totalFreq},${percentage}\n`;
    }
    
    // 3. Category Summary CSV
    let categorySummaryCSV = 'Category,First_Feed_Total,Second_Feed_Total,Combined_Total,First_Feed_Percent,Second_Feed_Percent,Combined_Percent\n';
    
    const totalFirstFeed = Object.values(categoryStats).reduce((sum, cat) => sum + cat.firstFeed, 0);
    const totalSecondFeed = Object.values(categoryStats).reduce((sum, cat) => sum + cat.secondFeed, 0);
    const totalCombined = Object.values(categoryStats).reduce((sum, cat) => sum + cat.total, 0);
    
    Object.entries(categoryStats).forEach(([category, stats]) => {
        const firstPct = ((stats.firstFeed / totalFirstFeed) * 100).toFixed(1);
        const secondPct = ((stats.secondFeed / totalSecondFeed) * 100).toFixed(1);
        const combinedPct = ((stats.total / totalCombined) * 100).toFixed(1);
        
        categorySummaryCSV += `${category},${stats.firstFeed},${stats.secondFeed},${stats.total},${firstPct},${secondPct},${combinedPct}\n`;
    });
    
    // 4. Detailed Participant Images CSV (like your original)
    let detailedCSV = 'ParticipantID,Feed_Type';
    
    // Add headers for all 700 images
    for (let i = 1; i <= 700; i++) {
        detailedCSV += `,Slide${i}.png`;
    }
    detailedCSV += '\n';
    
    results.forEach(result => {
        // First feed row
        const firstFeedArray = new Array(700).fill(0);
        result.firstFeedList.split(',').forEach(img => {
            const slideNum = parseInt(img.split('/').pop().replace('Slide', '').replace('.png', ''));
            if (slideNum >= 1 && slideNum <= 700) {
                firstFeedArray[slideNum - 1] = 1;
            }
        });
        detailedCSV += `${result.participantID},first_feed,${firstFeedArray.join(',')}\n`;
        
        // Second feed row
        const secondFeedArray = new Array(700).fill(0);
        result.secondFeedList.split(',').forEach(img => {
            const slideNum = parseInt(img.split('/').pop().replace('Slide', '').replace('.png', ''));
            if (slideNum >= 1 && slideNum <= 700) {
                secondFeedArray[slideNum - 1] = 1;
            }
        });
        detailedCSV += `${result.participantID},second_feed,${secondFeedArray.join(',')}\n`;
    });
    
    // Save all CSVs
    fs.writeFileSync('test_data/participant_summary.csv', participantCSV);
    fs.writeFileSync('test_data/image_frequencies.csv', imageFreqCSV);
    fs.writeFileSync('test_data/category_analysis.csv', categorySummaryCSV);
    fs.writeFileSync('test_data/detailed_participant_images.csv', detailedCSV);
    
    console.log('\nGenerated CSV files:');
    console.log('- test_data/participant_summary.csv');
    console.log('- test_data/image_frequencies.csv');
    console.log('- test_data/category_analysis.csv');
    console.log('- test_data/detailed_participant_images.csv');
}

function printAnalysis(results, imageFrequencies, categoryStats, interactionStats, numParticipants) {
    console.log(`\n=== EXPERIMENT TEST RESULTS ===`);
    console.log(`Total participants simulated: ${numParticipants}`);
    console.log(`Total unique images shown: ${Object.keys(imageFrequencies).length} out of 700 available`);
    
    // Category distribution
    console.log('=== CATEGORY DISTRIBUTION ===');
    const totalCombined = Object.values(categoryStats).reduce((sum, cat) => sum + cat.total, 0);
    
    Object.entries(categoryStats).forEach(([category, stats]) => {
        const combinedPct = ((stats.total / totalCombined) * 100).toFixed(1);
        const expectedQuota = firstFeedCategoryQuotas[category] || 0;
        const expectedPct = ((expectedQuota / 100) * 100).toFixed(1);
        
        console.log(`${category}:`);
        console.log(`  Combined: ${stats.total} (${combinedPct}%) - Expected first feed: ${expectedPct}%`);
        console.log(`  First feed: ${stats.firstFeed}, Second feed: ${stats.secondFeed}`);
    });
    
    // Image frequency
    console.log('\n=== IMAGE FREQUENCY ===');
    const frequencies = Object.values(imageFrequencies);
    if (frequencies.length > 0) {
        const minFreq = Math.min(...frequencies);
        const maxFreq = Math.max(...frequencies);
        const avgFreq = frequencies.reduce((a, b) => a + b, 0) / frequencies.length;
        
        console.log(`Min frequency: ${minFreq} times`);
        console.log(`Max frequency: ${maxFreq} times`);
        console.log(`Average frequency: ${avgFreq.toFixed(2)} times`);
        
        // Show frequency distribution
        const freqDistribution = {};
        frequencies.forEach(freq => {
            freqDistribution[freq] = (freqDistribution[freq] || 0) + 1;
        });
        
        console.log('\nFrequency distribution:');
        Object.entries(freqDistribution)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .forEach(([freq, count]) => {
                console.log(`${count} images shown ${freq} times`);
            });
    }
    
    // // Interactions
    // console.log('\n=== INTERACTION ANALYSIS ===');
    // const avgInteractions = interactionStats.reduce((sum, p) => sum + p.totalInteractions, 0) / numParticipants;
    // const avgLikes = interactionStats.reduce((sum, p) => sum + p.likedCount, 0) / numParticipants;
    // const avgShares = interactionStats.reduce((sum, p) => sum + p.sharedCount, 0) / numParticipants;
    
    // console.log(`Average interactions per participant: ${avgInteractions.toFixed(1)}`);
    // console.log(`Average likes per participant: ${avgLikes.toFixed(1)}`);
    // console.log(`Average shares per participant: ${avgShares.toFixed(1)}`);
}

runTest();