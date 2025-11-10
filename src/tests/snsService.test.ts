import { publishAppointment } from "../functions/appointment/snsService";
import AWS from "aws-sdk";

jest.mock("aws-sdk", () => {
  const mSNS = { publish: jest.fn().mockReturnThis(), promise: jest.fn() };
  return { SNS: jest.fn(() => mSNS) };
});

describe("snsService", () => {
  let snsInstance: any;

  beforeAll(() => {
    snsInstance = new AWS.SNS();
  });

  test("publishAppointment should call sns publish", async () => {
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

    snsInstance.promise.mockResolvedValueOnce({});
    await publishAppointment(appointment);
    expect(snsInstance.publish).toHaveBeenCalled();
  });
});
