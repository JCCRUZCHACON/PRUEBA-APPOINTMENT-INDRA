import { sendConfirmation } from "../functions/appointment/sqsService";
import AWS from "aws-sdk";

jest.mock("aws-sdk", () => {
  const mSQS = { sendMessage: jest.fn().mockReturnThis(), promise: jest.fn() };
  return { SQS: jest.fn(() => mSQS) };
});

describe("sqsService", () => {
  let sqsInstance: any;

  beforeAll(() => {
    sqsInstance = new AWS.SQS();
  });

  test("sendConfirmation should call sqs sendMessage", async () => {
    const appointment = {
      insuredId: "1",
      scheduleId: 1,
      countryISO: "PE",
      schedule: {
        scheduleId: 1,
        centerId: 1,
        specialtyId: 1,
        medicId: 1,
        date: "2025-11-10",
      },
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    sqsInstance.promise.mockResolvedValueOnce({});
    await sendConfirmation(appointment);
    expect(sqsInstance.sendMessage).toHaveBeenCalled();
  });
});
