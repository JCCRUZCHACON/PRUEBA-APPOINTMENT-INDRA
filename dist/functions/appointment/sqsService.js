"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendConfirmation = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const sqs = new aws_sdk_1.default.SQS();
const SQS_CONFIRMATION_URL = process.env.SQS_CONFIRMATION_URL || "";
const sendConfirmation = async (appointment) => {
    const message = {
        insuredId: appointment.insuredId,
        scheduleId: appointment.scheduleId,
        status: "completed",
        countryISO: appointment.countryISO,
    };
    await sqs.sendMessage({
        QueueUrl: SQS_CONFIRMATION_URL,
        MessageBody: JSON.stringify(message),
    }).promise();
};
exports.sendConfirmation = sendConfirmation;
