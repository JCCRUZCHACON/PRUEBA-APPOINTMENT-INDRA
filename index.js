module.exports.handler = async (event) => {
  console.log("Variables de entorno:", process.env);

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: "Hola Mundo desde Lambda",
        db: process.env.RDS_DB,
        input: event,
      },
      null,
      2
    ),
  };
};
