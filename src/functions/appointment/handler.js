const { saveAppointment, getAppointmentsByInsured } = require("./dynamoService");
const { publishAppointment } = require("./snsService");
const { sendConfirmation } = require("./sqsService");

//src/functions/appointment/handler.main
exports.main = async (event) => {
  try {
    const method = event.requestContext?.http?.method || event.httpMethod;

    // ---------------- POST /appointments ----------------
    if (method === "POST") {
      const body = JSON.parse(event.body || "{}");

      // Validación básica
      if (
        !body.insuredId ||
        !body.countryISO ||
        !body.schedule ||
        !body.schedule.scheduleId ||
        !body.schedule.centerId ||
        !body.schedule.specialtyId ||
        !body.schedule.medicId ||
        !body.schedule.date
      ) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Datos incompletos" }),
        };
      }

      // Guardar cita en DynamoDB
      const appointment = await saveAppointment(body);

      // Publicar en SNS
      await publishAppointment(appointment);

      // Enviar confirmación simulada a SQS
      await sendConfirmation(appointment);

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

      const appointments = await getAppointmentsByInsured(insuredId);
      return {
        statusCode: 200,
        body: JSON.stringify(appointments),
      };
    }

    // ---------------- Método no permitido ----------------
    return { statusCode: 405, body: "Método no permitido" };
  } catch (err) {
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
