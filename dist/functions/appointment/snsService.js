"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishAppointment = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const sns = new aws_sdk_1.default.SNS();
const TOPIC_ARN = process.env.SNS_TOPIC_ARN || "";
const publishAppointment = async (appointment) => {
    const snsParams = {
        TopicArn: TOPIC_ARN,
        Message: JSON.stringify(appointment),
        MessageAttributes: {
            countryISO: {
                DataType: "String",
                StringValue: appointment.countryISO,
            },
        },
    };
    await sns.publish(snsParams).promise();
};
exports.publishAppointment = publishAppointment;
