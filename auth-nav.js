// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDa5n4kouD8j8SkZjFKbOaLIR1P75qt_0Q",
  authDomain: "skill-x-e9103.firebaseapp.com",
  projectId: "skill-x-e9103",
  storageBucket: "skill-x-e9103.firebasestorage.app",
  messagingSenderId: "168346915694",
  appId: "1:168346915694:web:04d02b703f6af77cd0277f",
  measurementId: "G-PYNH68ZKVS"
};

// Initialize Firebase only once
let auth, database;

document.addEventListener('DOMContentLoaded', function() {
    console.log("🔧 Loading navbar authentication...");
    
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log("✅ Firebase initialized for navbar");
        }
        
        auth = firebase.auth();
        database = firebase.database();
        
        // Listen to auth state changes
        auth.onAuthStateChanged(handleAuthStateChange);
        
    } catch (error) {
        console.error("❌ Navbar Firebase error:", error);
    }
    
    // Initialize dropdown functionality
    initDropdown();
});

function handleAuthStateChange(user) {
    const navbar = document.querySelector('.navbar');
    const guestButtons = document.querySelector('.guest-buttons');
    const userProfile = document.querySelector('.user-profile');
    const userAvatar = document.querySelector('.user-avatar');
    const userNameElement = document.querySelector('.user-name');
    const userEmailElement = document.querySelector('.user-email');
    
    if (user) {
        // User is logged in
        console.log("👤 User is logged in:", user.email);
        
        // Update navbar state
        navbar.classList.add('auth-state-logged-in');
        
        // Update user info
        const displayName = user.displayName || user.email.split('@')[0];
        const initials = displayName.charAt(0).toUpperCase();
        
        userAvatar.textContent = initials;
        userEmailElement.textContent = user.email;
        
        // Get user's full name from database
        database.ref('users/' + user.uid).once('value')
            .then((snapshot) => {
                const userData = snapshot.val();
                if (userData && userData.fullName) {
                    userNameElement.textContent = userData.fullName;
                    userAvatar.textContent = userData.firstName?.charAt(0) || initials;
                } else {
                    userNameElement.textContent = displayName;
                }
            })
            .catch((error) => {
                console.log("⚠️ Could not fetch user data:", error);
                userNameElement.textContent = displayName;
            });
        
    } else {
        // User is logged out
        console.log("👤 No user logged in");
        
        // Update navbar state
        navbar.classList.remove('auth-state-logged-in');
    }
}

function initDropdown() {
    const userAvatar = document.querySelector('.user-avatar');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const logoutBtn = document.querySelector('.logout-btn');
    
    if (userAvatar) {
        // Toggle dropdown on avatar click
        userAvatar.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!dropdownMenu.contains(e.target) && !userAvatar.contains(e.target)) {
                dropdownMenu.classList.remove('show');
            }
        });
        
        // Logout functionality
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                if (confirm("Are you sure you want to logout?")) {
                    auth.signOut()
                        .then(() => {
                            console.log("✅ User logged out");
                            alert("Logged out successfully!");
                            dropdownMenu.classList.remove('show');
                            window.location.href = "landingpage.html";
                        })
                        .catch((error) => {
                            console.error("❌ Logout error:", error);
                            alert("Error logging out: " + error.message);
                        });
                }
            });
        }
    }
}

// Function to manually update navbar (call this after login/registration)
function updateNavbarForUser(user) {
    handleAuthStateChange(user);
}

// Make functions available globally
window.updateNavbarForUser = updateNavbarForUser;



// When page loads: HIDE the buttons/avatar first
navright.style.opacity = '0';
navright.style.visibility = 'hidden';

// When Firebase finishes checking: SHOW the correct one
auth.onAuthStateChanged(function(user) {
    // Show either login buttons OR user avatar
    navright.style.opacity = '1';
    navright.style.visibility = 'visible';
});