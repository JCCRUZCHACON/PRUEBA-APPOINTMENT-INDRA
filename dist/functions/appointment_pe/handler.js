"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_sqs_1 = require("@aws-sdk/client-sqs");
const promise_1 = __importDefault(require("mysql2/promise"));
const SQS_URL = process.env.SQS_PE_URL || "";
const rdsConfig = {
    host: process.env.RDS_HOST || "",
    user: process.env.RDS_USER || "",
    password: process.env.RDS_PASSWORD || "",
    database: process.env.RDS_DB || "",
};
const sqsClient = new client_sqs_1.SQSClient({ region: "us-east-1" });
const handler = async (event) => {
    const connection = await promise_1.default.createConnection(rdsConfig);
    try {
        for (const record of event.Records) {
            const data = JSON.parse(record.body);
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
            await sqsClient.send(new client_sqs_1.DeleteMessageCommand({
                QueueUrl: SQS_URL,
                ReceiptHandle: record.receiptHandle,
            }));
            console.log(`✅ Mensaje con scheduleId ${data.scheduleId} insertado en RDS y borrado de SQS PE`);
        }
    }
    catch (err) {
        console.error("💥 Error procesando mensajes PE:", err);
        throw err;
    }
    finally {
        await connection.end();
    }
};
exports.handler = handler;
