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
    console.log("📄 Registration page loaded");
    
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
    
    // Password strength indicator
    initPasswordStrength();
});

// Show error message
function showError(message) {
    const errorElement = document.getElementById('error');
    if (errorElement) {
        errorElement.innerHTML = message;
        errorElement.style.display = 'block';
    }
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

// Show success message
function showSuccess(message) {
    const successElement = document.getElementById('success');
    if (successElement) {
        successElement.innerHTML = message;
        successElement.style.display = 'block';
    }
}

// Initialize password strength meter
function initPasswordStrength() {
    const passwordInput = document.getElementById('password');
    const strengthMeter = document.getElementById('strengthMeter');
    
    if (passwordInput && strengthMeter) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            let strength = 0;
            
            if (password.length >= 8) strength += 25;
            if (/[a-z]/.test(password)) strength += 25;
            if (/[A-Z]/.test(password)) strength += 25;
            if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) strength += 25;
            
            strengthMeter.style.width = strength + '%';
            
            if (strength < 50) {
                strengthMeter.style.background = '#ff4757';
            } else if (strength < 75) {
                strengthMeter.style.background = '#ffa502';
            } else {
                strengthMeter.style.background = '#2ed573';
            }
        });
    }
}

// Main registration function
function register() {
    console.log("🚀 Starting registration...");
    
    // Get form values
    const fname = document.getElementById("fname").value.trim();
    const lname = document.getElementById("lname").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const agreeTerms = document.getElementById("agreeTerms").checked;
    
    // Clear messages
    document.getElementById('error').style.display = 'none';
    document.getElementById('success').style.display = 'none';
    
    // Validation
    if (!fname || !lname) {
        showError("Please enter your full name");
        return;
    }
    
    if (!email) {
        showError("Please enter your email");
        return;
    }
    
    if (!password) {
        showError("Please create a password");
        return;
    }
    
    if (password.length < 6) {
        showError("Password must be at least 6 characters");
        return;
    }
    
    if (password !== confirmPassword) {
        showError("Passwords do not match");
        return;
    }
    
    if (!agreeTerms) {
        showError("You must agree to the terms");
        return;
    }
    
    // Show loading state
    const button = document.getElementById('signupButton');
    const buttonText = document.getElementById('buttonText');
    const buttonSpinner = document.getElementById('buttonSpinner');
    
    button.disabled = true;
    buttonText.style.display = 'none';
    buttonSpinner.style.display = 'inline';
    
    console.log("🔄 Creating user account...");
    
    // Create user with Firebase Auth
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("✅ User created:", user.uid);
            
            // Create COMPLETE user data structure for dashboard
            const userData = {
                profile: {
                    firstName: fname,
                    lastName: lname,
                    fullName: `${fname} ${lname}`,
                    email: email,
                    photoURL: null,
                    bio: "New Skill X learner",
                    createdAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString(),
                    membership: "free"
                },
                progress: {
                    enrolledCourses: 0,
                    completedCourses: 0,
                    totalHours: 0,
                    currentStreak: 0,
                    lastActive: new Date().toISOString(),
                    totalXp: 0
                }
                // courses, mentors, activity will be added later
            };
            
            console.log("💾 Saving user data to database...");
            
            // Save to database
            return database.ref('users/' + user.uid).set(userData);
        })
        .then(() => {
            console.log("✅ User data saved successfully!");
            
            showSuccess("Account created successfully! Redirecting...");
            
            // Update navbar if function exists
            if (window.updateNavbarForUser) {
                window.updateNavbarForUser(auth.currentUser);
            }
            
            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 2000);
            
        })
        .catch((error) => {
            console.error("❌ Registration error:", error);
            
            // Reset button state
            button.disabled = false;
            buttonText.style.display = 'inline';
            buttonSpinner.style.display = 'none';
            
            // Show user-friendly error
            let errorMessage = "Registration failed. ";
            
            switch(error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = "This email is already registered. Try logging in.";
                    break;
                case 'auth/invalid-email':
                    errorMessage = "Invalid email address format.";
                    break;
                case 'auth/weak-password':
                    errorMessage = "Password is too weak. Use at least 6 characters.";
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

// Make function globally available
window.register = register;