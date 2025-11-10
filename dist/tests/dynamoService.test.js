"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dynamoService_1 = require("../functions/appointment/dynamoService");
jest.mock("aws-sdk", () => {
    return {
        DynamoDB: {
            DocumentClient: jest.fn(() => ({
                put: jest.fn(() => ({ promise: jest.fn().mockResolvedValue({}) })),
                query: jest.fn(() => ({ promise: jest.fn().mockResolvedValue({ Items: [] }) })),
            })),
        },
    };
});
describe("dynamoService", () => {
    test("saveAppointment should call dynamo put and return item", async () => {
        const data = {
            insuredId: "123",
            countryISO: "PE", // 👈 fuerza el tipo literal
            schedule: {
                scheduleId: 1,
                centerId: 1,
                specialtyId: 2,
                medicId: 3,
                date: "2025-11-10",
            },
        };
        const result = await (0, dynamoService_1.saveAppointment)(data);
        expect(result).toBeDefined();
        expect(result.insuredId).toBe(data.insuredId);
        expect(result.scheduleId).toBe(data.schedule.scheduleId);
        expect(result.schedule.centerId).toBe(data.schedule.centerId);
        expect(result.schedule.specialtyId).toBe(data.schedule.specialtyId);
        expect(result.schedule.medicId).toBe(data.schedule.medicId);
        expect(result.schedule.date).toBe(data.schedule.date);
        expect(result.status).toBe("pending");
        expect(result.createdAt).toBeDefined();
    });
    test("getAppointmentsByInsured should call dynamo query", async () => {
        const insuredId = "123";
        const result = await (0, dynamoService_1.getAppointmentsByInsured)(insuredId);
        expect(result).toEqual([]);
    });
});
