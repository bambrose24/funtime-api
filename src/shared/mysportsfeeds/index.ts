import {MSFClient} from './client';

export const msf = new MSFClient(process.env.MYSPORTSFEEDS_API_KEY || '');
