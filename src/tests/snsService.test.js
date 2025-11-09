const { publishAppointment } = require("../functions/appointment/snsService")
const AWS = require("aws-sdk")
jest.mock("aws-sdk", () => {
  const mSNS = { publish: jest.fn().mockReturnThis(), promise: jest.fn() }
  return { SNS: jest.fn(() => mSNS) }
})

describe("snsService", () => {
  let snsInstance

  beforeAll(() => {
    snsInstance = new AWS.SNS()
  })

  test("publishAppointment should call sns publish", async () => {
    const appointment = { insuredId: "1", countryISO: "MX" }
    snsInstance.promise.mockResolvedValueOnce({})
    await publishAppointment(appointment)
    expect(snsInstance.publish).toHaveBeenCalled()
  })
})
