const { Vonage } = require('@vonage/server-sdk');

const vonage = new Vonage({
    applicationId: VONAGE_APPLICATION_ID,
    privateKey: VONAGE_APPLICATION_PRIVATE_KEY_PATH
  });

module.exports = vonage;