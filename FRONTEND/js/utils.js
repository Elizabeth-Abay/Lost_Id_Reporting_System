// Utility functions for UI and data manipulation
class Utils {
    // Show notification with different types
    static showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        
        const alertClass = {
            success: 'alert-success',
            error: 'alert-danger',
            warning: 'alert-warning',
            info: 'alert-info'
        }[type] || 'alert-info';

        const icon = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        }[type] || 'fa-info-circle';

        notification.className = `alert ${alertClass} fade-in`;
        notification.innerHTML = `
            <div class="d-flex align-center">
                <i class="fas ${icon} me-3"></i>
                <span>${message}</span>
                <button type="button" class="btn btn-sm ms-auto" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        container.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Show modal with custom content
    static showModal(title, content, onConfirm = null) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        const modalFooter = document.getElementById('modalFooter');
        
        modalTitle.textContent = title;
        modalBody.innerHTML = content;
        
        if (onConfirm) {
            modalFooter.innerHTML = `
                <button type="button" class="btn btn-outline" id="modalCancel">Cancel</button>
                <button type="button" class="btn btn-primary" id="modalConfirm">Confirm</button>
            `;
            
            document.getElementById('modalConfirm').onclick = () => {
                onConfirm();
                this.closeModal();
            };
        } else {
            modalFooter.innerHTML = `
                <button type="button" class="btn btn-primary" id="modalClose">Close</button>
            `;
        }
        
        document.getElementById('modalCancel').onclick = () => this.closeModal();
        document.getElementById('modalClose').onclick = () => this.closeModal();
        
        modal.classList.add('show');
    }

    // Close modal
    static closeModal() {
        const modal = document.getElementById('modal');
        modal.classList.remove('show');
    }

    // Format date
    static formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Format status badge
    static getStatusBadge(status) {
        const statusConfig = {
            pending: { class: 'badge-warning', label: 'Pending' },
            approved: { class: 'badge-success', label: 'Approved' },
            rejected: { class: 'badge-danger', label: 'Rejected' },
            completed: { class: 'badge-primary', label: 'Completed' }
        };

        const config = statusConfig[status] || { class: 'badge-info', label: status };
        
        return `<span class="badge ${config.class}">${config.label}</span>`;
    }

    // Generate dynamic form from JSON data
    static generateDynamicForm(data, formType, onSubmit) {
        let formHTML = '<form id="dynamicForm" class="space-y-4">';
        
        if (formType === 'requestDetails') {
            formHTML += this.generateRequestDetailsForm(data);
        } else if (formType === 'banStudent') {
            formHTML += this.generateBanStudentForm();
        } else if (formType === 'rejectRequest') {
            formHTML += this.generateRejectRequestForm(data);
        } else if (formType === 'newIdRequest') {
            formHTML += this.generateNewIdRequestForm();
        } else if (formType === 'lostIdReport') {
            formHTML += this.generateLostIdReportForm();
        } else if (formType === 'foundIdReport') {
            formHTML += this.generateFoundIdReportForm();
        }

        formHTML += '</form>';
        return formHTML;
    }

    // Generate request details form
    static generateRequestDetailsForm(data) {
        return `
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Request ID</label>
                        <p class="text-gray-900 font-mono">${data.id}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Student Name</label>
                        <p class="text-gray-900">${data.student_name}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">ID Number</label>
                        <p class="text-gray-900">${data.id_number}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Department</label>
                        <p class="text-gray-900">${data.department || 'N/A'}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Status</label>
                        <div>${this.getStatusBadge(data.status)}</div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Created Date</label>
                        <p class="text-gray-900">${this.formatDate(data.created_at)}</p>
                    </div>
                </div>
                
                ${data.rejection_reason ? `
                    <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 class="font-medium text-red-800 mb-2">Rejection Reason</h4>
                        <p class="text-red-700">${data.rejection_reason}</p>
                    </div>
                ` : ''}

                <div class="border-t pt-4">
                    <h4 class="font-medium text-gray-800 mb-3">Signature Status</h4>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex items-center space-x-2">
                            <i class="fas ${data.library_sign ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-500'}"></i>
                            <span>Library: ${data.library_signer_name || 'Pending'}</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <i class="fas ${data.campus_police_sign ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-500'}"></i>
                            <span>Campus Police: ${data.police_signer_name || 'Pending'}</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <i class="fas ${data.financial_sign ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-500'}"></i>
                            <span>Financial: ${data.financial_signer_name || 'Pending'}</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <i class="fas ${data.book_store_sign ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-500'}"></i>
                            <span>Book Store: ${data.bookstore_signer_name || 'Pending'}</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <i class="fas ${data.department_head_sign ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-500'}"></i>
                            <span>Department Head: ${data.department_head_signer_name || 'Pending'}</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <i class="fas ${data.registral_sign ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-500'}"></i>
                            <span>Registral: ${data.registral_signer_name || 'Pending'}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Generate ban student form
    static generateBanStudentForm() {
        return `
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Student ID Number</label>
                    <input type="text" id="banIdNumber" required 
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                           placeholder="Enter student ID number">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Reason for Banning</label>
                    <textarea id="banReason" required rows="4"
                              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter reason for banning this student"></textarea>
                </div>
            </div>
        `;
    }

    // Generate reject request form
    static generateRejectRequestForm(data) {
        return `
            <div class="space-y-4">
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-medium text-gray-800 mb-2">Request Details</h4>
                    <p><strong>Request ID:</strong> ${data.id}</p>
                    <p><strong>Student:</strong> ${data.student_name}</p>
                    <p><strong>ID Number:</strong> ${data.id_number}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Rejection Reason</label>
                    <textarea id="rejectReason" required rows="4"
                              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter reason for rejecting this request"></textarea>
                </div>
            </div>
        `;
    }

    // Generate new ID request form
    static generateNewIdRequestForm() {
        return `
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">ID Number</label>
                    <input type="text" id="newIdNumber" required 
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                           placeholder="Enter your ID number">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Police Document</label>
                    <textarea id="policeDocument" required rows="4"
                              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter police report details or upload document reference"></textarea>
                </div>
            </div>
        `;
    }

    // Generate lost ID report form
    static generateLostIdReportForm() {
        return `
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">ID Number</label>
                    <input type="text" id="lostIdNumber" required 
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                           placeholder="Enter your lost ID number">
                </div>
            </div>
        `;
    }

    // Generate found ID report form
    static generateFoundIdReportForm() {
        return `
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                    <input type="text" id="founderName" required 
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                           placeholder="Enter your full name">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Contact Information</label>
                    <input type="text" id="contactInfo" required 
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                           placeholder="Enter your phone number or email">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Found ID Number (if known)</label>
                    <input type="text" id="foundIdNumber" 
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                           placeholder="Enter the ID number found (optional)">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Location Found</label>
                    <input type="text" id="foundAt" 
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                           placeholder="Where did you find the ID?">
                </div>
            </div>
        `;
    }

    // Generate data table with actions
    static generateDataTable(data, columns, actions = []) {
        let tableHTML = `
            <div class="overflow-x-auto">
                <table class="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead class="bg-gray-50">
                        <tr>
        `;

        // Add headers
        columns.forEach(col => {
            tableHTML += `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${col.label}</th>`;
        });

        if (actions.length > 0) {
            tableHTML += `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>`;
        }

        tableHTML += `
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
        `;

        // Add rows
        data.forEach(row => {
            tableHTML += '<tr class="hover:bg-gray-50">';
            
            columns.forEach(col => {
                let value = row[col.key];
                
                // Format special columns
                if (col.key === 'status') {
                    value = this.getStatusBadge(value);
                } else if (col.key.includes('_at') || col.key.includes('date')) {
                    value = this.formatDate(value);
                } else if (!value) {
                    value = 'N/A';
                }
                
                tableHTML += `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${value}</td>`;
            });

            // Add actions
            if (actions.length > 0) {
                tableHTML += '<td class="px-6 py-4 whitespace-nowrap text-sm font-medium">';
                actions.forEach(action => {
                    const btnClass = action.class || 'bg-blue-600 hover:bg-blue-700 text-white';
                    const icon = action.icon || 'fa-eye';
                    tableHTML += `
                        <button onclick="${action.onclick}(('${row.id}'))" 
                                class="${btnClass} px-3 py-1 rounded-lg text-xs mr-2 transition-colors"
                                title="${action.title}">
                            <i class="fas ${icon}"></i> ${action.label}
                        </button>
                    `;
                });
                tableHTML += '</td>';
            }

            tableHTML += '</tr>';
        });

        tableHTML += `
                    </tbody>
                </table>
            </div>
        `;

        return tableHTML;
    }

    // Loading spinner
    static showLoading() {
        return `
            <div class="d-flex justify-center p-4">
                <div class="spinner"></div>
            </div>
        `;
    }

    // Empty state
    static showEmptyState(message) {
        return `
            <div class="text-center p-6">
                <i class="fas fa-inbox text-4xl text-muted mb-3"></i>
                <p class="text-muted">${message}</p>
            </div>
        `;
    }
}

// Export for global use
window.Utils = Utils;
