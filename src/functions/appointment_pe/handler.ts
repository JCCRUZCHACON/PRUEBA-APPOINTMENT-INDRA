import { SQSClient, DeleteMessageCommand } from "@aws-sdk/client-sqs";
import mysql from "mysql2/promise";

const SQS_URL = process.env.SQS_PE_URL || "";

const rdsConfig = {
  host: process.env.RDS_HOST || "",
  user: process.env.RDS_USER || "",
  password: process.env.RDS_PASSWORD || "",
  database: process.env.RDS_DB || "",
};

const sqsClient = new SQSClient({ region: "us-east-1" });

interface Schedule {
  centerId: number;
  specialtyId: number;
  medicId: number;
  date: string;
}

interface AppointmentMessage {
  insuredId: string;
  scheduleId: number;
  countryISO: string;
  schedule: Schedule;
  status: string;
  createdAt: string;
}

export const handler = async (event: any): Promise<void> => {
  const connection = await mysql.createConnection(rdsConfig);

  try {
    for (const record of event.Records) {
      const data: AppointmentMessage = JSON.parse(record.body);
      console.log("Procesando mensaje de SQS PE:", data);

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
        data.createdAt,
      ]);

      // Borrar mensaje de SQS
      await sqsClient.send(
        new DeleteMessageCommand({
          QueueUrl: SQS_URL,
          ReceiptHandle: record.receiptHandle,
        })
      );

      console.log(`✅ Mensaje con scheduleId ${data.scheduleId} insertado en RDS y borrado de SQS PE`);
    }
  } catch (err: unknown) {
    console.error("💥 Error procesando mensajes PE:", err);
    throw err;
  } finally {
    await connection.end();
  }
};
