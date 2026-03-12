// ========================================
// APPOINTMENTS MODULE
// ========================================

// Available appointment types
const APPOINTMENT_TYPES = [
    'Document Consultation',
    'Cedula Application',
    'Complaint Filing',
    'General Inquiry',
    'Certificate Pickup',
    'Meeting with Official',
    'Other'
];

// Barangay officials available for appointments
const BARANGAY_OFFICIALS = [
    { id: 'official-1', name: 'Barangay Captain', position: 'Captain', available: true },
    { id: 'official-2', name: 'Barangay Secretary', position: 'Secretary', available: true },
    { id: 'official-3', name: 'Barangay Treasurer', position: 'Treasurer', available: true },
    { id: 'official-4', name: 'Kagawad - Health', position: 'Councilor', available: true },
    { id: 'official-5', name: 'Kagawad - Education', position: 'Councilor', available: true }
];

// Working hours
const WORKING_HOURS = {
    start: 8, // 8 AM
    end: 17,  // 5 PM
    slotDuration: 30 // 30 minutes per slot
};

// ========================================
// SHOW APPOINTMENT BOOKING MODAL
// ========================================

function showAppointmentModal() {
    const modal = createModal('Book Appointment', `
        <form id="appointmentForm" onsubmit="handleAppointmentBooking(event)">
            <div class="form-group">
                <label for="appointmentType">Appointment Type *</label>
                <select id="appointmentType" required>
                    <option value="">Select appointment type</option>
                    ${APPOINTMENT_TYPES.map(type => `<option value="${type}">${type}</option>`).join('')}
                </select>
            </div>
            
            <div class="form-group">
                <label for="appointmentOfficial">Official to Meet *</label>
                <select id="appointmentOfficial" required>
                    <option value="">Select official</option>
                    ${BARANGAY_OFFICIALS.map(official => `
                        <option value="${official.id}" ${!official.available ? 'disabled' : ''}>
                            ${official.name} - ${official.position} ${!official.available ? '(Unavailable)' : ''}
                        </option>
                    `).join('')}
                </select>
            </div>
            
            <div class="form-group">
                <label for="appointmentDate">Preferred Date *</label>
                <input type="date" id="appointmentDate" required min="${getMinDate()}" max="${getMaxDate()}">
            </div>
            
            <div class="form-group">
                <label for="appointmentTime">Preferred Time *</label>
                <select id="appointmentTime" required>
                    <option value="">Select time slot</option>
                    ${generateTimeSlots().map(slot => `<option value="${slot}">${slot}</option>`).join('')}
                </select>
            </div>
            
            <div class="form-group">
                <label for="appointmentPurpose">Purpose *</label>
                <textarea id="appointmentPurpose" placeholder="Briefly describe the purpose of your appointment" required></textarea>
            </div>
            
            <div class="form-group">
                <label for="appointmentNotes">Additional Notes</label>
                <textarea id="appointmentNotes" placeholder="Any additional information"></textarea>
            </div>
            
            <div style="background: var(--bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md); margin-top: var(--spacing-md);">
                <p style="font-size: var(--font-size-sm); color: var(--text-secondary); margin: 0;">
                    <strong>Note:</strong> You will receive a confirmation notification once your appointment is reviewed. Please arrive 5 minutes early.
                </p>
            </div>
            
            <div class="modal-footer" style="border: none; padding: var(--spacing-lg) 0 0 0;">
                <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Book Appointment</button>
            </div>
        </form>
    `, []);

    showModal(modal);
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function getMinDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
}

function getMaxDate() {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // 30 days from now
    return maxDate.toISOString().split('T')[0];
}

function generateTimeSlots() {
    const slots = [];
    for (let hour = WORKING_HOURS.start; hour < WORKING_HOURS.end; hour++) {
        for (let min = 0; min < 60; min += WORKING_HOURS.slotDuration) {
            const time = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
            const period = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour > 12 ? hour - 12 : hour;
            slots.push(`${time} (${displayHour}:${String(min).padStart(2, '0')} ${period})`);
        }
    }
    return slots;
}

// ========================================
// HANDLE APPOINTMENT BOOKING
// ========================================

function handleAppointmentBooking(event) {
    event.preventDefault();

    const type = document.getElementById('appointmentType').value;
    const officialId = document.getElementById('appointmentOfficial').value;
    const date = document.getElementById('appointmentDate').value;
    const time = document.getElementById('appointmentTime').value;
    const purpose = document.getElementById('appointmentPurpose').value.trim();
    const notes = document.getElementById('appointmentNotes').value.trim();

    if (!type || !officialId || !date || !time || !purpose) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    const official = BARANGAY_OFFICIALS.find(o => o.id === officialId);

    const appointment = {
        id: `appt-${Date.now()}`,
        referenceNumber: generateAppointmentReference(),
        userId: AppState.currentUser.id,
        userName: AppState.currentUser.fullName,
        type,
        officialId,
        officialName: official.name,
        date,
        time,
        purpose,
        notes,
        status: 'pending', // pending, confirmed, cancelled, completed
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    // Save appointment
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    appointments.push(appointment);
    localStorage.setItem('appointments', JSON.stringify(appointments));

    // Create notifications
    createNotification({
        userId: AppState.currentUser.id,
        title: 'Appointment Booked',
        message: `Your appointment with ${official.name} on ${formatDateFull(date)} at ${time} has been submitted for confirmation.`,
        type: 'success',
        appointmentId: appointment.id
    });

    createNotification({
        userId: 'user-admin',
        title: 'New Appointment Request',
        message: `${AppState.currentUser.fullName} requested an appointment with ${official.name}`,
        type: 'info',
        appointmentId: appointment.id
    });

    showToast(`Appointment booked! Reference: ${appointment.referenceNumber}`, 'success');
    closeModal();
    updateNotificationBadge();
}

function generateAppointmentReference() {
    const year = new Date().getFullYear();
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const count = appointments.length + 1;
    return `APPT-${year}-${String(count).padStart(4, '0')}`;
}

function formatDateFull(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// ========================================
// VIEW APPOINTMENTS
// ========================================

function loadAppointmentsPage(container) {
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]')
        .filter(a => a.userId === AppState.currentUser.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    container.innerHTML = `
        <div class="page-header">
            <h2>My Appointments</h2>
            <button class="btn btn-primary" onclick="showAppointmentModal()">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Book Appointment
            </button>
        </div>
        
        <div class="card">
            <div class="card-body">
                ${appointments.length === 0 ?
            '<p style="text-align: center; color: var(--text-secondary); padding: var(--spacing-xl);">No appointments yet. Book your first appointment!</p>' :
            `<div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Reference</th>
                                    <th>Type</th>
                                    <th>Official</th>
                                    <th>Date & Time</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${appointments.map(appt => `
                                    <tr>
                                        <td><strong>${appt.referenceNumber}</strong></td>
                                        <td>${appt.type}</td>
                                        <td>${appt.officialName}</td>
                                        <td>${new Date(appt.date).toLocaleDateString()}<br><small>${appt.time}</small></td>
                                        <td><span class="badge badge-${appt.status}">${appt.status}</span></td>
                                        <td>
                                            <button class="btn btn-sm btn-outline" onclick="viewAppointmentDetails('${appt.id}')">View</button>
                                            ${appt.status === 'pending' || appt.status === 'confirmed' ? `
                                                <button class="btn btn-sm btn-danger" onclick="cancelAppointment('${appt.id}')">Cancel</button>
                                            ` : ''}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>`
        }
            </div>
        </div>
    `;
}

function viewAppointmentDetails(appointmentId) {
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const appointment = appointments.find(a => a.id === appointmentId);

    if (!appointment) {
        showToast('Appointment not found', 'error');
        return;
    }

    const modal = createModal('Appointment Details', `
        <div style="margin-bottom: var(--spacing-lg);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-md);">
                <div>
                    <h4 style="margin: 0;">${appointment.type}</h4>
                    <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">
                        Ref: ${appointment.referenceNumber}
                    </p>
                </div>
                <span class="badge badge-${appointment.status}">${appointment.status}</span>
            </div>
        </div>
        
        <div style="background: var(--bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md);">
            <div style="margin-bottom: var(--spacing-sm);">
                <strong style="font-size: var(--font-size-sm); color: var(--text-secondary);">Official:</strong>
                <p style="margin: var(--spacing-xs) 0 0 0;">${appointment.officialName}</p>
            </div>
            
            <div style="margin-bottom: var(--spacing-sm);">
                <strong style="font-size: var(--font-size-sm); color: var(--text-secondary);">Date:</strong>
                <p style="margin: var(--spacing-xs) 0 0 0;">${formatDateFull(appointment.date)}</p>
            </div>
            
            <div style="margin-bottom: var(--spacing-sm);">
                <strong style="font-size: var(--font-size-sm); color: var(--text-secondary);">Time:</strong>
                <p style="margin: var(--spacing-xs) 0 0 0;">${appointment.time}</p>
            </div>
            
            <div style="margin-bottom: var(--spacing-sm);">
                <strong style="font-size: var(--font-size-sm); color: var(--text-secondary);">Purpose:</strong>
                <p style="margin: var(--spacing-xs) 0 0 0;">${appointment.purpose}</p>
            </div>
            
            ${appointment.notes ? `
                <div>
                    <strong style="font-size: var(--font-size-sm); color: var(--text-secondary);">Notes:</strong>
                    <p style="margin: var(--spacing-xs) 0 0 0;">${appointment.notes}</p>
                </div>
            ` : ''}
        </div>
    `, [
        { text: 'Close', class: 'btn-outline', action: 'close' }
    ]);

    showModal(modal);
}

function cancelAppointment(appointmentId) {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
        return;
    }

    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const index = appointments.findIndex(a => a.id === appointmentId);

    if (index === -1) {
        showToast('Appointment not found', 'error');
        return;
    }

    appointments[index].status = 'cancelled';
    appointments[index].updatedAt = new Date().toISOString();
    localStorage.setItem('appointments', JSON.stringify(appointments));

    createNotification({
        userId: AppState.currentUser.id,
        title: 'Appointment Cancelled',
        message: 'Your appointment has been cancelled successfully.',
        type: 'info',
        appointmentId
    });

    showToast('Appointment cancelled', 'success');
    navigateToPage(AppState.currentPage);
    updateNotificationBadge();
}

// Make functions globally available
window.showAppointmentModal = showAppointmentModal;
window.handleAppointmentBooking = handleAppointmentBooking;
window.loadAppointmentsPage = loadAppointmentsPage;
window.viewAppointmentDetails = viewAppointmentDetails;
window.cancelAppointment = cancelAppointment;
