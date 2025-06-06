document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
        // Redirect to home if already logged in (except if on admin page)
        if (!window.location.pathname.includes('admin.html')) {
            window.location.href = 'index.html';
        }
    }

    // Handle login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }

    // Handle registration form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleRegistration();
        });
    }
});

// Login function
function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');
    
    // Basic validation
    if (!email || !password) {
        errorMessage.textContent = 'Por favor, preencha todos os campos.';
        return;
    }
    
    // In a real app, you would make an API call to your server
    // For this demo, we'll simulate authentication with localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Generate a simple token (in real app, this would be from the server)
        const token = 'sim_token_' + Math.random().toString(36).substr(2, 9);
        
        // Save auth info
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({
            id: user.id,
            name: user.username,
            email: user.email,
            isAdmin: user.isAdmin || false
        }));
        
        // Redirect based on user role
        if (user.isAdmin) {
            window.location.href = 'admin.html';
        } else {
            // Check if there was a therapy selected before login
            const selectedTherapy = localStorage.getItem('selectedTherapy');
            if (selectedTherapy) {
                window.location.href = `appointment.html?therapy=${selectedTherapy}`;
            } else {
                window.location.href = 'index.html';
            }
        }
    } else {
        errorMessage.textContent = 'Email ou senha inválidos.';
    }
}

// Registration function
function handleRegistration() {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const birthdate = document.getElementById('birthdate').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorMessage = document.getElementById('error-message');
    
    // Basic validation
    if (!username || !email || !phone || !birthdate || !password) {
        errorMessage.textContent = 'Por favor, preencha todos os campos obrigatórios.';
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errorMessage.textContent = 'Por favor, insira um email válido.';
        return;
    }
    
    // Validate phone format (after mask is applied)
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
        errorMessage.textContent = 'Por favor, insira um telefone válido.';
        return;
    }
    
    // Validate password (minimum 6 characters)
    if (password.length < 6) {
        errorMessage.textContent = 'A senha deve ter pelo menos 6 caracteres.';
        return;
    }
    
    if (password !== confirmPassword) {
        errorMessage.textContent = 'As senhas não correspondem.';
        return;
    }
    
    // In a real app, you would make an API call to your server
    // For this demo, we'll simulate registration with localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check if email already exists
    if (users.some(user => user.email === email)) {
        errorMessage.textContent = 'Este email já está registrado.';
        return;
    }
    
    // Handle photo upload
    const photoInput = document.getElementById('photo');
    let photoUrl = '';
    
    if (photoInput && photoInput.files && photoInput.files[0]) {
        // In a real app, you would upload this to your server
        // For this demo, we'll just store a placeholder
        photoUrl = 'user_profile.png';
    }
      // Create user object
    const newUser = {
        id: Date.now().toString(),
        username,
        email,
        phone,
        birthdate,
        photo: photoUrl,
        password,
        isAdmin: false
    };
    
    // Save user
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Auto login after registration
    localStorage.setItem('token', 'sim_token_' + Math.random().toString(36).substr(2, 9));
    localStorage.setItem('user', JSON.stringify({
        id: newUser.id,
        name: newUser.username,
        email: newUser.email,
        isAdmin: newUser.isAdmin
    }));
    
    // Check if there was a therapy selected before registration
    const selectedTherapy = localStorage.getItem('selectedTherapy');
    if (selectedTherapy) {
        window.location.href = `appointment.html?therapy=${selectedTherapy}`;
    } else {
        window.location.href = 'index.html';
    }
}

// Add admin user if none exists (for demo purposes)
(function seedAdmin() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check if admin exists
    if (!users.some(user => user.isAdmin)) {
        users.push({
            id: 'admin-' + Date.now().toString(),
            username: 'Admin',
            email: 'admin@florescer.com',
            phone: '123456789',
            birthdate: '1990-01-01',
            photo: '',
            password: 'admin123',
            isAdmin: true
        });
        localStorage.setItem('users', JSON.stringify(users));
    }
})();