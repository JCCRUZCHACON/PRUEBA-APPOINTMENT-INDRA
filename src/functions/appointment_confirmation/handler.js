// appointment_confirmation.js
const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.DYNAMO_TABLE;

//appointment_confirmation
exports.main = async (event) => {
  for (const record of event.Records) {
    const confirmation = JSON.parse(record.body);

    const { insuredId, scheduleId } = confirmation;

    try {
      // Actualiza el estado a 'completed'
      const params = {
        TableName: TABLE_NAME,
        Key: { insuredId, scheduleId },
        UpdateExpression: "SET #st = :s",
        ExpressionAttributeNames: { "#st": "status" },
        ExpressionAttributeValues: { ":s": "completed" },
        ReturnValues: "ALL_NEW",
      };

      const result = await dynamo.update(params).promise();
      console.log(`✅ Cita ${scheduleId} de ${insuredId} actualizada a completed`, result.Attributes);
    } catch (err) {
      console.error("💥 Error actualizando estado:", err);
      throw err;
    }
  }
};
