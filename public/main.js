const jsPsych = initJsPsych({
    use_webaudio: false, // gets rid of AudioContext console warning, but not working

    on_finish: function() {

        let allData = jsPsych.data.get();
        
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
        var csv = allData.filterColumns(['prolific_id', 'participant_id', 'trial_type', 'trial_index', 'image_shown', 'consented', 'response', 'gender', 'age', 'language', 'education', 'employment', 'party', 'party_lean', 'political_ideology', 'political_follow', 'rep_id', 'dem_id', 'sm_use', 'sm_use_slider', 'sm_use_poli', 'sm_use_poli_slider', 'sm_post_poli', 'sm_post_poli_slider', 'share_why']).csv();
        
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
    const response = await fetch(SAVE_DATA_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ csv: csvData }),
    });
    if (!response.ok) {
        throw new Error('Failed to save experiment data');
    }
    const result = await response.json();
    console.log(result.message);
}

// function to generate a list of 20 images for each participant
function generateImageList(ParticipantID) {
    let N = (ParticipantID - 1) % 385; // -1 because we're 0-indexing
    let images = [];
    for (let k = 0; k < 20; k++) {
        let image_index = ((N + 35 * k) % 700);
        images.push(`img/Slide${image_index + 1}.png`);
    }
    return images;
}

// function to generate 20 image slider trials
function generateImageSliderTrials(images) {
    return images.map((img, index) => {
        let trial = {
            type: jsPsychHtmlSliderResponse,
            stimulus: function() {
                return `
                    <div class="social-media-feed">
                        <img src="${img}" class="stimulus">
                    </div>
                    <p class="slider-question">How <b>likely</b> would you be to post this message to your own social media network?</p>
                `;
            },
            labels: ['1', '2', '3', '4', '5', '6', '7'],
            prompt: "",
            button_label: 'Next >',
            data: {
                trial_index: index,
                image_shown: img.split('/').pop()
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
        };
        
        if (window.makeRequireMovementOptional) {
            trial = window.makeRequireMovementOptional(trial);
        }
        
        return trial;
    });
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
        let participant_images = generateImageList(ParticipantID);

        // shuffle images
        participant_images = jsPsych.randomization.shuffle(participant_images);

        jsPsych.data.addProperties({participant_id: ParticipantID, prolific_id: prolificID});

        var timeline = [];

        var preload = {
            type: jsPsychPreload,
            images: participant_images
        };
        timeline.push(preload);

        var welcome = {
            type: jsPsychInstructions,
            pages: ["<div class='instructions'>Welcome! In this task, you will view real social media messages sent by users who discuss politics on Twitter.<br><br>You will then be asked to <b>rate how likely you would be to post these messages to your own social media network.</b><br><br>Before we begin, please click <b>Next</b> to consent to participate.</div>"],
            show_clickable_nav: true
        };
        timeline.push(welcome);

        timeline.push(consent);

        var instruct = {
            type: jsPsychInstructions,
            pages: ["<div class='instructions'>Great! You are now ready to begin the task.<br><br>You will see 20 social media messages in total. Your job is to rate how likely you would be to post each message to your own social media network, on a scale from 1 (not at all likely) to 7 (very likely).<br><br>Note: All usernames have been anonymized.<br><br>Press <b>Next</b> to begin.</div>"],
            show_clickable_nav: true
        };
        timeline.push(instruct);

        const imageSliderTrials = generateImageSliderTrials(participant_images);
        timeline.push(...imageSliderTrials);

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

setupExperiment();