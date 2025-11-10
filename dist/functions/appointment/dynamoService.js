"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppointmentsByInsured = exports.saveAppointment = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const dynamo = new aws_sdk_1.default.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.DYNAMO_TABLE || "";
const saveAppointment = async (data) => {
    const item = {
        insuredId: data.insuredId,
        scheduleId: data.schedule.scheduleId,
        countryISO: data.countryISO,
        schedule: {
            scheduleId: data.schedule.scheduleId,
            centerId: data.schedule.centerId,
            specialtyId: data.schedule.specialtyId,
            medicId: data.schedule.medicId,
            date: data.schedule.date,
        },
        status: "pending",
        createdAt: new Date().toISOString(),
    };
    await dynamo.put({ TableName: TABLE_NAME, Item: item }).promise();
    return item;
};
exports.saveAppointment = saveAppointment;
const getAppointmentsByInsured = async (insuredId) => {
    const params = {
        TableName: TABLE_NAME,
        KeyConditionExpression: "insuredId = :insuredId",
        ExpressionAttributeValues: { ":insuredId": insuredId },
    };
    const result = await dynamo.query(params).promise();
    return result.Items;
};
exports.getAppointmentsByInsured = getAppointmentsByInsured;
