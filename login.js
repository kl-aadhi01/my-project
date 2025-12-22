// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDa5n4kouD8j8SkZjFKbOaLIR1P75qt_0Q",
  authDomain: "skill-x-e9103.firebaseapp.com",
  projectId: "skill-x-e9103",
  storageBucket: "skill-x-e9103.firebasestorage.app",
  messagingSenderId: "168346915694",
  appId: "1:168346915694:web:04d02b703f6af77cd0277f",
  measurementId: "G-PYNH68ZKVS",
  databaseURL: "https://skill-x-e9103-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
let auth, database;

document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 Login page loaded");
    
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log("✅ Firebase initialized");
        } else {
            firebase.app(); // Use existing app
        }
        
        auth = firebase.auth();
        database = firebase.database();
        console.log("✅ Firebase services ready");
        
    } catch (error) {
        console.error("❌ Firebase error:", error);
        showError("Firebase failed to load. Please refresh.");
    }
    
    // Check if already logged in
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log("👤 Already logged in as:", user.email);
            // Optional: Auto-redirect to dashboard
            // window.location.href = "dashboard.html";
        }
    });
});

// Show error message
function showError(message) {
    const errorElement = document.getElementById('login-error') || createMessageElement('login-error', 'error');
    errorElement.innerHTML = message;
    errorElement.style.display = 'block';
    
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

// Show success message
function showSuccess(message) {
    const successElement = document.getElementById('login-success') || createMessageElement('login-success', 'success');
    successElement.innerHTML = message;
    successElement.style.display = 'block';
}

// Create message element if doesn't exist
function createMessageElement(id, type) {
    const div = document.createElement('div');
    div.id = id;
    div.className = `${type}-message`;
    div.style.padding = '10px';
    div.style.borderRadius = '5px';
    div.style.margin = '10px 0';
    div.style.display = 'none';
    
    if (type === 'error') {
        div.style.color = '#ff6b6b';
        div.style.background = 'rgba(255, 107, 107, 0.1)';
    } else {
        div.style.color = '#2ed573';
        div.style.background = 'rgba(46, 213, 115, 0.1)';
    }
    
    document.querySelector('#loginForm').insertBefore(div, document.querySelector('.login-btn'));
    return div;
}

// Main login function
function loginUser() {
    console.log("🚀 Starting login...");
    
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    
    // Clear messages
    const errorElement = document.getElementById('login-error');
    const successElement = document.getElementById('login-success');
    if (errorElement) errorElement.style.display = 'none';
    if (successElement) successElement.style.display = 'none';
    
    // Validation
    if (!email) {
        showError("Please enter your email");
        return;
    }
    
    if (!password) {
        showError("Please enter your password");
        return;
    }
    
    // Show loading on button
    const loginBtn = document.querySelector('.login-btn');
    const originalText = loginBtn.innerHTML;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    loginBtn.disabled = true;
    
    console.log("🔄 Authenticating user...");
    
    // Login with Firebase
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("✅ Login successful:", user.uid);
            
            // Update last login time in database
            const updates = {
                'profile/lastLogin': new Date().toISOString(),
                'progress/lastActive': new Date().toISOString()
            };
            
            return database.ref('users/' + user.uid).update(updates);
        })
        .then(() => {
            console.log("✅ Last login updated");
            
            showSuccess("Login successful! Redirecting...");
            
            // Update navbar if function exists
            if (window.updateNavbarForUser) {
                window.updateNavbarForUser(auth.currentUser);
            }
            
            // Redirect to dashboard after 1.5 seconds
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1500);
            
        })
        .catch((error) => {
            console.error("❌ Login error:", error);
            
            // Reset button
            loginBtn.innerHTML = originalText;
            loginBtn.disabled = false;
            
            // Show user-friendly error
            let errorMessage = "Login failed. ";
            
            switch(error.code) {
                case 'auth/user-not-found':
                    errorMessage = "No account found with this email.";
                    break;
                case 'auth/wrong-password':
                    errorMessage = "Incorrect password. Please try again.";
                    document.getElementById("password").value = ""; // Clear password field
                    break;
                case 'auth/invalid-email':
                    errorMessage = "Invalid email address format.";
                    break;
                case 'auth/user-disabled':
                    errorMessage = "This account has been disabled.";
                    break;
                case 'auth/too-many-requests':
                    errorMessage = "Too many failed attempts. Try again later.";
                    break;
                case 'auth/network-request-failed':
                    errorMessage = "Network error. Check your connection.";
                    break;
                default:
                    errorMessage = error.message;
            }
            
            showError(errorMessage);
        });
}

// Forgot password function
function forgotPassword() {
    const email = document.getElementById("email").value.trim();
    
    if (!email) {
        showError("Please enter your email first");
        return;
    }
    
    console.log("🔄 Sending password reset to:", email);
    
    auth.sendPasswordResetEmail(email)
        .then(() => {
            showSuccess("Password reset email sent! Check your inbox.");
            console.log("✅ Password reset email sent");
        })
        .catch((error) => {
            console.error("❌ Reset error:", error);
            
            let errorMessage = "Failed to send reset email. ";
            
            if (error.code === 'auth/user-not-found') {
                errorMessage = "No account found with this email.";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "Invalid email address.";
            } else {
                errorMessage = error.message;
            }
            
            showError(errorMessage);
        });
}

// Google login function
function googleLogin() {
    console.log("🔵 Starting Google login...");
    
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    
    auth.signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            console.log("✅ Google login successful:", user.email);
            
            // Check if user exists in database
            return database.ref('users/' + user.uid).once('value');
        })
        .then((snapshot) => {
            const user = auth.currentUser;
            
            if (!snapshot.exists()) {
                // New Google user - create complete profile
                const names = user.displayName ? user.displayName.split(' ') : ['Google', 'User'];
                const userData = {
                    profile: {
                        firstName: names[0] || 'Google',
                        lastName: names.slice(1).join(' ') || 'User',
                        fullName: user.displayName || user.email,
                        email: user.email,
                        photoURL: user.photoURL || '',
                        isGoogleUser: true,
                        createdAt: new Date().toISOString(),
                        lastLogin: new Date().toISOString(),
                        membership: "free",
                        bio: "Google user"
                    },
                    progress: {
                        enrolledCourses: 0,
                        completedCourses: 0,
                        totalHours: 0,
                        currentStreak: 0,
                        lastActive: new Date().toISOString(),
                        totalXp: 0
                    }
                };
                
                console.log("💾 Saving new Google user...");
                return database.ref('users/' + user.uid).set(userData);
            } else {
                // Existing user - update last login
                return database.ref('users/' + user.uid + '/profile/lastLogin').set(new Date().toISOString());
            }
        })
        .then(() => {
            console.log("✅ Google user processed");
            
            showSuccess("Google login successful! Redirecting...");
            
            // Update navbar
            if (window.updateNavbarForUser) {
                window.updateNavbarForUser(auth.currentUser);
            }
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1500);
            
        })
        .catch((error) => {
            console.error("❌ Google login error:", error);
            
            let errorMessage = "Google login failed. ";
            
            if (error.code === 'auth/popup-blocked') {
                errorMessage = "Popup blocked. Please allow popups.";
            } else if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = "Login cancelled.";
            } else {
                errorMessage = error.message;
            }
            
            showError(errorMessage);
        });
}

// Make functions globally available
window.loginUser = loginUser;
window.forgotPassword = forgotPassword;
window.googleLogin = googleLogin;