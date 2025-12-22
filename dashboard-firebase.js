// dashboard-firebase.js - CORRECTED VERSION
console.log('🚀 Dashboard Firebase Integration Loaded');

// Wait for auth-nav.js to initialize Firebase
document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 Dashboard initializing...');
    
    // Check auth state
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            console.log('✅ User authenticated:', user.email);
            await initializeDashboard(user);
        } else {
            console.log('❌ No user logged in');
            window.location.href = 'login.html';
        }
    });
});

// Main Dashboard Initialization
async function initializeDashboard(user) {
    try {
        console.log('📊 Loading dashboard for:', user.uid);
        
        // Show loading states
        showLoadingStates();
        
        // Update current date
        updateCurrentDate();
        
        // Get user data from database
        const userData = await getUserData(user.uid);
        
        if (!userData) {
            console.error('❌ No user data found');
            showError('No user data found. Please contact support.');
            return;
        }
        
        // Update all dashboard sections
        updateUserProfile(user, userData);
        updateStats(userData.progress || {});
        updateCourses(userData.courses || []);
        updateMentors(userData.mentors || []);
        updateActivity(userData.activity || []);
        
        // Update other sections
        updateRecommendations();
        updateCalendarEvents();
        updateStorage();
        
        // Setup event listeners
        setupDashboardListeners();
        
        console.log('✅ Dashboard loaded successfully');
        
    } catch (error) {
        console.error('❌ Dashboard error:', error);
        showError('Error loading dashboard. Please refresh.');
    }
}

// Get user data from database
async function getUserData(userId) {
    try {
        console.log('📥 Fetching user data for:', userId);
        const snapshot = await firebase.database().ref('users/' + userId).once('value');
        
        if (snapshot.exists()) {
            const data = snapshot.val();
            console.log('📊 User data found:', data);
            
            // Handle both old and new data formats
            if (data.profile && data.progress) {
                // New format (correct)
                return data;
            } else {
                // Old format - convert to new format
                console.log('🔄 Converting old data format to new format');
                return convertOldDataFormat(data);
            }
        } else {
            console.log('⚠️ No user data found, creating default');
            return createDefaultUserData();
        }
        
    } catch (error) {
        console.error('❌ Error getting user data:', error);
        return createDefaultUserData();
    }
}

// Convert old data format to new format
function convertOldDataFormat(oldData) {
    return {
        profile: {
            firstName: oldData.firstName || oldData.profile?.firstName || 'User',
            lastName: oldData.lastName || oldData.profile?.lastName || '',
            fullName: oldData.fullName || oldData.profile?.fullName || 
                     (oldData.firstName || 'User') + ' ' + (oldData.lastName || ''),
            email: oldData.email || oldData.profile?.email || '',
            photoURL: oldData.photoURL || oldData.profile?.photoURL || null,
            bio: oldData.bio || oldData.profile?.bio || 'Skill X learner',
            createdAt: oldData.createdAt || oldData.profile?.createdAt || new Date().toISOString(),
            lastLogin: oldData.lastLogin || oldData.profile?.lastLogin || new Date().toISOString(),
            membership: oldData.membership || oldData.profile?.membership || 'free'
        },
        progress: {
            enrolledCourses: oldData.enrolledCourses || oldData.progress?.enrolledCourses || 0,
            completedCourses: oldData.completedCourses || oldData.progress?.completedCourses || 0,
            totalHours: oldData.totalHours || oldData.progress?.totalHours || 0,
            currentStreak: oldData.currentStreak || oldData.progress?.currentStreak || 0,
            lastActive: oldData.lastActive || oldData.progress?.lastActive || new Date().toISOString(),
            totalXp: oldData.totalXp || oldData.progress?.totalXp || 0
        },
        courses: oldData.courses || {},
        mentors: oldData.mentors || {},
        activity: oldData.activity || {}
    };
}

// Create default user data if none exists
function createDefaultUserData() {
    return {
        profile: {
            firstName: 'New',
            lastName: 'User',
            fullName: 'New User',
            email: '',
            bio: 'Welcome to Skill X!',
            membership: 'free'
        },
        progress: {
            enrolledCourses: 0,
            completedCourses: 0,
            totalHours: 0,
            currentStreak: 0
        },
        courses: {},
        mentors: {},
        activity: {}
    };
}

// Update user profile section
function updateUserProfile(user, userData) {
    try {
        const profile = userData.profile || {};
        const progress = userData.progress || {};
        
        // Get display name (priority: fullName > firstName > email username)
        let displayName = profile.fullName || 
                         (profile.firstName ? `${profile.firstName} ${profile.lastName || ''}`.trim() : 
                         user.email.split('@')[0]);
        
        console.log('👤 Setting display name:', displayName);
        
        // Update all name elements
        const nameElements = [
            document.getElementById('userName'),
            document.getElementById('welcomeName'),
            document.getElementById('userEmail')
        ];
        
        if (nameElements[0]) nameElements[0].textContent = displayName;
        if (nameElements[1]) nameElements[1].textContent = displayName.split(' ')[0] || displayName;
        if (nameElements[2]) nameElements[2].textContent = user.email;
        
        // Update avatar
        updateAvatar(profile, user, displayName);
        
        // Update sidebar stats
        const sidebarStats = [
            { id: 'coursesEnrolled', value: progress.enrolledCourses || 0 },
            { id: 'completedCourses', value: progress.completedCourses || 0 },
            { id: 'activeStreak', value: progress.currentStreak || 0 }
        ];
        
        sidebarStats.forEach(stat => {
            const element = document.getElementById(stat.id);
            if (element) element.textContent = stat.value;
        });
        
    } catch (error) {
        console.error('❌ Error updating profile:', error);
    }
}

// Update avatar
function updateAvatar(profile, user, displayName) {
    const avatar = document.getElementById('userAvatar');
    if (!avatar) return;
    
    if (user.photoURL || profile.photoURL) {
        const photoURL = user.photoURL || profile.photoURL;
        avatar.innerHTML = `<img src="${photoURL}" alt="${displayName}" 
                               style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
    } else {
        // Generate avatar with initials
        const initials = getInitials(displayName);
        avatar.innerHTML = `<span style="font-size:24px;font-weight:600;">${initials}</span>`;
        avatar.style.background = generateAvatarColor(displayName);
    }
}

// Update stats section
function updateStats(progress) {
    try {
        const stats = [
            { id: 'statCourses', value: progress.enrolledCourses || 0 },
            { id: 'statCompleted', value: progress.completedCourses || 0 },
            { id: 'statHours', value: progress.totalHours || 0 },
            { id: 'statStreak', value: progress.currentStreak || 0 }
        ];
        
        stats.forEach(stat => {
            const element = document.getElementById(stat.id);
            if (element) element.textContent = stat.value;
        });
        
        // Update trend indicators
        updateTrendIndicators(progress);
        
    } catch (error) {
        console.error('❌ Error updating stats:', error);
    }
}

function updateTrendIndicators(progress) {
    const trends = [
        { id: 'coursesTrend', text: progress.enrolledCourses > 0 ? 'Active learner' : 'Start learning' },
        { id: 'completedTrend', text: progress.completedCourses > 0 ? `${progress.completedCourses} completed` : 'Complete your first' },
        { id: 'hoursTrend', text: progress.totalHours > 0 ? `${progress.totalHours} total hours` : 'Start tracking time' },
        { id: 'streakTrend', text: progress.currentStreak > 0 ? `${progress.currentStreak} day streak!` : 'Start your streak' }
    ];
    
    trends.forEach(trend => {
        const element = document.getElementById(trend.id);
        if (element) element.innerHTML = `<i class="fas fa-${trend.id.includes('streak') ? 'fire' : 'arrow-up'}"></i> ${trend.text}`;
    });
}

// Update courses section
function updateCourses(courses) {
    const container = document.getElementById('recentCourses');
    if (!container) return;
    
    // Check if courses is object or array
    let coursesArray = [];
    
    if (Array.isArray(courses)) {
        coursesArray = courses;
    } else if (typeof courses === 'object' && courses !== null) {
        // Convert object to array
        coursesArray = Object.entries(courses).map(([id, data]) => ({ id, ...data }));
    }
    
    if (coursesArray.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book" style="font-size: 3rem; color: #a2aabc; margin-bottom: 15px;"></i>
                <p style="color: #596f9b; margin-bottom: 20px;">No courses enrolled yet</p>
                <a href="explore.html" class="btn-primary">Browse Courses</a>
            </div>
        `;
        return;
    }
    
    const coursesHTML = coursesArray.slice(0, 2).map(course => `
        <div class="course-item">
            <div class="course-icon" style="background: linear-gradient(135deg, #425480, #7395b8)">
                <i class="fas ${course.icon || 'fa-laptop-code'}"></i>
            </div>
            <div class="course-info">
                <h4>${course.title || 'Untitled Course'}</h4>
                <p>${getCourseStatus(course)}</p>
                <div class="course-progress">
                    <div class="progress-bar">
                        <div class="progress" style="width: ${course.progress || 0}%"></div>
                    </div>
                    <span>${course.progress || 0}% Complete</span>
                </div>
            </div>
            <button class="btn-continue" onclick="openCourse('${course.id || ''}')">
                <i class="fas fa-play"></i>
            </button>
        </div>
    `).join('');
    
    container.innerHTML = coursesHTML;
}

// Other update functions (simplified versions)
function updateMentors(mentors) {
    const container = document.getElementById('mentorList');
    if (!container) return;
    
    let mentorsArray = [];
    if (Array.isArray(mentors)) {
        mentorsArray = mentors;
    } else if (typeof mentors === 'object' && mentors !== null) {
        mentorsArray = Object.entries(mentors).map(([id, data]) => ({ id, ...data }));
    }
    
    if (mentorsArray.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users" style="font-size: 3rem; color: #a2aabc; margin-bottom: 15px;"></i>
                <p style="color: #596f9b; margin-bottom: 20px;">No mentors connected yet</p>
                <a href="mentor.html" class="btn-primary">Find Mentors</a>
            </div>
        `;
        return;
    }
    
    // ... rest of mentors code
}

function updateActivity(activities) {
    const container = document.getElementById('activityList');
    if (!container) return;
    
    let activitiesArray = [];
    if (Array.isArray(activities)) {
        activitiesArray = activities;
    } else if (typeof activities === 'object' && activities !== null) {
        activitiesArray = Object.entries(activities).map(([id, data]) => ({ id, ...data }));
    }
    
    if (activitiesArray.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-history" style="font-size: 3rem; color: #a2aabc; margin-bottom: 15px;"></i>
                <p style="color: #596f9b;">No recent activity</p>
            </div>
        `;
        return;
    }
    
    // ... rest of activity code
}

// Helper functions
function getInitials(name) {
    if (!name) return 'U';
    return name.split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

function generateAvatarColor(name) {
    const colors = [
        'linear-gradient(135deg, #425480, #7395b8)',
        'linear-gradient(135deg, #364874, #596f9b)',
        'linear-gradient(135deg, #6780ad, #a2aabc)',
        'linear-gradient(135deg, #0d1022, #131a29)'
    ];
    const index = (name?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
}

function getCourseStatus(course) {
    if (!course.progress || course.progress === 0) return 'Start your learning journey';
    if (course.progress < 30) return 'Getting started...';
    if (course.progress < 70) return 'Making good progress';
    if (course.progress < 100) return 'Almost there!';
    return 'Course completed!';
}

function updateCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        dateElement.textContent = now.toLocaleDateString('en-US', options);
    }
}

function showLoadingStates() {
    const loadingHTML = `
        <div class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading...</p>
        </div>
    `;
    
    ['recentCourses', 'mentorList', 'activityList', 'recommendationsList', 'calendarEvents'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.innerHTML = loadingHTML;
    });
}

function showError(message) {
    console.error('❌ Dashboard error:', message);
    // You can add a toast notification here
}

function updateRecommendations() {
    const container = document.getElementById('recommendationsList');
    if (!container) return;
    
    container.innerHTML = `
        <div class="recommendation-item">
            <div class="rec-icon" style="background: #e8f0fe">
                <i class="fas fa-mobile-alt" style="color: #425480"></i>
            </div>
            <div class="rec-content">
                <h4>Mobile App Development</h4>
                <p>Build iOS & Android apps with React Native</p>
                <div class="rec-meta">
                    <span><i class="fas fa-clock"></i> 45 hours</span>
                    <span><i class="fas fa-users"></i> 2.5k enrolled</span>
                </div>
            </div>
            <button class="btn-enroll" onclick="enrollCourse('mobile-dev')">Enroll</button>
        </div>
        <div class="recommendation-item">
            <div class="rec-icon" style="background: #f0f7ff">
                <i class="fas fa-shield-alt" style="color: #364874"></i>
            </div>
            <div class="rec-content">
                <h4>Cybersecurity Essentials</h4>
                <p>Protect systems from cyber threats</p>
                <div class="rec-meta">
                    <span><i class="fas fa-clock"></i> 30 hours</span>
                    <span><i class="fas fa-users"></i> 1.8k enrolled</span>
                </div>
            </div>
            <button class="btn-enroll" onclick="enrollCourse('cybersecurity')">Enroll</button>
        </div>
    `;
}

function updateCalendarEvents() {
    const container = document.getElementById('calendarEvents');
    if (!container) return;
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    container.innerHTML = `
        <div class="event-item">
            <div class="event-date">
                <span class="event-day">${tomorrow.getDate()}</span>
                <span class="event-month">${tomorrow.toLocaleString('default', { month: 'short' }).toUpperCase()}</span>
            </div>
            <div class="event-details">
                <h4>Live Q&A Session</h4>
                <p>Web Development Bootcamp • 2:00 PM</p>
            </div>
            <button class="btn-join" onclick="joinSession('webdev-qa')">Join</button>
        </div>
    `;
}

function updateStorage() {
    const percent = 65;
    const storagePercent = document.getElementById('storagePercent');
    const storageProgress = document.getElementById('storageProgress');
    
    if (storagePercent) storagePercent.textContent = `${percent}%`;
    if (storageProgress) storageProgress.style.width = `${percent}%`;
}

// Setup event listeners
function setupDashboardListeners() {
    const resumeBtn = document.getElementById('resumeLearning');
    if (resumeBtn) {
        resumeBtn.addEventListener('click', () => {
            showToast('Loading your most recent course...', 'info');
            setTimeout(() => window.location.href = 'explore.html', 1000);
        });
    }
}

// Toast notification
function showToast(message, type = 'info') {
    // Your existing toast function
}

// Make functions globally available
window.openCourse = function(courseId) {
    showToast(`Opening course...`, 'info');
    window.location.href = `course.html?id=${courseId}`;
};

window.enrollCourse = function(courseId) {
    showToast(`Enrolling in course...`, 'info');
};

window.joinSession = function(sessionId) {
    showToast(`Joining session...`, 'info');
};