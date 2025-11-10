import { main } from "../functions/appointment/handler";
import * as dynamoService from "../functions/appointment/dynamoService";
import * as snsService from "../functions/appointment/snsService";
import * as sqsService from "../functions/appointment/sqsService";

jest.mock("../functions/appointment/dynamoService");
jest.mock("../functions/appointment/snsService");
jest.mock("../functions/appointment/sqsService");

describe("appointmentHandler", () => {
  beforeEach(() => {
    (dynamoService.saveAppointment as jest.Mock).mockReset();
    (dynamoService.getAppointmentsByInsured as jest.Mock).mockReset();
    (snsService.publishAppointment as jest.Mock).mockReset();
    (sqsService.sendConfirmation as jest.Mock).mockReset();
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
    
    (dynamoService.saveAppointment as jest.Mock).mockResolvedValue({ id: "1" });
    
    await main(event as any);
    
    expect(dynamoService.saveAppointment).toHaveBeenCalled();
    expect(snsService.publishAppointment).toHaveBeenCalled();
    expect(sqsService.sendConfirmation).toHaveBeenCalled();
  });

  test("GET should return appointments by insuredId", async () => {
    const event = { httpMethod: "GET", pathParameters: { insuredId: "1" }, requestContext: { http: { method: "GET" } } };
    
    (dynamoService.getAppointmentsByInsured as jest.Mock).mockResolvedValue([{ id: "1" }]);
    
    const res = await main(event as any);
    
    expect(dynamoService.getAppointmentsByInsured).toHaveBeenCalledWith("1");
    expect(JSON.parse(res.body)[0].id).toBe("1");
  });
});
