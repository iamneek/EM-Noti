let latestEmailID;
let newEmail = false;

async function fetchEmails() {
    try {
        callToast("Fetching emails ...");
        const emailDetails = await window.electron.fetchEmails();
        callToast("Successfully fetched emails ...");

        if (latestEmailID == emailDetails[0].emailId) {
            newEmail = false;
        } else {
            latestEmailID = emailDetails[0].emailId;
            newEmail = true;
        }
        displayEmails(emailDetails);
    } catch (error) {
        console.error('Error fetching emails:', error);
    }
}

function displayEmails(emails) {
    const emailContainer = document.querySelector('.emails');
    emailContainer.innerHTML = '';

    emails.forEach(email => {
        const emailElement = document.createElement('div');
        emailElement.classList.add('email');
        emailElement.setAttribute('data-email-id', email.emailId);
        emailElement.innerHTML = `
            <div class="email_subject">
                <p>${email.subject}</p>
                <span>-</span>
                <p class="email-description-mini">${email.snippet}</p>
            </div>
        `;

        emailElement.addEventListener('click', () => displayProper(email.subject, email.snippet));

        emailContainer.appendChild(emailElement);
    });
}


function displayProper(subject, snippet) {
    const parentDiv = document.querySelector(".display_proper");
    const properSubject = document.querySelector(".display_proper_subject");
    const properSnippet = document.querySelector(".display_proper_snippet");
    const backdrop = document.querySelector(".backdrop");

    backdrop.classList.add("active");
    properSnippet.innerHTML = snippet;
    properSubject.innerHTML = subject + `<ion-icon name="close-outline" size="large"
                    onclick="closeProper()"></ion-icon>`;
    parentDiv.classList.add("active");
}

function closeProper() {
    const parentDiv = document.querySelector(".display_proper");
    const backdrop = document.querySelector(".backdrop");
    backdrop.classList.remove("active");
    parentDiv.classList.remove("active");
}

function callToast(message) {
    const toast = document.querySelector('.toast');
    const toast_msg = document.querySelector('.toast_message');
    toast_msg.innerHTML = `${message}`;
    toast.classList.add("active");
    setTimeout(() => {
        toast.classList.remove("active");
    }, 2000);
}

function openBrowser() {
    callToast("Opening Browser window...");
    window.electron.openBrowser();
}
