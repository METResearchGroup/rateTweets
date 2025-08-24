var jsPsychSocialMediaFeed = (function (jspsych) {
  'use strict';

  const info = {
    name: "social-media-feed",
    version: "1.0.0",
    parameters: {
      images: {
        type: jspsych.ParameterType.ARRAY,
        default: []
      },
      trial_duration: {
        type: jspsych.ParameterType.INT,
        default: null
      },
      require_scroll_to_bottom: {
        type: jspsych.ParameterType.BOOL,
        default: true
      }
    },
    data: {
      images_shown: {
        type: jspsych.ParameterType.ARRAY,
        array: true
      },
      like_states: {
        type: jspsych.ParameterType.ARRAY,
        array: true
      },
      share_states: {
        type: jspsych.ParameterType.ARRAY,
        array: true
      },
      liked_images: {
        type: jspsych.ParameterType.ARRAY,
        array: true
      },
      shared_images: {
        type: jspsych.ParameterType.ARRAY,
        array: true
      },
      scroll_to_bottom: {
        type: jspsych.ParameterType.BOOL
      }
    }
  };

  class SocialMediaFeedPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }
    
    static info = info;
    
    trial(display_element, trial) {
      // Create the feed container
      var feedHTML = `
        <div class="social-media-feed-container">
          <div class="feed-header">
            <h2>Social Media Feed</h2>
            <p>Scroll through the posts below. You can like and share posts you find interesting.</p>
          </div>
          <div class="feed-content" id="feed-content">
            ${trial.images.map((img, index) => `
              <div class="feed-post" data-image="${img}" data-index="${index}">
                <div class="post-content">
                  <img src="${img}" alt="Post content" class="post-image">
                </div>
                <div class="post-actions" style="display: flex; justify-content: flex-end; padding: 15px; border-top: 1px solid #f1f3f4;">
                  <button class="like-btn" data-index="${index}" onclick="toggleLike(${index})">
                    <span class="like-icon">♡</span>
                    <span class="like-count">0</span>
                  </button>
                  <button class="share-btn" data-index="${index}" onclick="toggleShare(${index})">
                    <span class="share-icon">↗</span>
                    <span class="share-text">Share</span>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
          <div class="feed-footer">
            <button id="continue-btn" class="continue-button" disabled>Continue</button>
          </div>
        </div>
      `;

      display_element.innerHTML = feedHTML;

      // Initialize like/share tracking
      var likeStates = new Array(trial.images.length).fill(false);
      var shareStates = new Array(trial.images.length).fill(false);
      var scrollToBottom = false;

      // Global functions for like/share buttons
      window.toggleLike = function(index) {
        likeStates[index] = !likeStates[index];
        var btn = document.querySelector(`[data-index="${index}"].like-btn`);
        var icon = btn.querySelector('.like-icon');
        var count = btn.querySelector('.like-count');
        
        if (likeStates[index]) {
          icon.textContent = '♥';
          icon.style.color = '#e74c3c';
          count.textContent = parseInt(count.textContent) + 1;
        } else {
          icon.textContent = '♡';
          icon.style.color = '#333';
          count.textContent = parseInt(count.textContent) - 1;
        }
      };

      window.toggleShare = function(index) {
        shareStates[index] = !shareStates[index];
        var btn = document.querySelector(`[data-index="${index}"].share-btn`);
        var text = btn.querySelector('.share-text');
        
        if (shareStates[index]) {
          text.textContent = 'Shared';
          btn.style.backgroundColor = '#27ae60';
          btn.style.color = 'white';
        } else {
          text.textContent = 'Share';
          btn.style.backgroundColor = '#3498db';
          btn.style.color = 'white';
        }
      };

      // Handle scrolling
      var feedContent = document.getElementById('feed-content');
      var continueBtn = document.getElementById('continue-btn');

      feedContent.addEventListener('scroll', function() {
        if (trial.require_scroll_to_bottom) {
          var scrollTop = feedContent.scrollTop;
          var scrollHeight = feedContent.scrollHeight;
          var clientHeight = feedContent.clientHeight;
          
          if (scrollTop + clientHeight >= scrollHeight - 10) {
            scrollToBottom = true;
            continueBtn.disabled = false;
          }
        }
      });

      // Continue button handler
      continueBtn.addEventListener('click', function() {
        // Clean up global functions
        delete window.toggleLike;
        delete window.toggleShare;
        
        // Use global jsPsych instead of this.jsPsych
        jsPsych.finishTrial({
          images_shown: trial.images,
          like_states: likeStates,
          share_states: shareStates,
          liked_images: trial.images.filter((_, i) => likeStates[i]),
          shared_images: trial.images.filter((_, i) => shareStates[i]),
          scroll_to_bottom: scrollToBottom
        });
      });

      // Auto-enable continue button if scroll requirement is disabled
      if (!trial.require_scroll_to_bottom) {
        continueBtn.disabled = false;
      }
    }
  }

  return SocialMediaFeedPlugin;

})(jsPsychModule);


// DEBUG: Check if plugin was registered
// console.log("jsPsych object keys:", Object.keys(jsPsych));
// console.log("jsPsychModule object keys:", Object.keys(jsPsychModule));
// console.log("window object has jsPsychSocialMediaFeed:", typeof window.jsPsychSocialMediaFeed !== 'undefined');
// console.log("window object has jsPsychInstructions:", typeof window.jsPsychInstructions !== 'undefined');
// console.log("window object has jsPsychHtmlSliderResponse:", typeof window.jsPsychHtmlSliderResponse !== 'undefined');

// DEBUG: Check what randomization methods are available
// console.log("jsPsych.randomization keys:", Object.keys(jsPsych.randomization));
// console.log("jsPsych.randomization methods:", typeof jsPsych.randomization);