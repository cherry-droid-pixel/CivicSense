const API_BASE_URL = "http://127.0.0.1:8080";

document.addEventListener("DOMContentLoaded", () => {
    initializeComplaintsPage();
});

async function initializeComplaintsPage() {
    console.log("CivicSense My Complaints loaded");

    setupLogout();
    setupRefresh();

    await loadMyComplaints();
}


/* =========================================================
   LOAD MY COMPLAINTS
========================================================= */

async function loadMyComplaints() {

    const loading = document.getElementById("complaintsLoading");
    const empty = document.getElementById("complaintsEmpty");
    const list = document.getElementById("complaintsList");
    const message = document.getElementById("complaintsMessage");

    if (loading) {
        loading.style.display = "block";
    }

    if (empty) {
        empty.style.display = "none";
    }

    if (message) {
        message.style.display = "none";
        message.textContent = "";
    }

    try {

        console.log(
            "Requesting:",
            `${API_BASE_URL}/api/complaints/my`
        );

        const response = await fetch(
            `${API_BASE_URL}/api/complaints/my`,
            {
                method: "GET",
                credentials: "include",
                headers: {
                    "Accept": "application/json"
                }
            }
        );

        console.log(
            "My complaints status:",
            response.status
        );

        const rawText = await response.text();

        console.log(
            "My complaints response:",
            rawText
        );

        if (!response.ok) {

            throw new Error(
                rawText || `Request failed (${response.status})`
            );
        }

        let complaints = [];

        if (rawText.trim()) {
            complaints = JSON.parse(rawText);
        }

        console.log(
            "Complaints:",
            complaints
        );

        if (!Array.isArray(complaints)) {

            throw new Error(
                "Backend returned an invalid complaints response."
            );
        }

        renderStatistics(complaints);
        renderComplaints(complaints);

    } catch (error) {

        console.error(
            "Failed to load complaints:",
            error
        );

        showMessage(
            error.message ||
            "Unable to load your complaints.",
            "error"
        );

    } finally {

    if (loading) {
        loading.style.display = "none";
        loading.classList.add("hidden");
    }
}
}


/* =========================================================
   STATISTICS
========================================================= */

function renderStatistics(complaints) {

    const total =
        complaints.length;

    const pending =
        complaints.filter(
            c =>
                normalizeStatus(c.status) ===
                "PENDING"
        ).length;

    const progress =
        complaints.filter(
            c =>
                normalizeStatus(c.status) ===
                "IN_PROGRESS"
        ).length;

    const resolved =
        complaints.filter(
            c =>
                normalizeStatus(c.status) ===
                "RESOLVED"
        ).length;

    setText(
        "totalComplaints",
        total
    );

    setText(
        "pendingComplaints",
        pending
    );

    setText(
        "progressComplaints",
        progress
    );

    setText(
        "resolvedComplaints",
        resolved
    );
}


/* =========================================================
   RENDER COMPLAINTS
========================================================= */

function renderComplaints(complaints) {

    const list =
        document.getElementById(
            "complaintsList"
        );

    const empty =
        document.getElementById(
            "complaintsEmpty"
        );

    if (!list) {

        console.error(
            "complaintsList element not found"
        );

        return;
    }

    list.innerHTML = "";

    if (
        !complaints ||
        complaints.length === 0
    ) {

        list.style.display = "none";

        if (empty) {
            empty.style.display = "block";
        }

        return;
    }

    if (empty) {
        empty.style.display = "none";
    }

    list.style.display = "grid";

    complaints
        .slice()
        .sort(
            (a, b) =>
                new Date(b.createdAt || 0) -
                new Date(a.createdAt || 0)
        )
        .forEach(
            complaint => {

                list.appendChild(
                    createComplaintCard(
                        complaint
                    )
                );
            }
        );
}


/* =========================================================
   COMPLAINT CARD
========================================================= */

function createComplaintCard(complaint) {

    const article =
        document.createElement("article");

    article.className =
        "complaint-card";

    const status =
        normalizeStatus(
            complaint.status
        );

    const title =
        complaint.title ||
        "Untitled complaint";

    const category =
        complaint.category ||
        complaint.aiCategory ||
        "General";

    const description =
        complaint.description ||
        "No description available.";

    const location =
        complaint.location ||
        "Location not provided";

    const priority =
        complaint.priority ||
        "MEDIUM";

    const date =
        formatDate(
            complaint.createdAt
        );

    article.innerHTML = `
        <div class="complaint-card-header">

            <div>
                <span class="complaint-id">
                    Complaint #${escapeHtml(
                        String(
                            complaint.id || "-"
                        )
                    )}
                </span>

                <h3>
                    ${escapeHtml(title)}
                </h3>
            </div>

            <span class="complaint-status ${statusClass(status)}">
                ${escapeHtml(
                    formatStatus(status)
                )}
            </span>

        </div>

        <div class="complaint-category">
            ${escapeHtml(category)}
        </div>

        <p class="complaint-description">
            ${escapeHtml(description)}
        </p>

        <div class="complaint-meta">

            <div>
                <strong>Location</strong>
                <span>
                    ${escapeHtml(location)}
                </span>
            </div>

            <div>
                <strong>Priority</strong>
                <span>
                    ${escapeHtml(priority)}
                </span>
            </div>

            <div>
                <strong>Reported</strong>
                <span>
                    ${escapeHtml(date)}
                </span>
            </div>

        </div>
    `;

    return article;
}


/* =========================================================
   REFRESH
========================================================= */

function setupRefresh() {

    const button =
        document.getElementById(
            "refreshComplaintsButton"
        );

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        async () => {

            button.disabled = true;

            const originalText =
                button.textContent;

            button.textContent =
                "Refreshing...";

            try {

                await loadMyComplaints();

            } finally {

                button.disabled = false;

                button.textContent =
                    originalText;
            }
        }
    );
}


/* =========================================================
   LOGOUT
========================================================= */

function setupLogout() {

    const button =
        document.getElementById(
            "logoutButton"
        );

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        async () => {

            button.disabled = true;

            button.textContent =
                "Logging out...";

            try {

                await fetch(
                    `${API_BASE_URL}/api/auth/logout`,
                    {
                        method: "POST",
                        credentials: "include"
                    }
                );

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

            } finally {

                window.location.href =
                    "login.html";
            }
        }
    );
}


/* =========================================================
   HELPERS
========================================================= */

function normalizeStatus(status) {

    return String(
        status || "PENDING"
    )
        .trim()
        .toUpperCase()
        .replace(/[\s-]+/g, "_");
}


function formatStatus(status) {

    return String(status || "")
        .replace(/_/g, " ")
        .replace(/\b\w/g, c =>
            c.toUpperCase()
        );
}


function statusClass(status) {

    switch (status) {

        case "RESOLVED":
            return "status-resolved";

        case "IN_PROGRESS":
            return "status-progress";

        case "PENDING":
            return "status-pending";

        default:
            return "status-pending";
    }
}


function formatDate(value) {

    if (!value) {
        return "Date unavailable";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "Date unavailable";
    }

    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent =
            String(value);
    }
}


function showMessage(
    text,
    type = "error"
) {

    const element =
        document.getElementById(
            "complaintsMessage"
        );

    if (!element) {
        return;
    }

    element.textContent =
        text;

    element.className =
        `complaints-message ${type}`;

    element.style.display =
        "block";
}


function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
