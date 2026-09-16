const loginForm = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
const message = document.getElementById("message");

function showMessage(text, type = "error") {
    message.textContent = text;
    message.className = `message ${type}`;
}

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;


    if (!email || !password) {

        showMessage(
            "Please enter your email and password."
        );

        return;
    }


    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";


    try {

        /* =========================================
           LOGIN
        ========================================= */

        const {
            data,
            error
        } = await supabaseClient.auth.signInWithPassword({

            email: email,

            password: password

        });


        if (error) {
            throw error;
        }


        if (!data?.session) {
            throw new Error("Unable to create login session.");
        }


        /* =========================================
           CHECK ADMIN
        ========================================= */

        const {
            data: isAdmin,
            error: adminError
        } = await supabaseClient.rpc(
            "check_admin"
        );


        if (adminError) {
            throw adminError;
        }


        if (!isAdmin) {

            await supabaseClient.auth.signOut();

            throw new Error(
                "This account does not have admin access."
            );
        }


        /* =========================================
           SUCCESS
        ========================================= */

        showMessage(
            "Login successful!",
            "success"
        );


        /*
           Small delay allows Supabase session
           to finish being stored before moving page.
        */

        setTimeout(() => {

            window.location.replace(
                "admin.html"
            );

        }, 500);


    } catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );


        showMessage(
            error.message ||
            "Login failed."
        );


        loginBtn.disabled = false;

        loginBtn.textContent =
            "Login";

    }

});