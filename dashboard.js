// Dashboard Main Script
console.log('🎯 Dashboard script loaded');

// Global variables
let currentUser = null;
let auth, database;

// Firebase configuration (same as in auth-nav.js)
const firebaseConfig = {
    apiKey: "AIzaSyDa5n4kouD8j8SkZjFKbOaLIR1P75qt_0Q",
    authDomain: "skill-x-e9103.firebaseapp.com",
    projectId: "skill-x-e9103",
    storageBucket: "skill-x-e9103.firebasestorage.app",
    messagingSenderId: "168346915694",
    appId: "1:168346915694:web:04d02b703f6af77cd0277f",
    databaseURL: "https://skill-x-e9103-default-rtdb.firebaseio.com/"
};

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 Dashboard DOM loaded');
    
    try {
        // Initialize Firebase
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log('✅ Firebase initialized for dashboard');
        }
        
        // Get auth and database instances
        auth = firebase.auth();
        database = firebase.database();
        
        // Make them available globally (optional)
        window.auth = auth;
        window.database = database;
        
        console.log('🔥 Firebase services ready');
        
        // Check authentication state
        auth.onAuthStateChanged(async function(user) {
            if (user) {
                console.log('✅ User authenticated:', user.email);
                currentUser = user;
                
                // Load user data
                await loadUserData(user);
                
                // Update UI
                updateCurrentDate();
                
                // Setup event listeners
                setupEventListeners();
                
                // Load dashboard data
                await loadDashboardData(user.uid);
                
            } else {
                console.log('❌ No user logged in, redirecting to login');
                showToast('Please login to access dashboard', 'warning');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            }
        });
        
    } catch (error) {
        console.error('❌ Dashboard Firebase error:', error);
        showToast('Firebase initialization failed. Please refresh the page.', 'error');
    }
});

// Load user data from Firebase
async function loadUserData(user) {
    try {
        console.log('👤 Loading user data for:', user.uid);
        
        // Get user data from database
        const userRef = database.ref('users/' + user.uid);
        const snapshot = await userRef.once('value');
        
        if (snapshot.exists()) {
            const userData = snapshot.val();
            console.log('📝 User data found:', userData);
            
            // Update UI with user data
            updateUserUI(user, userData);
            
        } else {
            console.log('⚠️ No user data found in database, creating new profile');
            // Create user profile if it doesn't exist
            await createUserProfile(user);
            // Reload user data
            await loadUserData(user);
        }
        
    } catch (error) {
        console.error('❌ Error loading user data:', error);
        showToast('Error loading profile data', 'error');
        
        // Fallback to basic user info from auth
        updateUserUI(user, null);
    }
}

// Update user interface with data
function updateUserUI(user, userData) {
    try {
        // Update name
        const displayName = userData?.fullName || user.displayName || user.email.split('@')[0];
        document.getElementById('userName').textContent = displayName;
        document.getElementById('welcomeName').textContent = displayName.split(' ')[0] || displayName;
        
        // Update email
        document.getElementById('userEmail').textContent = user.email;
        
        // Update avatar
        const avatar = document.getElementById('userAvatar');
        if (user.photoURL || userData?.photoURL) {
            const photoURL = user.photoURL || userData.photoURL;
            avatar.innerHTML = `<img src="${photoURL}" alt="${displayName}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
        } else {
            const initials = getInitials(displayName);
            avatar.innerHTML = `<span style="font-size:32px;">${initials}</span>`;
        }
        
        console.log('✅ User UI updated');
        
    } catch (error) {
        console.error('❌ Error updating user UI:', error);
    }
}

// Get initials from name
function getInitials(name) {
    if (!name) return 'U';
    return name.split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

// Create user profile in database
async function createUserProfile(user) {
    try {
        const userData = {
            firstName: user.displayName?.split(' ')[0] || user.email.split('@')[0],
            lastName: user.displayName?.split(' ')[1] || '',
            fullName: user.displayName || user.email.split('@')[0],
            email: user.email,
            photoURL: user.photoURL || null,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            membership: 'free',
            bio: 'New Skill X learner'
        };
        
        await database.ref('users/' + user.uid).set(userData);
        console.log('✅ New user profile created');
        
    } catch (error) {
        console.error('❌ Error creating user profile:', error);
        throw error;
    }
}

// Load dashboard data
async function loadDashboardData(userId) {
    try {
        console.log('📈 Loading dashboard data for user:', userId);
        
        // Get user progress data
        const progressRef = database.ref('userProgress/' + userId);
        const snapshot = await progressRef.once('value');
        
        if (snapshot.exists()) {
            const progressData = snapshot.val();
            console.log('📊 Progress data found:', progressData);
            
            // Update stats
            updateStats(progressData);
            
        } else {
            console.log('⚠️ No progress data found, initializing');
            await initializeUserProgress(userId);
        }
        
        // Update badge counts (placeholder - you can implement actual counts)
        updateBadgeCounts();
        
        console.log('✅ Dashboard data loaded successfully');
        
    } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
        showToast('Error loading dashboard data', 'error');
        
        // Set default values
        updateStats({
            enrolledCourses: 0,
            completedCourses: 0,
            totalHours: 0,
            currentStreak: 0
        });
    }
}

// Update statistics on the dashboard
function updateStats(progressData) {
    try {
        // Main stats
        document.getElementById('statCourses').textContent = progressData.enrolledCourses || 0;
        document.getElementById('statCompleted').textContent = progressData.completedCourses || 0;
        document.getElementById('statHours').textContent = progressData.totalHours || 0;
        document.getElementById('statStreak').textContent = progressData.currentStreak || 0;
        
        // Sidebar stats
        document.getElementById('coursesEnrolled').textContent = progressData.enrolledCourses || 0;
        document.getElementById('completedCourses').textContent = progressData.completedCourses || 0;
        
        console.log('📊 Stats updated');
        
    } catch (error) {
        console.error('❌ Error updating stats:', error);
    }
}

// Initialize user progress data
async function initializeUserProgress(userId) {
    try {
        const progressData = {
            enrolledCourses: 0,
            completedCourses: 0,
            totalHours: 0,
            currentStreak: 0,
            lastActive: new Date().toISOString(),
            enrolledCoursesList: {},
            completedCoursesList: {},
            activeCourses: {}
        };
        
        await database.ref('userProgress/' + userId).set(progressData);
        console.log('✅ User progress initialized');
        
        // Update UI with zeros
        updateStats(progressData);
        
    } catch (error) {
        console.error('❌ Error initializing progress:', error);
        throw error;
    }
}

// Update badge counts
function updateBadgeCounts() {
    // Placeholder - implement actual notification counts
    document.getElementById('messageBadge').textContent = '0';
    document.getElementById('notificationBadge').textContent = '0';
}

// Update current date
function updateCurrentDate() {
    try {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const formattedDate = now.toLocaleDateString('en-US', options);
        document.getElementById('currentDate').textContent = formattedDate;
        
    } catch (error) {
        console.error('❌ Error updating date:', error);
        document.getElementById('currentDate').textContent = new Date().toDateString();
    }
}

// Setup event listeners
function setupEventListeners() {
    console.log('🔗 Setting up event listeners');
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Menu items
    const menuItems = document.querySelectorAll('.menu-item:not(.logout)');
    menuItems.forEach(item => {
        item.addEventListener('click', handleMenuItemClick);
    });
    
    // Quick action buttons
    const profileBtn = document.getElementById('profileBtn');
    const progressBtn = document.getElementById('progressBtn');
    const profileActionBtn = document.getElementById('profileActionBtn');
    const certificateBtn = document.getElementById('certificateBtn');
    const messagesBtn = document.getElementById('messagesBtn');
    const notificationsBtn = document.getElementById('notificationsBtn');
    
    if (profileBtn) profileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Profile settings coming soon!', 'info');
    });
    
    if (progressBtn) progressBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Progress analytics coming soon!', 'info');
    });
    
    if (profileActionBtn) profileActionBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Update profile feature coming soon!', 'info');
    });
    
    if (certificateBtn) certificateBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Certificate feature coming soon!', 'info');
    });
    
    if (messagesBtn) messagesBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Messaging system coming soon!', 'info');
    });
    
    if (notificationsBtn) notificationsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Notifications panel coming soon!', 'info');
    });
    
    // Stat cards - add click handlers
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        card.addEventListener('click', () => {
            const label = card.querySelector('.stat-label').textContent;
            showToast(`Viewing ${label.toLowerCase()} details`, 'info');
        });
    });
}

// Handle menu item clicks
function handleMenuItemClick(e) {
    e.preventDefault();
    
    const menuItem = e.currentTarget;
    const href = menuItem.getAttribute('href');
    
    // Remove active class from all menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to clicked item
    menuItem.classList.add('active');
    
    // If it's an external link, navigate normally
    if (href && !href.startsWith('#')) {
        window.location.href = href;
    } else if (href === '#') {
        // Handle internal anchors
        const targetId = href.substring(1);
        console.log('📌 Navigating to:', targetId);
    }
}

// Handle logout
function handleLogout(e) {
    e.preventDefault();
    
    if (!auth) {
        console.error('❌ Firebase auth not available');
        showToast('Error logging out', 'error');
        return;
    }
    
    const confirmLogout = confirm('Are you sure you want to logout?');
    if (!confirmLogout) return;
    
    auth.signOut()
        .then(() => {
            console.log('👋 User logged out successfully');
            showToast('Logged out successfully! Redirecting to login...', 'success');
            
            // Redirect to login page after delay
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            
        })
        .catch(error => {
            console.error('❌ Error logging out:', error);
            showToast('Error logging out: ' + error.message, 'error');
        });
}

// Show toast notification
function showToast(message, type = 'info') {
    // Remove existing toast
    const existingToast = document.getElementById('toastContainer');
    if (existingToast) {
        existingToast.innerHTML = '';
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Style the toast
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#ff4757' : 
                     type === 'success' ? '#2ed573' : 
                     type === 'warning' ? '#ffa502' : '#1e90ff'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        font-weight: 500;
        max-width: 400px;
        word-wrap: break-word;
    `;
    
    // Add to container
    const container = document.getElementById('toastContainer') || document.body;
    container.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Add animation styles if not already present
if (!document.querySelector('#toastAnimations')) {
    const style = document.createElement('style');
    style.id = 'toastAnimations';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Initialize dashboard
console.log('🚀 Skill X Dashboard ready');