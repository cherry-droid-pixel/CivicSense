const API_BASE_URL = "http://127.0.0.1:8080";


// ======================================================
// HELPERS
// ======================================================

function showMessage(element, message, type = "error") {

    if (!element) return;

    element.textContent = message;

    element.className = `auth-message ${type}`;
}


// ======================================================
// REGISTER
// ======================================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    const registerMessage =
        document.getElementById("registerMessage");

    const registerButton =
        document.getElementById("registerButton");


    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();


        const name =
            document.getElementById("name").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;


        if (!name) {
            showMessage(
                registerMessage,
                "Please enter your name."
            );
            return;
        }


        if (!email) {
            showMessage(
                registerMessage,
                "Please enter your email."
            );
            return;
        }


        if (password.length < 6) {
            showMessage(
                registerMessage,
                "Password must contain at least 6 characters."
            );
            return;
        }


        if (password !== confirmPassword) {
            showMessage(
                registerMessage,
                "Passwords do not match."
            );
            return;
        }


        registerButton.disabled = true;
        registerButton.textContent = "Creating Account...";


        try {

            const response = await fetch(
                `${API_BASE_URL}/api/auth/register`,
                {
                    method: "POST",

                    credentials: "include",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Registration failed."
                );
            }


            showMessage(
                registerMessage,
                "Registration successful! Redirecting to login...",
                "success"
            );


            registerForm.reset();


            setTimeout(() => {

                window.location.href = "login.html";

            }, 1200);


        } catch (error) {

            console.error("Registration error:", error);

            showMessage(
                registerMessage,
                error.message ||
                "Cannot connect to CivicSense server."
            );

        } finally {

            registerButton.disabled = false;
            registerButton.textContent = "Create Account";
        }

    });
}


// ======================================================
// LOGIN
// ======================================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    const loginMessage =
        document.getElementById("loginMessage");

    const loginButton =
        document.getElementById("loginButton");


    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();


        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;


        if (!email) {

            showMessage(
                loginMessage,
                "Please enter your email."
            );

            return;
        }


        if (!password) {

            showMessage(
                loginMessage,
                "Please enter your password."
            );

            return;
        }


        loginButton.disabled = true;
        loginButton.textContent = "Signing In...";


        try {

            const response = await fetch(
                `${API_BASE_URL}/api/auth/login`,
                {
                    method: "POST",

                    credentials: "include",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Invalid email or password."
                );
            }


            // Store logged-in user
            localStorage.setItem(
                "civicSenseUser",
                JSON.stringify(data)
            );


            showMessage(
                loginMessage,
                "Login successful! Redirecting...",
                "success"
            );


            setTimeout(() => {

    if (data.role && data.role.toUpperCase() === "ADMIN") {
        window.location.href = "admin.html";
    } else {
        window.location.href = "dashboard.html";
    }

}, 700);


        } catch (error) {

            console.error("Login error:", error);

            showMessage(
                loginMessage,
                error.message ||
                "Cannot connect to CivicSense server."
            );

        } finally {

            loginButton.disabled = false;
            loginButton.textContent = "Sign In";
        }

    });
}
