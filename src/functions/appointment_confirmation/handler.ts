import AWS from "aws-sdk";

const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.DYNAMO_TABLE || "";

interface ConfirmationMessage {
  insuredId: string;
  scheduleId: number;
}

export const main = async (event: any): Promise<void> => {
  for (const record of event.Records) {
    const confirmation: ConfirmationMessage = JSON.parse(record.body);
    const { insuredId, scheduleId } = confirmation;

    try {
      // Actualiza el estado a 'completed'
      const params: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
        TableName: TABLE_NAME,
        Key: { insuredId, scheduleId },
        UpdateExpression: "SET #st = :s",
        ExpressionAttributeNames: { "#st": "status" },
        ExpressionAttributeValues: { ":s": "completed" },
        ReturnValues: "ALL_NEW",
      };

      const result = await dynamo.update(params).promise();
      console.log(
        `✅ Cita ${scheduleId} de ${insuredId} actualizada a completed`,
        result.Attributes
      );
    } catch (err: unknown) {
      console.error("💥 Error actualizando estado:", err);
      throw err;
    }
  }
};
