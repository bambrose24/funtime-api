'use strict';
Object.defineProperty(exports, '__esModule', {value: true});
const mail_1 = require('@sendgrid/mail');
const mailClient = new mail_1.MailService();
mailClient.setApiKey(process.env.SENDGRID_API_KEY || '');
exports.default = mailClient;
