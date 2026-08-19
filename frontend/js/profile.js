/* =========================================================
   CIVICSENSE — PROFILE
   Connected to Spring Boot session authentication
   ========================================================= */

const API_BASE_URL = "http://127.0.0.1:8080";


/* =========================================================
   DOM HELPERS
   ========================================================= */

function getElement(id) {
    return document.getElementById(id);
}


/* =========================================================
   INITIAL
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadProfile();

    setupRefresh();

    setupLogout();

});


/* =========================================================
   LOAD PROFILE
   ========================================================= */

async function loadProfile() {

    const message =
        getElement("profileMessage");

    try {

        const response = await fetch(
            `${API_BASE_URL}/api/auth/me`,
            {
                method: "GET",
                credentials: "include",
                headers: {
                    "Accept": "application/json"
                }
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            if (response.status === 401) {

                showMessage(
                    "Please login first. Redirecting to login...",
                    "error"
                );

                setTimeout(() => {
                    window.location.href =
                        "login.html";
                }, 1200);

                return;
            }

            throw new Error(
                data.message ||
                "Unable to load profile"
            );
        }


        renderProfile(data);

    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );

        showMessage(
            error.message ||
            "Unable to load your profile.",
            "error"
        );
    }
}


/* =========================================================
   RENDER PROFILE
   ========================================================= */

function renderProfile(user) {

    const name =
        user.name ||
        "Citizen";

    const email =
        user.email ||
        "Not available";

    const role =
        user.role ||
        "CITIZEN";


    const initial =
        getInitial(name);


    /* Main profile */

    setText(
        "profileName",
        name
    );

    setText(
        "profileEmail",
        email
    );

    setText(
        "profileRole",
        formatRole(role)
    );


    /* Header */

    setText(
        "topUserName",
        name
    );

    setText(
        "userInitial",
        initial
    );


    /* Large profile avatar */

    setText(
        "profileAvatar",
        initial
    );

    setText(
        "profileDisplayName",
        name
    );


    /* Phone is not provided by /me */

    setText(
        "profilePhone",
        "Not available"
    );


    showMessage(
        "Profile loaded successfully.",
        "success"
    );
}


/* =========================================================
   SET TEXT SAFELY
   ========================================================= */

function setText(id, value) {

    const element =
        getElement(id);

    if (!element) {
        return;
    }

    element.textContent =
        value;
}


/* =========================================================
   INITIAL
   ========================================================= */

function getInitial(name) {

    if (!name) {
        return "C";
    }

    return name
        .trim()
        .charAt(0)
        .toUpperCase();
}


/* =========================================================
   ROLE FORMAT
   ========================================================= */

function formatRole(role) {

    if (!role) {
        return "Citizen";
    }

    const normalized =
        String(role)
            .replace(/_/g, " ")
            .toLowerCase();


    return normalized
        .split(" ")
        .map(word => {

            if (!word) {
                return "";
            }

            return (
                word.charAt(0).toUpperCase() +
                word.slice(1)
            );

        })
        .join(" ");
}


/* =========================================================
   MESSAGE
   ========================================================= */

function showMessage(
    text,
    type = "success"
) {

    const element =
        getElement("profileMessage");

    if (!element) {
        return;
    }

    element.textContent =
        text;

    element.className =
        `profile-message ${type}`;
}


/* =========================================================
   REFRESH
   ========================================================= */

function setupRefresh() {

    const button =
        getElement(
            "refreshProfileButton"
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
                "Loading...";


            await loadProfile();


            button.disabled = false;

            button.textContent =
                originalText;
        }
    );
}


/* =========================================================
   LOGOUT
   ========================================================= */

function setupLogout() {

    const button =
        getElement(
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

                const response =
                    await fetch(
                        `${API_BASE_URL}/api/auth/logout`,
                        {
                            method: "POST",
                            credentials: "include"
                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        "Logout failed"
                    );
                }


                window.location.href =
                    "login.html";


            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );


                button.disabled = false;

                button.textContent =
                    "↪  Logout";


                showMessage(
                    "Unable to logout. Please try again.",
                    "error"
                );
            }
        }
    );
}
