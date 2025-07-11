// Data Storage
let users = [];
let posts = [];
let currentUser = null;

// Default admin user
const defaultAdmin = {
    id: 'admin-1',
    username: 'Lukha',
    email: 'lukha@fsociety.com',
    password: 'ahmetdurden1',
    avatar: 'https://images.unsplash.com/photo-1616582607004-eba71ce01e07?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwxfHxtYXNrZWQlMjBwb3J0cmFpdHxlbnwwfHx8YmxhY2tfYW5kX3doaXRlfDE3NTIyNDQ2MDl8MA&ixlib=rb-4.1.0&q=85',
    createdAt: new Date().toISOString(),
    isAdmin: true
};

// Mr. Robot quotes in Turkish
const quotes = [
    "Kontrol bir yanılsama.",
    "Güç halka aittir.",
    "Sistem bozuldu.",
    "Biz fsociety'iz.",
    "Merhaba, dostum.",
    "Dünya tehlikeli bir yer.",
    "Anonim bir organizasyon değil.",
    "Devrim televizyona çıkmayacak.",
    "Gerçek sen olduğun kişi.",
    "Toplum seni yargılar.",
    "Sistem seni kontrol ediyor.",
    "Özgürlük mücadelesi başladı."
];

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Load data from localStorage
    loadData();
    
    // Initialize Matrix rain
    initializeMatrixRain();
    
    // Initialize quote display
    initializeQuoteDisplay();
    
    // Show loading screen
    showLoading();
    
    // Check if user is logged in
    setTimeout(() => {
        hideLoading();
        checkAuthStatus();
    }, 2000);
    
    // Setup event listeners
    setupEventListeners();
}

function loadData() {
    // Load users from localStorage
    const savedUsers = localStorage.getItem('fsociety-users');
    if (savedUsers) {
        users = JSON.parse(savedUsers);
    }
    
    // Add default admin if not exists
    if (!users.find(u => u.username === 'Lukha')) {
        users.push(defaultAdmin);
        saveUsers();
    }
    
    // Load posts from localStorage
    const savedPosts = localStorage.getItem('fsociety-posts');
    if (savedPosts) {
        posts = JSON.parse(savedPosts);
    }
    
    // Load current user session
    const savedSession = localStorage.getItem('fsociety-session');
    if (savedSession) {
        const session = JSON.parse(savedSession);
        currentUser = users.find(u => u.id === session.userId);
    }
}

function saveUsers() {
    localStorage.setItem('fsociety-users', JSON.stringify(users));
}

function savePosts() {
    localStorage.setItem('fsociety-posts', JSON.stringify(posts));
}

function saveSession(user) {
    localStorage.setItem('fsociety-session', JSON.stringify({ userId: user.id }));
}

function clearSession() {
    localStorage.removeItem('fsociety-session');
}

function checkAuthStatus() {
    if (currentUser) {
        showDashboard();
    } else {
        showAuthScreen();
    }
}

function showLoading() {
    document.getElementById('loading-screen').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading-screen').style.display = 'none';
}

function showAuthScreen() {
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('dashboard').style.display = 'none';
}

function showDashboard() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    
    // Update user info
    document.getElementById('user-avatar').src = currentUser.avatar;
    document.getElementById('user-name').textContent = currentUser.username;
    
    if (currentUser.isAdmin) {
        document.getElementById('admin-badge').style.display = 'inline-block';
    }
    
    // Load posts
    loadPosts();
    
    // Animate logo
    setTimeout(() => {
        document.querySelector('.fsociety-logo').classList.add('animate');
    }, 500);
}

function setupEventListeners() {
    // Auth tabs
    document.getElementById('login-tab').addEventListener('click', () => switchTab('login'));
    document.getElementById('register-tab').addEventListener('click', () => switchTab('register'));
    
    // Forms
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    document.getElementById('create-post-form').addEventListener('submit', handleCreatePost);
    document.getElementById('new-user-form').addEventListener('submit', handleNewUser);
    
    // Buttons
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    document.getElementById('create-post-btn').addEventListener('click', toggleCreatePost);
    document.getElementById('new-user-btn').addEventListener('click', toggleNewUser);
    
    // Terminal input focus effects
    document.querySelectorAll('.terminal-field').forEach(field => {
        field.addEventListener('focus', (e) => {
            e.target.parentElement.classList.add('focused');
        });
        
        field.addEventListener('blur', (e) => {
            e.target.parentElement.classList.remove('focused');
        });
    });
}

function switchTab(tab) {
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (tab === 'login') {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.style.display = 'block';
        loginForm.style.display = 'none';
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    
    // Clear previous errors
    errorDiv.style.display = 'none';
    
    // Find user
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        saveSession(user);
        showDashboard();
    } else {
        errorDiv.textContent = 'Geçersiz kullanıcı bilgileri';
        errorDiv.style.display = 'block';
    }
}

function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const errorDiv = document.getElementById('register-error');
    
    // Clear previous errors
    errorDiv.style.display = 'none';
    
    // Check if user exists
    if (users.find(u => u.username === username || u.email === email)) {
        errorDiv.textContent = 'Kullanıcı adı veya email zaten mevcut';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Create new user
    const newUser = {
        id: 'user-' + Date.now(),
        username,
        email,
        password,
        avatar: 'https://images.unsplash.com/photo-1616582607004-eba71ce01e07?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwxfHxtYXNrZWQlMjBwb3J0cmFpdHxlbnwwfHx8YmxhY2tfYW5kX3doaXRlfDE3NTIyNDQ2MDl8MA&ixlib=rb-4.1.0&q=85',
        createdAt: new Date().toISOString(),
        isAdmin: false
    };
    
    users.push(newUser);
    saveUsers();
    
    // Auto login
    currentUser = newUser;
    saveSession(newUser);
    showDashboard();
}

function handleLogout() {
    currentUser = null;
    clearSession();
    showAuthScreen();
}

function toggleCreatePost() {
    const form = document.getElementById('create-post-form');
    const newUserForm = document.getElementById('new-user-form');
    
    // Hide new user form
    newUserForm.style.display = 'none';
    
    // Toggle create post form
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function toggleNewUser() {
    const form = document.getElementById('new-user-form');
    const createPostForm = document.getElementById('create-post-form');
    
    // Hide create post form
    createPostForm.style.display = 'none';
    
    // Toggle new user form
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function handleCreatePost(e) {
    e.preventDefault();
    
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    
    if (!title || !content) return;
    
    const newPost = {
        id: 'post-' + Date.now(),
        title,
        content,
        authorId: currentUser.id,
        authorUsername: currentUser.username,
        authorAvatar: currentUser.avatar,
        createdAt: new Date().toISOString(),
        comments: []
    };
    
    posts.unshift(newPost);
    savePosts();
    
    // Clear form
    document.getElementById('post-title').value = '';
    document.getElementById('post-content').value = '';
    document.getElementById('create-post-form').style.display = 'none';
    
    // Reload posts
    loadPosts();
}

function handleNewUser(e) {
    e.preventDefault();
    
    const username = document.getElementById('new-username').value;
    const email = document.getElementById('new-email').value;
    const password = document.getElementById('new-password').value;
    
    if (!username || !email || !password) return;
    
    // Check if user exists
    if (users.find(u => u.username === username || u.email === email)) {
        alert('Kullanıcı adı veya email zaten mevcut');
        return;
    }
    
    // Create new user
    const newUser = {
        id: 'user-' + Date.now(),
        username,
        email,
        password,
        avatar: 'https://images.unsplash.com/photo-1616582607004-eba71ce01e07?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwxfHxtYXNrZWQlMjBwb3J0cmFpdHxlbnwwfHx8YmxhY2tfYW5kX3doaXRlfDE3NTIyNDQ2MDl8MA&ixlib=rb-4.1.0&q=85',
        createdAt: new Date().toISOString(),
        isAdmin: false
    };
    
    users.push(newUser);
    saveUsers();
    
    // Clear form
    document.getElementById('new-username').value = '';
    document.getElementById('new-email').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('new-user-form').style.display = 'none';
    
    alert('Kullanıcı başarıyla oluşturuldu');
}

function loadPosts() {
    const container = document.getElementById('posts-container');
    
    if (posts.length === 0) {
        container.innerHTML = `
            <div class="no-posts">
                <div class="glitch-text" data-text="Henüz hiç gönderi yok...">Henüz hiç gönderi yok...</div>
                <p>İlk gönderiyi sen oluştur!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = posts.map(post => `
        <div class="forum-post">
            <div class="post-header">
                <div class="post-author">
                    <img src="${post.authorAvatar}" alt="avatar" class="avatar">
                    <span class="username">${post.authorUsername}</span>
                </div>
                <div class="post-date">${formatDate(post.createdAt)}</div>
            </div>
            <h3 class="post-title">${post.title}</h3>
            <div class="post-content">${post.content}</div>
            <div class="post-actions">
                <button class="comment-button">Yorumları Görüntüle</button>
            </div>
        </div>
    `).join('');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function initializeMatrixRain() {
    const canvas = document.getElementById('matrix-canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÇĞIİÖŞÜ123456789@#$%^&*()';
    const lettersArray = letters.split('');
    
    const fontSize = 10;
    const columns = canvas.width / fontSize;
    
    const drops = [];
    for (let x = 0; x < columns; x++) {
        drops[x] = 1;
    }
    
    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#00ff00';
        ctx.font = fontSize + 'px monospace';
        
        for (let i = 0; i < drops.length; i++) {
            const text = lettersArray[Math.floor(Math.random() * lettersArray.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }
    
    setInterval(draw, 35);
    
    // Resize handler
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

function initializeQuoteDisplay() {
    const quoteElement = document.getElementById('quote-display');
    
    function showQuote() {
        const quote = quotes[Math.floor(Math.random() * quotes.length)];
        quoteElement.textContent = quote;
        quoteElement.classList.add('visible');
        
        setTimeout(() => {
            quoteElement.classList.remove('visible');
        }, 3000);
    }
    
    // Show first quote after 2 seconds
    setTimeout(showQuote, 2000);
    
    // Show quote every 8 seconds
    setInterval(showQuote, 8000);
}

// Export data functions (for GitHub Pages)
window.exportData = function() {
    const data = {
        users: users.filter(u => u.id !== 'admin-1'), // Exclude default admin
        posts: posts
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fsociety-data.json';
    a.click();
    URL.revokeObjectURL(url);
};

window.importData = function(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.users) {
                users = [...users.filter(u => u.id === 'admin-1'), ...data.users];
                saveUsers();
            }
            if (data.posts) {
                posts = data.posts;
                savePosts();
            }
            location.reload();
        } catch (error) {
            alert('Geçersiz veri dosyası');
        }
    };
    reader.readAsText(file);
};