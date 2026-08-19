/* =========================================================
   CIVICSENSE — DASHBOARD JAVASCRIPT
   ========================================================= */

const API_BASE_URL = "http://127.0.0.1:8080";


/* =========================================================
   HELPERS
   ========================================================= */

function getCurrentUser() {

    const savedUser =
        localStorage.getItem("civicSenseUser");

    if (!savedUser) {
        return null;
    }

    try {

        return JSON.parse(savedUser);

    } catch (error) {

        console.error(
            "Invalid stored user:",
            error
        );

        localStorage.removeItem(
            "civicSenseUser"
        );

        return null;
    }
}


function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent =
            value ?? "";
    }
}


function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function formatStatus(status) {

    if (!status) {
        return "Pending";
    }

    return String(status)
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(
            /\b\w/g,
            letter => letter.toUpperCase()
        );
}


function statusClass(status) {

    return String(
        status || "PENDING"
    )
        .toLowerCase()
        .replace(/_/g, "-");
}


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "CivicSense dashboard initialized."
        );

        const user =
            getCurrentUser();

        if (!user) {

            window.location.href =
                "login.html";

            return;
        }


        /*
         * Display cached user immediately.
         */

        updateUserUI(user);


        /*
         * Initialize logout.
         */

        initializeLogout();


        /*
         * Verify server session.
         */

        const sessionValid =
            await verifySession();

        if (!sessionValid) {
            return;
        }


        /*
         * Load dashboard information.
         */

        await Promise.all([
            loadDashboardStats(),
            loadRecentComplaints()
        ]);

    }
);


/* =========================================================
   USER UI
   ========================================================= */

function updateUserUI(user) {

    const name =
        user?.name ||
        "Citizen";


    setText(
        "userName",
        name
    );


    setText(
        "welcomeName",
        name
    );


    const initial =
        name
            .trim()
            .charAt(0)
            .toUpperCase() ||
        "C";


    setText(
        "userInitial",
        initial
    );
}


/* =========================================================
   VERIFY SESSION
   ========================================================= */

async function verifySession() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/auth/me`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );


        if (response.status === 401) {

            console.warn(
                "CivicSense session expired."
            );

            localStorage.removeItem(
                "civicSenseUser"
            );

            window.location.href =
                "login.html";

            return false;
        }


        if (!response.ok) {

            throw new Error(
                `Session verification failed (${response.status})`
            );
        }


        const user =
            await response.json();


        console.log(
            "Server session:",
            user
        );


        localStorage.setItem(
            "civicSenseUser",
            JSON.stringify(user)
        );


        updateUserUI(user);


        return true;

    } catch (error) {

        console.error(
            "Session verification error:",
            error
        );


        /*
         * Don't immediately log the user out
         * for a temporary backend/network problem.
         */

        return true;
    }
}


/* =========================================================
   LOGOUT
   ========================================================= */

function initializeLogout() {

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
                    "Logout request failed:",
                    error
                );

            } finally {

                localStorage.removeItem(
                    "civicSenseUser"
                );

                window.location.href =
                    "login.html";
            }

        }
    );
}


/* =========================================================
   DASHBOARD STATISTICS
   ========================================================= */

async function loadDashboardStats() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/complaints/stats`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );


        if (response.status === 401) {

            localStorage.removeItem(
                "civicSenseUser"
            );

            window.location.href =
                "login.html";

            return;
        }


        if (!response.ok) {

            throw new Error(
                `Statistics request failed (${response.status})`
            );
        }


        const data =
            await response.json();


        console.log(
            "Dashboard statistics:",
            data
        );


        setText(
            "totalComplaints",
            data.total ?? 0
        );


        setText(
            "pendingComplaints",
            data.pending ?? 0
        );


        setText(
            "progressComplaints",
            data.inProgress ?? 0
        );


        setText(
            "resolvedComplaints",
            data.resolved ?? 0
        );

    } catch (error) {

        console.error(
            "Dashboard statistics error:",
            error
        );


        /*
         * Keep the dashboard usable if the
         * backend temporarily isn't available.
         */

        setText(
            "totalComplaints",
            0
        );

        setText(
            "pendingComplaints",
            0
        );

        setText(
            "progressComplaints",
            0
        );

        setText(
            "resolvedComplaints",
            0
        );
    }
}


/* =========================================================
   RECENT COMPLAINTS
   ========================================================= */

async function loadRecentComplaints() {

    const container =
        document.getElementById(
            "recentComplaints"
        );


    if (!container) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/complaints/my`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );


        if (response.status === 401) {

            localStorage.removeItem(
                "civicSenseUser"
            );

            window.location.href =
                "login.html";

            return;
        }


        if (!response.ok) {

            throw new Error(
                `Complaints request failed (${response.status})`
            );
        }


        const complaints =
            await response.json();


        console.log(
            "Dashboard complaints:",
            complaints
        );


        renderRecentComplaints(
            complaints
        );

    } catch (error) {

        console.error(
            "Recent complaints error:",
            error
        );


        container.innerHTML = `
            <div class="empty-state">
                <strong>
                    Unable to load reports
                </strong>

                <span>
                    Please try again later.
                </span>
            </div>
        `;
    }
}


/* =========================================================
   RENDER RECENT COMPLAINTS
   ========================================================= */

function renderRecentComplaints(
    complaints
) {

    const container =
        document.getElementById(
            "recentComplaints"
        );


    if (!container) {
        return;
    }


    if (
        !Array.isArray(complaints) ||
        complaints.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-state">

                <div style="
                    font-size:28px;
                    margin-bottom:8px;
                ">
                    📋
                </div>

                <strong>
                    No reports yet
                </strong>

                <span>
                    Your civic reports will appear here.
                </span>

            </div>
        `;

        return;
    }


    /*
     * Show newest reports first.
     * Limit dashboard to 4 cards.
     */

    const recent =
        [...complaints]
            .sort(
                (a, b) => {

                    const dateA =
                        new Date(
                            a.createdAt || 0
                        ).getTime();

                    const dateB =
                        new Date(
                            b.createdAt || 0
                        ).getTime();

                    return dateB - dateA;
                }
            )
            .slice(0, 4);


    container.innerHTML =
        recent
            .map(
                complaint =>
                    createComplaintCard(
                        complaint
                    )
            )
            .join("");
}


/* =========================================================
   COMPLAINT CARD
   ========================================================= */

function createComplaintCard(
    complaint
) {

    const title =
        complaint.title ||
        "Untitled complaint";


    const category =
        complaint.category ||
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


    const status =
        complaint.status ||
        "PENDING";


    let date = "";

    if (complaint.createdAt) {

        const parsedDate =
            new Date(
                complaint.createdAt
            );

        if (
            !Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            date =
                parsedDate.toLocaleDateString(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                );
        }
    }


    return `
        <article class="complaint-card">

            <div class="complaint-card-header">

                <div>

                    <h3>
                        ${escapeHtml(title)}
                    </h3>

                    <span class="complaint-category">
                        ${escapeHtml(category)}
                    </span>

                </div>


                <span class="
                    status-badge
                    status-${statusClass(status)}
                ">
                    ${escapeHtml(
                        formatStatus(status)
                    )}
                </span>

            </div>


            <p class="complaint-description">
                ${escapeHtml(description)}
            </p>


            <div class="complaint-meta">

                <span>
                    📍
                    ${escapeHtml(location)}
                </span>

                <span>
                    ⚡
                    ${escapeHtml(priority)}
                </span>

                ${
                    date
                        ? `
                            <span>
                                📅
                                ${escapeHtml(date)}
                            </span>
                          `
                        : ""
                }

            </div>

        </article>
    `;
}
