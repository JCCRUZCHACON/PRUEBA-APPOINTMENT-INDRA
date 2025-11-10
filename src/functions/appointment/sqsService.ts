import AWS from "aws-sdk";

const sqs = new AWS.SQS();
const SQS_CONFIRMATION_URL = process.env.SQS_CONFIRMATION_URL || "";

interface Schedule {
  scheduleId: number;
  centerId?: number;
  specialtyId?: number;
  medicId?: number;
  date?: string;
}

interface Appointment {
  insuredId: string;
  scheduleId: number;
  countryISO: string;
  schedule?: Schedule;
  status?: string;
  createdAt?: string;
}

export const sendConfirmation = async (appointment: Appointment): Promise<void> => {
  const message = {
    insuredId: appointment.insuredId,
    scheduleId: appointment.scheduleId,
    status: "completed",
    countryISO: appointment.countryISO,
  };

  await sqs.sendMessage({
    QueueUrl: SQS_CONFIRMATION_URL,
    MessageBody: JSON.stringify(message),
  }).promise();
};
