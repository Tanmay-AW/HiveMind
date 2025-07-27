// HiveMind Editor JS - Enhanced with CodeMirror and Room Collaboration
// - Handles collaborative editor UI, AI actions, and profile
// - CodeMirror integration with syntax highlighting
// - Room-based collaboration system
// - Fixed run code functionality

console.log('🔧 Enhanced Editor.js loading...');

// Check if required dependencies are available
if (typeof CONFIG === 'undefined') {
  console.error('❌ CONFIG is not defined! Make sure config.js is loaded first.');
} else {
  console.log('✅ CONFIG loaded:', CONFIG);
}

if (typeof CodeMirror === 'undefined') {
  console.error('❌ CodeMirror is not loaded! Make sure CodeMirror scripts are included.');
} else {
  console.log('✅ CodeMirror loaded');
}

const API_BASE_URL = CONFIG?.BACKEND_URL || 'https://hivemind-backend-9u2f.onrender.com';
const token = localStorage.getItem('token');

console.log('🔑 Token status:', token ? 'Present' : 'Missing');

// Global variables
let codeEditor; // CodeMirror instance
let currentRoom = null;
let socket = null;
let collaborators = new Set();
let currentUser = null;

// DOM elements
let runBtn, aiGenBtn, aiExplainBtn, aiDebugBtn, copyOutputBtn;
let profileBtn, profileMenu, logoutBtn;
let modal, modalMsg, modalCloseBtn;
let roomModal, roomIdInput, joinRoomBtn, createRoomBtn;
let languageSelect, aiPromptContainer, aiPromptInput, aiPromptSubmit, aiPromptCancel;
let roomInfo, roomIdDisplay, copyRoomBtn, collaboratorsList, collaboratorsCount;

// Utility Functions
function requireAuthOrRedirect() {
  if (!token) {
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

function setOutput(text, isError = false) {
  const box = document.getElementById('output-box');
  if (box) {
    box.textContent = text;
    box.style.color = isError ? "var(--color-danger)" : "";
  }
}

function showModal(msg) {
  if (modal && modalMsg) {
    modalMsg.textContent = msg;
    modal.removeAttribute('hidden');
    setTimeout(() => {
      modalCloseBtn?.focus();
    }, 50);
  }
}

function hideModal() {
  if (modal) modal.setAttribute('hidden', '');
}

function setActionButtons(disabled) {
  [runBtn, aiGenBtn, aiExplainBtn, aiDebugBtn].forEach(btn => {
    if (btn) btn.disabled = disabled;
  });
}

function getSelectedLanguage() {
  return languageSelect?.value || 'javascript';
}

// Room Management Functions
function generateRoomId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'HM-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getRoomFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('room');
}

function joinRoom(roomId) {
  if (!roomId || roomId.trim() === '') {
    showModal('Please enter a valid room ID');
    return;
  }
  
  // Update URL and join room
  const newUrl = `${window.location.pathname}?room=${roomId}`;
  window.history.pushState({}, '', newUrl);
  currentRoom = roomId;
  
  // Update page title
  document.title = `HiveMind - Room ${roomId}`;
  
  // Hide room modal
  if (roomModal) roomModal.setAttribute('hidden', '');
  
  // Show room info
  displayRoomInfo(roomId);
  
  console.log(`🏠 Joined room: ${roomId}`);
  
  // Initialize WebSocket connection for room
  initializeRoomConnection(roomId);
}

function createNewRoom() {
  const roomId = generateRoomId();
  joinRoom(roomId);
}

function showRoomModal() {
  if (roomModal) {
    roomModal.removeAttribute('hidden');
    setTimeout(() => {
      roomIdInput?.focus();
    }, 50);
    document.body.style.overflow = 'hidden';
  }
}

function hideRoomModal() {
  if (roomModal) {
    roomModal.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }
}

// Room UI Functions
function displayRoomInfo(roomId) {
  if (roomInfo && roomIdDisplay) {
    roomIdDisplay.textContent = `Room: ${roomId}`;
    roomInfo.style.display = 'flex';
  }
}

function copyRoomURL() {
  const roomURL = `${window.location.origin}${window.location.pathname}?room=${currentRoom}`;
  navigator.clipboard.writeText(roomURL).then(() => {
    if (copyRoomBtn) {
      const originalText = copyRoomBtn.textContent;
      copyRoomBtn.textContent = '✅ Copied!';
      copyRoomBtn.style.background = 'rgba(0, 255, 127, 0.3)';
      setTimeout(() => {
        copyRoomBtn.textContent = originalText;
        copyRoomBtn.style.background = '';
      }, 2000);
    }
  }).catch(err => {
    console.error('Failed to copy room URL:', err);
    showModal('Failed to copy room URL');
  });
}

function updateCollaboratorsList() {
  if (collaboratorsCount) {
    collaboratorsCount.textContent = collaborators.size;
  }
}

// WebSocket/Room Connection
function initializeRoomConnection(roomId) {
  console.log(`🔌 Initializing Socket.IO connection for room: ${roomId}`);
  
  try {
    // Initialize Socket.IO connection
    socket = io(API_BASE_URL, {
      auth: {
        token: token,
        room: roomId,
        user: currentUser || localStorage.getItem('profileName') || 'Anonymous'
      }
    });

    socket.on('connect', () => {
      console.log('✅ Connected to Socket.IO server');
      socket.emit('join-room', { 
        roomId: roomId,
        user: currentUser || localStorage.getItem('profileName') || 'Anonymous'
      });
    });

    socket.on('user-joined', (data) => {
      console.log(`👤 User joined: ${data.user}`);
      collaborators.add(data.user);
      updateCollaboratorsList();
    });

    socket.on('user-left', (data) => {
      console.log(`👋 User left: ${data.user}`);
      collaborators.delete(data.user);
      updateCollaboratorsList();
    });

    socket.on('room-users', (users) => {
      console.log('👥 Room users updated:', users);
      collaborators.clear();
      users.forEach(user => collaborators.add(user));
      updateCollaboratorsList();
    });

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from Socket.IO server');
    });

    socket.on('error', (error) => {
      console.error('❌ Socket.IO error:', error);
    });

  } catch (error) {
    console.error('❌ Failed to initialize Socket.IO:', error);
    // Continue without real-time features
  }
}

// CodeMirror Initialization
function initializeCodeEditor() {
  const textArea = document.getElementById('code-editor');
  if (!textArea) {
    console.error('❌ Code editor textarea not found');
    return;
  }

  // Initialize CodeMirror
  codeEditor = CodeMirror.fromTextArea(textArea, {
    lineNumbers: true,
    mode: 'javascript',
    theme: 'material-darker',
    matchBrackets: true,
    autoCloseBrackets: true,
    indentUnit: 2,
    smartIndent: true,
    lineWrapping: true,
    foldGutter: true,
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    extraKeys: {
      'Ctrl-Enter': () => {
        if (runBtn && !runBtn.disabled) runBtn.click();
      },
      'Cmd-Enter': () => {
        if (runBtn && !runBtn.disabled) runBtn.click();
      }
    }
  });

  // Set initial content
  codeEditor.setValue('// Welcome to HiveMind!\n// Write your code here and press Ctrl+Enter to run\n\nconsole.log("Hello, HiveMind!");');

  console.log('✅ CodeMirror editor initialized');
  
  // Update mode when language changes
  if (languageSelect) {
    languageSelect.addEventListener('change', updateEditorMode);
    updateEditorMode(); // Set initial mode
  }
}

function updateEditorMode() {
  if (!codeEditor) return;
  
  const language = getSelectedLanguage();
  let mode = 'javascript';
  let placeholder = '// Write your JavaScript code here...';
  
  if (language === 'python') {
    mode = 'python';
    placeholder = '# Write your Python code here...';
  }
  
  codeEditor.setOption('mode', mode);
  
  // Update placeholder if editor is empty
  if (codeEditor.getValue().trim() === '' || 
      codeEditor.getValue().includes('Write your') ||
      codeEditor.getValue().includes('Welcome to HiveMind!')) {
    const welcomeCode = language === 'python' 
      ? '# Welcome to HiveMind!\n# Write your code here and press Ctrl+Enter to run\n\nprint("Hello, HiveMind!")'
      : '// Welcome to HiveMind!\n// Write your code here and press Ctrl+Enter to run\n\nconsole.log("Hello, HiveMind!");';
    codeEditor.setValue(welcomeCode);
  }
}

// Initialize DOM elements
function initializeElements() {
  console.log('🔍 Initializing DOM elements...');
  
  // Action buttons
  runBtn = document.getElementById('run-btn');
  aiGenBtn = document.getElementById('ai-generate-btn');
  aiExplainBtn = document.getElementById('ai-explain-btn');
  aiDebugBtn = document.getElementById('ai-debug-btn');
  copyOutputBtn = document.getElementById('copy-output-btn');
  
  // Profile elements
  profileBtn = document.getElementById('profile-btn');
  profileMenu = document.getElementById('profile-menu');
  logoutBtn = document.getElementById('logout-btn');
  
  // Modal elements
  modal = document.getElementById('modal');
  modalMsg = document.getElementById('modal-message');
  modalCloseBtn = document.getElementById('modal-close');
  
  // Room modal elements
  roomModal = document.getElementById('room-modal');
  roomIdInput = document.getElementById('room-id-input');
  joinRoomBtn = document.getElementById('join-room-btn');
  createRoomBtn = document.getElementById('create-room-btn');
  
  // Room info elements
  roomInfo = document.getElementById('room-info');
  roomIdDisplay = document.getElementById('room-id-display');
  copyRoomBtn = document.getElementById('copy-room-btn');
  collaboratorsList = document.getElementById('collaborators-list');
  collaboratorsCount = document.getElementById('collaborators-count');
  
  // Language and AI elements
  languageSelect = document.getElementById('language-select');
  aiPromptContainer = document.getElementById('ai-prompt-container');
  aiPromptInput = document.getElementById('ai-prompt-input');
  aiPromptSubmit = document.getElementById('ai-prompt-submit');
  aiPromptCancel = document.getElementById('ai-prompt-cancel');
  
  console.log('📋 Elements initialized');
}

// Setup event handlers
function setupEventHandlers() {
  console.log('🔗 Setting up event handlers...');
  
  // Modal events
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', hideModal);
  }
  
  if (modal) {
    modal.addEventListener('click', e => {
      if (e.target === modal) hideModal();
    });
    modal.addEventListener('keydown', e => {
      if (e.key === "Escape") hideModal();
    });
  }

  // Room modal events
  if (joinRoomBtn) {
    joinRoomBtn.addEventListener('click', () => {
      const roomId = roomIdInput?.value?.trim();
      if (roomId) {
        joinRoom(roomId);
      } else {
        showModal('Please enter a room ID');
      }
    });
  }
  
  if (createRoomBtn) {
    createRoomBtn.addEventListener('click', createNewRoom);
  }
  
  if (roomIdInput) {
    roomIdInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        joinRoomBtn?.click();
      }
    });
  }
  
  if (roomModal) {
    roomModal.addEventListener('keydown', e => {
      if (e.key === 'Escape') hideRoomModal();
    });
  }

  // Profile dropdown events
  if (profileBtn && profileMenu) {
    profileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      profileMenu.hidden = !profileMenu.hidden;
    });
    
    document.addEventListener('click', (e) => {
      if (!profileBtn.contains(e.target) && !profileMenu.contains(e.target)) {
        profileMenu.hidden = true;
      }
    });
  }
  
  // Logout functionality
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('profileName');
      localStorage.removeItem('profileEmail');
      localStorage.removeItem('pendingEmail');
      window.location.href = 'index.html';
    });
  }

  // Copy to clipboard
  if (copyOutputBtn) {
    copyOutputBtn.addEventListener('click', () => {
      const output = document.getElementById('output-box');
      if (output) {
        navigator.clipboard.writeText(output.textContent || '').then(() => {
          copyOutputBtn.textContent = '✔ Copied!';
          setTimeout(() => { copyOutputBtn.textContent = '📋 Copy'; }, 1200);
        }).catch(err => {
          console.error('Copy failed:', err);
          copyOutputBtn.textContent = '❌ Error';
          setTimeout(() => { copyOutputBtn.textContent = '📋 Copy'; }, 1200);
        });
      }
    });
  }

  // Action button handlers
  if (runBtn) {
    runBtn.addEventListener('click', async () => {
      console.log('🚀 Run button clicked');
      
      if (!requireAuthOrRedirect()) return;
      
      const code = codeEditor?.getValue()?.trim();
      if (!code) {
        showModal('Please write some code first');
        return;
      }
      
      setActionButtons(true);
      setOutput("⏳ Running code...");
      
      try {
        const language = getSelectedLanguage();
        const res = await fetch(`${API_BASE_URL}/api/ai/execute`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ 
            code: code,
            language: language 
          })
        });
        
        const data = await res.json();
        
        if (data.success) {
          setOutput(data.output || data.result || "Code executed successfully");
        } else {
          setOutput("❌ " + (data.error || data.message || "Code execution failed"), true);
        }
      } catch (error) {
        console.error('Run code error:', error);
        setOutput("❌ Unable to run code (server error)", true);
      }
      setActionButtons(false);
    });
  }

  if (aiGenBtn) {
    aiGenBtn.addEventListener('click', () => {
      if (!requireAuthOrRedirect()) return;
      showAIPromptInput();
    });
  }

  if (aiExplainBtn) {
    aiExplainBtn.addEventListener('click', async () => {
      if (!requireAuthOrRedirect()) return;
      
      const code = codeEditor?.getValue()?.trim();
      if (!code) {
        showModal("Please write some code first before explaining.");
        return;
      }
      
      setActionButtons(true);
      showModal("⏳ Explaining code...");
      try {
        const language = getSelectedLanguage();
        const res = await fetch(`${API_BASE_URL}/api/ai/explain`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ 
            code: code,
            language: language 
          })
        });
        const data = await res.json();
        
        if (data.success && data.explanation) {
          setOutput(data.explanation);
        } else {
          setOutput("❌ Failed to explain code: " + (data.error || "No explanation available."), true);
        }
      } catch {
        setOutput("❌ AI explanation error", true);
      }
      hideModal();
      setActionButtons(false);
    });
  }

  if (aiDebugBtn) {
    aiDebugBtn.addEventListener('click', async () => {
      if (!requireAuthOrRedirect()) return;
      
      const code = codeEditor?.getValue()?.trim();
      if (!code) {
        showModal("Please write some code first before debugging.");
        return;
      }
      
      setActionButtons(true);
      showModal("⏳ Debugging with AI...");
      try {
        const language = getSelectedLanguage();
        const res = await fetch(`${API_BASE_URL}/api/ai/debug`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ 
            code: code,
            error: "Please analyze this code for potential bugs and improvements.",
            language: language 
          })
        });
        const data = await res.json();
        
        if (data.success && data.debug_info) {
          setOutput(data.debug_info);
        } else {
          setOutput("❌ Failed to debug code: " + (data.error || "No debug result available."), true);
        }
      } catch {
        setOutput("❌ AI debugging error", true);
      }
      hideModal();
      setActionButtons(false);
    });
  }

  // AI prompt handlers
  if (aiPromptSubmit) {
    aiPromptSubmit.addEventListener('click', async () => {
      const prompt = aiPromptInput?.value?.trim();
      if (!prompt) {
        showModal('Please enter a prompt for AI code generation.');
        return;
      }
      
      setActionButtons(true);
      showModal("⏳ Generating code with AI...");
      hideAIPromptInput();
      
      try {
        const language = getSelectedLanguage();
        const res = await fetch(`${API_BASE_URL}/api/ai/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ 
            description: prompt,
            language: language 
          })
        });
        const data = await res.json();
        
        if (data.success && data.generated) {
          codeEditor.setValue(data.generated);
          setOutput("✅ Code generated successfully!");
        } else {
          setOutput("❌ Failed to generate code: " + (data.error || "No code generated."), true);
        }
      } catch {
        setOutput("❌ AI generation error", true);
      }
      hideModal();
      setActionButtons(false);
    });
  }

  if (aiPromptCancel) {
    aiPromptCancel.addEventListener('click', hideAIPromptInput);
  }

  // Copy room URL handler
  if (copyRoomBtn) {
    copyRoomBtn.addEventListener('click', copyRoomURL);
  }
  
  console.log('✅ Event handlers set up');
}

// AI Prompt Functions
function showAIPromptInput() {
  if (aiPromptContainer) {
    aiPromptContainer.style.display = 'flex';
    aiPromptInput?.focus();
  }
}

function hideAIPromptInput() {
  if (aiPromptContainer) {
    aiPromptContainer.style.display = 'none';
    if (aiPromptInput) aiPromptInput.value = '';
  }
}

// Initialize profile information
async function initializeProfile() {
  if (window.authCheckInProgress) return;
  window.authCheckInProgress = true;
  
  console.log('👤 Initializing profile...');
  
  if (!requireAuthOrRedirect()) return;
  setOutput("");
  
  // Load profile information from localStorage
  const profileName = localStorage.getItem('profileName');
  const profileEmail = localStorage.getItem('profileEmail');
  currentUser = profileName || 'Anonymous';
  
  // Update profile display
  const profileNameEl = document.getElementById('profile-name');
  const profileEmailEl = document.getElementById('profile-email');
  const userInitialsEl = document.getElementById('user-initials');
  
  if (profileNameEl && profileName) profileNameEl.textContent = profileName;
  if (profileEmailEl && profileEmail) profileEmailEl.textContent = profileEmail;
  if (userInitialsEl && profileName) {
    userInitialsEl.textContent = profileName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
  
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      localStorage.removeItem('token');
      localStorage.removeItem('profileName');
      localStorage.removeItem('profileEmail');
      window.location.href = 'index.html';
    }
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('profileName');
    localStorage.removeItem('profileEmail');
    window.location.href = 'index.html';
  }
  
  setTimeout(() => {
    window.authCheckInProgress = false;
  }, 1000);
}

// Main initialization
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Enhanced Editor initializing...');
  
  // Initialize elements
  initializeElements();
  
  // Setup event handlers
  setupEventHandlers();
  
  // Initialize profile
  await initializeProfile();
  
  // Initialize CodeMirror editor
  initializeCodeEditor();
  
  // Check for room in URL
  const roomFromURL = getRoomFromURL();
  if (roomFromURL) {
    // Join existing room
    joinRoom(roomFromURL);
  } else {
    // Show room selection modal
    showRoomModal();
  }
  
  console.log('✅ Enhanced Editor initialized successfully');
});
