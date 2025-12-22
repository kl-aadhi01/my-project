 document.addEventListener('DOMContentLoaded', function() {
            const categoryItems = document.querySelectorAll('.category-item');
            const professionalContainers = document.querySelectorAll('.professionals-container');
            
            categoryItems.forEach(item => {
                item.addEventListener('click', function() {
                    // Remove active class from all categories
                    categoryItems.forEach(cat => cat.classList.remove('active'));
                    
                    // Add active class to clicked category
                    this.classList.add('active');
                    
                    // Get the category id
                    const categoryId = this.getAttribute('data-category');
                    
                    // Hide all professional containers
                    professionalContainers.forEach(container => {
                        container.classList.remove('active');
                    });
                    
                    // Show the selected professional container
                    const targetContainer = document.getElementById(categoryId);
                    if (targetContainer) {
                        targetContainer.classList.add('active');
                    }
                });
            });
        });
        

document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop();
    const links = document.querySelectorAll('.nav-link');
    
    links.forEach(link => link.classList.remove('active'));
    
    links.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
        
        link.addEventListener('click', function() {
            links.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
});
