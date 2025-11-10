"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqsService_1 = require("../functions/appointment/sqsService");
const aws_sdk_1 = __importDefault(require("aws-sdk"));
jest.mock("aws-sdk", () => {
    const mSQS = { sendMessage: jest.fn().mockReturnThis(), promise: jest.fn() };
    return { SQS: jest.fn(() => mSQS) };
});
describe("sqsService", () => {
    let sqsInstance;
    beforeAll(() => {
        sqsInstance = new aws_sdk_1.default.SQS();
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
        await (0, sqsService_1.sendConfirmation)(appointment);
        expect(sqsInstance.sendMessage).toHaveBeenCalled();
    });
});
