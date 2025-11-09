const AWS = require("aws-sdk");
const sns = new AWS.SNS();
const TOPIC_ARN = process.env.SNS_TOPIC_ARN;

//snsService.js
const publishAppointment = async (appointment) => {
  const snsParams = {
    TopicArn: TOPIC_ARN,
    Message: JSON.stringify(appointment),
    MessageAttributes: {
      countryISO: {
        DataType: "String",
        StringValue: appointment.countryISO,
      },
    },
  };

  await sns.publish(snsParams).promise();
};

module.exports = { publishAppointment };
