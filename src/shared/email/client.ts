import {MailService} from '@sendgrid/mail';

const mailClient = new MailService();
mailClient.setApiKey(process.env.SENDGRID_API_KEY || '');

export default mailClient;
