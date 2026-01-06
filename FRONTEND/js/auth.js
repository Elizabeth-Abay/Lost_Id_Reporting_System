// Authentication module
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Signup form
        document.getElementById('signupForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup();
        });

        // Toggle between login and signup
        document.getElementById('showSignup').addEventListener('click', (e) => {
            e.preventDefault();
            this.showSignup();
        });

        document.getElementById('showLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.showLogin();
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });
    }

    async handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!email || !password) {
            Utils.showNotification('Please fill in all fields', 'error');
            return;
        }

        try {
            Utils.showNotification('Logging in...', 'info');
            
            const response = await api.login(email, password);
            
            if (response.success) {
                api.setToken(response.accessToken);
                this.currentUser = response.user;
                this.updateUI();
                Utils.showNotification('Login successful!', 'success');
                
                // Load appropriate dashboard
                if (response.user.role === 'student') {
                    StudentDashboard.loadDashboard();
                } else if (response.user.role === 'staff') {
                    StaffDashboard.loadDashboard();
                }
            } else {
                Utils.showNotification(response.message || 'Login failed', 'error');
            }
        } catch (error) {
            Utils.showNotification(error.message || 'Login failed', 'error');
        }
    }

    async handleSignup() {
        const userData = {
            name: document.getElementById('signupName').value,
            id_number: document.getElementById('signupIdNumber').value,
            email: document.getElementById('signupEmail').value,
            department: document.getElementById('signupDepartment').value,
            role: document.getElementById('signupRole').value,
            password: document.getElementById('signupPassword').value
        };

        // Validate all fields
        if (Object.values(userData).some(value => !value)) {
            Utils.showNotification('Please fill in all fields', 'error');
            return;
        }

        try {
            Utils.showNotification('Creating account...', 'info');
            
            const response = await api.signup(userData);
            
            if (response.success) {
                Utils.showNotification('Account created successfully! Please check your email for verification.', 'success');
                this.showLogin();
            } else {
                Utils.showNotification(response.message || 'Signup failed', 'error');
            }
        } catch (error) {
            Utils.showNotification(error.message || 'Signup failed', 'error');
        }
    }

    handleLogout() {
        api.clearToken();
        this.currentUser = null;
        this.updateUI();
        Utils.showNotification('Logged out successfully', 'success');
        this.showLogin();
    }

    checkAuthStatus() {
        const token = localStorage.getItem('accessToken');
        if (token) {
            api.setToken(token);
            // In a real app, you'd validate the token here
            // For now, we'll just show the login form
        }
    }

    updateUI() {
        const loginSection = document.getElementById('loginSection');
        const signupSection = document.getElementById('signupSection');
        const studentDashboard = document.getElementById('studentDashboard');
        const staffDashboard = document.getElementById('staffDashboard');
        const logoutBtn = document.getElementById('logoutBtn');
        const userInfo = document.getElementById('userInfo');
        const userName = document.getElementById('userName');
        const userRole = document.getElementById('userRole');

        if (this.currentUser) {
            loginSection.classList.add('d-none');
            signupSection.classList.add('d-none');
            logoutBtn.classList.remove('d-none');
            userInfo.classList.remove('d-none');
            
            userName.textContent = this.currentUser.name;
            userRole.textContent = this.currentUser.role;
            
            // Show appropriate dashboard
            if (this.currentUser.role === 'student') {
                studentDashboard.classList.remove('d-none');
                staffDashboard.classList.add('d-none');
            } else if (this.currentUser.role === 'staff') {
                staffDashboard.classList.remove('d-none');
                studentDashboard.classList.add('d-none');
            }
        } else {
            loginSection.classList.remove('d-none');
            signupSection.classList.add('d-none');
            studentDashboard.classList.add('d-none');
            staffDashboard.classList.add('d-none');
            logoutBtn.classList.add('d-none');
            userInfo.classList.add('d-none');
        }
    }

    showLogin() {
        document.getElementById('loginSection').classList.remove('d-none');
        document.getElementById('signupSection').classList.add('d-none');
    }

    showSignup() {
        document.getElementById('loginSection').classList.add('d-none');
        document.getElementById('signupSection').classList.remove('d-none');
    }
}

// Initialize auth manager
const authManager = new AuthManager();
