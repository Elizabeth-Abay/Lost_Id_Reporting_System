// API Service - Centralized API calls with proper error handling
class ApiService {
    constructor() {
        this.baseURL = 'http://localhost:3000';
        this.token = localStorage.getItem('accessToken');
    }

    // Set token for authenticated requests
    setToken(token) {
        this.token = token;
        localStorage.setItem('accessToken', token);
    }

    // Clear token on logout
    clearToken() {
        this.token = null;
        localStorage.removeItem('accessToken');
    }

    // Generic request method with error handling
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { Authorization: `Bearer ${this.token}` }),
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Authentication endpoints
    async login(email, password) {
        return this.request('/user/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    async signup(userData) {
        return this.request('/user/signup', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async refreshToken() {
        return this.request('/token/refresh', {
            method: 'POST'
        });
    }

    // Student endpoints
    async reportLostId(idNumber) {
        return this.request('/api/student/lost-id', {
            method: 'POST',
            body: JSON.stringify({ idNumber })
        });
    }

    async requestNewId(idNumber, policeDocument) {
        return this.request('/api/student/new-id', {
            method: 'POST',
            body: JSON.stringify({ idNumber, policeDocument })
        });
    }

    async checkRequestStatus(idNumber) {
        return this.request(`/api/student/status/${idNumber}`, {
            method: 'GET'
        });
    }

    async getStudentNotifications() {
        return this.request('/api/student/notifications', {
            method: 'GET'
        });
    }

    // Staff endpoints
    async banStudent(idNumber, reason) {
        return this.request('/api/staff/ban-student', {
            method: 'POST',
            body: JSON.stringify({ idNumber, reason })
        });
    }

    async unBanStudent(idNumber) {
        return this.request('/api/staff/unban-student', {
            method: 'POST',
            body: JSON.stringify({ idNumber })
        });
    }

    async getBannedStudents() {
        return this.request('/api/staff/banned-students', {
            method: 'GET'
        });
    }

    async rejectRequest(reason, rejected_request_Id) {
        return this.request('/api/staff/reject-request', {
            method: 'POST',
            body: JSON.stringify({ reason, rejected_request_Id })
        });
    }

    async unrejectRequest(rejectedRequestId) {
        return this.request('/api/staff/unreject-request', {
            method: 'POST',
            body: JSON.stringify({ rejectedRequestId })
        });
    }

    async acceptRequest(requestFlowId) {
        return this.request('/api/staff/accept-request', {
            method: 'POST',
            body: JSON.stringify({ requestFlowId })
        });
    }

    async finalizeRequest(requestId) {
        return this.request('/api/staff/finalize-request', {
            method: 'POST',
            body: JSON.stringify({ requestId })
        });
    }

    async getUnsignedRequests() {
        return this.request('/api/staff/unsigned-requests', {
            method: 'GET'
        });
    }

    async getRejectedRequests() {
        return this.request('/api/staff/rejected-requests', {
            method: 'GET'
        });
    }

    async getAllRequests(status = 'all', limit = 50, offset = 0) {
        return this.request(`/api/staff/all-requests?status=${status}&limit=${limit}&offset=${offset}`, {
            method: 'GET'
        });
    }

    async getRequestDetails(requestId) {
        return this.request(`/api/staff/request-details/${requestId}`, {
            method: 'GET'
        });
    }

    async getDashboardStats() {
        return this.request('/api/staff/dashboard', {
            method: 'GET'
        });
    }

    // Public endpoints
    async reportFoundId(founderData) {
        return this.request('/api/found-id', {
            method: 'POST',
            body: JSON.stringify(founderData)
        });
    }

    // Health check
    async healthCheck() {
        return this.request('/health', {
            method: 'GET'
        });
    }
}

// Global API instance
const api = new ApiService();
