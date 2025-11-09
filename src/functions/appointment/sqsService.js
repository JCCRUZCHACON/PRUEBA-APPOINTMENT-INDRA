const AWS = require("aws-sdk");
const sqs = new AWS.SQS();
const SQS_CONFIRMATION_URL = process.env.SQS_CONFIRMATION_URL;

//sqsService.js
const sendConfirmation = async (appointment) => {
  const message = {
    insuredId: appointment.insuredId,
    scheduleId: appointment.scheduleId,
    status: "completed",
    countryISO: appointment.countryISO,
  };

  await sqs.sendMessage({
    QueueUrl: SQS_CONFIRMATION_URL,
    MessageBody: JSON.stringify(message),
  }).promise();
};

module.exports = { sendConfirmation };
