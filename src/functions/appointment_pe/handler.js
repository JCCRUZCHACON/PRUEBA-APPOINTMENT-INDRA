// appointment_pe.js
const { SQSClient, DeleteMessageCommand } = require("@aws-sdk/client-sqs");
const mysql = require("mysql2/promise");

const SQS_URL = process.env.SQS_PE_URL;

const rdsConfig = {
  host: process.env.RDS_HOST,
  user: process.env.RDS_USER,
  password: process.env.RDS_PASSWORD,
  database: process.env.RDS_DB,
};

const sqsClient = new SQSClient({ region: "us-east-1" });

//appointment_pe.js
exports.handler = async (event) => {
  const connection = await mysql.createConnection(rdsConfig);

  try {
    for (const record of event.Records) {
      const data = JSON.parse(record.body);
      console.log("Procesando mensaje de SQS:", data);

      const query = `
        INSERT INTO appointments 
        (insuredId, scheduleId, countryISO, centerId, specialtyId, medicId, date, status, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await connection.execute(query, [
        data.insuredId,
        data.scheduleId,
        data.countryISO,
        data.schedule.centerId,
        data.schedule.specialtyId,
        data.schedule.medicId,
        data.schedule.date,
        data.status,
        data.createdAt
      ]);

      // Borrar mensaje de SQS
      await sqsClient.send(new DeleteMessageCommand({
        QueueUrl: SQS_URL,
        ReceiptHandle: record.receiptHandle
      }));

      console.log(`✅ Mensaje con scheduleId ${data.scheduleId} insertado en RDS y borrado de SQS`);
    }
  } catch (err) {
    console.error("💥 Error procesando mensajes:", err);
    throw err;
  } finally {
    await connection.end();
  }
};
