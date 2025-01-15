import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const twilioConfig = {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  phoneNumber: process.env.TWILIO_PHONE_NUMBER
};

// Verify Twilio credentials are loaded
console.log('Checking Twilio credentials in twilio.js...');
console.log('TWILIO_ACCOUNT_SID:', twilioConfig.accountSid ? 'Present' : 'Missing');
console.log('TWILIO_AUTH_TOKEN:', twilioConfig.authToken ? 'Present' : 'Missing');
console.log('TWILIO_PHONE_NUMBER:', twilioConfig.phoneNumber);

