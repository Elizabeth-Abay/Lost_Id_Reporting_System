// Staff Dashboard Module
class StaffDashboard {
    static async loadDashboard() {
        const container = document.getElementById('dashboardContainer');
        container.innerHTML = `
            <div class="mb-6">
                <h2 class="text-3xl font-bold text-gray-800 mb-2">Staff Dashboard</h2>
                <p class="text-gray-600">Manage student requests and ID operations</p>
            </div>
            
            <!-- Dashboard Stats -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-xl shadow-lg p-6 card-hover">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm">Pending Requests</p>
                            <p class="text-2xl font-bold text-yellow-600" id="pendingCount">-</p>
                        </div>
                        <div class="bg-yellow-100 p-3 rounded-lg">
                            <i class="fas fa-clock text-yellow-600 text-xl"></i>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-lg p-6 card-hover">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm">Approved Requests</p>
                            <p class="text-2xl font-bold text-green-600" id="approvedCount">-</p>
                        </div>
                        <div class="bg-green-100 p-3 rounded-lg">
                            <i class="fas fa-check-circle text-green-600 text-xl"></i>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-lg p-6 card-hover">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm">Rejected Requests</p>
                            <p class="text-2xl font-bold text-red-600" id="rejectedCount">-</p>
                        </div>
                        <div class="bg-red-100 p-3 rounded-lg">
                            <i class="fas fa-times-circle text-red-600 text-xl"></i>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-lg p-6 card-hover">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm">Banned Students</p>
                            <p class="text-2xl font-bold text-purple-600" id="bannedCount">-</p>
                        </div>
                        <div class="bg-purple-100 p-3 rounded-lg">
                            <i class="fas fa-ban text-purple-600 text-xl"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <button onclick="StaffDashboard.showUnsignedRequests()" 
                        class="bg-white rounded-xl shadow-lg p-6 text-left hover:shadow-xl transition-shadow">
                    <div class="flex items-center mb-3">
                        <div class="bg-blue-100 p-2 rounded-lg">
                            <i class="fas fa-file-signature text-blue-600"></i>
                        </div>
                        <h3 class="ml-3 font-semibold text-gray-800">Unsigned Requests</h3>
                    </div>
                    <p class="text-gray-600 text-sm">View requests awaiting your signature</p>
                </button>

                <button onclick="StaffDashboard.showAllRequests()" 
                        class="bg-white rounded-xl shadow-lg p-6 text-left hover:shadow-xl transition-shadow">
                    <div class="flex items-center mb-3">
                        <div class="bg-green-100 p-2 rounded-lg">
                            <i class="fas fa-list text-green-600"></i>
                        </div>
                        <h3 class="ml-3 font-semibold text-gray-800">All Requests</h3>
                    </div>
                    <p class="text-gray-600 text-sm">View and manage all requests</p>
                </button>

                <button onclick="StaffDashboard.showBanStudentForm()" 
                        class="bg-white rounded-xl shadow-lg p-6 text-left hover:shadow-xl transition-shadow">
                    <div class="flex items-center mb-3">
                        <div class="bg-red-100 p-2 rounded-lg">
                            <i class="fas fa-user-slash text-red-600"></i>
                        </div>
                        <h3 class="ml-3 font-semibold text-gray-800">Ban Student</h3>
                    </div>
                    <p class="text-gray-600 text-sm">Ban a student from the system</p>
                </button>

                <button onclick="StaffDashboard.showBannedStudents()" 
                        class="bg-white rounded-xl shadow-lg p-6 text-left hover:shadow-xl transition-shadow">
                    <div class="flex items-center mb-3">
                        <div class="bg-purple-100 p-2 rounded-lg">
                            <i class="fas fa-users text-purple-600"></i>
                        </div>
                        <h3 class="ml-3 font-semibold text-gray-800">Banned Students</h3>
                    </div>
                    <p class="text-gray-600 text-sm">View and manage banned students</p>
                </button>
            </div>

            <!-- Recent Activity -->
            <div class="bg-white rounded-xl shadow-lg p-6">
                <h3 class="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h3>
                <div id="recentActivity">
                    ${Utils.showLoading()}
                </div>
            </div>
        `;

        // Load dashboard data
        this.loadDashboardStats();
        this.loadRecentActivity();
    }

    static async loadDashboardStats() {
        try {
            const response = await api.getDashboardStats();
            
            if (response.success) {
                const stats = response.data;
                document.getElementById('pendingCount').textContent = stats.pending_requests || 0;
                document.getElementById('approvedCount').textContent = stats.approved_requests || 0;
                document.getElementById('rejectedCount').textContent = stats.rejected_requests || 0;
                document.getElementById('bannedCount').textContent = stats.banned_students || 0;
            }
        } catch (error) {
            console.error('Failed to load dashboard stats:', error);
        }
    }

    static async loadRecentActivity() {
        try {
            const response = await api.getAllRequests('all', 10, 0);
            const activityContainer = document.getElementById('recentActivity');

            if (response.success && response.data.length > 0) {
                const activityHTML = response.data.map(request => `
                    <div class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                        <div class="flex items-center space-x-3">
                            <div class="w-2 h-2 rounded-full ${
                                request.status === 'pending' ? 'bg-yellow-400' :
                                request.status === 'approved' ? 'bg-green-400' :
                                request.status === 'rejected' ? 'bg-red-400' : 'bg-blue-400'
                            }"></div>
                            <div>
                                <p class="text-sm font-medium text-gray-900">
                                    ${request.student_name} - ${request.id_number}
                                </p>
                                <p class="text-xs text-gray-500">
                                    ${Utils.formatDate(request.created_at)}
                                </p>
                            </div>
                        </div>
                        <div>
                            ${Utils.getStatusBadge(request.status)}
                        </div>
                    </div>
                `).join('');

                activityContainer.innerHTML = activityHTML;
            } else {
                activityContainer.innerHTML = Utils.showEmptyState('No recent activity');
            }
        } catch (error) {
            document.getElementById('recentActivity').innerHTML = Utils.showEmptyState('Failed to load activity');
        }
    }

    static async showUnsignedRequests() {
        try {
            Utils.showNotification('Loading unsigned requests...', 'info');
            const response = await api.getUnsignedRequests();
            
            if (response.success) {
                const formContent = `
                    <div class="space-y-4">
                        <h4 class="font-medium text-gray-800">Requests Awaiting Your Signature</h4>
                        ${response.data.length > 0 ? 
                            Utils.generateDataTable(response.data, [
                                { key: 'id', label: 'Request ID' },
                                { key: 'police_document', label: 'Police Document' }
                            ], [
                                {
                                    label: 'Accept',
                                    icon: 'fa-check',
                                    class: 'bg-green-600 hover:bg-green-700 text-white',
                                    onclick: 'StaffDashboard.acceptRequest',
                                    title: 'Accept Request'
                                },
                                {
                                    label: 'Reject',
                                    icon: 'fa-times',
                                    class: 'bg-red-600 hover:bg-red-700 text-white',
                                    onclick: 'StaffDashboard.showRejectForm',
                                    title: 'Reject Request'
                                }
                            ]) : 
                            Utils.showEmptyState('No unsigned requests found')
                        }
                    </div>
                `;
                
                Utils.showModal('Unsigned Requests', formContent);
            } else {
                Utils.showNotification('Failed to load unsigned requests', 'error');
            }
        } catch (error) {
            Utils.showNotification('Failed to load unsigned requests', 'error');
        }
    }

    static async showAllRequests() {
        try {
            Utils.showNotification('Loading all requests...', 'info');
            const response = await api.getAllRequests();
            
            if (response.success) {
                const formContent = `
                    <div class="space-y-4">
                        <div class="flex justify-between items-center">
                            <h4 class="font-medium text-gray-800">All Requests</h4>
                            <select id="statusFilter" onchange="StaffDashboard.filterRequests()" 
                                    class="px-3 py-2 border border-gray-300 rounded-lg">
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <div id="requestsTable">
                            ${response.data.length > 0 ? 
                                Utils.generateDataTable(response.data, [
                                    { key: 'id', label: 'Request ID' },
                                    { key: 'student_name', label: 'Student Name' },
                                    { key: 'id_number', label: 'ID Number' },
                                    { key: 'status', label: 'Status' },
                                    { key: 'created_at', label: 'Created Date' }
                                ], [
                                    {
                                        label: 'View',
                                        icon: 'fa-eye',
                                        class: 'bg-blue-600 hover:bg-blue-700 text-white',
                                        onclick: 'StaffDashboard.viewRequestDetails',
                                        title: 'View Details'
                                    }
                                ]) : 
                                Utils.showEmptyState('No requests found')
                            }
                        </div>
                    </div>
                `;
                
                Utils.showModal('All Requests', formContent);
            } else {
                Utils.showNotification('Failed to load requests', 'error');
            }
        } catch (error) {
            Utils.showNotification('Failed to load requests', 'error');
        }
    }

    static async filterRequests() {
        const status = document.getElementById('statusFilter').value;
        try {
            const response = await api.getAllRequests(status);
            const tableContainer = document.getElementById('requestsTable');
            
            if (response.success) {
                tableContainer.innerHTML = response.data.length > 0 ? 
                    Utils.generateDataTable(response.data, [
                        { key: 'id', label: 'Request ID' },
                        { key: 'student_name', label: 'Student Name' },
                        { key: 'id_number', label: 'ID Number' },
                        { key: 'status', label: 'Status' },
                        { key: 'created_at', label: 'Created Date' }
                    ], [
                        {
                            label: 'View',
                            icon: 'fa-eye',
                            class: 'bg-blue-600 hover:bg-blue-700 text-white',
                            onclick: 'StaffDashboard.viewRequestDetails',
                            title: 'View Details'
                        }
                    ]) : 
                    Utils.showEmptyState('No requests found');
            }
        } catch (error) {
            Utils.showNotification('Failed to filter requests', 'error');
        }
    }

    static showBanStudentForm() {
        const formContent = Utils.generateDynamicForm(null, 'banStudent');
        
        Utils.showModal('Ban Student', `
            ${formContent}
            <div class="flex justify-end mt-6">
                <button onclick="Utils.closeModal()" 
                        class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors mr-3">
                    Cancel
                </button>
                <button onclick="StaffDashboard.submitBanStudent()" 
                        class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                    Ban Student
                </button>
            </div>
        `);
    }

    static async submitBanStudent() {
        const idNumber = document.getElementById('banIdNumber').value;
        const reason = document.getElementById('banReason').value;

        if (!idNumber || !reason) {
            Utils.showNotification('Please fill in all fields', 'error');
            return;
        }

        try {
            Utils.showNotification('Banning student...', 'info');
            
            const response = await api.banStudent(idNumber, reason);
            
            if (response.success) {
                Utils.showNotification('Student banned successfully!', 'success');
                Utils.closeModal();
                this.loadDashboardStats(); // Refresh stats
            } else {
                Utils.showNotification(response.message || 'Failed to ban student', 'error');
            }
        } catch (error) {
            Utils.showNotification(error.message || 'Failed to ban student', 'error');
        }
    }

    static async showBannedStudents() {
        try {
            Utils.showNotification('Loading banned students...', 'info');
            const response = await api.getBannedStudents();
            
            if (response.success) {
                const formContent = `
                    <div class="space-y-4">
                        <h4 class="font-medium text-gray-800">Banned Students</h4>
                        ${response.data && response.data.length > 0 ? 
                            Utils.generateDataTable(response.data, [
                                { key: 'id_number', label: 'ID Number' },
                                { key: 'reason', label: 'Reason' },
                                { key: 'created_at', label: 'Banned Date' }
                            ], [
                                {
                                    label: 'Unban',
                                    icon: 'fa-user-check',
                                    class: 'bg-green-600 hover:bg-green-700 text-white',
                                    onclick: 'StaffDashboard.unbanStudent',
                                    title: 'Unban Student'
                                }
                            ]) : 
                            Utils.showEmptyState('No banned students found')
                        }
                    </div>
                `;
                
                Utils.showModal('Banned Students', formContent);
            } else {
                Utils.showNotification('Failed to load banned students', 'error');
            }
        } catch (error) {
            Utils.showNotification('Failed to load banned students', 'error');
        }
    }

    static async unbanStudent(studentId) {
        if (!confirm('Are you sure you want to unban this student?')) return;

        try {
            Utils.showNotification('Unbanning student...', 'info');
            
            // In a real implementation, you'd need the student's ID number
            // For now, we'll use a placeholder
            const response = await api.unBanStudent(studentId);
            
            if (response.success) {
                Utils.showNotification('Student unbanned successfully!', 'success');
                Utils.closeModal();
                this.loadDashboardStats(); // Refresh stats
            } else {
                Utils.showNotification(response.message || 'Failed to unban student', 'error');
            }
        } catch (error) {
            Utils.showNotification(error.message || 'Failed to unban student', 'error');
        }
    }

    static async acceptRequest(requestId) {
        if (!confirm('Are you sure you want to accept this request?')) return;

        try {
            Utils.showNotification('Accepting request...', 'info');
            
            const response = await api.acceptRequest(requestId);
            
            if (response.success) {
                Utils.showNotification('Request accepted successfully!', 'success');
                Utils.closeModal();
                this.loadDashboardStats(); // Refresh stats
            } else {
                Utils.showNotification(response.message || 'Failed to accept request', 'error');
            }
        } catch (error) {
            Utils.showNotification(error.message || 'Failed to accept request', 'error');
        }
    }

    static showRejectForm(requestId) {
        // For now, we'll use a simple form. In a real app, you'd fetch request details
        const formContent = Utils.generateDynamicForm({ id: requestId }, 'rejectRequest');
        
        Utils.showModal('Reject Request', `
            ${formContent}
            <div class="flex justify-end mt-6">
                <button onclick="Utils.closeModal()" 
                        class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors mr-3">
                    Cancel
                </button>
                <button onclick="StaffDashboard.submitRejectRequest('${requestId}')" 
                        class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                    Reject Request
                </button>
            </div>
        `);
    }

    static async submitRejectRequest(requestId) {
        const reason = document.getElementById('rejectReason').value;

        if (!reason) {
            Utils.showNotification('Please provide a reason for rejection', 'error');
            return;
        }

        try {
            Utils.showNotification('Rejecting request...', 'info');
            
            const response = await api.rejectRequest(reason, requestId);
            
            if (response.success) {
                Utils.showNotification('Request rejected successfully!', 'success');
                Utils.closeModal();
                this.loadDashboardStats(); // Refresh stats
            } else {
                Utils.showNotification(response.message || 'Failed to reject request', 'error');
            }
        } catch (error) {
            Utils.showNotification(error.message || 'Failed to reject request', 'error');
        }
    }

    static async viewRequestDetails(requestId) {
        try {
            const response = await api.getRequestDetails(requestId);
            
            if (response.success) {
                const formContent = Utils.generateDynamicForm(response.data, 'requestDetails');
                
                // Add action buttons based on status
                const actions = `
                    <div class="flex justify-end space-x-3 mt-6 pt-6 border-t">
                        ${response.data.status === 'pending' ? `
                            <button onclick="StaffDashboard.acceptRequest('${requestId}')" 
                                    class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                                <i class="fas fa-check mr-2"></i>Accept Request
                            </button>
                            <button onclick="StaffDashboard.showRejectForm('${requestId}')" 
                                    class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                                <i class="fas fa-times mr-2"></i>Reject Request
                            </button>
                        ` : ''}
                        ${response.data.status === 'rejected' ? `
                            <button onclick="StaffDashboard.unrejectRequest('${requestId}')" 
                                    class="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors">
                                <i class="fas fa-undo mr-2"></i>Unreject Request
                            </button>
                        ` : ''}
                        ${this.canFinalizeRequest(response.data) ? `
                            <button onclick="StaffDashboard.finalizeRequest('${requestId}')" 
                                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                                <i class="fas fa-check-double mr-2"></i>Finalize Request
                            </button>
                        ` : ''}
                        <button onclick="Utils.closeModal()" 
                                class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors">
                            Close
                        </button>
                    </div>
                `;
                
                Utils.showModal('Request Details', formContent + actions);
            } else {
                Utils.showNotification('Failed to load request details', 'error');
            }
        } catch (error) {
            Utils.showNotification('Failed to load request details', 'error');
        }
    }

    static canFinalizeRequest(request) {
        const requiredSignatures = [
            'library_sign', 'campus_police_sign', 'financial_sign',
            'book_store_sign', 'department_head_sign'
        ];
        
        return requiredSignatures.every(sig => request[sig] !== null) && 
               request.status === 'pending';
    }

    static async finalizeRequest(requestId) {
        if (!confirm('Are you sure you want to finalize this request? This action cannot be undone.')) return;

        try {
            Utils.showNotification('Finalizing request...', 'info');
            
            const response = await api.finalizeRequest(requestId);
            
            if (response.success) {
                Utils.showNotification('Request finalized successfully!', 'success');
                Utils.closeModal();
                this.loadDashboardStats(); // Refresh stats
            } else {
                Utils.showNotification(response.message || 'Failed to finalize request', 'error');
            }
        } catch (error) {
            Utils.showNotification(error.message || 'Failed to finalize request', 'error');
        }
    }

    static async unrejectRequest(requestId) {
        if (!confirm('Are you sure you want to unreject this request?')) return;

        try {
            Utils.showNotification('Unrejecting request...', 'info');
            
            const response = await api.unrejectRequest(requestId);
            
            if (response.success) {
                Utils.showNotification('Request unrejected successfully!', 'success');
                Utils.closeModal();
                this.loadDashboardStats(); // Refresh stats
            } else {
                Utils.showNotification(response.message || 'Failed to unreject request', 'error');
            }
        } catch (error) {
            Utils.showNotification(error.message || 'Failed to unreject request', 'error');
        }
    }
}

// Make it globally available
window.StaffDashboard = StaffDashboard;
