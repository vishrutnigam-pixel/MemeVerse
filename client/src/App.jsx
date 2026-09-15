import React, { useState, useEffect, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [activeTab, setActiveTab] = useState('feed');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [notification, setNotification] = useState(null);

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [memeTitle, setMemeTitle] = useState('');
  const [memeUrl, setMemeUrl] = useState('');
  const [authError, setAuthError] = useState('');

  const [memes, setMemes] = useState([]);
  const [loadingMemes, setLoadingMemes] = useState(false);

  const canvasRef = useRef(null);

  const notify = (msg, type = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 1,
      dx: (Math.random() - 0.5) * 0.8,
      dy: (Math.random() - 0.5) * 0.8,
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)';
      
      particles.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  const fetchMemes = async () => {
    setLoadingMemes(true);
    try {
      const res = await fetch(`${API_BASE}/api/memes`);
      if (res.ok) {
        const data = await res.json();
        setMemes(data);
      } else {
        setMemes([
          { id: 1, title: 'When the Vercel build finally succeeds', image_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80', upvotes: 142, downvotes: 3 },
          { id: 2, title: 'Debugging in production like a boss', image_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80', upvotes: 89, downvotes: 12 }
        ]);
      }
    } catch (err) {
      notify('Failed to connect to backend feed', 'error');
    } finally {
      setLoadingMemes(false);
    }
  };

  useEffect(() => {
    fetchMemes();
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Authentication failed');

      if (authMode === 'login') {
        setToken(data.token);
        localStorage.setItem('token', data.token);
        setUser({ username: usernameInput });
        setShowAuthModal(false);
        notify(`Welcome back, ${usernameInput}!`, 'success');
      } else {
        setAuthMode('login');
        notify('Account created! Please sign in.', 'success');
      }
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    notify('Logged out successfully', 'info');
  };

  const handleVote = async (id, type) => {
    setMemes(memes.map(m => {
      if (m.id === id) {
        return {
          ...m,
          upvotes: type === 'up' ? m.upvotes + 1 : m.upvotes,
          downvotes: type === 'down' ? m.downvotes + 1 : m.downvotes
        };
      }
      return m;
    }));

    try {
      await fetch(`${API_BASE}/api/memes/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
    } catch (err) {
      // Quiet catch
    }
  };

  const handleCreateMeme = async (e) => {
    e.preventDefault();
    if (!memeTitle || !memeUrl) return;

    try {
      const res = await fetch(`${API_BASE}/api/memes`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: memeTitle, image_url: memeUrl })
      });

      if (res.ok) {
        notify('Meme posted successfully!', 'success');
        setMemeTitle('');
        setMemeUrl('');
        setShowUploadModal(false);
        fetchMemes();
      } else {
        throw new Error('Failed to post meme');
      }
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  return (
    <div className={`min-h-screen relative font-sans transition-colors duration-200 ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-amber-50 text-slate-900'
    }`}>
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-40" />

      {notification && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 border-4 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 ${
          notification.type === 'error' ? 'bg-red-500 text-white border-black' :
          notification.type === 'success' ? 'bg-green-400 text-black border-black' : 'bg-yellow-300 text-black border-black'
        }`}>
          ⚡ {notification.msg}
        </div>
      )}

      <header className="sticky top-0 z-40 border-b-4 border-black bg-yellow-400 text-black p-4 shadow-[0_4px_0_0_rgba(0,0,0,1)]">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('feed')}>
            <div className="bg-black text-white p-2 border-2 border-black font-black text-2xl tracking-tighter transform -rotate-2">
              MV
            </div>
            <h1 className="text-3xl font-black tracking-extrabold uppercase italic">MemeVerse</h1>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 border-2 border-black bg-white text-black font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2 border-2 border-black bg-emerald-400 text-black font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                >
                  📤 Upload
                </button>
                <button 
                  onClick={handleLogout}
                  className="p-2 border-2 border-black bg-rose-500 text-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                >
                  🚪 Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={() => { setShowAuthModal(true); setAuthMode('login'); }}
                className="px-5 py-2 border-2 border-black bg-cyan-400 text-black font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
              >
                🔑 Join / Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-6 relative z-10">
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('feed')}
            className={`px-6 py-3 border-4 border-black font-black uppercase text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer ${
              activeTab === 'feed' ? 'bg-orange-500 text-white' : 'bg-white text-black'
            }`}
          >
            🔥 Trending Feed
          </button>
          <button 
            onClick={() => setActiveTab('leaderboard')}
            className={`px-6 py-3 border-4 border-black font-black uppercase text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer ${
              activeTab === 'leaderboard' ? 'bg-purple-500 text-white' : 'bg-white text-black'
            }`}
          >
            🏆 Hall of Fame
          </button>
        </div>

        {activeTab === 'feed' && (
          <div className="space-y-6">
            {loadingMemes ? (
              <div className="p-8 border-4 border-black bg-white text-black font-black text-center text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                ⏳ LOADING MEMES FROM NEON POSTGRES...
              </div>
            ) : memes.length === 0 ? (
              <div className="p-8 border-4 border-black bg-white text-black font-black text-center text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                NO MEMES FOUND. BE THE FIRST TO UPLOAD!
              </div>
            ) : (
              memes.map((meme) => (
                <div key={meme.id} className="border-4 border-black bg-white text-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <h2 className="text-2xl font-black uppercase mb-3 border-b-2 border-black pb-2">{meme.title}</h2>
                  <div className="bg-black border-2 border-black mb-4 overflow-hidden max-h-[500px] flex items-center justify-center">
                    <img src={meme.image_url} alt={meme.title} className="w-full h-auto object-contain" />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleVote(meme.id, 'up')}
                        className="px-4 py-2 border-2 border-black bg-green-400 font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                      >
                        ▲ {meme.upvotes}
                      </button>
                      <button 
                        onClick={() => handleVote(meme.id, 'down')}
                        className="px-4 py-2 border-2 border-black bg-red-400 font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                      >
                        ▼ {meme.downvotes}
                      </button>
                    </div>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(meme.image_url);
                        notify('Meme link copied!', 'info');
                      }}
                      className="p-2 border-2 border-black bg-yellow-300 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                    >
                      🔗 Share
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="border-4 border-black bg-white text-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-3xl font-black uppercase border-b-4 border-black pb-3 mb-6">
              👑 Top Rated Creators
            </h2>
            <div className="space-y-4">
              {[
                { rank: 1, name: 'MemeLord99', score: '2,420 pts', badge: '🥇 CHAMPION' },
                { rank: 2, name: 'ViteMaster', score: '1,850 pts', badge: '🥈 RUNNER UP' },
                { rank: 3, name: 'NeonQuery', score: '1,210 pts', badge: '🥉 BRONZE' }
              ].map((item) => (
                <div key={item.rank} className="p-4 border-2 border-black bg-amber-100 flex justify-between items-center font-bold">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black">#{item.rank}</span>
                    <span className="text-xl">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono bg-black text-white px-2 py-1">{item.score}</span>
                    <span className="text-sm font-black uppercase">{item.badge}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="border-4 border-black bg-white text-black p-6 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] relative">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-1 border-2 border-black bg-red-400 font-bold cursor-pointer"
            >
              ✖
            </button>
            <h2 className="text-2xl font-black uppercase border-b-4 border-black pb-2 mb-4">
              {authMode === 'login' ? 'Sign In to MemeVerse' : 'Create Account'}
            </h2>
            
            {authError && (
              <div className="mb-4 p-2 bg-red-200 border-2 border-black text-red-800 font-bold text-sm">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block font-black uppercase text-sm mb-1">Username</label>
                <input 
                  type="text" 
                  value={usernameInput} 
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full p-2 border-2 border-black font-bold focus:outline-none focus:bg-yellow-100"
                  required
                />
              </div>
              <div>
                <label className="block font-black uppercase text-sm mb-1">Password</label>
                <input 
                  type="password" 
                  value={passwordInput} 
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full p-2 border-2 border-black font-bold focus:outline-none focus:bg-yellow-100"
                  required
                />
              </div>
              <button 
                type="submit" 
                className="w-full py-3 border-2 border-black bg-yellow-400 text-black font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
              >
                {authMode === 'login' ? 'Authenticate' : 'Register Now'}
              </button>
            </form>

            <div className="mt-4 text-center font-bold text-sm">
              {authMode === 'login' ? "Don't have an account? " : "Already registered? "}
              <button 
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="underline font-black text-blue-600 cursor-pointer"
              >
                {authMode === 'login' ? 'Register here' : 'Sign in here'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="border-4 border-black bg-white text-black p-6 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] relative">
            <button 
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 p-1 border-2 border-black bg-red-400 font-bold cursor-pointer"
            >
              ✖
            </button>
            <h2 className="text-2xl font-black uppercase border-b-4 border-black pb-2 mb-4">Post a Meme</h2>
            <form onSubmit={handleCreateMeme} className="space-y-4">
              <div>
                <label className="block font-black uppercase text-sm mb-1">Meme Title</label>
                <input 
                  type="text" 
                  value={memeTitle} 
                  onChange={(e) => setMemeTitle(e.target.value)}
                  placeholder="e.g. When the build passes first try"
                  className="w-full p-2 border-2 border-black font-bold focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block font-black uppercase text-sm mb-1">Image URL</label>
                <input 
                  type="url" 
                  value={memeUrl} 
                  onChange={(e) => setMemeUrl(e.target.value)}
                  placeholder="https://i.imgur.com/example.png"
                  className="w-full p-2 border-2 border-black font-bold focus:outline-none"
                  required
                />
              </div>
              <button 
                type="submit" 
                className="w-full py-3 border-2 border-black bg-emerald-400 text-black font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
              >
                Publish to MemeVerse
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
