import React, { useState, useEffect, useContext, createContext } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API}/me`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API}/login`, { username, password });
      const { access_token, user } = response.data;
      setToken(access_token);
      setUser(user);
      localStorage.setItem('token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Giriş başarısız' };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await axios.post(`${API}/register`, { username, email, password });
      return { success: true, user: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Kayıt başarısız' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Components
const GlitchText = ({ children, className = "" }) => {
  return (
    <div className={`glitch-text ${className}`} data-text={children}>
      {children}
    </div>
  );
};

const TerminalInput = ({ placeholder, value, onChange, type = "text", className = "" }) => {
  const [focused, setFocused] = useState(false);
  
  return (
    <div className={`terminal-input ${focused ? 'focused' : ''} ${className}`}>
      <span className="terminal-prompt">root@fsociety:~$ </span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="terminal-field"
      />
      {focused && <span className="terminal-cursor">|</span>}
    </div>
  );
};

const MatrixRain = () => {
  useEffect(() => {
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
    
    const interval = setInterval(draw, 35);
    return () => clearInterval(interval);
  }, []);
  
  return <canvas id="matrix-canvas" className="matrix-canvas"></canvas>;
};

const FSocietyLogo = () => {
  const [animationState, setAnimationState] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationState('animate');
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className={`fsociety-logo ${animationState}`}>
      <div className="logo-char">f</div>
      <div className="logo-char">s</div>
      <div className="logo-char">o</div>
      <div className="logo-char">c</div>
      <div className="logo-char">i</div>
      <div className="logo-char">e</div>
      <div className="logo-char">t</div>
      <div className="logo-char">y</div>
    </div>
  );
};

const QuoteDisplay = () => {
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
  
  const [currentQuote, setCurrentQuote] = useState('');
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const showQuote = () => {
      const quote = quotes[Math.floor(Math.random() * quotes.length)];
      setCurrentQuote(quote);
      setVisible(true);
      
      setTimeout(() => {
        setVisible(false);
      }, 3000);
    };
    
    const interval = setInterval(showQuote, 8000);
    setTimeout(showQuote, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className={`quote-display ${visible ? 'visible' : ''}`}>
      {currentQuote}
    </div>
  );
};

const LoginForm = ({ onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await login(username, password);
    
    if (result.success) {
      onSuccess();
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };
  
  return (
    <form onSubmit={handleSubmit} className="login-form">
      <GlitchText className="form-title">GİRİŞ TERMİNALİ</GlitchText>
      
      <TerminalInput
        placeholder="Kullanıcı adı girin"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      
      <TerminalInput
        placeholder="Şifre girin"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
      />
      
      {error && <div className="error-message">{error}</div>}
      
      <button type="submit" disabled={loading} className="terminal-button">
        {loading ? 'KİMLİK DOĞRULANIYOR...' : 'GİRİŞ YAP'}
      </button>
    </form>
  );
};

const RegisterForm = ({ onSuccess }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await register(username, email, password);
    
    if (result.success) {
      onSuccess();
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };
  
  return (
    <form onSubmit={handleSubmit} className="register-form">
      <GlitchText className="form-title">DEVRIME KATIL</GlitchText>
      
      <TerminalInput
        placeholder="Kullanıcı adı girin"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      
      <TerminalInput
        placeholder="Email girin"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
      />
      
      <TerminalInput
        placeholder="Şifre girin"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
      />
      
      {error && <div className="error-message">{error}</div>}
      
      <button type="submit" disabled={loading} className="terminal-button">
        {loading ? 'KAYIT EDİLİYOR...' : 'KAYIT OL'}
      </button>
    </form>
  );
};

const ForumPost = ({ post, onCommentClick }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="forum-post">
      <div className="post-header">
        <div className="post-author">
          <img src={post.author_avatar || "https://images.unsplash.com/photo-1616582607004-eba71ce01e07?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwxfHxtYXNrZWQlMjBwb3J0cmFpdHxlbnwwfHx8YmxhY2tfYW5kX3doaXRlfDE3NTIyNDQ2MDl8MA&ixlib=rb-4.1.0&q=85"} alt="avatar" className="avatar" />
          <span className="username">{post.author_username}</span>
        </div>
        <div className="post-date">{formatDate(post.created_at)}</div>
      </div>
      <h3 className="post-title">{post.title}</h3>
      <div className="post-content">{post.content}</div>
      <div className="post-actions">
        <button onClick={() => onCommentClick(post)} className="comment-button">
          Yorumları Görüntüle
        </button>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();
  
  useEffect(() => {
    fetchPosts();
  }, []);
  
  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API}/posts`);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };
  
  const handleCreatePost = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post(`${API}/posts`, newPost);
      setNewPost({ title: '', content: '' });
      setShowCreatePost(false);
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <FSocietyLogo />
        </div>
        <div className="header-right">
          <div className="user-info">
            <img src={user?.avatar} alt="avatar" className="user-avatar" />
            <span className="username">{user?.username}</span>
            {user?.is_admin && <span className="admin-badge">ADMİN</span>}
          </div>
          <button onClick={logout} className="logout-button">ÇIKIŞ YAP</button>
        </div>
      </header>
      
      <main className="dashboard-main">
        <div className="controls">
          <button 
            onClick={() => setShowCreatePost(!showCreatePost)} 
            className="create-post-button"
          >
            <GlitchText>Yeni Gönderi Oluştur</GlitchText>
          </button>
          
          <button 
            onClick={() => setShowRegister(!showRegister)} 
            className="register-button"
          >
            Yeni Kullanıcı Kaydı
          </button>
        </div>
        
        {showCreatePost && (
          <form onSubmit={handleCreatePost} className="create-post-form">
            <TerminalInput
              placeholder="Gönderi başlığı"
              value={newPost.title}
              onChange={(e) => setNewPost({...newPost, title: e.target.value})}
            />
            <textarea
              placeholder="Gönderi içeriği..."
              value={newPost.content}
              onChange={(e) => setNewPost({...newPost, content: e.target.value})}
              className="post-content-textarea"
              rows="4"
            />
            <button type="submit" disabled={loading} className="terminal-button">
              {loading ? 'GÖNDERİLİYOR...' : 'GÖNDERİYİ PAYLAŞ'}
            </button>
          </form>
        )}
        
        {showRegister && (
          <RegisterForm onSuccess={() => setShowRegister(false)} />
        )}
        
        <div className="posts-container">
          {posts.length === 0 ? (
            <div className="no-posts">
              <GlitchText>Henüz hiç gönderi yok...</GlitchText>
              <p>İlk gönderiyi sen oluştur!</p>
            </div>
          ) : (
            posts.map(post => (
              <ForumPost 
                key={post.id} 
                post={post} 
                onCommentClick={() => {}} 
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

const App = () => {
  const [currentView, setCurrentView] = useState('login');
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-terminal">
          <div className="loading-text">fsociety terminali başlatılıyor...</div>
          <div className="loading-cursor">|</div>
        </div>
      </div>
    );
  }
  
  if (user) {
    return <Dashboard />;
  }
  
  return (
    <div className="App">
      <MatrixRain />
      <div className="main-content">
        <div className="auth-container">
          <div className="auth-tabs">
            <button 
              className={currentView === 'login' ? 'active' : ''} 
              onClick={() => setCurrentView('login')}
            >
              GİRİŞ
            </button>
            <button 
              className={currentView === 'register' ? 'active' : ''} 
              onClick={() => setCurrentView('register')}
            >
              KAYIT
            </button>
          </div>
          
          {currentView === 'login' ? (
            <LoginForm onSuccess={() => {}} />
          ) : (
            <RegisterForm onSuccess={() => setCurrentView('login')} />
          )}
        </div>
      </div>
      
      <QuoteDisplay />
    </div>
  );
};

const AppWrapper = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

export default AppWrapper;