// ========================================
// PAYMENTS MODULE
// ========================================

// Payment methods
const PAYMENT_METHODS = [
    { id: 'gcash', name: 'GCash', icon: '💳', available: true },
    { id: 'paymaya', name: 'PayMaya', icon: '💰', available: true },
    { id: 'card', name: 'Credit/Debit Card', icon: '💳', available: true },
    { id: 'cash', name: 'Cash on Pickup', icon: '💵', available: true }
];

// Fee structure
const DOCUMENT_FEES = {
    'Barangay Clearance': 50,
    'Certificate of Residency': 30,
    'Certificate of Indigency': 0, // Free
    'Cedula': 50,
    'Barangay ID': 100,
    'Complaint Certificate': 50,
    'Other': 50
};

// ========================================
// SHOW PAYMENT MODAL
// ========================================

function showPaymentModal(requestId) {
    const requests = JSON.parse(localStorage.getItem('requests') || '[]');
    const request = requests.find(r => r.id === requestId);

    if (!request) {
        showToast('Request not found', 'error');
        return;
    }

    const fee = DOCUMENT_FEES[request.documentType] || 50;
    const total = fee * request.quantity;

    if (total === 0) {
        showToast('This document is free of charge', 'info');
        return;
    }

    // Check if already paid
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    const existingPayment = payments.find(p => p.requestId === requestId && p.status === 'completed');

    if (existingPayment) {
        showToast('Payment already completed', 'info');
        return;
    }

    const modal = createModal('Payment', `
        <div style="background: var(--bg-secondary); padding: var(--spacing-lg); border-radius: var(--radius-lg); margin-bottom: var(--spacing-lg);">
            <h4 style="margin: 0 0 var(--spacing-md) 0;">Payment Summary</h4>
            <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-sm);">
                <span>Document:</span>
                <strong>${request.documentType}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-sm);">
                <span>Quantity:</span>
                <strong>${request.quantity}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-sm);">
                <span>Fee per document:</span>
                <strong>₱${fee.toFixed(2)}</strong>
            </div>
            <div style="height: 1px; background: var(--border-color); margin: var(--spacing-md) 0;"></div>
            <div style="display: flex; justify-content: space-between; font-size: var(--font-size-lg);">
                <strong>Total Amount:</strong>
                <strong style="color: var(--primary-color);">₱${total.toFixed(2)}</strong>
            </div>
        </div>
        
        <form id="paymentForm" onsubmit="handlePayment(event, '${requestId}', ${total})">
            <div class="form-group">
                <label>Select Payment Method *</label>
                <div style="display: grid; gap: var(--spacing-sm);">
                    ${PAYMENT_METHODS.map(method => `
                        <label style="display: flex; align-items: center; padding: var(--spacing-md); border: 2px solid var(--border-color); border-radius: var(--radius-md); cursor: pointer; transition: all var(--transition-fast);" 
                               onmouseover="this.style.borderColor='var(--primary-color)'" 
                               onmouseout="if(!this.querySelector('input').checked) this.style.borderColor='var(--border-color)'">
                            <input type="radio" name="paymentMethod" value="${method.id}" required 
                                   onchange="this.parentElement.parentElement.querySelectorAll('label').forEach(l => l.style.borderColor='var(--border-color)'); this.parentElement.style.borderColor='var(--primary-color)';"
                                   style="margin-right: var(--spacing-md);">
                            <span style="font-size: var(--font-size-xl); margin-right: var(--spacing-sm);">${method.icon}</span>
                            <span style="flex: 1;">${method.name}</span>
                            ${!method.available ? '<span class="badge badge-warning">Coming Soon</span>' : ''}
                        </label>
                    `).join('')}
                </div>
            </div>
            
            <div id="cardDetails" style="display: none;">
                <div class="form-group">
                    <label for="cardNumber">Card Number</label>
                    <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19">
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                    <div class="form-group">
                        <label for="cardExpiry">Expiry Date</label>
                        <input type="text" id="cardExpiry" placeholder="MM/YY" maxlength="5">
                    </div>
                    <div class="form-group">
                        <label for="cardCVV">CVV</label>
                        <input type="text" id="cardCVV" placeholder="123" maxlength="3">
                    </div>
                </div>
            </div>
            
            <div id="ewalletDetails" style="display: none;">
                <div class="form-group">
                    <label for="mobileNumber">Mobile Number</label>
                    <input type="tel" id="mobileNumber" placeholder="09XX XXX XXXX" maxlength="11">
                </div>
            </div>
            
            <div style="background: rgba(37, 99, 235, 0.1); padding: var(--spacing-md); border-radius: var(--radius-md); margin: var(--spacing-lg) 0;">
                <p style="font-size: var(--font-size-sm); color: var(--text-secondary); margin: 0;">
                    <strong>🔒 Secure Payment:</strong> Your payment information is encrypted and secure. You will receive a digital receipt after successful payment.
                </p>
            </div>
            
            <div class="modal-footer" style="border: none; padding: var(--spacing-lg) 0 0 0;">
                <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Pay ₱${total.toFixed(2)}</button>
            </div>
        </form>
    `, []);

    showModal(modal);

    // Add event listeners for payment method selection
    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            document.getElementById('cardDetails').style.display = 'none';
            document.getElementById('ewalletDetails').style.display = 'none';

            if (e.target.value === 'card') {
                document.getElementById('cardDetails').style.display = 'block';
            } else if (e.target.value === 'gcash' || e.target.value === 'paymaya') {
                document.getElementById('ewalletDetails').style.display = 'block';
            }
        });
    });
}

// ========================================
// HANDLE PAYMENT
// ========================================

function handlePayment(event, requestId, amount) {
    event.preventDefault();

    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;

    if (!paymentMethod) {
        showToast('Please select a payment method', 'error');
        return;
    }

    // Simulate payment processing
    showToast('Processing payment...', 'info');

    setTimeout(() => {
        const payment = {
            id: `pay-${Date.now()}`,
            referenceNumber: generatePaymentReference(),
            userId: AppState.currentUser.id,
            requestId,
            amount,
            method: paymentMethod,
            status: 'completed', // In production: pending, processing, completed, failed
            createdAt: new Date().toISOString()
        };

        // Save payment
        const payments = JSON.parse(localStorage.getItem('payments') || '[]');
        payments.push(payment);
        localStorage.setItem('payments', JSON.stringify(payments));

        // Update request to mark as paid
        const requests = JSON.parse(localStorage.getItem('requests') || '[]');
        const requestIndex = requests.findIndex(r => r.id === requestId);
        if (requestIndex !== -1) {
            requests[requestIndex].paid = true;
            requests[requestIndex].paymentId = payment.id;
            localStorage.setItem('requests', JSON.stringify(requests));
        }

        // Create notification
        createNotification({
            userId: AppState.currentUser.id,
            title: 'Payment Successful',
            message: `Payment of ₱${amount.toFixed(2)} completed. Reference: ${payment.referenceNumber}`,
            type: 'success',
            paymentId: payment.id
        });

        showToast('Payment successful!', 'success');
        closeModal();

        // Show receipt
        setTimeout(() => {
            showReceiptModal(payment.id);
        }, 500);

        updateNotificationBadge();
    }, 2000);
}

function generatePaymentReference() {
    const year = new Date().getFullYear();
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    const count = payments.length + 1;
    return `PAY-${year}-${String(count).padStart(6, '0')}`;
}

// ========================================
// SHOW RECEIPT MODAL
// ========================================

function showReceiptModal(paymentId) {
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    const payment = payments.find(p => p.id === paymentId);

    if (!payment) {
        showToast('Receipt not found', 'error');
        return;
    }

    const requests = JSON.parse(localStorage.getItem('requests') || '[]');
    const request = requests.find(r => r.id === payment.requestId);

    const modal = createModal('Payment Receipt', `
        <div style="text-align: center; margin-bottom: var(--spacing-lg);">
            <div style="width: 80px; height: 80px; margin: 0 auto var(--spacing-md); background: linear-gradient(135deg, var(--success-color), #34d399); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center;">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>
            <h3 style="color: var(--success-color); margin-bottom: var(--spacing-xs);">Payment Successful!</h3>
            <p style="color: var(--text-secondary); font-size: var(--font-size-sm);">Your payment has been processed</p>
        </div>
        
        <div style="background: var(--bg-secondary); padding: var(--spacing-lg); border-radius: var(--radius-lg); margin-bottom: var(--spacing-lg);">
            <div style="text-align: center; margin-bottom: var(--spacing-lg);">
                <div style="font-size: var(--font-size-3xl); font-weight: 700; color: var(--primary-color);">
                    ₱${payment.amount.toFixed(2)}
                </div>
                <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">
                    Reference: ${payment.referenceNumber}
                </div>
            </div>
            
            <div style="border-top: 1px dashed var(--border-color); padding-top: var(--spacing-md);">
                <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-sm);">
                    <span style="color: var(--text-secondary);">Date & Time:</span>
                    <strong>${new Date(payment.createdAt).toLocaleString()}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-sm);">
                    <span style="color: var(--text-secondary);">Payment Method:</span>
                    <strong style="text-transform: capitalize;">${payment.method}</strong>
                </div>
                ${request ? `
                    <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-sm);">
                        <span style="color: var(--text-secondary);">Document:</span>
                        <strong>${request.documentType}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-sm);">
                        <span style="color: var(--text-secondary);">Tracking #:</span>
                        <strong>${request.trackingNumber}</strong>
                    </div>
                ` : ''}
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-secondary);">Status:</span>
                    <span class="badge badge-${payment.status}">${payment.status}</span>
                </div>
            </div>
        </div>
        
        <div style="text-align: center; margin-bottom: var(--spacing-lg);">
            <p style="font-size: var(--font-size-sm); color: var(--text-secondary);">
                A copy of this receipt has been saved to your account.
            </p>
        </div>
    `, [
        { text: 'Download Receipt', class: 'btn-outline', action: 'downloadReceipt(\'' + paymentId + '\')' },
        { text: 'Close', class: 'btn-primary', action: 'close' }
    ]);

    showModal(modal);
}

function downloadReceipt(paymentId) {
    // In production, generate and download PDF
    showToast('Receipt download feature coming soon', 'info');
}

// ========================================
// PAYMENT HISTORY
// ========================================

function loadPaymentHistory(container) {
    const payments = JSON.parse(localStorage.getItem('payments') || '[]')
        .filter(p => p.userId === AppState.currentUser.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    container.innerHTML = `
        <div class="page-header">
            <h2>Payment History</h2>
            <p>View all your payment transactions</p>
        </div>
        
        <div class="card">
            <div class="card-body">
                ${payments.length === 0 ?
            '<p style="text-align: center; color: var(--text-secondary); padding: var(--spacing-xl);">No payment history</p>' :
            `<div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Reference</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${payments.map(payment => `
                                    <tr>
                                        <td><strong>${payment.referenceNumber}</strong></td>
                                        <td><strong style="color: var(--primary-color);">₱${payment.amount.toFixed(2)}</strong></td>
                                        <td style="text-transform: capitalize;">${payment.method}</td>
                                        <td>${new Date(payment.createdAt).toLocaleDateString()}</td>
                                        <td><span class="badge badge-${payment.status}">${payment.status}</span></td>
                                        <td>
                                            <button class="btn btn-sm btn-outline" onclick="showReceiptModal('${payment.id}')">View Receipt</button>
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

// Make functions globally available
window.showPaymentModal = showPaymentModal;
window.handlePayment = handlePayment;
window.showReceiptModal = showReceiptModal;
window.downloadReceipt = downloadReceipt;
window.loadPaymentHistory = loadPaymentHistory;
