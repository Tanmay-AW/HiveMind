document.addEventListener('DOMContentLoaded', () => {

    const API_BASE_URL = CONFIG.BACKEND_URL;

    // --- Authentication State Check ---
    const checkAuthState = async () => {
        console.log('🔍 Checking authentication state...');
        const token = localStorage.getItem('token');
        const profileName = localStorage.getItem('profileName');
        const profileEmail = localStorage.getItem('profileEmail');
        
        console.log('📋 Stored data:', { 
            hasToken: !!token, 
            hasName: !!profileName, 
            hasEmail: !!profileEmail 
        });
        
        if (token && profileName && profileEmail) {
            try {
                console.log('🔐 Validating token with backend...');
                // Validate token with backend
                const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                console.log('📊 Token validation response:', res.status);
                
                if (res.ok) {
                    // Token is valid - redirect to app
                    console.log('✅ Token valid, redirecting to app...');
                    window.location.href = 'app.html';
                    return true;
                } else {
                    // Token is invalid - clear localStorage
                    console.log('❌ Token invalid, clearing localStorage...');
                    localStorage.removeItem('token');
                    localStorage.removeItem('profileName');
                    localStorage.removeItem('profileEmail');
                    return false;
                }
            } catch (error) {
                // Network error - clear localStorage to be safe
                console.log('❌ Network error, clearing localStorage...');
                localStorage.removeItem('token');
                localStorage.removeItem('profileName');
                localStorage.removeItem('profileEmail');
                return false;
            }
        } else {
            console.log('❌ No stored authentication data found');
        }
        return false;
    };

    // Initialize the page after authentication check
    const initializePage = () => {
        // --- Element Selectors ---
        const loginModal = document.getElementById('login-modal');
        const signupModal = document.getElementById('signup-modal');
        const otpModal = document.getElementById('otp-modal');
        const loginTriggerBtn = document.getElementById('login-trigger-btn');
        const signupTriggerBtn = document.getElementById('signup-trigger-btn');
        const launchBtn = document.getElementById('launch-hivemind-btn');

    // --- Modal Handling ---
    const showModal = (modal) => { if (modal) modal.removeAttribute('hidden'); };
    const closeModal = (modal) => { if (modal) modal.setAttribute('hidden', ''); };

    document.querySelectorAll('.modal-close-x').forEach(btn => {
        btn.addEventListener('click', () => closeModal(btn.closest('.modal')));
    });

    if(loginTriggerBtn) loginTriggerBtn.addEventListener('click', () => showModal(loginModal));
    if(signupTriggerBtn) signupTriggerBtn.addEventListener('click', () => showModal(signupModal));
    
    if(launchBtn) launchBtn.addEventListener('click', () => {
        if (localStorage.getItem('token')) {
            window.location.href = 'app.html';
        } else {
            showModal(loginModal);
        }
    });

    const openSignupLink = document.getElementById('open-signup-from-login');
    const openLoginLink = document.getElementById('open-login-from-signup');
    if(openSignupLink) openSignupLink.addEventListener('click', (e) => { e.preventDefault(); closeModal(loginModal); showModal(signupModal); });
    if(openLoginLink) openLoginLink.addEventListener('click', (e) => { e.preventDefault(); closeModal(signupModal); showModal(loginModal); });
    
    // --- Toast Notification ---
    const showToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => { if (document.body.contains(toast)) document.body.removeChild(toast); }, 500);
        }, 3000);
    };

    // --- Password Toggle Logic ---
    document.querySelectorAll('.password-toggle').forEach(toggle => {
      toggle.addEventListener('click', () => {
        const wrapper = toggle.closest('.password-wrapper');
        const input = wrapper.querySelector('input');
        if (!input) return;
        if (input.type === 'password') {
          input.type = 'text';
          toggle.textContent = '🙈';
        } else {
          input.type = 'password';
          toggle.textContent = '👁️';
        }
      });
    });

    // --- Form Logic (Login) ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        const email = document.getElementById('login-email');
        const password = document.getElementById('login-password');
        const formError = document.getElementById('login-formError');
        const loginBtn = document.getElementById('loginBtn');
        
        loginForm.addEventListener('submit', async e => {
            e.preventDefault();
            console.log('🔐 Login attempt started...');
            loginBtn.disabled = true;
            loginBtn.textContent = "Logging in...";
            formError.textContent = ""; // Clear previous errors
            try {
                console.log('📡 Sending login request to:', `${API_BASE_URL}/api/auth/login`);
                const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email.value.trim(), password: password.value })
                });
                const data = await res.json();
                console.log('📊 Login response:', { status: res.status, data });
                
                if (!res.ok) throw new Error(data.message || "Login failed.");
                
                console.log('✅ Login successful, storing data...');
                localStorage.setItem('token', data.token);
                localStorage.setItem('profileName', data.name);
                localStorage.setItem('profileEmail', data.email);
                console.log('🚀 Redirecting to app.html...');
                window.location.href = "app.html";
            } catch (error) {
                formError.textContent = error.message;
                
                // If it's an unverified email error, show helpful message
                if (error.message.includes('verify your email')) {
                    formError.innerHTML = `${error.message}<br><small>💡 <a href="#" id="resend-verification" style="color: var(--color-accent);">Resend verification email</a></small>`;
                    
                    // Add resend verification functionality
                    const resendLink = document.getElementById('resend-verification');
                    if (resendLink) {
                        resendLink.addEventListener('click', async (e) => {
                            e.preventDefault();
                            try {
                                const resendRes = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ email: email.value.trim() })
                                });
                                const resendData = await resendRes.json();
                                if (resendRes.ok) {
                                    showToast('Verification email sent! Check your inbox.', 'success');
                                } else {
                                    showToast(resendData.message || 'Failed to resend email', 'error');
                                }
                            } catch (resendError) {
                                showToast('Failed to resend verification email', 'error');
                            }
                        });
                    }
                }
            } finally {
                loginBtn.disabled = false;
                loginBtn.textContent = "Login";
            }
        });
        const validateLogin = () => { loginBtn.disabled = !(email.value && password.value); };
        email.addEventListener('input', validateLogin);
        password.addEventListener('input', validateLogin);
    }
    
    // --- Signup Form ---
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        const name = document.getElementById('signup-name');
        const email = document.getElementById('signup-email');
        const password = document.getElementById('signup-password');
        const formError = document.getElementById('signup-formError');
        const signupBtn = document.getElementById('signupBtn');
        const strengthFill = signupForm.querySelector('.strength-fill');
        const strengthText = signupForm.querySelector('.strength-text');

        const passwordStrength = (pw) => {
            let score = 0;
            if (pw.length >= 8) score++;
            if (/[A-Z]/.test(pw)) score++;
            if (/[0-9]/.test(pw)) score++;
            if (/[^A-Za-z0-9]/.test(pw)) score++;
            return score;
        };

        const updateStrength = () => {
            const pw = password.value;
            const score = passwordStrength(pw);
            let percent = (score / 4) * 100;
            let label = 'Weak', color = 'var(--danger)';
            if (score === 4) { label = 'Strong'; color = 'var(--color-accent)'; }
            else if (score === 3) { label = 'Medium'; color = '#ffc400'; }
            else if (score <= 1) { percent = 20; }
            if (strengthFill) {
                strengthFill.style.width = percent + "%";
                strengthFill.style.backgroundColor = color;
            }
            if (strengthText) {
                strengthText.textContent = label;
                strengthText.style.color = color;
            }
        };

        signupForm.addEventListener('submit', async e => {
            e.preventDefault();
            signupBtn.disabled = true;
            signupBtn.textContent = "Signing up...";
            try {
                const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: name.value.trim(), email: email.value.trim(), password: password.value })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Signup failed.");

                localStorage.setItem('pendingEmail', email.value.trim());
                closeModal(signupModal);
                showModal(otpModal);
                showToast(data.message);
            } catch (error) {
                formError.textContent = error.message;
            } finally {
                signupBtn.disabled = false;
                signupBtn.textContent = "Create Account";
            }
        });
        
        const validateSignup = () => { signupBtn.disabled = !(name.value && email.value && password.value && passwordStrength(password.value) >= 3); };
        name.addEventListener('input', validateSignup);
        email.addEventListener('input', validateSignup);
        password.addEventListener('input', () => {
            updateStrength();
            validateSignup();
        });
    }

    // --- OTP Form ---
    const otpForm = document.getElementById('otpForm');
    if (otpForm) {
        const otpCode = document.getElementById('otpCode');
        const formError = document.getElementById('otp-formError');
        const verifyBtn = document.getElementById('verifyBtn');
        
        otpForm.addEventListener('submit', async e => {
            e.preventDefault();
            verifyBtn.disabled = true;
            verifyBtn.textContent = "Verifying...";
            const email = localStorage.getItem('pendingEmail');
            try {
                const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, otp: otpCode.value })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Invalid OTP.");

                localStorage.setItem('token', data.token);
                localStorage.setItem('profileName', data.name);
                localStorage.setItem('profileEmail', data.email);
                localStorage.removeItem('pendingEmail');
                window.location.href = "app.html";
            } catch (error) {
                formError.textContent = error.message;
            } finally {
                verifyBtn.disabled = false;
                verifyBtn.textContent = "Verify";
            }
        });
        otpCode.addEventListener('input', () => { verifyBtn.disabled = !(otpCode.value.length === 6); });
    }

    // --- Resend OTP Functionality ---
    const resendOtpBtn = document.getElementById('resendOtp');
    if (resendOtpBtn) {
        resendOtpBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const email = localStorage.getItem('pendingEmail');
            if (!email) {
                showToast('No pending email found. Please sign up again.', 'error');
                return;
            }
            
            resendOtpBtn.disabled = true;
            resendOtpBtn.textContent = 'Sending...';
            
            try {
                const res = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                const data = await res.json();
                
                if (res.ok) {
                    showToast('OTP resent successfully!', 'success');
                } else {
                    throw new Error(data.message || 'Failed to resend OTP');
                }
            } catch (error) {
                showToast(error.message, 'error');
            } finally {
                resendOtpBtn.disabled = false;
                resendOtpBtn.textContent = 'Resend OTP';
            }
        });
    }

    // --- Scroll Animation & Smooth Scroll ---
    const sections = document.querySelectorAll('.fade-in-section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('is-visible');
        });
    }, { threshold: 0.1 });
    sections.forEach(section => observer.observe(section));

    document.querySelectorAll('[data-scroll]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });
    };

    // Check authentication state on page load and initialize
    checkAuthState().then(isAuthenticated => {
        if (!isAuthenticated) {
            initializePage();
        }
    });
});