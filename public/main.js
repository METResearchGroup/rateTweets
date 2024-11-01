const jsPsych = initJsPsych({
    use_webaudio: false, // gets rid of AudioContext console warning, but not working

    on_finish: function() {

        let allData = jsPsych.data.get();
        console.log("Raw data:", allData.values()); // debug log
        
        // function to flatten survey responses
        function flattenSurveyResponses(data) {
            if (data.response) {
                // initialize all fields with default values (in case participant is able to bypass a question)
                const defaultData = {
                    gender: '',
                    age: '',
                    language: '',
                    education: '',
                    employment: '',
                    party: '',
                    party_lean: '',
                    political_ideology: '',
                    political_follow: '',
                    rep_id: '',
                    dem_id: '',
                    sm_use: '',
                    sm_use_slider: '',
                    sm_use_poli: '',
                    sm_use_poli_slider: '',
                    sm_post_poli: '',
                    sm_post_poli_slider: '',
                    share_why: '', // initialize as an empty array for multi-select
                };

                // merge collected data with default data
                data.response = { ...defaultData, ...data.response };

                // concatenate share_whycheckbox values
                const shareWhyKeys = [
                    'share_why_1',
                    'share_why_2',
                    'share_why_3',
                    'share_why_4',
                    'share_why_5',
                    'share_why_6',
                    'share_why_7'
                ];

                data.response.share_why = shareWhyKeys
                    .filter(key => data.response[key])
                    .map(key => data.response[key])
                    .join(', ');

                Object.entries(data.response).forEach(([key, value]) => {
                    data[key] = value;
                });
                delete data.response;
            }
            return data;
        }

        // flatten survey responses
        allData.filter({trial_type: 'survey-html-form'}).values().forEach(flattenSurveyResponses);

        // var csv = allData.csv // collects all data
        // filter out unnecessary columns
        var csv = allData.filterColumns([
            'prolific_id', 
            'participant_id', 
            'trial_type', 
            'trial_index', 
            'image_shown',
            'response',  // this will include slider responses
            'political_affiliation',  // from pre-survey
            'consented',
            'gender', 
            'age', 
            'language', 
            'education', 
            'employment', 
            'party', 
            'party_lean', 
            'political_ideology', 
            'political_follow', 
            'rep_id', 
            'dem_id', 
            'sm_use', 
            'sm_use_slider', 
            'sm_use_poli', 
            'sm_use_poli_slider', 
            'sm_post_poli', 
            'sm_post_poli_slider', 
            'share_why'
        ]).csv();

        console.log("Filtered CSV data length:", csv.length); // Debug log
        console.log("First 100 characters of CSV:", csv.substring(0, 100)); // Debug log
        
        if (!csv || csv.length === 0) {
            console.error("No data collected during experiment!");
            document.body.innerHTML = '<p>There was an error saving your data. Please contact the researcher.</p>';
            return;
        }
        
        saveExperimentData(csv)
            .then(() => {
                document.body.innerHTML = `
                    <div style="text-align: center; margin-top: 50px;">
                        <p>Thank you for participating! 
                        <a href="https://app.prolific.com/submissions/complete?cc=CV0XRWGP" target="_blank">
                            <b>Click here</b></a> to be redirected to Prolific (completion code <b>CV0XRWGP</b>).
                        </p>
                    </div>
                `;
            })
            .catch(error => {
                console.error('Error saving data:', error);
                document.body.innerHTML = '<p>There was an error saving your data.</p>';
            });
    }
});

// API gateway URLs
const GET_PARTICIPANT_ID_URL = 'https://n2w6sd413g.execute-api.us-east-2.amazonaws.com/get-participant-id';
const SAVE_DATA_URL = 'https://n2w6sd413g.execute-api.us-east-2.amazonaws.com/save-jspsych-data';

// function to get participant ID
async function getParticipantId(prolificId) {
    console.log('Requesting participant ID for:', prolificId);
    const response = await fetch(`${GET_PARTICIPANT_ID_URL}?prolific_id=${prolificId}`);
    if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', response.status, errorText);
        throw new Error(`Failed to get participant ID: ${response.status} ${errorText}`);
    }
    const data = await response.json();
    console.log('Received participant ID:', data.participantID);
    return data.participantID;
}

// function to save experiment data
async function saveExperimentData(csvData) {
    try {
        if (!csvData || csvData.length === 0) {
            throw new Error('No data to save');
        }

        console.log('Attempting to save data of size:', csvData.length);
        console.log('First 100 characters of data:', csvData.substring(0, 100));
        
        const payload = JSON.stringify({ csv: csvData });
        console.log('Payload size:', payload.length);

        const response = await fetch(SAVE_DATA_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: payload
        });

        // log the response details
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response body:', errorText);
            throw new Error(`Failed to save experiment data: ${response.status} ${errorText}`);
        }

        const result = await response.json();
        console.log('Save successful:', result.message);
        return result;
    } catch (error) {
        console.error('Detailed save error:', error);
        throw error;
    }
}

// function to generate a list of images for each participant
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

// main experiment setup function
async function setupExperiment() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const prolificID = urlParams.get('PROLIFIC_PID');
        console.log('Extracted Prolific ID from URL:', prolificID);
        
        if (!prolificID) {
            throw new Error('No Prolific ID provided');
        }

        const ParticipantID = await getParticipantId(prolificID);
        jsPsych.data.addProperties({participant_id: ParticipantID, prolific_id: prolificID});

        var timeline = [];

        var welcome = {
            type: jsPsychInstructions,
            pages: ["<div class='instructions'>Welcome! In this task, you will view real social media messages sent by users who discuss politics on Twitter.<br><br>You will then be asked to <b>rate how likely you would be to post these messages to your own social media network.</b><br><br>Before we begin, please click <b>Next</b> to consent to participate.</div>"],
            show_clickable_nav: true
        };
        timeline.push(welcome);

        timeline.push(consent);

        timeline.push(prePolSurvey);

        // Create a variable to store the images
        let participant_images;

        // Create a nested timeline for the image trials
        var imageTrialsBlock = {
            timeline: [
                {
                    type: jsPsychCallFunction,
                    func: function() {
                        const politicalAffiliation = jsPsych.data.get().last(1).values()[0].political_affiliation;
                        console.log("Political affiliation:", politicalAffiliation);
                        
                        participant_images = generateImageList(ParticipantID, politicalAffiliation);
                        console.log("Generated images:", participant_images);
                        
                        participant_images = jsPsych.randomization.shuffle(participant_images);
                        console.log("Shuffled images:", participant_images);
                        
                        jsPsych.data.addProperties({
                            participant_images: participant_images
                        });
                    }
                },
                {
                    type: jsPsychPreload,
                    images: function() {
                        return participant_images;
                    }
                },
                {
                    type: jsPsychInstructions,
                    pages: function() {
                        return [`<div class='instructions'>Great! You are now ready to begin the task.<br><br>You will see ${participant_images.length} social media messages in total. Your job is to rate how likely you would be to post each message to your own social media network, on a scale from 1 (not at all likely) to 7 (very likely).<br><br>Note: All usernames have been anonymized.<br><br>Press <b>Next</b> to begin.</div>`];
                    },
                    show_clickable_nav: true
                }
            ]
        };
        timeline.push(imageTrialsBlock);

        var imageTrials = {
            timeline: [{
                type: jsPsychHtmlSliderResponse,
                stimulus: function() {
                    const currentIndex = jsPsych.data.get().filter({trial_type: 'html-slider-response'}).count();
                    const img = participant_images[currentIndex];
                    return `
                        <div class="social-media-feed">
                            <img src="${img}" class="stimulus">
                        </div>
                        <p class="slider-question">How <b>likely</b> would you be to post this message to your own social media network?</p>
                        <p class="progress-text">Image ${currentIndex + 1} of ${participant_images.length}</p>
                    `;
                },
                labels: ['1', '2', '3', '4', '5', '6', '7'],
                prompt: "",
                button_label: 'Next >',
                data: function() {
                    const currentIndex = jsPsych.data.get().filter({trial_type: 'html-slider-response'}).count();
                    return {
                        trial_index: currentIndex,
                        image_shown: participant_images[currentIndex].split('/').pop()
                    };
                },
                require_movement: true,
                slider_width: 600,
                min: 1,
                max: 7,
                step: 1,
                slider_start: 4,
                on_load: function() {
                    var sliderContainer = document.querySelector('.jspsych-html-slider-response-container');
                    var customLabels = document.createElement('div');
                    customLabels.className = 'custom-slider-labels';
                    customLabels.innerHTML = `
                        <span>Not at all likely</span>
                        <span>Somewhat likely</span>
                        <span>Very likely</span>
                    `;
                    sliderContainer.appendChild(customLabels);
                }
            }].map(trial => {
                if (window.makeRequireMovementOptional) {
                    return window.makeRequireMovementOptional(trial);
                }
                return trial;
            }),
            loop_function: function() {
                const currentCount = jsPsych.data.get().filter({trial_type: 'html-slider-response'}).count();
                return currentCount < participant_images.length;
            }
        };
        timeline.push(imageTrials);

        var demo_instruct = {
            type: jsPsychInstructions,
            pages: ["<div class='instructions'>Thanks for providing your responses.<br><br>We would now like you to answer a few short demographics questions, after which you will be redirected back to Prolific.<br><br>Please press <b>Next</b> to continue.</div>"],
            show_clickable_nav: true
        };
        timeline.push(demo_instruct);

        timeline.push(demographicsSurvey);
        timeline.push(politicalSurvey);
        timeline.push(socialMediaSurvey);       

        jsPsych.run(timeline);

    } catch (error) {
        console.error('Error setting up experiment:', error);
        document.body.innerHTML = '<p>There was an error setting up the experiment. Please contact the researcher.</p>';
    }
}

// Start the experiment
setupExperiment();