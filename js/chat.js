// ==========================================
// REAL-TIME CHAT MODULE (Resident & Admin)
// ==========================================

let activeChatUnsubscribe = null;
let activeChatSummaryUnsubscribe = null;
let activeConversationsUnsubscribe = null;
let currentChatConversationId = null; 
let pendingImageFiles = []; // Changed to array for albums
let mediaRecorder = null;
let audioChunks = [];
let recordingTimerInterval = null;
let isRecording = false;
let recordingStartTime = 0;
// -------------------------
// 1. STYLES & UI INJECTION
// -------------------------

function injectChatStyles() {
    if (document.getElementById('chatStyles')) return;
    const style = document.createElement('style');
    style.id = 'chatStyles';
    style.innerHTML = `
        .chat-backdrop {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 100000;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s;
        }
        .chat-backdrop.open {
            opacity: 1;
            pointer-events: auto;
        }
        
        /* Floating Chat Button */
        .chat-floating-btn {
            position: fixed;
            bottom: 25px;
            right: 25px;
            width: 58px;
            height: 58px;
            background: linear-gradient(135deg, #0A7CFF, #005ce6);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 15px rgba(10, 124, 255, 0.4);
            cursor: pointer;
            z-index: 9999;
            transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.2s;
        }
        .chat-floating-btn:hover {
            transform: scale(1.08);
            box-shadow: 0 6px 20px rgba(10, 124, 255, 0.5);
        }
        .chat-unread-badge {
            position: absolute;
            top: -4px;
            right: -4px;
            background: #FF3B30;
            color: #fff;
            font-size: 0.75rem;
            font-weight: 700;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            display: none;
            border: 2px solid white;
        }

        /* iOS Style Chat Window */
        .chat-window {
            position: fixed;
            bottom: 95px;
            right: 25px;
            width: 380px;
            height: 600px;
            max-height: calc(100vh - 120px);
            background: rgba(250, 250, 252, 0.85);
            backdrop-filter: blur(25px);
            -webkit-backdrop-filter: blur(25px);
            border-radius: 24px;
            box-shadow: 0 15px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05) inset;
            
            display: flex;
            flex-direction: column;
            z-index: 10000;
            overflow: hidden;
            
            /* Hidden State */
            opacity: 0;
            pointer-events: none;
            transform: scale(0.85) translateY(20px);
            transform-origin: bottom right;
            transition: opacity 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .chat-window.open {
            opacity: 1;
            pointer-events: auto;
            transform: scale(1) translateY(0);
        }

        /* iOS Chat Header */
        .chat-header {
            padding: 20px 20px 14px;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-bottom: 0.5px solid rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: relative;
            z-index: 10;
        }
        .chat-header-info {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
            justify-content: center;
        }
        .chat-header-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            object-fit: cover;
            background: #E5E5EA;
        }
        .chat-header-text {
            text-align: center;
        }
        .chat-header h3 {
            margin: 0;
            font-size: 1.05rem;
            font-weight: 600;
            color: #000;
            letter-spacing: -0.3px;
        }
        .chat-header p {
            margin: 2px 0 0 0;
            font-size: 0.75rem;
            color: #8E8E93;
        }
        .chat-close-btn, .chat-back-btn {
            background: none;
            border: none;
            color: #0A7CFF;
            cursor: pointer;
            padding: 8px 0;
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 1.05rem;
            font-weight: 500;
            position: absolute;
            z-index: 15;
            transition: opacity 0.2s;
        }
        .chat-close-btn:active, .chat-back-btn:active {
            opacity: 0.6;
        }
        .chat-back-btn { left: 16px; top: 16px; }
        .chat-close-btn { right: 16px; top: 16px; font-weight: 600; }

        /* Chat Body & iMessage Bubbles */
        .chat-body::-webkit-scrollbar, .chat-inbox-list::-webkit-scrollbar {
            width: 5px;
        }
        .chat-body::-webkit-scrollbar-track, .chat-inbox-list::-webkit-scrollbar-track {
            background: transparent;
        }
        .chat-body::-webkit-scrollbar-thumb, .chat-inbox-list::-webkit-scrollbar-thumb {
            background: #D1D1D6;
            border-radius: 10px;
        }
        .chat-body::-webkit-scrollbar-thumb:hover, .chat-inbox-list::-webkit-scrollbar-thumb:hover {
            background: #8E8E93;
        }
        .chat-body {
            flex: 1;
            padding: 18px 16px;
            overflow-y: auto;
            overflow-x: hidden;
            display: flex;
            flex-direction: column;
            gap: 4px;
            background: transparent;
        }
        .chat-bubble {
            max-width: 78%;
            padding: 10px 15px;
            font-size: 0.95rem;
            line-height: 1.35;
            word-wrap: break-word;
            position: relative;
            cursor: pointer;
            user-select: none;
            letter-spacing: -0.2px;
        }
        
        /* iMessage Blue (Sent) */
        .chat-bubble.sent {
            align-self: flex-end;
            background: #0A7CFF;
            color: white;
            border-radius: 20px 20px 4px 20px;
            margin-left: auto;
        }

        /* iMessage Gray (Received) */
        .chat-bubble.received {
            align-self: flex-start;
            background: #E5E5EA;
            color: #000;
            border-radius: 20px 20px 20px 4px;
        }
        
        /* Message Reactions */
        .chat-reaction {
            position: absolute;
            bottom: -6px;
            background: #fff;
            border: 0.5px solid rgba(0,0,0,0.1);
            box-shadow: 0 4px 10px rgba(0,0,0,0.08);
            border-radius: 20px;
            padding: 3px 6px;
            font-size: 0.85rem;
            z-index: 5;
            animation: popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            line-height: 1;
        }
        
        /* Push the label down if reaction exists */
        .chat-bubble:has(> .chat-reaction) {
            margin-bottom: 8px;
        }

        .chat-timestamp {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            font-size: 0.65rem;
            color: #8E8E93;
            opacity: 0;
            white-space: nowrap;
            pointer-events: none;
            transition: opacity 0.2s;
            right: -60px;
        }
        .chat-message-group {
            display: flex;
            flex-direction: column;
            margin-bottom: 8px;
            position: relative;
            transition: transform 0.2s;
            width: 100%;
        }
        .chat-message-group.dragging {
            transition: none;
        }

        /* Typing Indicator dots animation */
        .typing-indicator {
            display: none;
            padding: 8px 12px;
            background: #E5E5EA;
            border-radius: 18px 18px 18px 4px;
            width: fit-content;
            margin: 0 16px 10px;
            align-self: flex-start;
            animation: fadeIn 0.2s ease;
        }
        .typing-dots {
            display: flex;
            gap: 4px;
            align-items: center;
            height: 12px;
        }
        .typing-dot {
            width: 5px;
            height: 5px;
            background: #8E8E93;
            border-radius: 50%;
            animation: typingBounce 1.4s infinite ease-in-out;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes typingBounce {
            0%, 80%, 100% { transform: translateY(0); opacity: 0.6; }
            40% { transform: translateY(-4px); opacity: 1; }
        }

        /* Image Sending Styles */
        .chat-image-btn {
            background: none;
            border: none;
            cursor: pointer;
            padding: 8px 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            border-radius: 50%;
        }
        .chat-image-btn:hover { background: rgba(10, 124, 255, 0.1); }
        .chat-image-btn:active { transform: scale(0.9); }

        .chat-bubble-image {
            padding: 0 !important;
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            overflow: visible !important;
        }
        .chat-bubble-image img {
            border-radius: 18px;
            display: block;
            width: 100%;
            height: auto;
            max-width: 260px;
        }
        .chat-bubble-image img:active { opacity: 0.8; }

        /* Voice Message Styles */
        .chat-bubble-voice {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 14px !important;
            min-width: 140px;
        }
        .voice-play-btn {
            background: rgba(255,255,255,0.2);
            border: none;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: white;
            transition: 0.2s;
        }
        .voice-play-btn:hover { background: rgba(255,255,255,0.3); }
        .chat-bubble.received .voice-play-btn { background: rgba(0,0,0,0.05); color: #0A7CFF; }
        
        .voice-progress-wrap {
            flex: 1;
            height: 3px;
            background: rgba(255,255,255,0.3);
            border-radius: 2px;
            position: relative;
        }
        .chat-bubble.received .voice-progress-wrap { background: rgba(0,0,0,0.1); }
        
        .voice-progress-bar {
            position: absolute;
            left: 0; top: 0; height: 100%;
            width: 0%;
            background: white;
            border-radius: 2px;
        }
        .chat-bubble.received .voice-progress-bar { background: #0A7CFF; }

        .voice-timer {
            font-size: 0.75rem;
            color: rgba(255,255,255,0.8);
            font-family: monospace;
        }
        .chat-bubble.received .voice-timer { color: #8E8E93; }

        @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.3); opacity: 0.6; }
            100% { transform: scale(1); opacity: 1; }
        }

        /* Album Grid Styles */
        .chat-album-grid {
            display: grid;
            gap: 2px;
            width: 100%;
            max-width: 250px;
            border-radius: 14px;
            overflow: hidden;
            background: rgba(0,0,0,0.05);
            border: 0.5px solid rgba(0,0,0,0.1);
        }
        .chat-album-grid img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            cursor: pointer;
            transition: opacity 0.2s;
        }
        .chat-album-grid img:hover { opacity: 0.9; }
        
        .chat-album-grid.grid-1 img { aspect-ratio: unset; max-height: 300px; }
        .chat-album-grid.grid-2 { grid-template-columns: 1fr 1fr; }
        .chat-album-grid.grid-2 img { aspect-ratio: 1; }
        
        .chat-album-grid.grid-3 { grid-template-columns: 1fr 1fr; }
        .chat-album-grid.grid-3 img { aspect-ratio: 1; }
        .chat-album-grid.grid-3 img:first-child { grid-column: span 2; aspect-ratio: 1.8 / 1; }
        
        .chat-album-grid.grid-4 { grid-template-columns: 1fr 1fr; }
        .chat-album-grid.grid-4 img { aspect-ratio: 1; }

        .preview-thumb {
            position: relative; 
            width: 64px; 
            height: 64px; 
            flex-shrink: 0;
        }
        .preview-thumb img {
            width: 100%; 
            height: 100%; 
            object-fit: cover; 
            border-radius: 12px; 
            border: 1px solid rgba(0,0,0,0.1);
        }
        .preview-thumb .remove-btn {
            position: absolute; 
            top: -6px; 
            right: -6px; 
            background: #FF3B30; 
            color: white; 
            border: 2px solid white; 
            border-radius: 50%; 
            width: 20px; 
            height: 20px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            cursor: pointer; 
            font-size: 12px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            z-index: 2;
        }

        .image-sending-indicator {
            align-self: flex-end;
            font-size: 0.75rem;
            color: #8E8E93;
            margin: -6px 16px 10px 0;
            display: none;
        }

        .reaction-menu {
            position: fixed;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-radius: 30px;
            display: flex;
            gap: 12px;
            padding: 10px 16px;
            box-shadow: 0 10px 35px rgba(0,0,0,0.15);
            z-index: 100000;
            transition: opacity 0.2s, transform 0.2s;
            transform: scale(0.9);
            opacity: 0;
            pointer-events: none;
        }
        /* Photo Viewer Lightbox */
        .chat-photo-viewer {
            position: fixed;
            top: 0; left: 0; 
            width: 100%; height: 100%;
            background: rgba(0,0,0,0.98);
            z-index: 200001;
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.2s ease;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }
        .chat-photo-viewer img {
            max-width: 100%;
            max-height: 80vh;
            object-fit: contain;
            transition: transform 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
            transform: scale(0.9);
        }
        .chat-photo-viewer.active { display: flex; }
        .chat-photo-viewer.active img { transform: scale(1.0); }
        
        .chat-photo-viewer-close {
            position: absolute;
            top: 40px; right: 24px;
            background: rgba(255,255,255,0.15);
            color: white; border: none;
            width: 48px; height: 48px;
            border-radius: 50%;
            cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            z-index: 10;
        }

        /* Read Status */
        .chat-read-status {
            font-size: 0.65rem;
            color: #8E8E93;
            align-self: flex-end;
            margin-right: 4px;
            margin-top: 2px;
            display: none;
            font-weight: 500;
            letter-spacing: -0.1px;
        }

        /* Chat Input Area */
        .chat-input-area {
            padding: 10px 16px 16px;
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-top: 0.5px solid rgba(0,0,0,0.1);
            display: flex;
            gap: 10px;
            align-items: flex-end;
            z-index: 10;
        }
        .chat-input-wrapper {
            flex: 1;
            border: 1px solid #D1D1D6;
            background: #fff;
            border-radius: 22px;
            display: flex;
            align-items: center;
            padding: 0;
            transition: border-color 0.2s;
        }
        .chat-input-wrapper:focus-within {
            border-color: #0A7CFF;
        }
        .chat-input {
            flex: 1;
            border: none;
            background: transparent;
            padding: 10px 14px;
            font-size: 0.95rem;
            font-family: inherit;
            outline: none;
            resize: none;
            max-height: 120px;
            min-height: 22px;
            color: #000;
            letter-spacing: -0.2px;
        }
        .chat-input::placeholder {
            color: #8E8E93;
        }
        .chat-send-btn {
            background: #0A7CFF;
            color: white;
            border: none;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: transform 0.2s, opacity 0.2s;
            flex-shrink: 0;
            margin: 4px 6px;
        }
        .chat-send-btn:active {
            transform: scale(0.9);
            opacity: 0.8;
        }
        .chat-send-btn svg {
            width: 15px;
            height: 15px;
            margin-top: 1px;
            margin-right: -1px;
        }

        /* Admin Inbox View */
        .chat-inbox-list {
            flex: 1;
            overflow-y: auto;
            background: transparent;
        }
        .chat-inbox-item {
            padding: 12px 20px;
            border-bottom: 0.5px solid rgba(0,0,0,0.05);
            display: flex;
            align-items: stretch;
            gap: 14px;
            cursor: pointer;
            transition: background 0.2s;
        }
        .chat-inbox-item:hover {
            background: rgba(0,0,0,0.03);
        }
        .inbox-item-avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            object-fit: cover;
            background: #e2e8f0;
        }
        .inbox-item-details {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 2px;
        }
        .inbox-item-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
        }
        .inbox-item-name {
            margin: 0;
            font-size: 1.05rem;
            font-weight: 600;
            color: #000;
            letter-spacing: -0.3px;
        }
        .inbox-item-time {
            font-size: 0.8rem;
            color: #8E8E93;
        }
        .inbox-item-message {
            margin: 0;
            font-size: 0.95rem;
            color: #8E8E93;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            letter-spacing: -0.2px;
        }
        
        .inbox-item-unread {
            background: #0A7CFF;
            color: white;
            font-size: 0.75rem;
            font-weight: 600;
            min-width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            margin-left: 8px;
            padding: 0 6px;
        }

        /* Mobile specific styling */
        @media (max-width: 768px) {
            .chat-floating-btn {
                bottom: 95px;
            }
            .chat-window {
                width: 100%;
                height: calc(100% - 60px);
                max-height: none;
                bottom: 0;
                right: 0;
                border-radius: 20px 20px 0 0;
                border: none;
                z-index: 100000;
                background: #FAFAFC;
                
                /* Mobile Hidden State */
                transform: translateY(100%) scale(1);
                opacity: 0;
                pointer-events: none;
                transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.3, 1), opacity 0.35s ease;
                transform-origin: center;
                z-index: 100001;
            }
            .chat-window.open {
                transform: translateY(0) scale(1);
                opacity: 1;
                pointer-events: auto;
            }
            .chat-pull-indicator {
                display: block !important;
                width: 36px;
                height: 5px;
                background: rgba(0,0,0,0.2);
                border-radius: 4px;
                position: absolute;
                top: 8px;
                left: 50%;
                transform: translateX(-50%);
            }
            .chat-header {
                padding-top: 24px;
                background: rgba(250, 250, 252, 0.95);
            }
            .chat-close-btn, .chat-back-btn {
                top: 16px;
            }
            .chat-input-area {
                /* Add safe area inset for bottom home bar on iPhone */
                padding-bottom: max(env(safe-area-inset-bottom), 24px);
                padding-left: max(env(safe-area-inset-left), 16px);
                padding-right: max(env(safe-area-inset-right), 16px);
                background: rgba(250, 250, 252, 0.9);
            }
        }
    `;
    document.head.appendChild(style);
}

function initChatWidget() {
    if (!AppState.currentUser) return;
    if (document.getElementById('chatWindow')) return; // Prevent duplicate widgets

    injectChatStyles();

    // The reaction menu global element
    const reactMenu = document.createElement('div');
    reactMenu.className = 'reaction-menu';
    reactMenu.id = 'chatReactionMenu';
    reactMenu.innerHTML = `
        <span class="react-btn" onclick="submitReaction('❤️')">❤️</span>
        <span class="react-btn" onclick="submitReaction('👍')">👍</span>
        <span class="react-btn" onclick="submitReaction('😂')">😂</span>
        <span class="react-btn" onclick="submitReaction('😮')">😮</span>
        <span class="react-btn" onclick="submitReaction('😢')">😢</span>
    `;
    document.body.appendChild(reactMenu);

    // The Photo Viewer element
    const viewer = document.createElement('div');
    viewer.className = 'chat-photo-viewer';
    viewer.id = 'chatPhotoViewer';
    viewer.innerHTML = `
        <button class="chat-photo-viewer-close" onclick="closeChatPhoto()">✕</button>
        <img id="chatViewerImg" src="">
    `;
    viewer.onclick = (e) => { if(e.target === viewer) closeChatPhoto(); };
    document.body.appendChild(viewer);

    window.viewChatPhoto = (url) => {
        const v = document.getElementById('chatPhotoViewer');
        const img = document.getElementById('chatViewerImg');
        img.src = url;
        v.classList.add('active');
    };
    window.closeChatPhoto = () => {
        const v = document.getElementById('chatPhotoViewer');
        v.classList.remove('active');
    };

    // Hide reaction menu on tap outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.reaction-menu') && !e.target.closest('.chat-bubble')) {
            reactMenu.classList.remove('active');
        }
    });

    // Create the floating button
    const btn = document.createElement('div');
    btn.className = 'chat-floating-btn';
    btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
        </svg>
        <div class="chat-unread-badge" id="chatTotalUnread">0</div>
    `;
    document.body.appendChild(btn);

    // Backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'chat-backdrop';
    backdrop.id = 'chatBackdrop';
    document.body.appendChild(backdrop);
    
    // Create the chat window
    const win = document.createElement('div');
    win.className = 'chat-window';
    win.id = 'chatWindow';
    
    // Base layout
    win.innerHTML = `
        <div class="chat-header" id="chatDragHeader">
            <div class="chat-pull-indicator" style="display:none;"></div>
            <button class="chat-back-btn" id="chatBackBtn" style="display: none;">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <div class="chat-header-info">
                <img src="https://ui-avatars.com/api/?name=Admin&background=0A7CFF&color=fff" class="chat-header-avatar" id="chatHeaderAvatar" style="display: none;">
                <div class="chat-header-text">
                    <h3 id="chatHeaderName">Messages</h3>
                    <p id="chatHeaderStatus">We usually reply instantly</p>
                </div>
            </div>
            <!-- chatCloseBtn removed by user request -->
        </div>

        <!-- Inbox View (Admin Only) -->
        <div class="chat-inbox-view" id="chatInboxView" style="display: none; height: 100%; flex-direction: column;">
            <div class="chat-search-wrap" style="padding: 10px 16px; background: #fff; border-bottom: 0.5px solid rgba(0,0,0,0.05); position: sticky; top: 0; z-index: 5;">
                <div style="position: relative; display: flex; align-items: center;">
                    <svg style="position: absolute; left: 12px; color: #8E8E93;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input type="text" id="chatInboxSearch" placeholder="Search" style="width: 100%; background: #F2F2F7; border: none; padding: 10px 12px 10px 38px; border-radius: 12px; font-size: 1rem; outline: none; transition: 0.2s;">
                </div>
            </div>
            <div class="chat-inbox-list" id="chatInboxList" style="flex: 1; overflow-y: auto;">
                <div style="padding: 30px; text-align: center; color: var(--text-secondary); font-size: 0.95rem;">Loading chats...</div>
            </div>
        </div>

        <!-- Conversation View -->
        <div class="chat-body" id="chatBody"></div>
        <div id="chatTypingIndicator" class="typing-indicator">
             <div class="typing-dots">
                 <div class="typing-dot"></div>
                 <div class="typing-dot"></div>
                 <div class="typing-dot"></div>
             </div>
        </div>
        
        <div class="chat-input-area" id="chatInputArea">
            <input type="file" id="chatImageInput" accept="image/*" multiple style="display: none;">
            <div id="chatImagePreview" style="display: none; padding: 12px 16px; background: #fff; border-top: 0.5px solid rgba(0,0,0,0.05); overflow-x: auto; -webkit-overflow-scrolling: touch;">
                <div id="chatPreviewList" style="display: flex; gap: 10px;">
                    <!-- Thumbnails go here -->
                </div>
            </div>
            <div id="chatRecordingLayer" style="display: none; padding: 12px 16px; background: #fff; border-top: 0.5px solid rgba(0,0,0,0.05); align-items: center; gap: 12px;">
                <div style="background: #FF3B30; width: 10px; height: 10px; border-radius: 50%; animation: pulse 1s infinite;"></div>
                <div id="chatRecordingTimer" style="font-size: 0.95rem; color: #FF3B30; font-family: monospace; flex: 1; font-weight: 600;">0:00</div>
                <button id="chatCancelRecord" style="background: none; border: none; color: #8E8E93; font-size: 0.95rem; cursor: pointer; padding: 5px 10px; font-weight: 500;">Cancel</button>
            </div>
            <div class="chat-input-wrapper" id="chatInputWrapper">
                <button class="chat-image-btn" id="chatImageBtn" title="Send photo">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0A7CFF" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                </button>
                <button class="chat-mic-btn" id="chatMicBtn" title="Record voice" style="background: none; border: none; padding: 8px 12px 8px 4px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0A7CFF" stroke-width="2.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                </button>
                <textarea class="chat-input" id="chatInputMessage" placeholder="Type a message..." rows="1"></textarea>
                <button class="chat-send-btn" id="chatSendBtn" style="display: none;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2.5"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(win);

    // Global Listeners
    const openChat = () => {
        win.classList.add('open');
        backdrop.classList.add('open');
        win.style.transform = '';
        btn.style.display = 'none';
        
        const isAdmin = AppState.currentUser.role === 'admin';
        if (isAdmin && !currentChatConversationId) {
            document.getElementById('chatInboxView').style.display = 'flex';
            document.getElementById('chatBody').style.display = 'none';
            document.getElementById('chatInputArea').style.display = 'none';
            document.getElementById('chatHeaderName').textContent = 'Messages';
            document.getElementById('chatHeaderStatus').textContent = 'Inbox';
            document.getElementById('chatBackBtn').style.display = 'none';
        } else if (!isAdmin) {
            openConversation(AppState.currentUser.id, 'Brgy ONE Admin', true);
        }
    };
    
    btn.addEventListener('click', openChat);

    const closeChat = () => {
        win.classList.remove('open');
        backdrop.classList.remove('open');
        
        // Use a slight timeout to ensure CSS transition handles the slide-down before we wipe styles
        setTimeout(() => {
            if (!win.classList.contains('open')) {
                win.style.removeProperty('transform');
                win.style.removeProperty('transition');
            }
        }, 400);

        document.getElementById('chatReactionMenu').classList.remove('active');
        document.getElementById('chatInboxSearch').value = ''; // Reset search
        clearTimeout(typingTimer);
        setTypingStatus(false);
        setTimeout(() => { 
            btn.style.display = 'flex'; 
        }, 300);
    };

    backdrop.addEventListener('click', closeChat);

    // Pull to dismiss on mobile
    const dragHeader = document.getElementById('chatDragHeader');
    let dragStartY = 0;
    let isHeaderDragging = false;
    let currentYOffset = 0;
    let dragTicking = false;

    dragHeader.addEventListener('touchstart', e => {
        if (window.innerWidth > 768) return;
        dragStartY = e.touches[0].clientY;
        isHeaderDragging = true;
        win.style.transition = 'none'; // Instant tracking without CSS lag
    }, {passive: true});

    dragHeader.addEventListener('touchmove', e => {
        if (!isHeaderDragging) return;
        
        const currentY = e.touches[0].clientY;
        const diffY = currentY - dragStartY;
        currentYOffset = diffY;
        
        if (!dragTicking) {
            window.requestAnimationFrame(() => {
                if (currentYOffset < 0) {
                    // Rubber-band effect moving up
                    win.style.transform = `translateY(${currentYOffset / 3}px)`;
                } else {
                    // 1:1 tracking moving down
                    win.style.transform = `translateY(${currentYOffset}px)`;
                }
                dragTicking = false;
            });
            dragTicking = true;
        }
        
        // Prevent scroll when pulling down
        if (diffY > 0) e.preventDefault();
    }, {passive: false});

    const endHeaderDrag = () => {
        if (!isHeaderDragging) return;
        isHeaderDragging = false;
        dragTicking = false;
        
        // Restore transition to allow smooth animate back
        win.style.transition = 'transform 0.35s cubic-bezier(0.2, 0.8, 0.3, 1)';
        
        if (currentYOffset > 100) {
            closeChat();
        } else {
            // Spring back to 0
            win.style.transform = 'translateY(0)';
            // After transition finishes, clean up inline style
            setTimeout(() => {
                if (isHeaderDragging === false && win.classList.contains('open')) {
                    win.style.removeProperty('transform');
                    win.style.removeProperty('transition');
                }
            }, 350);
        }
        currentYOffset = 0;
    };

    window.addEventListener('touchend', endHeaderDrag);
    window.addEventListener('touchcancel', endHeaderDrag);

    // Swipe to reveal timestamps logic
    const chatBody = document.getElementById('chatBody');
    let startX = 0;
    let isSwiping = false;
    let swipeTicking = false;

    chatBody.addEventListener('touchstart', e => {
        // Only activate swipe-to-reveal if user taps on a bubble
        if (!e.target.closest('.chat-bubble')) return;
        startX = e.touches[0].clientX;
        isSwiping = true;
    });

    chatBody.addEventListener('touchmove', e => {
        if (!isSwiping) return;
        const diff = e.touches[0].clientX - startX;
        
        // ONLY allow swiping to the LEFT (diff < 0) for iMessage/FB style
        if (diff > -10) return; 
        
        const dragLimit = 80;
        let translateDiff = diff;
        
        if (translateDiff < -dragLimit) translateDiff = -dragLimit;
        
        if (!swipeTicking) {
            window.requestAnimationFrame(() => {
                document.querySelectorAll('.chat-message-group').forEach(group => {
                    group.classList.add('dragging');
                    group.style.transform = `translateX(${translateDiff}px)`;
                });
                document.querySelectorAll('.chat-timestamp').forEach(ts => {
                    ts.style.opacity = Math.min(Math.abs(translateDiff) / dragLimit, 1);
                });
                swipeTicking = false;
            });
            swipeTicking = true;
        }
    });

    const endSwipe = () => {
        if (!isSwiping) return;
        isSwiping = false;
        document.querySelectorAll('.chat-message-group').forEach(group => {
            group.classList.remove('dragging');
            group.style.transform = `translateX(0px)`;
        });
        document.querySelectorAll('.chat-timestamp').forEach(ts => {
            ts.style.transform = `translateY(-50%) translateX(0px)`;
            ts.style.opacity = '0';
        });
    };

    chatBody.addEventListener('touchend', endSwipe);
    chatBody.addEventListener('touchcancel', endSwipe);
    // Remove duplicate chatCloseBtn listener

    document.getElementById('chatBackBtn').addEventListener('click', () => {
        currentChatConversationId = null;
        if (activeChatUnsubscribe) { activeChatUnsubscribe(); activeChatUnsubscribe = null; }
        if (activeChatSummaryUnsubscribe) { activeChatSummaryUnsubscribe(); activeChatSummaryUnsubscribe = null; }
        
        document.getElementById('chatReactionMenu').classList.remove('active');
        document.getElementById('chatInboxSearch').value = ''; // Reset search focus
        document.getElementById('chatInboxView').style.display = 'flex';
        document.getElementById('chatBody').style.display = 'none';
        document.getElementById('chatInputArea').style.display = 'none';
        document.getElementById('chatHeaderName').textContent = 'Messages';
        document.getElementById('chatHeaderStatus').textContent = 'Inbox';
        document.getElementById('chatBackBtn').style.display = 'none';
    });

    document.getElementById('chatSendBtn').addEventListener('click', sendMessage);
    document.getElementById('chatInputMessage').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Realtime Typing Logic
    let typingTimer = null;
    const typingInterval = 2500; 
    let isCurrentlyTyping = false;

    window.setTypingStatus = async (status) => {
        if (!currentChatConversationId) return;
        if (isCurrentlyTyping === status) return;
        isCurrentlyTyping = status;
        
        const field = AppState.currentUser.role === 'admin' ? 'typingAdmin' : 'typingUser';
        try {
            await window.DB.firestore.collection('CHATS').doc(currentChatConversationId).update({
                [field]: status
            });
        } catch (e) { }
    };


    // Real-time Search Logic
    document.getElementById('chatInboxSearch').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const items = document.querySelectorAll('.chat-inbox-item');
        
        items.forEach(item => {
            const name = item.querySelector('.inbox-item-name').textContent.toLowerCase();
            if (name.includes(query)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });

    // Voice Messaging Logic
    const micBtn = document.getElementById('chatMicBtn');
    const sendBtn = document.getElementById('chatSendBtn');
    const messageInput = document.getElementById('chatInputMessage');
    const recordingLayer = document.getElementById('chatRecordingLayer');
    const inputWrapper = document.getElementById('chatInputWrapper');
    const cancelRecordBtn = document.getElementById('chatCancelRecord');

    messageInput.addEventListener('input', () => {
        // Typing status logic
        window.setTypingStatus(true);
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
            window.setTypingStatus(false);
        }, typingInterval);

        // Send button visibility logic
        const hasText = messageInput.value.trim().length > 0;
        const hasImages = pendingImageFiles.length > 0;
        if (hasText || hasImages) {
            sendBtn.style.display = 'flex';
        } else {
            sendBtn.style.display = 'none';
        }
    });

    // Helper to start recording
    const startRecording = async (e) => {
        if (e) e.preventDefault();
        if (isRecording) return;
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            isRecording = true;
            recordingStartTime = Date.now();

            mediaRecorder.ondataavailable = e => { if (e.data.size > 0) audioChunks.push(e.data); };
            mediaRecorder.onstop = async () => {
                const duration = Date.now() - recordingStartTime;
                const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType || 'audio/webm' });
                
                // Final safety: don't send if cancelled or too short (< 0.5s)
                if (audioChunks.length > 0 && recordingLayer.dataset.cancelled === 'false' && duration > 500) {
                     try {
                         const audioUrl = await window.uploadAudioToCloudinary(audioBlob);
                         if (audioUrl) {
                             await sendMessage(null, audioUrl);
                         }
                     } catch (err) {
                         console.error('Audio upload failed:', err);
                     }
                }
                stream.getTracks().forEach(track => track.stop());
            };

            // UI updates
            recordingLayer.style.display = 'flex';
            inputWrapper.style.display = 'none';
            recordingLayer.dataset.cancelled = 'false';
            
            let seconds = 0;
            const timerEl = document.getElementById('chatRecordingTimer');
            timerEl.textContent = '0:00';
            recordingTimerInterval = setInterval(() => {
                seconds++;
                const mins = Math.floor(seconds / 60);
                const secs = seconds % 60;
                timerEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
            }, 1000);

            mediaRecorder.start(200); // Collect data every 200ms
        } catch (err) {
            console.error('Mic access denied:', err);
            showToast('Permission denied. Please allow microphone access.', 'error');
            isRecording = false;
        }
    };

    const stopRecording = (cancelled = false) => {
        if (!mediaRecorder || mediaRecorder.state === 'inactive') return;
        
        isRecording = false;
        if (cancelled) recordingLayer.dataset.cancelled = 'true';
        
        mediaRecorder.stop();
        recordingLayer.style.display = 'none';
        inputWrapper.style.display = 'flex';
        clearInterval(recordingTimerInterval);
    };

    micBtn.addEventListener('mousedown', startRecording);
    micBtn.addEventListener('mouseup', (e) => { e.preventDefault(); stopRecording(false); });
    micBtn.addEventListener('mouseleave', (e) => { if(isRecording) stopRecording(true); });
    
    // Mobile touch support
    micBtn.addEventListener('touchstart', startRecording, {passive: false});
    micBtn.addEventListener('touchend', (e) => { e.preventDefault(); stopRecording(false); }, {passive: false});
    micBtn.addEventListener('touchcancel', (e) => { e.preventDefault(); stopRecording(true); }, {passive: false});

    cancelRecordBtn.addEventListener('click', () => stopRecording(true));

    // Image Upload Logic
    const imageInput = document.getElementById('chatImageInput');
    const imageBtn = document.getElementById('chatImageBtn');

    imageBtn.addEventListener('click', () => imageInput.click());

    imageInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        files.forEach(file => {
            const fileId = Math.random().toString(36).substr(2, 9);
            pendingImageFiles.push({ id: fileId, file: file });
            
            const thumb = document.createElement('div');
            thumb.className = 'preview-thumb';
            thumb.id = `thumb-${fileId}`;
            thumb.innerHTML = `
                <img src="${URL.createObjectURL(file)}">
                <button class="remove-btn" onclick="removeChatPreview('${fileId}')">✕</button>
            `;
            document.getElementById('chatPreviewList').appendChild(thumb);
        });

        document.getElementById('chatImagePreview').style.display = 'block';
        micBtn.style.display = 'none';
        sendBtn.style.display = 'flex';
        imageInput.value = '';
    });

    window.removeChatPreview = (fileId) => {
        pendingImageFiles = pendingImageFiles.filter(item => item.id !== fileId);
        const thumb = document.getElementById(`thumb-${fileId}`);
        if (thumb) thumb.remove();
        
        if (pendingImageFiles.length === 0) {
            document.getElementById('chatImagePreview').style.display = 'none';
        }
    };

    // Start Realtime Listeners
    startGlobalChatListener();
}

function startGlobalChatListener() {
    const isAdmin = AppState.currentUser.role === 'admin';
    const chatsRef = window.DB.firestore.collection('CHATS');

    if (isAdmin) {
        activeConversationsUnsubscribe = chatsRef
            .orderBy('lastMessageAt', 'desc')
            .onSnapshot(snapshot => {
                let totalUnread = 0;
                let inboxHtml = '';
                
                if (snapshot.empty) {
                    inboxHtml = '<div style="padding: 30px; text-align: center; color: #8E8E93;">No messages yet.</div>';
                }

                snapshot.forEach(doc => {
                    const chat = doc.data();
                    const unread = chat.unreadAdmin || 0;
                    totalUnread += unread;

                    const timeStr = chat.lastMessageAt ? new Date(chat.lastMessageAt.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';
                    
                    const isYou = chat.lastSenderId === AppState.currentUser.id ? 'You: ' : '';
                    inboxHtml += `
                        <div class="chat-inbox-item" onclick="openConversation('${doc.id}', '${(chat.residentName || 'Resident').replace(/'/g, "\\'")}', false, '${chat.residentAvatar || ''}')">
                            <img src="${chat.residentAvatar || 'https://ui-avatars.com/api/?name=R&background=random'}" class="inbox-item-avatar">
                            <div class="inbox-item-details">
                                <div class="inbox-item-header">
                                    <p class="inbox-item-name">${chat.residentName || 'Resident'}</p>
                                    <span class="inbox-item-time">${timeStr}</span>
                                </div>
                                <div style="display: flex; align-items: center; justify-content: space-between;">
                                    <p class="inbox-item-message ${unread > 0 ? 'unread' : ''}" style="${unread > 0 ? 'color: #000; font-weight: 500;' : ''}">${isYou}${chat.lastMessage || 'No messages'}</p>
                                    ${unread > 0 ? `<div class="inbox-item-unread"></div>` : ''} 
                                </div>
                            </div>
                        </div>
                    `;
                });

                const badge = document.getElementById('chatTotalUnread');
                if (badge) {
                    badge.textContent = totalUnread;
                    badge.style.display = totalUnread > 0 ? 'flex' : 'none';
                }
                
                const dBadge = document.getElementById('desktopNavInboxBadge');
                if (dBadge) {
                    dBadge.textContent = totalUnread;
                    dBadge.style.display = totalUnread > 0 ? 'block' : 'none';
                }
                
                const mBadge = document.getElementById('mobileNavInboxBadge');
                if (mBadge) {
                    mBadge.textContent = totalUnread;
                    mBadge.style.display = totalUnread > 0 ? 'flex' : 'none';
                }

                // Floating button now persists for Admin too per request
                const list = document.getElementById('chatInboxList');
                if (list) list.innerHTML = inboxHtml;
            });
    } else {
        const chatDocRef = chatsRef.doc(AppState.currentUser.id);
        chatDocRef.onSnapshot(doc => {
            if (doc.exists) {
                const data = doc.data();
                const unread = data.unreadUser || 0;
                const badge = document.getElementById('chatTotalUnread');
                if (badge) {
                    badge.textContent = unread;
                    badge.style.display = unread > 0 ? 'flex' : 'none';
                }
            }
        });
    }
}

let reactionTargetMsgId = null;
let holdTimer = null;
let lastTapTime = 0;

window.handleReactionHoldStart = function(e, msgId) {
    holdTimer = setTimeout(() => {
        showReactions(e, msgId);
    }, 500); 
};

window.handleDoubleTapAndHoldStart = function(e, msgId, currentReaction) {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTime;
    
    if (tapLength < 300 && tapLength > 0) {
        submitReactionDirect('❤️', msgId, currentReaction);
        e.preventDefault(); 
    } else {
        holdTimer = setTimeout(() => {
            showReactions(e, msgId);
        }, 500);
    }
    lastTapTime = currentTime;
};

window.handleReactionHoldEnd = function() {
    clearTimeout(holdTimer);
};

window.showReactions = function(e, msgId) {
    e.preventDefault();
    clearTimeout(holdTimer);
    reactionTargetMsgId = msgId;
    
    // Position the menu near the click/touch
    const menu = document.getElementById('chatReactionMenu');
    menu.classList.add('active');
    
    let x, y;
    if (e.touches && e.touches.length > 0) {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
    } else {
        x = e.clientX;
        y = e.clientY;
    }
    
    // ensure menu stays within window
    const menuWidth = 220;
    x = Math.min(x, window.innerWidth - menuWidth - 20);
    y = y - 60; // place above finger
    
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
};

window.submitReaction = async function(emoji) {
    if (!reactionTargetMsgId || !currentChatConversationId) return;
    try {
        await window.DB.firestore.collection('CHATS')
            .doc(currentChatConversationId).collection('MESSAGES')
            .doc(reactionTargetMsgId).update({ reaction: emoji });
    } catch (e) { console.error('React failed', e); }
    document.getElementById('chatReactionMenu').classList.remove('active');
    reactionTargetMsgId = null;
};

window.submitReactionDirect = async function(emoji, msgId, currentReaction) {
    if (!currentChatConversationId) return;
    
    // Toggle offline if reacting with the exact same emoji
    const newEmoji = (currentReaction === emoji) ? null : emoji;
    
    try {
        await window.DB.firestore.collection('CHATS')
            .doc(currentChatConversationId).collection('MESSAGES')
            .doc(msgId).update({ reaction: newEmoji });
    } catch (e) { console.error('React failed', e); }
};

function openConversation(conversationId, headerName, isResident, avatarUrl = '') {
    currentChatConversationId = conversationId;
    
    // Update UI
    document.getElementById('chatHeaderName').textContent = headerName;
    document.getElementById('chatHeaderStatus').textContent = isResident ? 'Admin usually replies instantly' : 'Resident Chat';
    
    // Avatar styling
    const avatar = document.getElementById('chatHeaderAvatar');
    if (avatar) {
        avatar.style.display = 'block';
        if (isResident) {
            avatar.src = 'https://ui-avatars.com/api/?name=Admin&background=0A7CFF&color=fff';
        } else {
            avatar.src = avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(headerName)}&background=random`;
        }
    }
    
    // Ensure conversation areas are visible (especially if previously hidden by admin inbox logic)
    document.getElementById('chatInboxView').style.display = 'none';
    document.getElementById('chatBody').style.display = 'flex';
    document.getElementById('chatInputArea').style.display = 'flex';
    
    if (!isResident) {
        document.getElementById('chatBackBtn').style.display = 'block';
    } else {
        document.getElementById('chatBackBtn').style.display = 'none';
    }

    const chatBody = document.getElementById('chatBody');
    chatBody.innerHTML = '<div style="text-align: center; color: #8E8E93; margin-top: 20px;">BrgyONE Chat</div>';

    // Clear previous listener
    if (activeChatUnsubscribe) { activeChatUnsubscribe(); }
    if (activeChatSummaryUnsubscribe) { activeChatSummaryUnsubscribe(); }

    const resetField = isResident ? 'unreadUser' : 'unreadAdmin';

    // ✨ 1. Listen to Conversation Doc for "Read" Receipts
    activeChatSummaryUnsubscribe = window.DB.firestore.collection('CHATS').doc(conversationId)
        .onSnapshot(doc => {
            if(doc.exists) {
                const data = doc.data();
                
                // If I am looking at it, force my unread count to 0
                if (data[resetField] > 0 && document.getElementById('chatWindow').classList.contains('open')) {
                    window.DB.firestore.collection('CHATS').doc(conversationId).set({ [resetField]: 0 }, { merge: true });
                }

                // Update Admin Avatar in Resident view if it exists in the doc
                if (isResident && data.adminAvatar) {
                    const headerAvatar = document.getElementById('chatHeaderAvatar');
                    if (headerAvatar) headerAvatar.src = data.adminAvatar;
                }

                // Update Typing Indicator
                const otherTypingField = isResident ? 'typingAdmin' : 'typingUser';
                const indicator = document.getElementById('chatTypingIndicator');
                if (indicator) {
                    const isOtherTyping = data[otherTypingField] || false;
                    const currentlyShowing = indicator.style.display === 'block';
                    
                    if (isOtherTyping !== currentlyShowing) {
                        indicator.style.display = isOtherTyping ? 'block' : 'none';
                        if (isOtherTyping) {
                            const chatBody = document.getElementById('chatBody');
                            chatBody.scrollTop = chatBody.scrollHeight;
                        }
                    }
                }

                // Evaluate Read status based on the other person's unread counts
                const otherUnreadField = isResident ? 'unreadAdmin' : 'unreadUser';
                const isRead = data[otherUnreadField] === 0;

                // Update all dynamic statuses
                document.querySelectorAll('.dynamic-status').forEach(el => {
                    el.textContent = isRead ? 'Read' : 'Sent';
                });
            }
        });

    // ✨ 2. Listen to Messages
    activeChatUnsubscribe = window.DB.firestore.collection('CHATS')
        .doc(conversationId).collection('MESSAGES')
        .orderBy('timestamp', 'asc')
        .onSnapshot(snapshot => {
            chatBody.innerHTML = '';
            
            if (snapshot.empty) {
                chatBody.innerHTML = '<div style="text-align: center; color: #8E8E93; margin-top: 20px; font-size: 0.8rem;">Start a conversation</div>';
                return;
            }

            let previousSenderId = null;

            snapshot.forEach(doc => {
                const msg = doc.data();
                const isMine = msg.senderId === AppState.currentUser.id;
                
                // Start a message group
                let groupHtml = `<div class="chat-message-group">`;
                
                const reactionPos = isMine ? 'right: -8px;' : 'left: -8px;';
                const timeStr = msg.timestamp ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';
                
                groupHtml += `
                    <div class="chat-timestamp">${timeStr}</div>
                    <div class="chat-bubble ${isMine ? 'sent' : 'received'} ${msg.type === 'image' || msg.type === 'album' ? 'chat-bubble-image' : ''}"
                         oncontextmenu="showReactions(event, '${doc.id}')"
                         ondblclick="submitReactionDirect('❤️', '${doc.id}', '${msg.reaction || ''}')"
                         onmousedown="handleReactionHoldStart(event, '${doc.id}')" 
                         onmouseup="handleReactionHoldEnd()" 
                         onmouseleave="handleReactionHoldEnd()"
                         ontouchstart="handleDoubleTapAndHoldStart(event, '${doc.id}', '${msg.reaction || ''}')" 
                         ontouchend="handleReactionHoldEnd()" 
                         ontouchcancel="handleReactionHoldEnd()">
                        ${msg.type === 'album' ? `
                            <div class="chat-album-grid grid-${Math.min(msg.images.length, 4)}">
                                ${msg.images.map(img => `<img src="${img}" onclick="window.viewChatPhoto('${img}')" alt="Album image">`).join('')}
                            </div>
                        ` : (msg.type === 'image' ? `<img src="${msg.image}" onclick="window.viewChatPhoto('${msg.image}')" alt="Image">` : (msg.type === 'voice' ? `
                            <div class="chat-bubble-voice">
                                <button class="voice-play-btn" onclick="window.toggleVoicePlayback(this, '${msg.audio}')">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                </button>
                                <div class="voice-progress-wrap">
                                    <div class="voice-progress-bar"></div>
                                </div>
                                <div class="voice-timer">VOICE</div>
                            </div>
                        ` : msg.text))}
                        ${msg.reaction ? `<div class="chat-reaction" style="${reactionPos}">${msg.reaction}</div>` : ''}
                    </div>
                `;
                
                if (isMine) {
                    groupHtml += `<div class="chat-read-status dynamic-status" style="display:block;">Sent</div>`;
                }
                
                groupHtml += `</div>`;
                chatBody.innerHTML += groupHtml;
                previousSenderId = msg.senderId;
            });

            // Scroll to bottom
            setTimeout(() => {
                chatBody.scrollTop = chatBody.scrollHeight;
            }, 50);
        });
}

async function sendMessage(manualText = null, manualAudioUrl = null) {
    if (!currentChatConversationId) return;
    
    const input = document.getElementById('chatInputMessage');
    const text = manualText || input.value.trim();
    if (!text && pendingImageFiles.length === 0 && !manualAudioUrl) return;

    const previewContainer = document.getElementById('chatImagePreview');
    previewContainer.style.display = 'none';
    document.getElementById('chatPreviewList').innerHTML = '';
    
    // Reset buttons
    document.getElementById('chatSendBtn').style.display = 'none';
    
    // If there's pending images, upload them
    let finalImageUrls = [];
    if (pendingImageFiles.length > 0) {
        try {
            const sendBtn = document.getElementById('chatSendBtn');
            sendBtn.disabled = true;
            sendBtn.innerHTML = '<span style="font-size: 10px;">...</span>';
            
            const filesToUpload = pendingImageFiles.map(item => item.file);
            pendingImageFiles = []; // Clear now
            
            // Upload all concurrently
            finalImageUrls = await Promise.all(filesToUpload.map(f => uploadToCloudinary(f)));
            
            sendBtn.disabled = false;
            sendBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2.5"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>';
        } catch (e) {
            console.error('Album upload failed:', e);
            showToast('Failed to upload some images', 'error');
            return;
        }
    }

    input.value = '';
    input.style.height = 'auto'; // Reset height
    
    // Clear typing status immediately
    if (window.setTypingStatus) window.setTypingStatus(false);
    const isAdmin = AppState.currentUser.role === 'admin';
    const residentName = AppState.currentUser.fullName;
    
    try {
        const chatRef = window.DB.firestore.collection('CHATS').doc(currentChatConversationId);
        
        let msgType = 'text';
        if (manualAudioUrl) msgType = 'voice';
        else if (finalImageUrls.length === 1) msgType = 'image';
        else if (finalImageUrls.length > 1) msgType = 'album';

        // Add message
        await chatRef.collection('MESSAGES').add({
            senderId: AppState.currentUser.id,
            text: text,
            image: finalImageUrls.length === 1 ? finalImageUrls[0] : null,
            images: finalImageUrls.length > 1 ? finalImageUrls : null,
            audio: manualAudioUrl || null,
            type: msgType,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            isAdmin: isAdmin
        });

        // Update conversation summary
        let lastMsg = text;
        if (manualAudioUrl) lastMsg = '🎤 Voice Message';
        else if (finalImageUrls.length === 1) lastMsg = '📷 Photo';
        else if (finalImageUrls.length > 1) lastMsg = `📷 ${finalImageUrls.length} Photos`;

        const updateData = {
            lastMessage: lastMsg,
            lastMessageAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastSenderId: AppState.currentUser.id
        };
        
        if (isAdmin) {
            updateData.unreadUser = firebase.firestore.FieldValue.increment(1);
            updateData.adminAvatar = AppState.currentUser.profileImage || `https://ui-avatars.com/api/?name=Admin&background=0A7CFF&color=fff`;
        } else {
            updateData.unreadAdmin = firebase.firestore.FieldValue.increment(1);
            updateData.residentName = residentName;
            updateData.residentAvatar = AppState.currentUser.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(residentName)}&background=random`;
            updateData.userId = currentChatConversationId;
        }

        await chatRef.set(updateData, { merge: true });
        
    } catch (err) {
        console.error('Error sending msg:', err);
    }
}

// Initialize on load if logged in, or export for login hook
function toggleVoicePlayback(btn, url) {
    let audio = btn._audio;
    const progress = btn.parentElement.querySelector('.voice-progress-bar');
    const timer = btn.parentElement.querySelector('.voice-timer');

    if (!audio) {
        audio = new Audio(url);
        btn._audio = audio;
        
        audio.ontimeupdate = () => {
            if (audio.duration) {
                const perc = (audio.currentTime / audio.duration) * 100;
                progress.style.width = perc + '%';
            }
            
            const mins = Math.floor(audio.currentTime / 60);
            const secs = Math.floor(audio.currentTime % 60);
            timer.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        };
        
        audio.onended = () => {
            btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
            progress.style.width = '0%';
            timer.textContent = 'VOICE';
        };

        audio.onloadedmetadata = () => {
             const mins = Math.floor(audio.duration / 60);
             const secs = Math.floor(audio.duration % 60);
             timer.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        };
    }

    if (audio.paused) {
        document.querySelectorAll('audio').forEach(a => a.pause()); // Pause others
        audio.play();
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
    } else {
        audio.pause();
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
    }
}

window.toggleVoicePlayback = toggleVoicePlayback;
window.initChatWidget = initChatWidget;
window.submitReaction = submitReaction;
window.removeChatPreview = removeChatPreview;

// We wait 1 second for firebase to fully auth before initializing
setTimeout(() => {
    if (window.AppState && window.AppState.currentUser) {
        initChatWidget();
    }
}, 1000);

