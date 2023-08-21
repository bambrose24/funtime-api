import {MailService} from '@sendgrid/mail';
import {Resend} from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY || '');

const mailClient = new MailService();
mailClient.setApiKey(process.env.SENDGRID_API_KEY || '');

export {mailClient};
