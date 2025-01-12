const jsPsych = initJsPsych({

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
        var csv = allData.filterColumns(['prolific_id', 'participant_id', 'trial_type', 'trial_index', 'image_shown', 'response', 'gender', 'age', 'language', 'education', 'employment', 'party', 'party_lean', 'political_ideology', 'political_follow', 'rep_id', 'dem_id', 'sm_use', 'sm_use_slider', 'sm_use_poli', 'sm_use_poli_slider', 'sm_post_poli', 'sm_post_poli_slider', 'share_why']).csv();
        
        fetch('/save-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({csv: csv}),
        })
        .then(response => response.text())
        .then(result => {
            console.log('Success:', result);
            document.body.innerHTML = '<p>Thank you for participating! Your data has been saved.</p>';
        })
        .catch(error => {
            console.error('Error:', error);
            document.body.innerHTML = '<p>There was an error saving your data.</p>';
        });
    }
});

async function getParticipantID(prolificID) {
    console.log('Requesting participant ID for:', prolificID);
    const response = await fetch(`/get-participant-id?prolific_id=${prolificID}`);
    if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', response.status, errorText);
        throw new Error(`Failed to get participant ID: ${response.status} ${errorText}`);
    }
    const data = await response.json();
    console.log('Received participant ID:', data.participantID);
    return data.participantID;
}

async function setupExperiment() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const prolificID = urlParams.get('PROLIFIC_PID');
        console.log('Extracted Prolific ID from URL:', prolificID);
        
        if (!prolificID) {
            throw new Error('No Prolific ID provided');
        }


        // function to generate a list of 20 images for each participant
        function generateImageList(ParticipantID) {
            let N = ParticipantID % 350; // ensures that N is always between 1 and 350
            let images = [];
            for (let k = 0; k < 20; k++) {
                let image_index = ((N + 35 * k) % 700) + 1; // creates sequence of numbers starting at N and increasing by 35 each time the loop runs; range is 1-700
                images.push(`img/full_700/Slide${image_index}.png`);
            }
            return images;
        }

        // (350 * 20) / 700 = 10
        // ((N + 35 * k) % 700) + 1, where k goes from 0 to 19
        // 350 unique starting points that increase by 35 each time the loop runs
        // then modulus 700 to ensure that the sequence loops back around
        // w/ exactly 350 participants, each of the 700 stimuli will be shown a total of 10 times


        const ParticipantID = await getParticipantID(prolificID);
        let participant_images = generateImageList(ParticipantID);


        // need to show 20 images, one at a time, with a slider for rating likelihood of posting
        // images should be shown in random order
        // images shown should be determined by the function generateImageList

        // shuffle images
        participant_images = jsPsych.randomization.shuffle(participant_images);

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
                            <p class="slider-question">How likely would you be to post this message to your own social media network?</p>
                        `;
                    },
                    labels: ['1', '2', '3', '4', '5', '6', '7'],
                    prompt: "", // remove prompt
                    button_label: 'Next >',
                    data: {
                        trial_index: index,
                        image_shown: img.split('/').pop() // save just image filename to data, not entire path
                    },
                    require_movement: true,
                    slider_width: 600,
                    min: 1,
                    max: 7,
                    step: 1,
                    slider_start: 4,
                    on_load: function() {
                        // add custom labels below the slider
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
                
                // if debug is true, make require_movement optional
                if (window.makeRequireMovementOptional) {
                    trial = window.makeRequireMovementOptional(trial);
                }
                
                return trial;
            });
        }

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

        // function to check whether consent has been given
        // present external consent page to participant

        var instruct = {
            type: jsPsychInstructions,
            pages: ["<div class='instructions'>Great! You are now ready to begin the task.<br><br>You will see 20 Twitter messages (tweets) in total. Your job is to rate how likely you would be to post each message to your own social media network, on a scale from 1 (not at all likely) to 7 (very likely).<br><br>Press <b>Next</b> to begin.</div>"],
            show_clickable_nav: true
        };
        timeline.push(instruct);

        // var scroll = {
        //     type: jsPsychHtmlButtonResponse,
        //     stimulus: function() {
        //         var html = '<div class="social-media-feed">' +
        //             participant_images.map(img => `<img src="${img}" class="stimulus">`).join('') +
        //             '</div>';
        //         return html;
        //     },
        //     choices: ['Next'],
        //     data: {
        //         images_shown: participant_images
        //     }
        // };
        // timeline.push(scroll);

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