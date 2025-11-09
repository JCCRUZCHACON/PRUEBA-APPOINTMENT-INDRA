const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.DYNAMO_TABLE;

//dynamoService.js
const saveAppointment = async (data) => {
  const item = {
    insuredId: data.insuredId,
    scheduleId: data.schedule.scheduleId,
    countryISO: data.countryISO,
    schedule: {
      centerId: data.schedule.centerId,
      specialtyId: data.schedule.specialtyId,
      medicId: data.schedule.medicId,
      date: data.schedule.date,
    },
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  await dynamo.put({ TableName: TABLE_NAME, Item: item }).promise();
  return item;
};

const getAppointmentsByInsured = async (insuredId) => {
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: "insuredId = :insuredId",
    ExpressionAttributeValues: { ":insuredId": insuredId },
  };

  const result = await dynamo.query(params).promise();
  return result.Items;
};

module.exports = { saveAppointment, getAppointmentsByInsured };
