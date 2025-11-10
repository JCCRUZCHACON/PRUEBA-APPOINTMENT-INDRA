"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const dynamoService_1 = require("./dynamoService");
const snsService_1 = require("./snsService");
const sqsService_1 = require("./sqsService");
// Lambda handler
const main = async (event) => {
    try {
        const method = event.requestContext?.http?.method || event.httpMethod;
        // ---------------- POST /appointments ----------------
        if (method === "POST") {
            const body = JSON.parse(event.body || "{}");
            // Validación básica
            if (!body.insuredId ||
                !body.countryISO ||
                !body.schedule ||
                !body.schedule.scheduleId ||
                !body.schedule.centerId ||
                !body.schedule.specialtyId ||
                !body.schedule.medicId ||
                !body.schedule.date) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ message: "Datos incompletos" }),
                };
            }
            // Guardar cita en DynamoDB
            const appointment = await (0, dynamoService_1.saveAppointment)(body);
            // Publicar en SNS
            await (0, snsService_1.publishAppointment)(appointment);
            // Enviar confirmación simulada a SQS
            await (0, sqsService_1.sendConfirmation)(appointment);
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: "Cita creada correctamente",
                    data: appointment,
                }),
            };
        }
        // ---------------- GET /appointments/{insuredId} ----------------
        if (method === "GET") {
            const insuredId = event.pathParameters?.insuredId;
            if (!insuredId) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ message: "insuredId es requerido" }),
                };
            }
            const appointments = await (0, dynamoService_1.getAppointmentsByInsured)(insuredId);
            return {
                statusCode: 200,
                body: JSON.stringify(appointments),
            };
        }
        // ---------------- Método no permitido ----------------
        return { statusCode: 405, body: "Método no permitido" };
    }
    catch (err) {
        console.error("💥 Error en Lambda:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error interno del servidor",
                error: err.message,
            }),
        };
    }
};
exports.main = main;
