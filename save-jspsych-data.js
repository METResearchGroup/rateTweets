// saves experiment data to S3 bucket

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const BUCKET_NAME = 'jspsych-rate-tweets';
const DATA_PREFIX = 'data/';

exports.handler = async (event) => {
    // parse incoming JSON body
    const body = JSON.parse(event.body);

    if (!body || !body.csv) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'No data provided' }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };
    }

    const filename = `data_${Date.now()}.csv`;

    try {
        // write csv data to S3
        await s3.putObject({
            Bucket: BUCKET_NAME,
            Key: DATA_PREFIX + filename,
            Body: body.csv,
            ContentType: 'text/csv'
        }).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Data saved successfully' }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };
    } catch (error) {
        console.error('Error saving data to S3:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to save data to S3' }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };
    }
};