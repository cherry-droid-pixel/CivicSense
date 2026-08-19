const API_BASE_URL = "http://127.0.0.1:8080";

let complaints = [];
let selectedComplaintId = null;


// ======================================================
// HELPERS
// ======================================================

function getSavedUser() {
    const savedUser = localStorage.getItem("civicSenseUser");

    if (!savedUser) return null;

    try {
        return JSON.parse(savedUser);
    } catch (error) {
        localStorage.removeItem("civicSenseUser");
        return null;
    }
}


function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value ?? "";
    }
}


function escapeHtml(value) {
    if (value === null || value === undefined) {
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
    if (!status) return "Pending";

    return String(status)
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, letter => letter.toUpperCase());
}


function statusClass(status) {
    return String(status || "PENDING")
        .toLowerCase()
        .replace(/_/g, "-");
}


function priorityClass(priority) {
    return String(priority || "MEDIUM")
        .toLowerCase()
        .replace(/_/g, "-");
}


function showMessage(message, type = "success") {
    const element = document.getElementById("adminMessage");

    if (!element) return;

    element.textContent = message;
    element.className = `admin-message show ${type}`;

    setTimeout(() => {
        element.className = "admin-message";
    }, 3500);
}


// ======================================================
// INITIALIZATION
// ======================================================

document.addEventListener("DOMContentLoaded", async () => {

    console.log("CivicSense Admin JS loaded.");

    const user = getSavedUser();

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    initializeButtons();

    const authenticated = await verifyAdminSession();

    if (!authenticated) {
        return;
    }

    await refreshDashboard();
});


// ======================================================
// VERIFY ADMIN SESSION
// ======================================================

async function verifyAdminSession() {

    try {

        const response = await fetch(
            `${API_BASE_URL}/api/auth/me`,
            {
                method: "GET",
                credentials: "include"
            }
        );

        if (response.status === 401) {

            localStorage.removeItem("civicSenseUser");

            window.location.href = "login.html";

            return false;
        }

        if (!response.ok) {
            throw new Error("Unable to verify session.");
        }

        const user = await response.json();

        console.log("Authenticated user:", user);

        if (
            !user.role ||
            user.role.toUpperCase() !== "ADMIN"
        ) {

            showMessage(
                "Admin access required.",
                "error"
            );

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1000);

            return false;
        }

        localStorage.setItem(
            "civicSenseUser",
            JSON.stringify(user)
        );

        setText(
            "adminName",
            user.name || "Administrator"
        );

        setText(
            "adminEmail",
            user.email || ""
        );

        return true;

    } catch (error) {

        console.error(
            "Admin session error:",
            error
        );

        showMessage(
            "Unable to verify admin session.",
            "error"
        );

        return false;
    }
}


// ======================================================
// REFRESH DASHBOARD
// ======================================================

async function refreshDashboard() {

    console.log("Refreshing admin dashboard...");

    await Promise.all([
        loadAdminStats(),
        loadComplaints()
    ]);
}


// ======================================================
// ADMIN STATS
// ======================================================

async function loadAdminStats() {

    try {

        const response = await fetch(
            `${API_BASE_URL}/api/admin/stats`,
            {
                method: "GET",
                credentials: "include"
            }
        );

        if (response.status === 401) {
            window.location.href = "login.html";
            return;
        }

        if (response.status === 403) {
            window.location.href = "dashboard.html";
            return;
        }

        if (!response.ok) {
            throw new Error(
                `Stats request failed: ${response.status}`
            );
        }

        const data = await response.json();

        console.log("Admin stats:", data);

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
            "Admin stats error:",
            error
        );

        showMessage(
            "Unable to load dashboard statistics.",
            "error"
        );
    }
}


// ======================================================
// LOAD COMPLAINTS
// ======================================================

async function loadComplaints() {

    const loading =
        document.getElementById("loadingState");

    const empty =
        document.getElementById("emptyState");

    if (loading) {
        loading.classList.remove("hidden");
    }

    if (empty) {
        empty.classList.add("hidden");
    }

    try {

        const filter =
            document.getElementById("statusFilter")?.value || "";

        let url =
            `${API_BASE_URL}/api/admin/complaints`;

        if (filter) {
            url += `?status=${encodeURIComponent(filter)}`;
        }

        const response = await fetch(
            url,
            {
                method: "GET",
                credentials: "include"
            }
        );

        if (response.status === 401) {
            window.location.href = "login.html";
            return;
        }

        if (response.status === 403) {
            window.location.href = "dashboard.html";
            return;
        }

        if (!response.ok) {
            throw new Error(
                `Complaints request failed: ${response.status}`
            );
        }

        complaints = await response.json();

        console.log(
            "Admin complaints:",
            complaints
        );

        renderComplaints();

    } catch (error) {

        console.error(
            "Complaint loading error:",
            error
        );

        showMessage(
            "Unable to load complaints.",
            "error"
        );

    } finally {

        if (loading) {
            loading.classList.add("hidden");
        }
    }
}


// ======================================================
// RENDER COMPLAINTS
// ======================================================

function renderComplaints() {

    const tbody =
        document.getElementById(
            "complaintsTableBody"
        );

    const empty =
        document.getElementById(
            "emptyState"
        );

    if (!tbody) {
        console.error(
            "complaintsTableBody not found."
        );
        return;
    }

    if (
        !complaints ||
        complaints.length === 0
    ) {

        tbody.innerHTML = "";

        if (empty) {
            empty.classList.remove("hidden");
        }

        return;
    }

    if (empty) {
        empty.classList.add("hidden");
    }

    tbody.innerHTML = complaints
        .map(complaint => {

            const id =
                complaint.id ?? "-";

            const title =
                complaint.title ||
                "Untitled complaint";

            const description =
                complaint.description ||
                "";

            const category =
                complaint.category ||
                "General";

            const location =
                complaint.location ||
                "Not provided";

            const priority =
                complaint.priority ||
                "MEDIUM";

            const status =
                complaint.status ||
                "PENDING";

            const userId =
                complaint.userId ??
                "-";

            return `
                <tr>

                    <td>
                        <strong>#${escapeHtml(id)}</strong>
                    </td>

                    <td>

                        <div class="complaint-title">
                            ${escapeHtml(title)}
                        </div>

                        <div class="complaint-description">
                            ${escapeHtml(description)}
                        </div>

                    </td>

                    <td>
                        ${escapeHtml(category)}
                    </td>

                    <td>

                        <div class="location-cell">
                            ${escapeHtml(location)}
                        </div>

                    </td>

                    <td>

                        <span class="
                            priority-badge
                            priority-${priorityClass(priority)}
                        ">
                            ${escapeHtml(priority)}
                        </span>

                    </td>

                    <td>
                        User #${escapeHtml(userId)}
                    </td>

                    <td>

                        <span class="
                            status-badge
                            status-${statusClass(status)}
                        ">
                            ${escapeHtml(
                                formatStatus(status)
                            )}
                        </span>

                    </td>

                    <td>

                        <div class="action-buttons">

                            <button
                                class="action-button"
                                onclick="viewComplaint(${Number(id)})">
                                View
                            </button>

                            <button
                                class="action-button"
                                onclick="openStatusEditor(${Number(id)})">
                                Status
                            </button>

                        </div>

                    </td>

                </tr>
            `;
        })
        .join("");
}


// ======================================================
// VIEW COMPLAINT
// ======================================================

async function viewComplaint(id) {

    try {

        const response = await fetch(
            `${API_BASE_URL}/api/admin/complaints/${id}`,
            {
                method: "GET",
                credentials: "include"
            }
        );

        if (response.status === 401) {
            window.location.href = "login.html";
            return;
        }

        if (response.status === 403) {
            window.location.href = "dashboard.html";
            return;
        }

        if (!response.ok) {
            throw new Error(
                "Unable to load complaint."
            );
        }

        const complaint =
            await response.json();

        selectedComplaintId =
            complaint.id;

        setText(
            "modalTitle",
            complaint.title || "Complaint"
        );

        setText(
            "modalId",
            complaint.id
        );

        setText(
            "modalStatus",
            formatStatus(complaint.status)
        );

        setText(
            "modalCategory",
            complaint.category || "General"
        );

        setText(
            "modalPriority",
            complaint.priority || "MEDIUM"
        );

        setText(
            "modalDescription",
            complaint.description || "No description"
        );

        setText(
            "modalLocation",
            complaint.location || "Location not provided"
        );

        setText(
            "modalLatitude",
            complaint.latitude ?? "-"
        );

        setText(
            "modalLongitude",
            complaint.longitude ?? "-"
        );

        const statusSelect =
            document.getElementById(
                "modalStatusSelect"
            );

        if (statusSelect) {
            statusSelect.value =
                complaint.status || "PENDING";
        }

        const modal =
            document.getElementById(
                "complaintModal"
            );

        modal?.classList.remove("hidden");

    } catch (error) {

        console.error(
            "View complaint error:",
            error
        );

        showMessage(
            "Unable to load complaint details.",
            "error"
        );
    }
}


// ======================================================
// OPEN STATUS EDITOR
// ======================================================

async function openStatusEditor(id) {
    await viewComplaint(id);
}


// ======================================================
// UPDATE STATUS
// ======================================================

async function updateComplaintStatus() {

    if (!selectedComplaintId) {
        return;
    }

    const select =
        document.getElementById(
            "modalStatusSelect"
        );

    const button =
        document.getElementById(
            "modalUpdateButton"
        );

    const status =
        select?.value;

    if (!status) {
        return;
    }

    if (button) {
        button.disabled = true;
        button.textContent = "Updating...";
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/api/admin/complaints/${selectedComplaintId}/status`,
            {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    status: status
                })
            }
        );

        if (response.status === 401) {
            window.location.href = "login.html";
            return;
        }

        if (response.status === 403) {
            window.location.href = "dashboard.html";
            return;
        }

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Unable to update complaint."
            );
        }

        setText(
            "modalStatus",
            formatStatus(data.status)
        );

        showMessage(
            `Complaint #${selectedComplaintId} updated successfully.`
        );

        await refreshDashboard();

    } catch (error) {

        console.error(
            "Status update error:",
            error
        );

        showMessage(
            error.message ||
            "Unable to update complaint.",
            "error"
        );

    } finally {

        if (button) {
            button.disabled = false;
            button.textContent = "Update Status";
        }
    }
}


// ======================================================
// LOGOUT
// ======================================================

async function logout() {

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

        localStorage.removeItem(
            "civicSenseUser"
        );

        window.location.href =
            "login.html";
    }
}


// ======================================================
// BUTTON EVENTS
// ======================================================

function initializeButtons() {

    document
        .getElementById("logoutButton")
        ?.addEventListener(
            "click",
            logout
        );

    document
        .getElementById("refreshButton")
        ?.addEventListener(
            "click",
            refreshDashboard
        );

    document
        .getElementById("statusFilter")
        ?.addEventListener(
            "change",
            loadComplaints
        );

    document
        .getElementById("closeModalButton")
        ?.addEventListener(
            "click",
            closeModal
        );

    document
        .getElementById("modalOverlay")
        ?.addEventListener(
            "click",
            closeModal
        );

    document
        .getElementById("modalUpdateButton")
        ?.addEventListener(
            "click",
            updateComplaintStatus
        );
}


// ======================================================
// CLOSE MODAL
// ======================================================

function closeModal() {

    const modal =
        document.getElementById(
            "complaintModal"
        );

    modal?.classList.add("hidden");

    selectedComplaintId = null;
}


// ======================================================
// EXPORT FUNCTIONS
// ======================================================

window.viewComplaint =
    viewComplaint;

window.openStatusEditor =
    openStatusEditor;

window.refreshDashboard =
    refreshDashboard;

window.loadComplaints =
    loadComplaints;

window.loadAdminStats =
    loadAdminStats;

window.updateComplaintStatus =
    updateComplaintStatus;

