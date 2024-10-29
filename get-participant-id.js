// gets participant IDs extracted from frontend

import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({ region: "us-east-2" });

const BUCKET_NAME = 'jspsych-rate-tweets';
const ASSIGNMENTS_FILE = 'data/participant_assignments.json';

export const handler = async (event) => {
    // handle DELETE requests for removing participant IDs
    if (event.httpMethod === 'DELETE') {
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
            // read current assignments
            const data = await s3Client.send(new GetObjectCommand({
                Bucket: BUCKET_NAME,
                Key: ASSIGNMENTS_FILE
            }));
            const assignments = JSON.parse(await data.Body.transformToString());

            // remove the participant
            delete assignments[prolificID];

            // write updated assignments back to S3
            await s3Client.send(new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: ASSIGNMENTS_FILE,
                Body: JSON.stringify(assignments),
                ContentType: 'application/json'
            }));

            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Participant ID removed successfully' }),
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
    }

    // handle GET requests for assigning participant IDs
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
        let assignments;
        try {
            const data = await s3Client.send(new GetObjectCommand({
                Bucket: BUCKET_NAME,
                Key: ASSIGNMENTS_FILE
            }));
            assignments = JSON.parse(await data.Body.transformToString());
        } catch (error) {
            if (error.name === 'NoSuchKey') {
                assignments = {};
            } else {
                console.error('Error reading assignments from S3:', error);
                throw error;
            }
        }

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
        await s3Client.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: ASSIGNMENTS_FILE,
            Body: JSON.stringify(assignments),
            ContentType: 'application/json'
        }));

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