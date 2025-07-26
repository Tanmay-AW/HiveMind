// HiveMind Editor JS
// - Handles collaborative editor UI, AI actions, and profile
// - Robust error handling, accessibility, keyboard shortcuts
// - Maintainers: See comments for logic explanations

console.log('🔧 Editor.js loading...');

// Check if CONFIG is available
if (typeof CONFIG === 'undefined') {
  console.error('❌ CONFIG is not defined! Make sure config.js is loaded first.');
} else {
  console.log('✅ CONFIG loaded:', CONFIG);
}

const API_BASE_URL = CONFIG?.BACKEND_URL || 'https://hivemind-backend-9u2f.onrender.com';
const token = localStorage.getItem('token');

console.log('🔑 Token status:', token ? 'Present' : 'Missing');

// Global variables for DOM elements
let runBtn, aiGenBtn, aiExplainBtn, aiDebugBtn, codeEditor, copyOutputBtn;
let profileBtn, profileMenu, logoutBtn;
let modal, modalMsg, modalCloseBtn;
let welcomeModal, continueBtn;

// Helpers
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
    box.style.color = isError ? "var(--danger)" : "";
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

// Welcome Modal logic
function showWelcomeModal() {
  if (welcomeModal) {
    welcomeModal.removeAttribute('hidden');
    setTimeout(() => {
      continueBtn?.focus();
    }, 50);
    document.body.style.overflow = 'hidden';
  }
}

function hideWelcomeModal() {
  if (welcomeModal) {
    welcomeModal.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }
}

// Utility to disable/enable buttons as a group
function setActionButtons(disabled) {
  [runBtn, aiGenBtn, aiExplainBtn, aiDebugBtn].forEach(btn => {
    if (btn) btn.disabled = disabled;
  });
}

// Initialize DOM elements and event handlers
function initializeElements() {
  console.log('🔍 Initializing DOM elements...');
  
  // Get DOM elements
  runBtn = document.getElementById('run-btn');
  aiGenBtn = document.getElementById('ai-generate-btn');
  aiExplainBtn = document.getElementById('ai-explain-btn');
  aiDebugBtn = document.getElementById('ai-debug-btn');
  codeEditor = document.getElementById('code-editor');
  copyOutputBtn = document.getElementById('copy-output-btn');
  
  profileBtn = document.getElementById('profile-btn');
  profileMenu = document.getElementById('profile-menu');
  logoutBtn = document.getElementById('logout-btn');
  
  modal = document.getElementById('modal');
  modalMsg = document.getElementById('modal-message');
  modalCloseBtn = document.getElementById('modal-close');
  
  welcomeModal = document.getElementById('welcome-modal');
  continueBtn = document.getElementById('continue-to-editor');
  
  // Log element status
  console.log('📋 Element status:', {
    runBtn: !!runBtn,
    aiGenBtn: !!aiGenBtn,
    aiExplainBtn: !!aiExplainBtn,
    aiDebugBtn: !!aiDebugBtn,
    codeEditor: !!codeEditor,
    profileBtn: !!profileBtn,
    profileMenu: !!profileMenu,
    logoutBtn: !!logoutBtn,
    modal: !!modal,
    welcomeModal: !!welcomeModal
  });
}

// Setup all event handlers
function setupEventHandlers() {
  console.log('🔗 Setting up event handlers...');
  
  // Modal events
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', hideModal);
    console.log('✅ Modal close button event handler attached');
  } else {
    console.warn('⚠️ Modal close button not found');
  }
  
  if (modal) {
    modal.addEventListener('click', e => {
      if (e.target === modal) hideModal();
    });
    modal.addEventListener('keydown', e => {
      if (e.key === "Escape") hideModal();
    });
  }

  // Welcome modal events
  if (continueBtn) {
    continueBtn.addEventListener('click', hideWelcomeModal);
  }
  
  if (welcomeModal) {
    welcomeModal.addEventListener('keydown', e => {
      if (e.key === 'Escape') hideWelcomeModal();
    });
  }

  // Profile dropdown events
  if (profileBtn && profileMenu) {
    console.log('✅ Attaching Profile button event handler');
    profileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      profileMenu.hidden = !profileMenu.hidden;
      console.log('🔄 Profile menu toggled:', !profileMenu.hidden ? 'open' : 'closed');
    });
    
    // Close menu when clicking outside
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

  // Keyboard shortcut: Ctrl+Enter to run code
  if (codeEditor) {
    codeEditor.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (runBtn && !runBtn.disabled) runBtn.click();
      }
    });
  }

  // Action button handlers
  if (runBtn) {
    console.log('✅ Attaching Run button event handler');
    runBtn.addEventListener('click', async () => {
      console.log('🚀 Run button clicked');
      
      if (!window.location.pathname.includes('test.html') && !requireAuthOrRedirect()) return;
      
      setActionButtons(true);
      setOutput("⏳ Running...");
      
      // In test mode, simulate code execution
      if (window.location.pathname.includes('test.html')) {
        setTimeout(() => {
          setOutput("✅ Test output: Your code would run here!");
          setActionButtons(false);
        }, 1000);
        return;
      }
      
      try {
        const res = await fetch(`${API_BASE_URL}/api/ai/run`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ code: codeEditor.value })
        });
        const data = await res.json();
        setOutput(data.output ?? data.message ?? "No output.");
      } catch {
        setOutput("❌ Unable to run code (server error)", true);
      }
      setActionButtons(false);
    });
  }

  if (aiGenBtn) {
    console.log('✅ Attaching Generate button event handler');
    aiGenBtn.addEventListener('click', async () => {
      if (!requireAuthOrRedirect()) return;
      setActionButtons(true);
      showModal("⏳ Generating code with AI...");
      try {
        const res = await fetch(`${API_BASE_URL}/api/ai/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ prompt: codeEditor.value })
        });
        const data = await res.json();
        codeEditor.value = data.generated ?? "";
        setOutput("✅ Code generated.");
      } catch {
        setOutput("❌ AI generation error", true);
      }
      hideModal();
      setActionButtons(false);
    });
  }

  if (aiExplainBtn) {
    aiExplainBtn.addEventListener('click', async () => {
      if (!requireAuthOrRedirect()) return;
      setActionButtons(true);
      showModal("⏳ Explaining code...");
      try {
        const res = await fetch(`${API_BASE_URL}/api/ai/explain`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ code: codeEditor.value })
        });
        const data = await res.json();
        setOutput(data.explanation ?? "No explanation available.");
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
      setActionButtons(true);
      showModal("⏳ Debugging with AI...");
      try {
        const res = await fetch(`${API_BASE_URL}/api/ai/debug`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ code: codeEditor.value })
        });
        const data = await res.json();
        setOutput(data.debugged ?? data.message ?? "No debug result.");
      } catch {
        setOutput("❌ AI debugging error", true);
      }
      hideModal();
      setActionButtons(false);
    });
  }
}

// Initialize profile information
async function initializeProfile() {
  // Prevent multiple redirects
  if (window.authCheckInProgress) return;
  window.authCheckInProgress = true;
  
  console.log('👤 Initializing profile...');
  
  // Skip auth check if this is a test environment
  if (window.location.pathname.includes('test.html')) {
    console.log('🧪 Test mode detected, skipping auth check');
  } else {
    if (!requireAuthOrRedirect()) return;
  }
  setOutput("");
  
  // Load profile information from localStorage
  const profileName = localStorage.getItem('profileName');
  const profileEmail = localStorage.getItem('profileEmail');
  
  // Update profile display
  const profileNameEl = document.getElementById('profile-name');
  const profileEmailEl = document.getElementById('profile-email');
  const userInitialsEl = document.getElementById('user-initials');
  
  if (profileNameEl && profileName) profileNameEl.textContent = profileName;
  if (profileEmailEl && profileEmail) profileEmailEl.textContent = profileEmail;
  if (userInitialsEl && profileName) {
    userInitialsEl.textContent = profileName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
  
  // Skip API validation in test mode
  if (!window.location.pathname.includes('test.html')) {
    try {
      // Validate token by fetching profile
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
  } else {
    console.log('🧪 Skipping API validation in test mode');
  }
  
  // Reset the flag after a delay
  setTimeout(() => {
    window.authCheckInProgress = false;
  }, 1000);
}

// Main initialization function
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Editor initializing...');
  
  // Initialize DOM elements
  initializeElements();
  
  // Setup event handlers
  setupEventHandlers();
  
  // Initialize profile
  await initializeProfile();
  
  // Show welcome modal
  showWelcomeModal();
  
  console.log('✅ Editor initialized successfully');
});