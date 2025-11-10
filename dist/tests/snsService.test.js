"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const snsService_1 = require("../functions/appointment/snsService");
const aws_sdk_1 = __importDefault(require("aws-sdk"));
jest.mock("aws-sdk", () => {
    const mSNS = { publish: jest.fn().mockReturnThis(), promise: jest.fn() };
    return { SNS: jest.fn(() => mSNS) };
});
describe("snsService", () => {
    let snsInstance;
    beforeAll(() => {
        snsInstance = new aws_sdk_1.default.SNS();
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
        await (0, snsService_1.publishAppointment)(appointment);
        expect(snsInstance.publish).toHaveBeenCalled();
    });
});
