import AWS from "aws-sdk";

const sns = new AWS.SNS();
const TOPIC_ARN = process.env.SNS_TOPIC_ARN || "";

interface Schedule {
  scheduleId: number;
  centerId: number;
  specialtyId: number;
  medicId: number;
  date: string;
}

interface Appointment {
  insuredId: string;
  countryISO: string;
  schedule: Schedule;
  status?: string;
  createdAt?: string;
}

export const publishAppointment = async (appointment: Appointment): Promise<void> => {
  const snsParams = {
    TopicArn: TOPIC_ARN,
    Message: JSON.stringify(appointment),
    MessageAttributes: {
      countryISO: {
        DataType: "String",
        StringValue: appointment.countryISO,
      },
    },
  };

  await sns.publish(snsParams).promise();
};
