import { app, BrowserWindow, Tray, Menu, ipcMain, Notification } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { getEmail, openBrowser, getLatestEmail} from './api.js';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let tray = null;

app.setLoginItemSettings({
    openAtLogin: true,
    openAsHidden: false,
    path: app.getPath('exe'),
});


app.whenReady().then(() => {
    app.setName("Em Noti");
    if (process.platform === 'win32')
{
    app.setAppUserModelId(app.name);
}
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: path.join(__dirname, '/assets', 'trayIcon.ico'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        resizable: false
    });

    mainWindow.on('close', (event) => {
        event.preventDefault();
        mainWindow.hide();
    });

    mainWindow.setMenu(null);

    tray = new Tray(path.join(__dirname, 'assets', 'trayIcon.png'));
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Show App', click: () => mainWindow.show() },
        {
            label: 'Quit',
            type: 'normal',
            click: () => {
                mainWindow.removeAllListeners('close');
                mainWindow.close();
                mainWindow.destroy();
                tray.destroy();
                app.quit();
            }
        }
    ]);
    tray.setToolTip('EM noti - Running');
    tray.setContextMenu(contextMenu);

    mainWindow.loadFile('index.html');

    ipcMain.handle('fetch-emails', async () => {
        try {
            const emailDetails = await getEmail();
            return emailDetails;
        } catch (error) {
            console.error('Error fetching emails:', error);
            return [];
        }
    });

    ipcMain.handle('open-browser', () => {
        try {
            openBrowser();
        } catch (error) {
            console.error('Error fetching emails:', error);
        }
    });


    // This one's for periodically fetchin' emails so that I can send notification about the email.

    const FILEPATH = path.join(process.cwd(), './data/lastEmailID.txt');
    const getLastEmailIdFromFile = async () => {
        try{
            const content = await fs.promises.readFile(FILEPATH, 'utf8');
            return content.trim();
        }
        catch (err) {
        console.log("Error: " + err.message);
        return null;
    }
    }

    const fetchEmailsPeriodically = async () => {
        try {
            console.log("Fetching...");

            let lastEmail = await getLastEmailIdFromFile();
            const emailDetails = await getLatestEmail();

            if(lastEmail == null) {
                await fs.promises.writeFile(FILEPATH, emailDetails[0].emailId, 'utf8');
                lastEmail = emailDetails[0].emailId;
            }

            if(lastEmail != emailDetails[0].emailId) {
                console.log('New Email found: ' + emailDetails[0].subject);
                console.log('Email Id: ' + emailDetails[0].emailId);
                lastEmail = emailDetails[0].emailId;
                await fs.promises.writeFile(FILEPATH, lastEmail, 'utf8');

                // send notification to desktop, if and only if new email is found.
                new Notification({
                title: 'New Email Found..',
                body: `Subject: ${emailDetails[0].subject} - ${emailDetails[0].subject}`,
                icon: path.join(__dirname, 'assets', 'logo.png')
            }).show();

            // Notification end;

            }
            else{
                console.log("No New Email Found");
            }
        } catch (error) {
            console.error('Error Fetching Latest EMail:', error);
        }
    };

    let pollEmail;
    pollEmail = setInterval(fetchEmailsPeriodically, 1200000); // 20 minutes interval polling.
});
