import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Supabase configuration
const SUPABASE_URL = "https://wwwmgwamvqywrkpfdazq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_pSISYDQ1dtG34gqlJGTW5g_lgdJTjbL";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

// HTML elements
const $ = (id) => document.getElementById(id);

const loginView = $("loginView");
const portfolioView = $("portfolioView");

const authForm = $("authForm");
const emailInput = $("email");
const passwordInput = $("password");

const submitBtn = $("submitBtn");
const modeToggle = $("modeToggle");
const switchLabel = $("switchLabel");
const forgotBtn = $("forgotBtn");

const googleBtn = $("googleBtn");
const githubBtn = $("githubBtn");

const message = $("message");
const authStatus = $("authStatus");
const userEmail = $("userEmail");

let isSignUp = false;
let recoveryMode = false;

// Redirect back to the portfolio subfolder after OAuth
const REDIRECT_URL = new URL(
  "index.html",
  window.location.href
).href;

// Set current year if the element exists
if ($("year")) {
  $("year").textContent = new Date().getFullYear();
}

// Display messages
function showMessage(text, isError = false) {
  if (!message) return;

  message.textContent = text;
  message.style.color = isError ? "#c62828" : "#16803d";
}

// Disable/enable buttons while processing
function setBusy(busy, label = "") {
  [submitBtn, googleBtn, githubBtn, forgotBtn, modeToggle].forEach((button) => {
    if (button) button.disabled = busy;
  });

  if (submitBtn) {
    submitBtn.textContent = busy
      ? label || "Please wait…"
      : isSignUp
        ? "Create account"
        : recoveryMode
          ? "Update password"
          : "Login";
  }
}

// Switch between login and sign-up modes
function setMode(signUp) {
  isSignUp = signUp;
  recoveryMode = false;

  if ($("formTitle")) {
    $("formTitle").textContent = isSignUp
      ? "Create your account"
      : "Welcome back";
  }

  if (switchLabel) {
    switchLabel.textContent = isSignUp
      ? "Already have an account?"
      : "Don't have an account?";
  }

  if (modeToggle) {
    modeToggle.textContent = isSignUp ? "Login" : "Sign up";
    modeToggle.hidden = false;
  }

  if (forgotBtn) {
    forgotBtn.hidden = isSignUp;
  }

  if (passwordInput) {
    passwordInput.autocomplete = isSignUp
      ? "new-password"
      : "current-password";
  }

  if (submitBtn) {
    submitBtn.textContent = isSignUp ? "Create account" : "Login";
  }

  showMessage("");
}

// Update the page based on the authentication session
function updateUI(session) {
  const loggedIn = Boolean(session?.user);

  if (loginView) {
    loginView.classList.toggle("hidden", loggedIn);
  }

  if (portfolioView) {
    portfolioView.classList.toggle("hidden", !loggedIn);
  }

  if (authStatus) {
    authStatus.textContent = loggedIn ? "Signed in" : "Not signed in";
  }

  if (userEmail) {
    userEmail.textContent = session?.user?.email || "";
  }
}

// Initialize the current session
async function initialize() {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) throw error;

    updateUI(data.session);
  } catch (error) {
    console.error("Session initialization error:", error);
    showMessage(error.message || "Could not check your login session.", true);
  }
}

// Listen for authentication changes
supabase.auth.onAuthStateChange((event, session) => {
  updateUI(session);

  if (event === "SIGNED_IN") {
    showMessage("Login successful!");
  }

  if (event === "SIGNED_OUT") {
    showMessage("You have signed out.");
  }

  if (event === "PASSWORD_RECOVERY") {
    recoveryMode = true;
    isSignUp = false;

    if ($("formTitle")) {
      $("formTitle").textContent = "Choose a new password";
    }

    if (switchLabel) switchLabel.textContent = "";
    if (modeToggle) modeToggle.hidden = true;
    if (forgotBtn) forgotBtn.hidden = true;

    if (passwordInput) {
      passwordInput.value = "";
      passwordInput.autocomplete = "new-password";
    }

    if (submitBtn) {
      submitBtn.textContent = "Update password";
    }

    showMessage("Enter your new password, then click Update password.");
  }
});

// Email sign-up and login
if (authForm) {
  authForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput?.value.trim();
    const password = passwordInput?.value;

    if (!email || !password) {
      showMessage("Enter your email and password.", true);
      return;
    }

    if (!recoveryMode && password.length < 6) {
      showMessage("Password must contain at least 6 characters.", true);
      return;
    }

    setBusy(
      true,
      recoveryMode
        ? "Updating password…"
        : isSignUp
          ? "Creating account…"
          : "Logging in…"
    );

    try {
      let result;

      if (recoveryMode) {
        result = await supabase.auth.updateUser({ password });

        if (result.error) throw result.error;

        recoveryMode = false;
        setMode(false);

        showMessage("Password updated successfully. You can now sign in.");
      } else if (isSignUp) {
        result = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: REDIRECT_URL
          }
        });

        if (result.error) throw result.error;

        if (result.data.user && !result.data.session) {
          showMessage(
            "Account created. Check your email and confirm your account before logging in."
          );
        } else {
          updateUI(result.data.session);
          showMessage("Account created successfully!");
        }
      } else {
        result = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (result.error) throw result.error;

        updateUI(result.data.session);
        showMessage("Login successful!");
      }
    } catch (error) {
      console.error("Email authentication error:", error);
      showMessage(error.message || "Authentication failed.", true);
    } finally {
      setBusy(false);

      if (recoveryMode && submitBtn) {
        submitBtn.textContent = "Update password";
      }
    }
  });
}

// Toggle login/sign-up mode
if (modeToggle) {
  modeToggle.addEventListener("click", () => {
    setMode(!isSignUp);
  });
}

// Forgot password
if (forgotBtn) {
  forgotBtn.addEventListener("click", async () => {
    const email = emailInput?.value.trim();

    if (!email) {
      showMessage("Enter your email address first.", true);
      emailInput?.focus();
      return;
    }

    setBusy(true, "Sending reset email…");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: REDIRECT_URL
      });

      if (error) throw error;

      showMessage(
        "If the account exists, a password reset email has been sent. Check your inbox."
      );
    } catch (error) {
      console.error("Password reset error:", error);
      showMessage(error.message || "Could not send the reset email.", true);
    } finally {
      setBusy(false);
    }
  });
}

// Google and GitHub OAuth
async function oauthLogin(provider) {
  setBusy(true, `Connecting to ${provider}…`);

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: REDIRECT_URL
      }
    });

    if (error) throw error;

    // Supabase normally redirects the browser automatically.
    // This fallback is only used if a URL is returned without navigation.
    if (data?.url) {
      window.location.assign(data.url);
    }
  } catch (error) {
    console.error(`${provider} OAuth error:`, error);

    showMessage(
      error.message || `${provider} login failed. Check Supabase provider settings.`,
      true
    );

    setBusy(false);
  }
}

if (googleBtn) {
  googleBtn.addEventListener("click", () => oauthLogin("google"));
}

if (githubBtn) {
  githubBtn.addEventListener("click", () => oauthLogin("github"));
}

// Logout
if ($("logoutBtn")) {
  $("logoutBtn").addEventListener("click", async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      updateUI(null);
      setMode(false);
      showMessage("You have signed out.");
    } catch (error) {
      console.error("Logout error:", error);
      showMessage(error.message || "Could not sign out.", true);
    }
  });
}

// Start the app
setMode(false);
initialize();