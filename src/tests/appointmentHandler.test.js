const { main } = require("../functions/appointment/handler.js")
const dynamoService = require("../functions/appointment/dynamoService")
const snsService = require("../functions/appointment/snsService")
const sqsService = require("../functions/appointment/sqsService")

jest.mock("../functions/appointment/dynamoService")
jest.mock("../functions/appointment/snsService")
jest.mock("../functions/appointment/sqsService")

describe("appointmentHandler", () => {
  beforeEach(() => {
    dynamoService.saveAppointment.mockReset()
    dynamoService.getAppointmentsByInsured.mockReset()
    snsService.publishAppointment.mockReset()
    sqsService.sendConfirmation.mockReset()
  })

  test("POST should save appointment and call services", async () => {
    const event = {
      httpMethod: "POST",
      body: JSON.stringify({
        insuredId: "1",
        countryISO: "MX",
        schedule: { scheduleId: "a", centerId: "b", specialtyId: "c", medicId: "d", date: "2025-01-01" }
      })
    }
    dynamoService.saveAppointment.mockResolvedValue({ id: "1" })
    await main(event)
    expect(dynamoService.saveAppointment).toHaveBeenCalled()
    expect(snsService.publishAppointment).toHaveBeenCalled()
    expect(sqsService.sendConfirmation).toHaveBeenCalled()
  })

  test("GET should return appointments by insuredId", async () => {
    const event = { httpMethod: "GET", pathParameters: { insuredId: "1" } }
    dynamoService.getAppointmentsByInsured.mockResolvedValue([{ id: "1" }])
    const res = await main(event)
    expect(dynamoService.getAppointmentsByInsured).toHaveBeenCalledWith("1")
    expect(JSON.parse(res.body)[0].id).toBe("1")
  })
})
