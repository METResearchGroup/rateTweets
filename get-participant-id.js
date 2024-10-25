// gets participant IDs extracted from frontend

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const BUCKET_NAME = 'jspsych-rate-tweets';
const ASSIGNMENTS_FILE = 'data/participant_assignments.json';

exports.handler = async (event) => {
    const prolificID = event.queryStringParameters.prolific_id;

    if (!prolificID) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'No Prolific ID provided' }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };
    }

    try {
        // read current assignments from S3
        const data = await s3.getObject({
            Bucket: BUCKET_NAME,
            Key: ASSIGNMENTS_FILE
        }).promise();

        let assignments = JSON.parse(data.Body.toString());

        if (assignments[prolificID]) {
            return {
                statusCode: 200,
                body: JSON.stringify({ participantID: assignments[prolificID] }),
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            };
        }

        // assign new ID
        const newParticipantID = Object.keys(assignments).length + 1;
        assignments[prolificID] = newParticipantID;

        // write updated assignments back to S3
        await s3.putObject({
            Bucket: BUCKET_NAME,
            Key: ASSIGNMENTS_FILE,
            Body: JSON.stringify(assignments),
            ContentType: 'application/json'
        }).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ participantID: newParticipantID }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };
    }
};