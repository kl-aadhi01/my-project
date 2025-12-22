// Run this once to add sample data
async function addSampleData(userId) {
    const database = firebase.database();
    
    // Sample courses
    await database.ref(`users/${userId}/courses`).set({
        course1: {
            title: "Web Development Bootcamp",
            progress: 65,
            lastAccessed: new Date().toISOString(),
            enrolledDate: new Date().toISOString(),
            category: "Programming",
            instructor: "Sarah Johnson"
        },
        course2: {
            title: "Data Science Fundamentals",
            progress: 30,
            lastAccessed: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            enrolledDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            category: "Data Science",
            instructor: "Michael Chen"
        }
    });
    
    // Sample progress
    await database.ref(`users/${userId}/progress`).set({
        enrolledCourses: 2,
        completedCourses: 0,
        totalHours: 12,
        currentStreak: 5,
        lastActive: new Date().toISOString(),
        totalXp: 450
    });
    
    // Sample activity
    await database.ref(`users/${userId}/activity`).set({
        activity1: {
            type: "course_started",
            title: "Started Web Development Bootcamp",
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            details: "Enrolled in the course"
        },
        activity2: {
            type: "quiz_taken",
            title: "Completed JavaScript Basics Quiz",
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            details: "Score: 85%"
        }
    });
    
    console.log('✅ Sample data added!');
}