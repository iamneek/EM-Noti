import { promises as fs } from 'fs';
import path from 'path';
import process from 'process';
import { authenticate } from '@google-cloud/local-auth';
import {google} from 'googleapis';

// Define Scopes

const SCOPE = ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.modify'];

// Fetch and Store tokens form files...
const TOKEN_PATH = path.join(process.cwd(), './credentials/token.json');

const CREDENTIALS_PATH = path.join(process.cwd(), './credentials/credentials.json');

async function LoadSavedCredentialsIfExists() {
    try {
        const content = await fs.readFile(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        console.log("Error: " + err.message);
        return null;
    }
}

async function saveCredentials(client) {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.web || keys.installed;

    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token
    });

    await fs.writeFile(TOKEN_PATH, payload);
}

async function authorize() {
    let client = await LoadSavedCredentialsIfExists();
    if (client) {
        return client;
    }

    console.log("No saved credentials found. Performing authentication...");
    client = await authenticate({
        scopes: SCOPE,
        keyfilePath: CREDENTIALS_PATH,
    });

    if (client.credentials) {
        await saveCredentials(client);
    }

    return client;
}


export default authorize;
