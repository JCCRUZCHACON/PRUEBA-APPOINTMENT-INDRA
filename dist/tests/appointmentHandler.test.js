"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const handler_1 = require("../functions/appointment/handler");
const dynamoService = __importStar(require("../functions/appointment/dynamoService"));
const snsService = __importStar(require("../functions/appointment/snsService"));
const sqsService = __importStar(require("../functions/appointment/sqsService"));
jest.mock("../functions/appointment/dynamoService");
jest.mock("../functions/appointment/snsService");
jest.mock("../functions/appointment/sqsService");
describe("appointmentHandler", () => {
    beforeEach(() => {
        dynamoService.saveAppointment.mockReset();
        dynamoService.getAppointmentsByInsured.mockReset();
        snsService.publishAppointment.mockReset();
        sqsService.sendConfirmation.mockReset();
    });
    test("POST should save appointment and call services", async () => {
        const event = {
            httpMethod: "POST",
            body: JSON.stringify({
                insuredId: "1",
                countryISO: "MX",
                schedule: { scheduleId: "a", centerId: "b", specialtyId: "c", medicId: "d", date: "2025-01-01" }
            }),
            requestContext: { http: { method: "POST" } } // Para compatibilidad con APIGatewayV2
        };
        dynamoService.saveAppointment.mockResolvedValue({ id: "1" });
        await (0, handler_1.main)(event);
        expect(dynamoService.saveAppointment).toHaveBeenCalled();
        expect(snsService.publishAppointment).toHaveBeenCalled();
        expect(sqsService.sendConfirmation).toHaveBeenCalled();
    });
    test("GET should return appointments by insuredId", async () => {
        const event = { httpMethod: "GET", pathParameters: { insuredId: "1" }, requestContext: { http: { method: "GET" } } };
        dynamoService.getAppointmentsByInsured.mockResolvedValue([{ id: "1" }]);
        const res = await (0, handler_1.main)(event);
        expect(dynamoService.getAppointmentsByInsured).toHaveBeenCalledWith("1");
        expect(JSON.parse(res.body)[0].id).toBe("1");
    });
});
