import AWS from "aws-sdk";

const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.DYNAMO_TABLE || ""; 

interface Schedule {
  scheduleId: number;
  centerId: number;
  specialtyId: number;
  medicId: number;
  date: string;
}

interface Appointment {
  insuredId: string;
  scheduleId: number;
  countryISO: "PE" | "CL";
  schedule: Schedule;
  status: string;
  createdAt: string;
}

export const saveAppointment = async (data: {
  insuredId: string;
  countryISO: "PE" | "CL";
  schedule: Schedule;
}): Promise<Appointment> => {
  const item: Appointment = {
    insuredId: data.insuredId,
    scheduleId: data.schedule.scheduleId,
    countryISO: data.countryISO,
    schedule: {
      scheduleId: data.schedule.scheduleId,
      centerId: data.schedule.centerId,
      specialtyId: data.schedule.specialtyId,
      medicId: data.schedule.medicId,
      date: data.schedule.date,
    },
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  await dynamo.put({ TableName: TABLE_NAME, Item: item }).promise();
  return item;
};

export const getAppointmentsByInsured = async (
  insuredId: string
): Promise<Appointment[] | undefined> => {
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: "insuredId = :insuredId",
    ExpressionAttributeValues: { ":insuredId": insuredId },
  };

  const result = await dynamo.query(params).promise();
  return result.Items as Appointment[] | undefined;
};
