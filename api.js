import authorize from './services/googleAuthService.js';
import {listEmails, lastEmail} from './services/gmailApiServices.js';
import { shell } from 'electron';

async function getEmail() {
    let auth = await authorize();
    let emailDetails = await listEmails(auth);
    return emailDetails;
}

async function getLatestEmail() {
    let auth = await authorize();
    let latestEmail = await lastEmail(auth);
    return latestEmail;
}


function openBrowser() {
    shell.openExternal("https://mail.google.com/mail/u/1/#inbox")
}

function sendNotification() {}

export {getEmail, getLatestEmail, openBrowser};
