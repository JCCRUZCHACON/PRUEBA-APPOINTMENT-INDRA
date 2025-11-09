const { sendConfirmation } = require("../functions/appointment/sqsService")
const AWS = require("aws-sdk")
jest.mock("aws-sdk", () => {
  const mSQS = { sendMessage: jest.fn().mockReturnThis(), promise: jest.fn() }
  return { SQS: jest.fn(() => mSQS) }
})

describe("sqsService", () => {
  let sqsInstance

  beforeAll(() => {
    sqsInstance = new AWS.SQS()
  })

  test("sendConfirmation should call sqs sendMessage", async () => {
    const appointment = { insuredId: "1", scheduleId: "a", countryISO: "MX" }
    sqsInstance.promise.mockResolvedValueOnce({})
    await sendConfirmation(appointment)
    expect(sqsInstance.sendMessage).toHaveBeenCalled()
  })
})
