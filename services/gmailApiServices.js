import { google } from "googleapis";

async function listEmails(auth) {
    const gmail = google.gmail({ version: 'v1', auth });
    const res = await gmail.users.messages.list({
        userId: 'me',
        maxResults: 10,
        q: "category:primary",
    });

    if (!res.data.messages || res.data.messages.length === 0) {
        console.log("No emails found.");
        return [];
    }

    const emailDetails = [];

    for (let message of res.data.messages) {
        const messageContent = await gmail.users.messages.get({
            userId: 'me',
            id: message.id,
        });

        // Extract subject
        const headers = messageContent.data.payload.headers;
        const subjectHeader = headers.find(header => header.name === "Subject");
        const subject = subjectHeader ? subjectHeader.value : "No Subject";

        // Extract snippet
        const snippet = messageContent.data.snippet || "No snippet available";

        // Extract ID, for later use so that I can -> Delete or view full message.
        const emailId = message.id;

        emailDetails.push({emailId, subject, snippet });
    }
    return emailDetails;
}

async function lastEmail(auth) {
    const gmail = google.gmail({ version: 'v1', auth });
    const res = await gmail.users.messages.list({
        userId: 'me',
        maxResults: 1,
        q: "category:primary",
    });

    if (!res.data.messages || res.data.messages.length === 0) {
        console.log("No emails found.");
        return [];
    }

    const latestEmail = [];

    for (let message of res.data.messages) {
        const messageContent = await gmail.users.messages.get({
            userId: 'me',
            id: message.id,
        });
        const header = messageContent.data.payload.headers;
        const subjectHeader = header.find(header => header.name === "Subject");
        const subject = subjectHeader ? subjectHeader.value : "No Subject";
        const snippet = messageContent.data.snippet || "No snippet available";
        const emailId = message.id;

        latestEmail.push({emailId, subject, snippet });
    }
    return latestEmail;
}


export { listEmails, lastEmail };
