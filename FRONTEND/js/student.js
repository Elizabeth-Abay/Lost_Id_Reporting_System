// Student Dashboard Module
import  {requestAccess} from './requestingAccessFromRef.js';

class StudentDashboard {
    static async loadDashboard() {
        const container = document.getElementById('dashboardContainer');
        container.innerHTML = `
            <div class="mb-6">
                <h2 class="text-3xl font-bold text-gray-800 mb-2">Student Dashboard</h2>
                <p class="text-gray-600">Manage your lost ID reports and new ID requests</p>
            </div>
            
            <!-- Quick Actions -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="bg-white rounded-xl shadow-lg p-6 card-hover">
                    <div class="flex items-center mb-4">
                        <div class="bg-red-100 p-3 rounded-lg">
                            <i class="fas fa-search text-red-600 text-xl"></i>
                        </div>
                        <h3 class="ml-4 text-lg font-semibold text-gray-800">Report Lost ID</h3>
                    </div>
                    <p class="text-gray-600 mb-4">Report your lost ID to help find it</p>
                    <button onclick="StudentDashboard.showLostIdForm()" 
                            class="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition-colors">
                        Report Lost ID
                    </button>
                </div>

                <div class="bg-white rounded-xl shadow-lg p-6 card-hover">
                    <div class="flex items-center mb-4">
                        <div class="bg-blue-100 p-3 rounded-lg">
                            <i class="fas fa-id-card text-blue-600 text-xl"></i>
                        </div>
                        <h3 class="ml-4 text-lg font-semibold text-gray-800">Request New ID</h3>
                    </div>
                    <p class="text-gray-600 mb-4">Apply for a new ID card</p>
                    <button onclick="StudentDashboard.showNewIdForm()" 
                            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors">
                        Request New ID
                    </button>
                </div>

                <div class="bg-white rounded-xl shadow-lg p-6 card-hover">
                    <div class="flex items-center mb-4">
                        <div class="bg-green-100 p-3 rounded-lg">
                            <i class="fas fa-bell text-green-600 text-xl"></i>
                        </div>
                        <h3 class="ml-4 text-lg font-semibold text-gray-800">Notifications</h3>
                    </div>
                    <p class="text-gray-600 mb-4">Check your notifications</p>
                    <button onclick="StudentDashboard.showNotifications()" 
                            class="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-colors">
                        View Notifications
                    </button>
                </div>
            </div>

            <!-- Status Section -->
            <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h3 class="text-xl font-semibold text-gray-800 mb-4">Your Request Status</h3>
                <div id="statusContent">
                    ${Utils.showLoading()}
                </div>
            </div>
        `;

        // Load status data
        this.loadRequestStatus();
    }

    static async loadRequestStatus() {
        try {
            const response = await api.checkRequestStatus();
            const statusContent = document.getElementById('statusContent');

            if (response.success) {
                const { requests, lostReports } = response.data;

                let html = '';

                // Show new ID requests
                if (requests && requests.length > 0) {
                    html += `
                        <div class="mb-6">
                            <h4 class="font-medium text-gray-700 mb-3">New ID Requests</h4>
                            ${Utils.generateDataTable(requests, [
                                { key: 'id', label: 'Request ID' },
                                { key: 'id_number', label: 'ID Number' },
                                { key: 'status', label: 'Status' },
                                { key: 'created_at', label: 'Created Date' }
                            ], [
                                {
                                    label: 'View',
                                    icon: 'fa-eye',
                                    class: 'bg-blue-600 hover:bg-blue-700 text-white',
                                    onclick: 'StudentDashboard.viewRequestDetails',
                                    title: 'View Details'
                                }
                            ])}
                        </div>
                    `;
                }

                // Show lost ID reports
                if (lostReports && lostReports.length > 0) {
                    html += `
                        <div>
                            <h4 class="font-medium text-gray-700 mb-3">Lost ID Reports</h4>
                            ${Utils.generateDataTable(lostReports, [
                                { key: 'id', label: 'Report ID' },
                                { key: 'lost_id_number', label: 'ID Number' },
                                { key: 'found_status', label: 'Found Status' },
                                { key: 'created_at', label: 'Report Date' }
                            ], [
                                {
                                    label: 'View',
                                    icon: 'fa-eye',
                                    class: 'bg-blue-600 hover:bg-blue-700 text-white',
                                    onclick: 'StudentDashboard.viewLostReportDetails',
                                    title: 'View Details'
                                }
                            ])}
                        </div>
                    `;
                }

                if (!html) {
                    html = Utils.showEmptyState('No requests or reports found');
                }

                statusContent.innerHTML = html;
            } else {
                statusContent.innerHTML = Utils.showEmptyState('Failed to load status');
            }
        } catch (error) {
            document.getElementById('statusContent').innerHTML = Utils.showEmptyState('Error loading status');
            Utils.showNotification('Failed to load request status', 'error');
        }
    }

    static showLostIdForm() {
        const formContent = Utils.generateDynamicForm(null, 'lostIdReport', 'StudentDashboard.submitLostIdReport');
        
        Utils.showModal('Report Lost ID', `
            ${formContent}
            <div class="flex justify-end mt-6">
                <button onclick="Utils.closeModal()" 
                        class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors mr-3">
                    Cancel
                </button>
                <button onclick="StudentDashboard.submitLostIdReport()" 
                        class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                    Submit Report
                </button>
            </div>
        `);
    }

    static showNewIdForm() {
        const formContent = Utils.generateDynamicForm(null, 'newIdRequest', 'StudentDashboard.submitNewIdRequest');
        
        Utils.showModal('Request New ID', `
            ${formContent}
            <div class="flex justify-end mt-6">
                <button onclick="Utils.closeModal()" 
                        class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors mr-3">
                    Cancel
                </button>
                <button onclick="StudentDashboard.submitNewIdRequest()" 
                        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    Submit Request
                </button>
            </div>
        `);
    }

    static async submitLostIdReport() {
        const idNumber = document.getElementById('lostIdNumber').value;

        if (!idNumber) {
            Utils.showNotification('Please enter your ID number', 'error');
            return;
        }

        try {
            Utils.showNotification('Submitting lost ID report...', 'info');
            
            const response = await api.reportLostId(idNumber);
            
            if (response.success) {
                Utils.showNotification('Lost ID reported successfully!', 'success');
                Utils.closeModal();
                this.loadRequestStatus(); // Refresh status
            } else {
                Utils.showNotification(response.message || 'Failed to report lost ID', 'error');
            }
        } catch (error) {
            Utils.showNotification(error.message || 'Failed to report lost ID', 'error');
        }
    }

    static async submitNewIdRequest() {
        const idNumber = document.getElementById('newIdNumber').value;
        const policeDocument = document.getElementById('policeDocument').value;

        if (!idNumber || !policeDocument) {
            Utils.showNotification('Please fill in all fields', 'error');
            return;
        }

        try {
            Utils.showNotification('Submitting new ID request...', 'info');
            
            const response = await api.requestNewId(idNumber, policeDocument);
            
            if (response.success) {
                Utils.showNotification('New ID request submitted successfully!', 'success');
                Utils.closeModal();
                this.loadRequestStatus(); // Refresh status
            } else {
                Utils.showNotification(response.message || 'Failed to submit request', 'error');
            }
        } catch (error) {
            Utils.showNotification(error.message || 'Failed to submit request', 'error');
        }
    }

    static async showNotifications() {
        try {
            const response = await api.getStudentNotifications();
            
            if (response.success) {
                const { rejections, approvals, foundIds } = response.data;
                
                let html = '<div class="space-y-4">';
                
                // Show rejections
                if (rejections.length > 0) {
                    html += `
                        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h4 class="font-medium text-red-800 mb-2">
                                <i class="fas fa-exclamation-circle mr-2"></i>Request Rejections
                            </h4>
                            <div class="space-y-2">
                                ${rejections.map(notif => `
                                    <div class="text-sm">
                                        <p class="text-red-700">Request ID: ${notif.id}</p>
                                        <p class="text-red-600">Reason: ${notif.reason}</p>
                                        <p class="text-red-500 text-xs">${Utils.formatDate(notif.created_at)}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }

                // Show approvals
                if (approvals.length > 0) {
                    html += `
                        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h4 class="font-medium text-green-800 mb-2">
                                <i class="fas fa-check-circle mr-2"></i>Request Approvals
                            </h4>
                            <div class="space-y-2">
                                ${approvals.map(notif => `
                                    <div class="text-sm">
                                        <p class="text-green-700">Request ID: ${notif.id}</p>
                                        <p class="text-green-500 text-xs">${Utils.formatDate(notif.updated_at)}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }

                // Show found IDs
                if (foundIds.length > 0) {
                    html += `
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 class="font-medium text-blue-800 mb-2">
                                <i class="fas fa-search mr-2"></i>Found IDs
                            </h4>
                            <div class="space-y-2">
                                ${foundIds.map(notif => `
                                    <div class="text-sm">
                                        <p class="text-blue-700">Report ID: ${notif.id}</p>
                                        <p class="text-blue-600">Found by: ${notif.founder_name}</p>
                                        <p class="text-blue-600">Contact: ${notif.contact_info}</p>
                                        <p class="text-blue-500 text-xs">${Utils.formatDate(notif.created_at)}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }

                if (!html) {
                    html = Utils.showEmptyState('No notifications');
                }

                html += '</div>';
                
                Utils.showModal('Notifications', html);
            } else {
                Utils.showNotification('Failed to load notifications', 'error');
            }
        } catch (error) {
            Utils.showNotification('Failed to load notifications', 'error');
        }
    }

    static async viewRequestDetails(requestId) {
        try {
            const response = await api.getRequestDetails(requestId);
            
            if (response.success) {
                const formContent = Utils.generateDynamicForm(response.data, 'requestDetails');
                Utils.showModal('Request Details', formContent);
            } else {
                Utils.showNotification('Failed to load request details', 'error');
            }
        } catch (error) {
            Utils.showNotification('Failed to load request details', 'error');
        }
    }

    static viewLostReportDetails(reportId) {
        // For now, show basic info. In a real app, you'd fetch detailed info
        Utils.showModal('Lost ID Report Details', `
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Report ID</label>
                    <p class="text-gray-900">${reportId}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Status</label>
                    <p class="text-gray-900">Report submitted successfully</p>
                </div>
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p class="text-yellow-800">
                        <i class="fas fa-info-circle mr-2"></i>
                        We'll notify you when your ID is found.
                    </p>
                </div>
            </div>
        `);
    }
}

// Make it globally available
window.StudentDashboard = StudentDashboard;
