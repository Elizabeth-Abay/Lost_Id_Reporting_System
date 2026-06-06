// Public module for found ID reporting (no authentication required)
class PublicModule {
    static showFoundIdForm() {
        const formContent = Utils.generateDynamicForm(null, 'foundIdReport');
        
        Utils.showModal('Report Found ID', `
            <div class="mb-4">
                <p class="text-gray-600">
                    Thank you for finding a lost ID! Please provide your information so we can help return it to the owner.
                </p>
            </div>
            ${formContent}
            <div class="flex justify-end mt-6">
                <button onclick="Utils.closeModal()" 
                        class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors mr-3">
                    Cancel
                </button>
                <button onclick="PublicModule.submitFoundIdReport()" 
                        class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                    Submit Report
                </button>
            </div>
        `);
    }

    static async submitFoundIdReport() {
        const founderData = {
            founder_name: document.getElementById('founderName').value,
            contact_info: document.getElementById('contactInfo').value,
            found_id_number: document.getElementById('foundIdNumber').value,
            found_at: document.getElementById('foundAt').value
        };

        // Validate required fields
        if (!founderData.founder_name || !founderData.contact_info) {
            Utils.showNotification('Please fill in your name and contact information', 'error');
            return;
        }

        try {
            Utils.showNotification('Submitting found ID report...', 'info');
            
            const response = await api.reportFoundId(founderData);
            
            if (response.success) {
                Utils.showNotification('Found ID reported successfully! Thank you for your help.', 'success');
                Utils.closeModal();
                
                // Show success details
                Utils.showModal('Report Submitted Successfully', `
                    <div class="text-center space-y-4">
                        <div class="bg-green-100 p-4 rounded-lg">
                            <i class="fas fa-check-circle text-green-600 text-4xl mb-3"></i>
                            <h3 class="text-lg font-semibold text-green-800">Thank You!</h3>
                            <p class="text-green-700">
                                Your found ID report has been submitted successfully.
                                We'll notify the owner if there's a match.
                            </p>
                        </div>
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p class="text-blue-800 text-sm">
                                <i class="fas fa-info-circle mr-2"></i>
                                Report ID: ${response.data.id}
                            </p>
                        </div>
                        <button onclick="Utils.closeModal()" 
                                class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                            Close
                        </button>
                    </div>
                `);
            } else {
                Utils.showNotification(response.message || 'Failed to submit found ID report', 'error');
            }
        } catch (error) {
            Utils.showNotification(error.message || 'Failed to submit found ID report', 'error');
        }
    }
}

// Make it globally available
window.PublicModule = PublicModule;
