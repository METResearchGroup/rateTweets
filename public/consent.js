// consent form
const consent = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <div class="consent-container">
            <h1>INFORMED CONSENT</h1>

            <h2>Title of Research Study:</h2>
            <p><strong>Judging Moral Opinions</strong></p>

            <h2>Principal Investigator:</h2>
            <p>William J. Brady</p>

            <h2>Supported By:</h2>
            <p>This research is supported by Northwestern University's Kellogg School of Management, approved by NU IRB on 11/9/22, IRB #: STU00218134</p>

            <h2>Key Information about this research study</h2>
            <p>The following is a short summary of this study to help you decide whether to be a part of this study. Information that is more detailed is explained later on in this form.</p>
            <ul>
                <li>The purpose of this study is to gain a deeper understanding of your attitudes, beliefs, and opinions on various topics.</li>
                <li>You will be asked to complete a set of questionnaires. You may also be asked to do activities like judging messages written in different contexts.</li>
                <li>We expect that you will be in this research study for around 10 minutes.</li>
                <li>The primary potential risk of participation is emotional distress from thinking about politically charged issues.</li>
                <li>The main benefit of being in this study is contributing to the scientific understanding of how the mind works and society functions.</li>
                <li>We cannot tell you every detail of this study ahead of time, but if you are willing to participate under these conditions, we will explain the procedure to you fully after your participation</li>
            </ul>

            <h2>Why am I being asked to take part in this research study?</h2>
            <p>We are asking you to take part in this research study because you at least 18 years of age and are living in the U.S. and because we are interested in your opinions and experiences.</p>

            <h2>How many people will be in this study?</h2>
            <p>We expect about 16,000 people will be in this research study.</p>

            <h2>What should I know about participating in a research study?</h2>
            <ul>
                <li>Whether or not you take part is up to you.</li>
                <li>You can choose not to take part.</li>
                <li>You can agree to take part and later change your mind.</li>
                <li>Your decision will not be held against you.</li>
                <li>You can ask all the questions you want before you decide.</li>
                <li>You do not have to answer any question you do not want to answer.</li>
            </ul>

            <h2>What happens if I say, "Yes, I want to be in this research"?</h2>
            <p>If you agree to participate, you will complete a research survey. The survey asks about your agreement or disagreement with various statements, along with free-response items. The topics include your attitudes and opinions about various topics, including your personal relationships and your political views. It includes some comprehension questions intended to make sure you understand information you have read.</p>

            <h2>Will being in this study help me in any way?</h2>
            <p>We cannot promise any benefits to you or others from your taking part in this research. However, possible benefits include the inherent interest value you may find in responding to the surveys and the value in contributing to society's understanding of the human mind.</p>

            <h2>Is there any way being in this study could be bad for me?</h2>
            <p>We do not foresee any risk in participating in this study. If you choose to participate, the effects should be comparable to those you would experience from completing a task and answering questions for few minutes using a mouse and keyboard (or using your smartphone). It is possible that you might be uncomfortable answering certain questions; if that happens, you may simply leave them blank. A possible risk for any research is that confidentiality could be compromised—that people outside the study might get hold of confidential study information. We will do everything we can to minimize this risk, as described in more detail later in this form.</p>

            <h2>What happens if I do not want to be in this research, or I change my mind later?</h2>
            <p>Participation in this research is voluntary. You may decide to participate or not to participate. If you do not want to be in this study or withdraw from the study at any point, your decision will not affect your compensation or relationship with Northwestern University in any way. You can leave the research at any time and it will not be held against you.</p>

            <h2>How will the researchers protect my information?</h2>
            <p>Data will be collected anonymously and will not be labeled with any identifying information. Moreover, data will be stored electronically on a password protected cloud storage service. The collection of information about participants is limited to the amount necessary to achieve the aims of research, so that no unneeded information is being collected.</p>

            <h2>Who will have access to the information collected during this research study?</h2>
            <p>Efforts will be made to limit the use and disclosure of your personal information, including research study records, to people who have a need to review this information. We cannot promise complete secrecy.</p>
            <p>There are reasons why information about you may be used or seen by other people beyond the research team during or after this study.</p>
            <p>Examples include: University officials, government officials, study funders, auditors, and the Institutional Review Board may need access to the study information to make sure the study is done in a safe and appropriate manner.</p>

            <h2>How might the information collected in this study be shared in the future?</h2>
            <p>We will keep the information we collect about you during this research study for study recordkeeping. Your name and other information that can directly identify you will be stored securely and separately from the rest of the research information we collect from you.</p>
            <p>De-identified data from this study may be shared with the research community, with journals in which study results are published, and with databases and data repositories used for research. We will remove or code any personal information that could directly identify you before the study data are shared. Despite these measures, we cannot guarantee the anonymity of your personal data.</p>
            <p>The results of this study could be shared in articles and presentations, but will not include any information that identifies you unless you give permission for use of information that identifies you in articles and presentations.</p>

            <h2>Will I be paid or given anything for taking part in this study?</h2>
            <p>You will receive $2.00 for your participation in this 10-minute study.</p>

            <h2>Who can I talk to?</h2>
            <p>If you have questions, concerns, or complaints, you can contact the Principal Investigator, William Brady, at william.brady@kellogg.northwestern.edu (or, if email doesn't work for you, via phone at 704-904-6420.</p>
            <p>This research has been reviewed and approved by an Institutional Review Board ("IRB") – an IRB is a committee that protects the rights of people who participate in research studies. You may contact the IRB by phone at (312) 503-9338 or by email at irb@northwestern.edu if:</p>
            <ul>
                <li>Your questions, concerns, or complaints are not being answered by the research team.</li>
                <li>You cannot reach the research team.</li>
                <li>You want to talk to someone besides the research team.</li>
                <li>You have questions about your rights as a research participant.</li>
                <li>You want to get information or provide input about this research.</li>
            </ul>

            <h2>Consent</h2>
            <p>If you want a copy of this consent for your records, you can print it from the screen.</p>
            <p>If you cannot print the consent and would like a copy for your records, contact the Principal Investigator with the contact information above.</p>

            <p style="text-align: center; margin-top: 20px; font-weight: bold;">
                Clicking "I agree" indicates that you are at least 18 years of age and agree to complete this survey voluntarily.
            </p>
        </div>
    `,
    choices: ['I do not agree', 'I agree'],
    // button_html: ['<button class="jspsych-btn">%choice%</button>'], // not used
    data: {
        consented: null
    },
    on_finish: function(data) {
        data.consented = data.response === 1 ? 1 : 0; // 1 if "I agree", 0 if "I do not agree"

        if (data.response === 0) { // 0 is the index of "I do not agree"
            jsPsych.endExperiment(`
                <div style="text-align: center; margin-top: 50px;">
                    <h2>You have not consented to participate in this study.</h2>
                    <p>Thank you for your time. You may now close this window.</p>
                </div>
            `);
        }
    }
};

if (typeof module !== 'undefined') {
    module.exports = { consent };
}