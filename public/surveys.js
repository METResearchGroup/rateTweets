// demographics survey
const demographicsSurvey = {
    type: jsPsychSurveyHtmlForm,
    preamble: "<h2>Demographics</h2>",
    html: `
        <div class="survey-container">
            <div class="survey-question">
            <label for="gender">To which gender do you mostly identify?</label>
            <select id="gender" name="gender" required>
                <option value="" selected disabled>Select an option</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
            </div>
        </div>
        <div class="survey-container">
            <div class="survey-question">
            <label for="age">How old are you?</label>
                <input type="number" id="age" name="age" required min="18" max="120">
            </div>
        </div>          
        <div class="survey-container">
            <div class="survey-question">
                <label for="language">Is English your first language?</label>
            <select id="language" name="language" required>
                <option value="" selected disabled>Select an option</option>
                <option value="yes">Yes</option>
                <option value="no_fluent">No, but fluent</option>
                <option value="no_mostly_fluent">No, mostly fluent</option>
                <option value="no_minimal">No, minimal fluency</option>
                </select>
            </div>
        </div>
        <div class="survey-container">
            <div class="survey-question">
                <label for="education">Please indicate your education level</label>
            <select id="education" name="education" required>
                <option value="" selected disabled>Select an option</option>
                <option value="no_school">No school</option>
                <option value="eighth_or_less">Eighth grade or less</option>
                <option value="some_high_school">More than eighth grade, but less than high school</option>
                <option value="high_school">High school or equivalent</option>
                <option value="some_college">Some college</option>
                <option value="college_degree">4-year college degree</option>
                <option value="graduate">Graduate or professional training</option>
                </select>
            </div>
        </div>
        <div class="survey-container">
            <div class="survey-question">
                <label for="employment">Are you currently...?</label>
            <select id="employment" name="employment" required>
                <option value="" selected disabled>Select an option</option>
                <option value="employed">Employed</option>
                <option value="self_employed">Self-employed</option>
                <option value="student">A student</option>
                <option value="unemployed">Unemployed</option>
                <option value="other">Other</option>
                </select>
            </div>
        </div>
    `,
    button_label: "Next >",
    autofocus: "gender",

    on_load: function() {
        window.removeRequiredAttributes();
    }
};

function createLikertOptions(name, count) {
    let options = '';
    for (let i = 1; i <= count; i++) {
        options += `
            <div class="likert-option">
                <input type="radio" name="${name}" value="${i}" id="${name}-${i}" required>
                <label for="${name}-${i}"></label>
            </div>
        `;
    }
    return options;
}

function setupLikertScales() {
    const likertContainers = document.querySelectorAll('.likert-container');
    likertContainers.forEach(container => {
        const radioButtons = container.querySelectorAll('input[type="radio"]');
        const labels = container.querySelector('.likert-labels').children;

        radioButtons.forEach(radio => {
            radio.addEventListener('change', function() {
                // reset all labels to normal font weight
                for (let i = 0; i < labels.length; i++) {
                    labels[i].style.fontWeight = 'normal';
                }
                // bold the selected label
                labels[this.value - 1].style.fontWeight = 'bold';
            });
        });
    });
}

const politicalSurvey = {
    type: jsPsychSurveyHtmlForm,
    preamble: "<h2>Political Attitudes</h2>",
    html: `
        <div class="survey-container">
            <div class="survey-question">
                <label for="party">Politically speaking, do you consider yourself:</label>
                <select id="party" name="party" required>
                    <option value="" selected disabled>Select an option</option>
                <option value="democrat">A Democrat</option>
                <option value="republican">A Republican</option>
                <option value="other">Other</option>
                </select>
            </div>
        </div>
        <div id="party-lean" class="survey-container" style="display:none;">
            <div class="survey-question">
                <label for="party_lean">If you had to choose, which party do you feel like you lean more closely toward?</label>
                <select id="party_lean" name="party_lean">
                    <option value="" selected disabled>Select an option</option>
                <option value="democrat">A Democrat</option>
                <option value="republican">A Republican</option>
                </select>
            </div>
        </div>
        <div class="survey-container">
            <div class="survey-question">
                <label for="political_ideology">How would you describe your political ideology?</label>
                <div class="likert-container">
                    <div class="likert-scale">
                        ${createLikertOptions('political_ideology', 7)}
                    </div>
                    <div class="likert-labels">
                        <span>1 - Extremely liberal</span>
                        <span>2</span>
                        <span>3</span>
                        <span>4 - Neither</span>
                        <span>5</span>
                        <span>6</span>
                        <span>7 - Extremely conservative</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="survey-container">
            <div class="survey-question">
                <label for="political_follow">Generally speaking, how closely do you follow politics?</label>
                <div class="likert-container">
                    <div class="likert-scale">
                        ${createLikertOptions('political_follow', 7)}
                    </div>
                    <div class="likert-labels">
                        <span>1 - Not closely at all</span>
                        <span>2</span>
                        <span>3</span>
                        <span>4 - Moderately closely</span>
                        <span>5</span>
                        <span>6</span>
                        <span>7 - Very closely</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="survey-container">
            <div class="survey-question">
                <label for="rep_id">To what extent do you agree with the following statement: "I identify with the Republican Party"</label>
                <div class="likert-container">
                    <div class="likert-scale">
                        ${createLikertOptions('rep_id', 7)}
                    </div>
                    <div class="likert-labels">
                        <span>1 - Fully Disagree</span>
                        <span>2</span>
                        <span>3</span>
                        <span>4 - Neither agree nor disagree</span>
                        <span>5</span>
                        <span>6</span>
                        <span>7 - Fully agree</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="survey-container">
            <div class="survey-question">
                <label for="dem_id">To what extent do you agree with the following statement: "I identify with the Democratic Party"</label>
                <div class="likert-container">
                    <div class="likert-scale">
                        ${createLikertOptions('dem_id', 7)}
                    </div>
                    <div class="likert-labels">
                        <span>1 - Fully Disagree</span>
                        <span>2</span>
                        <span>3</span>
                        <span>4 - Neither agree nor disagree</span>
                        <span>5</span>
                        <span>6</span>
                        <span>7 - Fully agree</span>
                    </div>
                </div>
            </div>
        </div>
    `,
    button_label: "Next >",

    on_load: function() {
        // if user selects 'other' for party, show party lean question
        document.getElementById('party').addEventListener('change', function() {
            var partyLeanDiv = document.getElementById('party-lean');
            if (this.value === 'other') {
                partyLeanDiv.style.display = 'block';
                document.getElementById('party_lean').required = true;
            } else {
                partyLeanDiv.style.display = 'none';
                document.getElementById('party_lean').required = false;
            }
        });

        setupLikertScales();

        window.removeRequiredAttributes();
    }
};

const socialMediaSurvey = {
    type: jsPsychSurveyHtmlForm,
    preamble: "<h2>Social Media Usage</h2>",
    html: `
        <div class="survey-container">
            <div class="survey-question">
                <label for="sm_use">How often do you use social media?</label>
                <select id="sm_use" name="sm_use" required>
                <option value="" selected disabled>Select an option</option>
                <option value="daily_or_more">Daily or more</option>
                <option value="4-6_times_a_week">4-6 times a week</option>
                <option value="2-3_times_a_week">2-3 times a week</option>
                <option value="once_per_week">Once per week</option>
                <option value="between_once_per_week_and_once_per_month">Between once per week and once per month</option>
                <option value="between_once_per_month_and_once_per_year">Between once per month and once per year</option>
                <option value="never">Never</option>
                </select>
            </div>
        </div>
        <div class="survey-container">
            <div class="survey-question">
                <label for="sm_use_slider">If you use social media daily or more, use the slider to indicate how many times per day you tend to use social media. If you don't use social media daily or more, then leave the slider at 0.</label>
                <div class="slider-container">
                    <input type="range" id="sm_use_slider" name="sm_use_slider" min="0" max="100" value="0" step="1">
                    <output for="sm_use_slider" id="sm_use_slider_value">0</output>
                </div>
            </div>
        </div>
        <div class="survey-container">
            <div class="survey-question">
                <label for="sm_use_poli">How often do you use social media specifically to <span style="text-decoration: underline;">view or learn about political content?</span></label>
                <select id="sm_use_poli" name="sm_use_poli" required>
                <option value="" selected disabled>Select an option</option>
                <option value="daily_or_more">Daily or more</option>
                <option value="4-6_times_a_week">4-6 times a week</option>
                <option value="2-3_times_a_week">2-3 times a week</option>
                <option value="once_per_week">Once per week</option>
                <option value="between_once_per_week_and_once_per_month">Between once per week and once per month</option>
                <option value="between_once_per_month_and_once_per_year">Between once per month and once per year</option>
                <option value="never">Never</option>
                </select>
            </div>
        </div>
        <div class="survey-container">
            <div class="survey-question">
                <label for="sm_use_poli_slider">If you use social media to <span style="text-decoration: underline;">view or learn about political content daily or more,</span> use the slider to indicate how many times per day you tend to use social media to view or learn about political content. If you don't use social media to view or learn about political content daily or more, then leave the slider at 0.</label>
                <div class="slider-container">
                    <input type="range" id="sm_use_poli_slider" name="sm_use_poli_slider" min="0" max="100" value="0" step="1">
                    <output for="sm_use_poli_slider" id="sm_use_poli_slider_value">0</output>
                </div>
            </div>
        </div>
        <div class="survey-container">
            <div class="survey-question">
                <label for="sm_post_poli">How often do you use social media specifically to <span style="text-decoration: underline;">post or share political content?</span></label>
                <select id="sm_post_poli" name="sm_post_poli" required>
                <option value="" selected disabled>Select an option</option>
                <option value="daily_or_more">Daily or more</option>
                <option value="4-6_times_a_week">4-6 times a week</option>
                <option value="2-3_times_a_week">2-3 times a week</option>
                <option value="once_per_week">Once per week</option>
                <option value="between_once_per_week_and_once_per_month">Between once per week and once per month</option>
                <option value="between_once_per_month_and_once_per_year">Between once per month and once per year</option>
                <option value="never">Never</option>
                </select>
            </div>
        </div>
        <div class="survey-container">
            <div class="survey-question">
                <label for="sm_post_poli_slider">If you use social media to <span style="text-decoration: underline;">post or share political content</span> daily or more, use the slider to indicate how many times per day you tend to use social media to post or share political content. If you don't use social media to post or sharepolitical content daily or more, then leave the slider at 0.</label>
                <div class="slider-container">
                    <input type="range" id="sm_post_poli_slider" name="sm_post_poli_slider" min="0" max="100" value="0" step="1">
                    <output for="sm_post_poli_slider" id="sm_post_poli_slider_value">0</output>
                </div>
            </div>
        </div>  
        <div class="survey-container">
            <div class="survey-question">
                <label for="share_why">If you share (e.g. retweet, share, repost) content on social media, why do you typically share it (check all that apply)?</label>
                <div class="multi-select-options">
                    <label><input type="checkbox" name="share_why_1" value="see_content"> I want people to see the content</label>
                    <label><input type="checkbox" name="share_why_2" value="make_laugh"> I want to make people laugh</label>
                    <label><input type="checkbox" name="share_why_3" value="change_opinions"> I want to change people's opinions</label>
                    <label><input type="checkbox" name="share_why_4" value="troll_people"> I want to troll people</label>
                    <label><input type="checkbox" name="share_why_5" value="represents_beliefs"> The content represents my beliefs or attitudes</label>
                    <label><input type="checkbox" name="share_why_6" value="show_common_beliefs"> I want to show people that we share common beliefs or attitudes</label>
                    <label><input type="checkbox" name="share_why_7" value="other"> Other</label>
                </div>
            </div>
        </div>   
    `,
    button_label: "Next >",

    on_load: function() {
        const sliders = ['sm_use_slider', 'sm_use_poli_slider', 'sm_post_poli_slider'];
        sliders.forEach(sliderId => {
            const slider = document.getElementById(sliderId);
            const output = document.getElementById(`${sliderId}_value`);
            slider.oninput = function() {
                output.value = this.value;
            }
        });

        window.removeRequiredAttributes();
    }
}

// export surveys so they can be imported in the main file
if (typeof module !== 'undefined') {
    module.exports = {
        demographicsSurvey,
        politicalSurvey,
        socialMediaSurvey
    };
}