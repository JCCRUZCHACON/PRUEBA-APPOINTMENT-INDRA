"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const dynamo = new aws_sdk_1.default.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.DYNAMO_TABLE || "";
const main = async (event) => {
    for (const record of event.Records) {
        const confirmation = JSON.parse(record.body);
        const { insuredId, scheduleId } = confirmation;
        try {
            // Actualiza el estado a 'completed'
            const params = {
                TableName: TABLE_NAME,
                Key: { insuredId, scheduleId },
                UpdateExpression: "SET #st = :s",
                ExpressionAttributeNames: { "#st": "status" },
                ExpressionAttributeValues: { ":s": "completed" },
                ReturnValues: "ALL_NEW",
            };
            const result = await dynamo.update(params).promise();
            console.log(`✅ Cita ${scheduleId} de ${insuredId} actualizada a completed`, result.Attributes);
        }
        catch (err) {
            console.error("💥 Error actualizando estado:", err);
            throw err;
        }
    }
};
exports.main = main;
