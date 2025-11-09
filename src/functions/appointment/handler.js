const { saveAppointment, getAppointmentsByInsured } = require("./dynamoService.js");

exports.main = async (event) => {
  console.log("Evento recibido:", JSON.stringify(event));

  try {
    const method = event.requestContext?.http?.method || event.httpMethod;
    console.log("Método detectado:", method);

    if (method === "POST") {
      console.log("Entrando a POST...");
      const body = JSON.parse(event.body || "{}");
      console.log("Body recibido:", body);

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
        console.log("❌ Datos incompletos");
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "Datos incompletos. Debes enviar insuredId, countryISO y schedule completo.",
          }),
        };
      }

      console.log("Llamando a saveAppointment...");
      const result = await saveAppointment(body);
      console.log("✅ Resultado DynamoDB:", result);

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Cita creada correctamente",
          data: result,
        }),
      };
    }

    if (method === "GET") {
      console.log("Entrando a GET...");
      const insuredId = event.pathParameters?.insuredId;
      console.log("insuredId recibido:", insuredId);

      if (!insuredId) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "insuredId es requerido" }),
        };
      }

      const appointments = await getAppointmentsByInsured(insuredId);
      console.log("✅ Citas obtenidas:", appointments);

      return {
        statusCode: 200,
        body: JSON.stringify(appointments),
      };
    }

    console.log("Método no permitido:", method);
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Método no permitido" }),
    };
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
