// ========================================
// PAYMENTS MODULE - GCash Receipt Upload
// ========================================

// Default fee fallbacks (overridden by Firestore SETTINGS/barangay)
const DEFAULT_DOCUMENT_FEES = {
    'Barangay Clearance': 50,
    'Certificate of Residency': 30,
    'Certificate of Indigency': 0,
    'Cedula': 50,
    'Other': 50
};

// Holds the selected receipt file globally
let selectedReceiptFile = null;

// ========================================
// STEP 1: SHOW GCASH PAYMENT MODAL
// Called right after request is submitted
// ========================================

async function showGCashPaymentModal(requestId, documentType) {
    selectedReceiptFile = null;

    // Load settings from Firestore
    let fees = DEFAULT_DOCUMENT_FEES;
    let gcashNumber = '(not set — contact barangay office)';
    let gcashName = 'Barangay Pantukan';

    try {
        const settingsResult = await DB.getSettings();
        if (settingsResult.success && settingsResult.data) {
            fees = settingsResult.data.documentFees || DEFAULT_DOCUMENT_FEES;
            gcashNumber = settingsResult.data.gcashNumber || gcashNumber;
            gcashName = settingsResult.data.gcashName || gcashName;
        }
    } catch (e) {
        console.warn('Could not load settings, using defaults', e);
    }

    const fee = fees[documentType] ?? DEFAULT_DOCUMENT_FEES[documentType] ?? 50;
    const isFree = fee === 0;

    const modal = createModal('Payment Required', `
        <div style="display: flex; flex-direction: column; gap: 16px;">

            <!-- Fee Summary Banner -->
            <div style="
                background: linear-gradient(135deg, #1d4ed8, #3b82f6);
                border-radius: 16px;
                padding: 20px;
                color: white;
                text-align: center;
            ">
                <p style="margin: 0 0 4px 0; font-size: 0.8rem; opacity: 0.85; letter-spacing: 1px; text-transform: uppercase;">Amount Due</p>
                <div style="font-size: 2.5rem; font-weight: 800; letter-spacing: -1px;">
                    ${isFree ? 'FREE' : `₱${fee.toFixed(2)}`}
                </div>
                <p style="margin: 6px 0 0 0; font-size: 0.85rem; opacity: 0.9;">${documentType}</p>
            </div>

            ${isFree ? `
                <!-- FREE document — no payment needed -->
                <div style="
                    background: rgba(16, 185, 129, 0.08);
                    border: 1px solid rgba(16, 185, 129, 0.3);
                    border-radius: 12px;
                    padding: 16px;
                    text-align: center;
                ">
                    <div style="font-size: 2rem; margin-bottom: 8px;">🎉</div>
                    <p style="margin: 0; color: var(--success-color); font-weight: 600;">This document is free of charge!</p>
                    <p style="margin: 6px 0 0 0; font-size: 0.85rem; color: var(--text-secondary);">No payment is required. Click "Confirm" to proceed.</p>
                </div>
            ` : `
                <!-- GCash Payment Instructions -->
                <div style="
                    background: var(--bg-secondary);
                    border-radius: 12px;
                    padding: 16px;
                ">
                    <h4 style="margin: 0 0 12px 0; font-size: 0.9rem; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1.2rem;">📱</span> Send Payment via GCash
                    </h4>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: white; border-radius: 8px; border: 1px solid var(--border-color);">
                            <span style="font-size: 0.8rem; color: var(--text-secondary);">GCash Number</span>
                            <strong style="color: #007aff; font-size: 1rem; letter-spacing: 0.5px;">${BARANGAY_GCASH.number}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: white; border-radius: 8px; border: 1px solid var(--border-color);">
                            <span style="font-size: 0.8rem; color: var(--text-secondary);">Account Name</span>
                            <strong style="color: var(--text-primary);">${BARANGAY_GCASH.name}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: white; border-radius: 8px; border: 1px solid var(--border-color);">
                            <span style="font-size: 0.8rem; color: var(--text-secondary);">Amount to Send</span>
                            <strong style="color: #10b981; font-size: 1.1rem;">₱${fee.toFixed(2)}</strong>
                        </div>
                    </div>
                    <p style="margin: 10px 0 0 0; font-size: 0.75rem; color: var(--text-secondary); text-align: center;">
                        ⚠️ Make sure to send the exact amount above
                    </p>
                </div>

                <!-- Receipt Upload -->
                <div class="form-group" style="margin: 0;">
                    <label style="font-weight: 600; margin-bottom: 8px; display: block; font-size: 0.9rem;">
                        Upload GCash Receipt Screenshot <span style="color: var(--danger-color);">*</span>
                    </label>
                    <div id="receiptUploadArea" onclick="document.getElementById('gcashReceiptInput').click()" style="
                        border: 2px dashed var(--primary-color);
                        border-radius: 14px;
                        padding: 24px 16px;
                        text-align: center;
                        cursor: pointer;
                        background: rgba(37, 99, 235, 0.03);
                        transition: all 0.2s ease;
                        min-height: 130px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                    "
                    onmouseover="this.style.background='rgba(37,99,235,0.07)'"
                    onmouseout="if(!selectedReceiptFile) this.style.background='rgba(37,99,235,0.03)'"
                    >
                        <input
                            type="file"
                            id="gcashReceiptInput"
                            accept="image/*"
                            style="display: none;"
                            onchange="handleReceiptFileSelect(event)"
                        >
                        <div id="receiptUploadIcon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="3"/>
                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                <polyline points="21 15 16 10 5 21"/>
                            </svg>
                        </div>
                        <div id="receiptUploadText">
                            <p style="margin: 0; font-weight: 600; color: var(--primary-color); font-size: 0.9rem;">Tap to upload GCash screenshot</p>
                            <p style="margin: 4px 0 0 0; font-size: 0.75rem; color: var(--text-secondary);">JPG, PNG, or WEBP • Max 10MB</p>
                        </div>
                    </div>

                    <!-- Preview will appear here -->
                    <div id="receiptPreviewContainer" style="display: none; margin-top: 10px; position: relative;">
                        <img id="receiptPreviewImg" style="
                            width: 100%;
                            max-height: 200px;
                            object-fit: contain;
                            border-radius: 10px;
                            border: 1px solid var(--border-color);
                            background: var(--bg-secondary);
                        ">
                        <button onclick="clearReceiptFile()" style="
                            position: absolute;
                            top: 6px;
                            right: 6px;
                            background: rgba(239,68,68,0.9);
                            color: white;
                            border: none;
                            border-radius: 50%;
                            width: 28px;
                            height: 28px;
                            cursor: pointer;
                            font-size: 14px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        ">✕</button>
                    </div>
                </div>
            `}

            <!-- Info note -->
            <div style="
                background: rgba(245, 158, 11, 0.08);
                border: 1px solid rgba(245, 158, 11, 0.25);
                border-radius: 10px;
                padding: 12px 14px;
                display: flex;
                gap: 10px;
                align-items: flex-start;
            ">
                <span style="font-size: 1.1rem; flex-shrink: 0;">ℹ️</span>
                <p style="margin: 0; font-size: 0.78rem; color: var(--text-secondary); line-height: 1.5;">
                    Your payment will be <strong>verified by the admin</strong> before your request is processed.
                    You will receive a notification once confirmed.
                </p>
            </div>

            <!-- Action Buttons -->
            <div style="display: flex; gap: 10px; padding-top: 4px;">
                <button
                    type="button"
                    class="btn btn-outline"
                    onclick="closeModal()"
                    style="flex: 1;"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    id="confirmPaymentBtn"
                    onclick="handleConfirmPayment('${requestId}', '${documentType}', ${isFree})"
                    style="
                        flex: 2;
                        background: linear-gradient(135deg, #007aff, #0055d4);
                        color: white;
                        border: none;
                        border-radius: 10px;
                        padding: 14px;
                        font-weight: 700;
                        font-size: 0.95rem;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                        transition: opacity 0.2s;
                    "
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Confirm Payment
                </button>
            </div>
        </div>
    `, []);

    showModal(modal);
}

// ========================================
// RECEIPT FILE HANDLERS
// ========================================

function handleReceiptFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
        showToast('File size must be less than 10MB', 'error');
        return;
    }

    selectedReceiptFile = file;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        const previewContainer = document.getElementById('receiptPreviewContainer');
        const previewImg = document.getElementById('receiptPreviewImg');
        const uploadArea = document.getElementById('receiptUploadArea');
        const uploadIcon = document.getElementById('receiptUploadIcon');
        const uploadText = document.getElementById('receiptUploadText');

        if (previewImg) previewImg.src = e.target.result;
        if (previewContainer) previewContainer.style.display = 'block';

        // Update upload area to show success state
        if (uploadArea) uploadArea.style.background = 'rgba(16, 185, 129, 0.06)';
        if (uploadArea) uploadArea.style.borderColor = 'var(--success-color)';
        if (uploadIcon) uploadIcon.innerHTML = `<div style="font-size: 2rem;">✅</div>`;
        if (uploadText) uploadText.innerHTML = `
            <p style="margin: 0; font-weight: 600; color: var(--success-color); font-size: 0.9rem;">${file.name}</p>
            <p style="margin: 4px 0 0 0; font-size: 0.75rem; color: var(--text-secondary);">Tap to change</p>
        `;
    };
    reader.readAsDataURL(file);
}

function clearReceiptFile() {
    selectedReceiptFile = null;

    const previewContainer = document.getElementById('receiptPreviewContainer');
    const uploadArea = document.getElementById('receiptUploadArea');
    const uploadIcon = document.getElementById('receiptUploadIcon');
    const uploadText = document.getElementById('receiptUploadText');
    const input = document.getElementById('gcashReceiptInput');

    if (previewContainer) previewContainer.style.display = 'none';
    if (uploadArea) {
        uploadArea.style.background = 'rgba(37, 99, 235, 0.03)';
        uploadArea.style.borderColor = 'var(--primary-color)';
    }
    if (uploadIcon) uploadIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="3"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
        </svg>
    `;
    if (uploadText) uploadText.innerHTML = `
        <p style="margin: 0; font-weight: 600; color: var(--primary-color); font-size: 0.9rem;">Tap to upload GCash screenshot</p>
        <p style="margin: 4px 0 0 0; font-size: 0.75rem; color: var(--text-secondary);">JPG, PNG, or WEBP • Max 10MB</p>
    `;
    if (input) input.value = '';
}

// ========================================
// STEP 2: HANDLE CONFIRM PAYMENT
// ========================================

async function handleConfirmPayment(requestId, documentType, isFree) {
    // Validate: receipt required unless free
    if (!isFree && !selectedReceiptFile) {
        showToast('Please upload your GCash receipt screenshot', 'error');
        return;
    }

    // Disable confirm button
    const btn = document.getElementById('confirmPaymentBtn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `
            <div style="width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.4); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
            Uploading...
        `;
    }

    try {
        let receiptImageUrl = null;
        const fee = DOCUMENT_FEES[documentType] || 0;

        // Upload receipt to Cloudinary (if not free)
        if (!isFree && selectedReceiptFile) {
            showToast('Uploading receipt...', 'info');
            receiptImageUrl = await uploadToCloudinary(selectedReceiptFile);
        }

        // Generate payment reference
        const referenceNumber = `PAY-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

        // Save payment to Firestore PAYMENTS collection
        const paymentData = {
            requestId: requestId,
            userId: AppState.currentUser.id,
            userName: AppState.currentUser.fullName,
            documentType: documentType,
            amount: fee,
            method: isFree ? 'free' : 'gcash',
            referenceNumber: referenceNumber,
            receiptImageUrl: receiptImageUrl,
            status: isFree ? 'confirmed' : 'pending_verification',
            createdAt: new Date().toISOString()
        };

        await DB.createPayment(paymentData);

        // Update the request in Firestore with payment info
        await DB.updateData('REQUESTS', requestId, {
            paymentStatus: isFree ? 'confirmed' : 'pending_verification',
            paymentReceiptUrl: receiptImageUrl,
            paymentReference: referenceNumber,
            paymentAmount: fee
        });

        // Notify admin about payment
        if (!isFree) {
            await DB.createNotification({
                userId: 'role:admin',
                title: '💳 Payment Receipt Submitted',
                message: `${AppState.currentUser.fullName} submitted a GCash receipt for ${documentType}. Please verify.`,
                type: 'info',
                requestId: requestId,
                link: 'admin-requests'
            });
        }

        // Show loading screen before summary
        showPaymentLoadingScreen(requestId);

    } catch (error) {
        console.error('Payment confirm error:', error);
        showToast('Failed to submit payment. Please try again.', 'error');

        // Re-enable button
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Confirm Payment
            `;
        }
    }
}

// ========================================
// STEP 2.5: LOADING SCREEN ANIMATION
// ========================================

function showPaymentLoadingScreen(requestId) {
    // Close payment modal first
    closeModal();

    // Create full loading overlay
    const overlay = document.createElement('div');
    overlay.id = 'paymentLoadingOverlay';
    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(255,255,255,0.97);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 20px;
        animation: fadeIn 0.3s ease;
    `;

    overlay.innerHTML = `
        <style>
            @keyframes paySpinRing {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            @keyframes payPulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.08); opacity: 0.8; }
            }
        </style>

        <!-- Animated GCash-style spinner -->
        <div style="position: relative; width: 90px; height: 90px;">
            <div style="
                position: absolute; inset: 0;
                border: 4px solid rgba(37,99,235,0.15);
                border-top: 4px solid #2563eb;
                border-radius: 50%;
                animation: paySpinRing 0.9s linear infinite;
            "></div>
            <div style="
                position: absolute; inset: 10px;
                border: 3px solid rgba(37,99,235,0.1);
                border-top: 3px solid #60a5fa;
                border-radius: 50%;
                animation: paySpinRing 1.4s linear infinite reverse;
            "></div>
            <div style="
                position: absolute; inset: 0;
                display: flex; align-items: center; justify-content: center;
                font-size: 1.8rem;
                animation: payPulse 1.5s ease infinite;
            ">💳</div>
        </div>

        <div style="text-align: center;">
            <h3 style="margin: 0 0 6px 0; color: var(--text-primary); font-size: 1.1rem;">Processing Payment...</h3>
            <p id="payLoadingSubtext" style="margin: 0; color: var(--text-secondary); font-size: 0.85rem;">Saving your receipt</p>
        </div>

        <!-- Animated steps -->
        <div style="display: flex; flex-direction: column; gap: 10px; width: 260px;">
            <div class="pay-step" id="payStep1" style="display:flex; align-items:center; gap:10px; opacity:0.3; transition: opacity 0.4s;">
                <div style="width:24px; height:24px; border-radius:50%; background:#dbeafe; display:flex; align-items:center; justify-content:center; font-size:0.75rem; flex-shrink:0;">1</div>
                <span style="font-size:0.85rem; color:var(--text-secondary);">Receipt uploaded</span>
            </div>
            <div class="pay-step" id="payStep2" style="display:flex; align-items:center; gap:10px; opacity:0.3; transition: opacity 0.4s;">
                <div style="width:24px; height:24px; border-radius:50%; background:#dbeafe; display:flex; align-items:center; justify-content:center; font-size:0.75rem; flex-shrink:0;">2</div>
                <span style="font-size:0.85rem; color:var(--text-secondary);">Payment record saved</span>
            </div>
            <div class="pay-step" id="payStep3" style="display:flex; align-items:center; gap:10px; opacity:0.3; transition: opacity 0.4s;">
                <div style="width:24px; height:24px; border-radius:50%; background:#dbeafe; display:flex; align-items:center; justify-content:center; font-size:0.75rem; flex-shrink:0;">3</div>
                <span style="font-size:0.85rem; color:var(--text-secondary);">Notifying admin</span>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Animate checklist steps
    const steps = [
        { el: 'payStep1', delay: 400, text: 'Receipt uploaded ✅' },
        { el: 'payStep2', delay: 900, text: 'Payment record saved ✅' },
        { el: 'payStep3', delay: 1400, text: 'Admin notified ✅' },
    ];

    steps.forEach(({ el, delay, text }) => {
        setTimeout(() => {
            const stepEl = document.getElementById(el);
            if (stepEl) {
                stepEl.style.opacity = '1';
                stepEl.querySelector('div').style.background = '#dcfce7';
                stepEl.querySelector('div').style.color = '#16a34a';
                stepEl.querySelector('span').textContent = text;
                stepEl.querySelector('span').style.color = 'var(--text-primary)';
                stepEl.querySelector('span').style.fontWeight = '600';
            }
        }, delay);
    });

    // Show summary after loading
    setTimeout(() => {
        const loadingOverlay = document.getElementById('paymentLoadingOverlay');
        if (loadingOverlay) loadingOverlay.remove();
        showSubmissionSummaryModal(requestId);
    }, 2200);
}

// ========================================
// STEP 3: SUBMISSION SUMMARY MODAL
// ========================================

async function showSubmissionSummaryModal(requestId) {
    try {
        const result = await DB.getData('REQUESTS', requestId);
        if (!result.success || !result.data) {
            showToast('Could not load request details', 'error');
            navigateToPage('requests');
            return;
        }

        const request = result.data;
        const fee = DOCUMENT_FEES[request.documentType] || 0;
        const isFree = fee === 0;

        const modal = createModal('Submission Review', `
            <div style="display: flex; flex-direction: column; gap: 16px;">

                <!-- Success Header -->
                <div style="text-align: center; padding: 10px 0 6px;">
                    <div style="
                        width: 64px; height: 64px;
                        background: linear-gradient(135deg, #10b981, #34d399);
                        border-radius: 50%;
                        margin: 0 auto 12px;
                        display: flex; align-items: center; justify-content: center;
                        box-shadow: 0 4px 20px rgba(16,185,129,0.3);
                    ">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </div>
                    <h3 style="margin: 0; color: var(--text-primary);">Request Submitted!</h3>
                    <p style="margin: 6px 0 0 0; font-size: 0.85rem; color: var(--text-secondary);">Your request is now under review</p>
                </div>

                <!-- Request Details Card -->
                <div style="background: var(--bg-secondary); border-radius: 14px; overflow: hidden;">
                    <div style="padding: 12px 16px; background: rgba(37,99,235,0.07); border-bottom: 1px solid var(--border-color);">
                        <p style="margin: 0; font-size: 0.75rem; font-weight: 700; color: var(--primary-color); text-transform: uppercase; letter-spacing: 0.8px;">Request Details</p>
                    </div>
                    <div style="padding: 14px 16px; display: flex; flex-direction: column; gap: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 0.82rem; color: var(--text-secondary);">Tracking No.</span>
                            <code style="background: var(--bg-tertiary); padding: 3px 8px; border-radius: 6px; font-size: 0.82rem; color: var(--primary-color); font-weight: 700;">${request.trackingNumber}</code>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 0.82rem; color: var(--text-secondary);">Document</span>
                            <strong style="font-size: 0.88rem;">${request.documentType}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 0.82rem; color: var(--text-secondary);">Name</span>
                            <strong style="font-size: 0.88rem;">${request.userName}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 0.82rem; color: var(--text-secondary);">Purpose</span>
                            <span style="font-size: 0.82rem; text-align: right; max-width: 60%;">${request.purpose}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 0.82rem; color: var(--text-secondary);">Quantity</span>
                            <strong>${request.quantity}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 0.82rem; color: var(--text-secondary);">Submitted</span>
                            <span style="font-size: 0.82rem;">${formatDateTime(request.createdAt)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 0.82rem; color: var(--text-secondary);">Status</span>
                            <span class="badge badge-pending">Pending</span>
                        </div>
                    </div>
                </div>

                <!-- Payment Details Card -->
                <div style="background: var(--bg-secondary); border-radius: 14px; overflow: hidden;">
                    <div style="padding: 12px 16px; background: rgba(37,99,235,0.07); border-bottom: 1px solid var(--border-color);">
                        <p style="margin: 0; font-size: 0.75rem; font-weight: 700; color: var(--primary-color); text-transform: uppercase; letter-spacing: 0.8px;">Payment Details</p>
                    </div>
                    <div style="padding: 14px 16px; display: flex; flex-direction: column; gap: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 0.82rem; color: var(--text-secondary);">Amount</span>
                            <strong style="color: ${isFree ? 'var(--success-color)' : 'var(--primary-color)'}; font-size: 1rem;">
                                ${isFree ? 'FREE' : `₱${fee.toFixed(2)}`}
                            </strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 0.82rem; color: var(--text-secondary);">Method</span>
                            <strong>${isFree ? 'Free Document' : '📱 GCash'}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 0.82rem; color: var(--text-secondary);">Payment Status</span>
                            <span class="badge ${isFree ? 'badge-completed' : 'badge-processing'}" style="font-size: 0.72rem;">
                                ${isFree ? 'Confirmed' : 'Pending Verification'}
                            </span>
                        </div>
                        ${request.paymentReceiptUrl ? `
                        <div style="margin-top: 4px;">
                            <p style="margin: 0 0 6px 0; font-size: 0.78rem; color: var(--text-secondary);">Receipt Submitted:</p>
                            <div style="border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden;">
                                <img src="${request.paymentReceiptUrl}"
                                     alt="GCash Receipt"
                                     style="width: 100%; max-height: 150px; object-fit: contain; cursor: pointer; background: var(--bg-tertiary);"
                                     onclick="window.open('${request.paymentReceiptUrl}', '_blank')"
                                >
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>

                <!-- What happens next -->
                <div style="
                    background: rgba(37,99,235,0.05);
                    border: 1px solid rgba(37,99,235,0.15);
                    border-radius: 12px;
                    padding: 14px;
                ">
                    <p style="margin: 0 0 8px 0; font-weight: 700; font-size: 0.85rem; color: var(--primary-color);">📋 What happens next?</p>
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                        <p style="margin: 0; font-size: 0.78rem; color: var(--text-secondary);">1. Admin reviews your request and payment receipt</p>
                        <p style="margin: 0; font-size: 0.78rem; color: var(--text-secondary);">2. You'll receive a notification when payment is verified</p>
                        <p style="margin: 0; font-size: 0.78rem; color: var(--text-secondary);">3. Your document will be processed and ready for pickup</p>
                    </div>
                </div>

                <!-- Done Button -->
                <button
                    onclick="closeModal(); navigateToPage('requests');"
                    style="
                        width: 100%;
                        padding: 14px;
                        background: linear-gradient(135deg, #2563eb, #1d4ed8);
                        color: white;
                        border: none;
                        border-radius: 12px;
                        font-weight: 700;
                        font-size: 1rem;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                        box-shadow: 0 4px 14px rgba(37,99,235,0.3);
                    "
                >
                    View My Requests
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12 5 19 12 12 19"/>
                    </svg>
                </button>
            </div>
        `, []);

        showModal(modal);

        // Reset receipt file
        selectedReceiptFile = null;

    } catch (error) {
        console.error('Error showing summary:', error);
        showToast('Request submitted! Redirecting...', 'success');
        navigateToPage('requests');
    }
}

// ========================================
// PAYMENT HISTORY (kept for admin use)
// ========================================

function loadPaymentHistory(container) {
    container.innerHTML = `
        <div class="page-header">
            <h2>Payment History</h2>
            <p>View all your payment transactions</p>
        </div>
        <div style="text-align:center; padding: var(--spacing-xl); color: var(--text-secondary);">
            <p>Payment history is now tracked in your requests.</p>
            <button class="btn btn-primary" onclick="navigateToPage('requests')">View My Requests</button>
        </div>
    `;
}

// ========================================
// GLOBAL EXPORTS
// ========================================

window.showGCashPaymentModal = showGCashPaymentModal;
window.handleReceiptFileSelect = handleReceiptFileSelect;
window.clearReceiptFile = clearReceiptFile;
window.handleConfirmPayment = handleConfirmPayment;
window.showSubmissionSummaryModal = showSubmissionSummaryModal;
window.loadPaymentHistory = loadPaymentHistory;
window.DEFAULT_DOCUMENT_FEES = DEFAULT_DOCUMENT_FEES;
