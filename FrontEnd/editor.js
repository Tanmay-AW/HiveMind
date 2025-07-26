// HiveMind Editor JS
// - Handles collaborative editor UI, AI actions, and profile
// - Robust error handling, accessibility, keyboard shortcuts
// - Maintainers: See comments for logic explanations

const API_BASE_URL = CONFIG.BACKEND_URL;
const token = localStorage.getItem('token');

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
  const modal = document.getElementById('modal');
  const modalMsg = document.getElementById('modal-message');
  if (modal && modalMsg) {
    modalMsg.textContent = msg;
    modal.removeAttribute('hidden');
    setTimeout(() => {
      modal.querySelector('button')?.focus();
    }, 50);
  }
}
function hideModal() {
  const modal = document.getElementById('modal');
  if (modal) modal.setAttribute('hidden', '');
}

// Modal close events (must be set after DOM is loaded)
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('modal');
  if (modal) {
    const closeBtn = modal.querySelector('#modal-close');
    const modalContent = modal.querySelector('.modal-content');
    if (closeBtn) closeBtn.addEventListener('click', hideModal);
    modal.addEventListener('click', e => {
      if (e.target === modal) hideModal();
    });
    if (modalContent) modalContent.addEventListener('keydown', e => {
      if (e.key === "Escape") hideModal();
    });
  }
});

// Welcome Modal logic
function showWelcomeModal() {
  const welcomeModal = document.getElementById('welcome-modal');
  if (welcomeModal) {
    welcomeModal.removeAttribute('hidden');
    setTimeout(() => {
      welcomeModal.querySelector('button, .cta')?.focus();
    }, 50);
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  }
}
function hideWelcomeModal() {
  const welcomeModal = document.getElementById('welcome-modal');
  if (welcomeModal) {
    welcomeModal.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }
}
document.addEventListener('DOMContentLoaded', () => {
  // Show welcome modal on first load
  showWelcomeModal();
  // Handle continue button
  const continueBtn = document.getElementById('continue-to-editor');
  if (continueBtn) {
    continueBtn.addEventListener('click', hideWelcomeModal);
  }
  // Allow closing with Escape key
  const welcomeModal = document.getElementById('welcome-modal');
  if (welcomeModal) {
    welcomeModal.addEventListener('keydown', e => {
      if (e.key === 'Escape') hideWelcomeModal();
    });
  }
});

// Profile dropdown session check on load
document.addEventListener('DOMContentLoaded', async () => {
  // Prevent multiple redirects
  if (window.authCheckInProgress) return;
  window.authCheckInProgress = true;
  
  if (!requireAuthOrRedirect()) return;
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
  
  // Setup profile menu toggle
  const profileBtn = document.getElementById('profile-btn');
  const profileMenu = document.getElementById('profile-menu');
  
  if (profileBtn && profileMenu) {
    profileBtn.addEventListener('click', () => {
      profileMenu.hidden = !profileMenu.hidden;
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!profileBtn.contains(e.target) && !profileMenu.contains(e.target)) {
        profileMenu.hidden = true;
      }
    });
  }
  
  // Setup logout functionality
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('profileName');
      localStorage.removeItem('profileEmail');
      localStorage.removeItem('pendingEmail');
      window.location.href = 'index.html';
    });
  }
  
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
  
  // Reset the flag after a delay
  setTimeout(() => {
    window.authCheckInProgress = false;
  }, 1000);
});

// --- Action Buttons ---
const runBtn = document.getElementById('run-btn');
const aiGenBtn = document.getElementById('ai-generate-btn');
const aiExplainBtn = document.getElementById('ai-explain-btn');
const aiDebugBtn = document.getElementById('ai-debug-btn');
const codeEditor = document.getElementById('code-editor');
const copyOutputBtn = document.getElementById('copy-output-btn');

// Utility to disable/enable buttons as a group
function setActionButtons(disabled) {
  [runBtn, aiGenBtn, aiExplainBtn, aiDebugBtn].forEach(btn =>
    btn && (btn.disabled = disabled)
  );
}

// --- Copy to Clipboard Feature ---
if (copyOutputBtn) {
  copyOutputBtn.onclick = () => {
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
  };
}

// --- Keyboard Shortcut: Ctrl+Enter to Run Code ---
if (codeEditor) {
  codeEditor.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (runBtn && !runBtn.disabled) runBtn.click();
    }
  });
}

// RUN CODE
if (runBtn) runBtn.onclick = async () => {
  if (!requireAuthOrRedirect()) return;
  setActionButtons(true);
  setOutput("⏳ Running...");
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
};

// GENERATE CODE
if (aiGenBtn) aiGenBtn.onclick = async () => {
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
};

// EXPLAIN CODE
if (aiExplainBtn) aiExplainBtn.onclick = async () => {
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
};

// DEBUG CODE
if (aiDebugBtn) aiDebugBtn.onclick = async () => {
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
};
