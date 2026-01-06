// Main application entry point
class App {
    constructor() {
        this.init();
    }

    init() {
        this.setupGlobalEventListeners();
        this.checkServerHealth();
        this.addPublicFeatures();
    }

    setupGlobalEventListeners() {
        // Handle ESC key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                Utils.closeModal();
            }
        });

        // Handle click outside modal to close
        document.getElementById('modalContainer').addEventListener('click', (e) => {
            if (e.target.id === 'modalContainer') {
                Utils.closeModal();
            }
        });

        // Handle form submissions with Enter key
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
                const form = e.target.closest('form');
                if (form) {
                    const submitBtn = form.querySelector('button[type="submit"]');
                    if (submitBtn && !submitBtn.disabled) {
                        submitBtn.click();
                    }
                }
            }
        });
    }

    async checkServerHealth() {
        try {
            const response = await api.healthCheck();
            if (!response.success) {
                Utils.showNotification('Server is not responding. Please try again later.', 'warning');
            }
        } catch (error) {
            console.log('Server health check failed:', error);
            Utils.showNotification('Unable to connect to server. Please check your connection.', 'warning');
        }
    }

    addPublicFeatures() {
        // Add public "Found ID" button to the login page
        const loginSection = document.getElementById('loginSection');
        if (loginSection) {
            const publicButton = document.createElement('div');
            publicButton.className = 'mt-6 text-center';
            publicButton.innerHTML = `
                <button onclick="PublicModule.showFoundIdForm()" 
                        class="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                    <i class="fas fa-search mr-2"></i>Found an ID? Report it here
                </button>
            `;
            loginSection.appendChild(publicButton);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});

// Export for global access
window.App = App;
