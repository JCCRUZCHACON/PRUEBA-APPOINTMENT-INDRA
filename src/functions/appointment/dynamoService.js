const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();
const sqs = new AWS.SQS();

const TABLE_NAME = process.env.DYNAMO_TABLE;
const TOPIC_ARN = process.env.SNS_TOPIC_ARN;
const SQS_CONFIRMATION_URL = process.env.SQS_CONFIRMATION_URL; // Cola para conformidad

const saveAppointment = async (data) => {
  console.log("🔹 Guardando cita en DynamoDB:", data);

  const item = {
    insuredId: data.insuredId,
    scheduleId: data.schedule.scheduleId, // nivel raíz
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

  const params = {
    TableName: TABLE_NAME,
    Item: item,
  };

  // Guardar en DynamoDB
  await dynamo.put(params).promise();
  console.log("✅ Cita guardada exitosamente");

  // Publicar en SNS
  try {
    const snsParams = {
      TopicArn: TOPIC_ARN,
      Message: JSON.stringify(item),
      MessageAttributes: {
        countryISO: {
          DataType: "String",
          StringValue: item.countryISO,
        },
      },
    };

    console.log("📤 Publicando mensaje en SNS:", JSON.stringify(snsParams, null, 2));
    const result = await sns.publish(snsParams).promise();
    console.log("✅ Mensaje publicado en SNS con MessageId:", result.MessageId);
  } catch (err) {
    console.error("💥 Error publicando en SNS:", err);
  }

  // Enviar conformidad simulada a SQS (para paso 5 → Lambda de actualización)
  try {
    const confirmationMessage = {
      insuredId: item.insuredId,
      scheduleId: item.scheduleId,
      status: "completed",
      countryISO: item.countryISO,
    };

    await sqs
      .sendMessage({
        QueueUrl: SQS_CONFIRMATION_URL,
        MessageBody: JSON.stringify(confirmationMessage),
      })
      .promise();

    console.log("✅ Mensaje de conformidad enviado a SQS:", confirmationMessage);
  } catch (err) {
    console.error("💥 Error enviando mensaje de conformidad a SQS:", err);
  }

  return item;
};

const getAppointmentsByInsured = async (insuredId) => {
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: "insuredId = :insuredId",
    ExpressionAttributeValues: {
      ":insuredId": insuredId,
    },
  };

  const result = await dynamo.query(params).promise();
  return result.Items;
};

module.exports = {
  saveAppointment,
  getAppointmentsByInsured,
};
