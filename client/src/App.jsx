import React, { useState, useEffect } from 'react';

// ==========================================
// 1. SPECIAL EFFECTS BACKGROUND ENGINE
// ==========================================
const SpecialEffectsBackground = ({ type }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    let icons = ['✨', '🌊', '🌴', '☀️', '🏖️'];
    if (type === 'trending') icons = ['🔥', '🚀', '📈', '🔺', '💸'];
    if (type === 'cursed') icons = ['☣️', '💀', '☢️', '⚠️', '🩸'];
    if (type === 'auth') icons = ['🔒', '🔑', '🖥️', '⚠️', '⚡'];

    const initialParticles = Array.from({ length: 22 }, (_, i) => ({
      id: i,
      icon: icons[Math.floor(Math.random() * icons.length)],
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.floor(Math.random() * 24) + 16,
    }));
    setParticles(initialParticles);
  }, [type]);

  if (type === 'fresh') {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-gradient-to-tr from-[#AEEFFF] via-[#E0F7FA] to-[#FFFDE0]">
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(#0080FF 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
        {particles.map(p => (
          <span key={p.id} className="absolute select-none opacity-60" style={{ left: `${p.left}%`, top: `${p.top}%`, fontSize: `${p.size}px` }}>
            {p.icon}
          </span>
        ))}
      </div>
    );
  }

  if (type === 'trending') {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#FFF3E0]">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #FF4500 0, #FF4500 2px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }}></div>
        {particles.map(p => (
          <div key={p.id} className="absolute select-none font-black text-slate-900 border-2 border-black bg-yellow-300 px-2 py-0.5 text-xs shadow-brutal rotate-12" style={{ left: `${p.left}%`, top: `${p.top}%` }}>
            {p.icon} LIVE_HYPE_
          </div>
        ))}
      </div>
    );
  }

  if (type === 'cursed') {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-black">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(0,255,0,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,0,0.15) 1px, transparent 1px)', backgroundSize: '25px 25px' }}></div>
        {particles.map(p => (
          <span key={p.id} className="absolute select-none font-black text-lime-400 opacity-80 filter drop-shadow-[0_0_8px_#39FF14]" style={{ left: `${p.left}%`, top: `${p.top}%`, fontSize: `${p.size}px` }}>
            {p.icon}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#FFF3E0]">
      {particles.map(p => (
        <span key={p.id} className="absolute select-none opacity-40 font-black text-lime-500" style={{ left: `${p.left}%`, top: `${p.top}%`, fontSize: `${p.size}px` }}>
          {p.icon}
        </span>
      ))}
    </div>
  );
};

// ==========================================
// 2. MASTER APPLICATION CONTAINER
// ==========================================
export default function App() {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Auth Session State
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(localStorage.getItem('username') || '');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authForm, setAuthForm] = useState({ username: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [backendError, setBackendError] = useState(false);

  // Main UI States
  const [currentPage, setCurrentPage] = useState('fresh');
  const [activeCategory, setActiveCategory] = useState('#EXAM_PAIN');
  const [caption, setCaption] = useState('');
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [openPostId, setOpenPostId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [loadingMemes, setLoadingMemes] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatingAi, setGeneratingAi] = useState(false);

  const [posts, setPosts] = useState([]);

  const fetchMemes = async () => {
    setLoadingMemes(true);
    setBackendError(false);
    try {
      const res = await fetch(`${API_BASE}/api/memes`);
      if (res.ok) {
        const data = await res.json();
        const formattedMemes = (data.memes || data).map(m => ({
          id: m.id,
          caption: m.title || m.caption,
          image: m.image_url || m.image,
          top_text: m.top_text || '',
          bottom_text: m.bottom_text || '',
          category: activeCategory,
          type: 'fresh',
          timestamp: 'JUST NOW',
          votes: m.likes || 0,
          comments: []
        }));
        setPosts(formattedMemes.length > 0 ? formattedMemes : getDefaultMemes());
      } else {
        setBackendError(true);
        setPosts(getDefaultMemes());
      }
    } catch (err) {
      setBackendError(true);
      setPosts(getDefaultMemes());
    } finally {
      setLoadingMemes(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMemes();
    }
  }, [token]);

  const getDefaultMemes = () => [
    {
      id: 1,
      caption: "Me looking at my clean code template knowing damn well it won't work on the first run.",
      image: "https://media.giphy.com/media/3o7TKSjRrfIPjeiOkM/giphy.gif",
      top_text: "CLEAN CODE TEMPLATE",
      bottom_text: "DOES NOT COMPILE",
      category: "#SHITPOSTING",
      type: "fresh",
      timestamp: "2 MINS AGO",
      votes: 142,
      comments: [{ id: 101, text: "Realest post of the day 😂" }]
    }
  ];

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = isRegistering ? 'signup' : 'login';

    try {
      const response = await fetch(`${API_BASE}/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Authentication aborted');

      if (isRegistering) {
        alert('Registration complete! Please log in.');
        setIsRegistering(false);
      } else {
        localStorage.setItem('token', data.user.id);
        localStorage.setItem('username', data.user.username);
        setToken(String(data.user.id));
        setUser(data.user.username);
      }
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken('');
    setUser('');
  };

  // Smart AI Meme Generator with Funky Impact Font Taglines
  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return alert("Enter a prompt for AI generation!");
    setGeneratingAi(true);
    try {
      const response = await fetch(`${API_BASE}/api/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt })
      });
      const data = await response.json();
      if (response.ok && data.imageUrl) {
        setPreviewUrl(data.imageUrl);
        setTopText(data.top_text || '');
        setBottomText(data.bottom_text || '');
        setCaption(data.caption || aiPrompt);
        setAiPrompt('');
      } else {
        setPreviewUrl("https://media.giphy.com/media/3o7TKSjRrfIPjeiOkM/giphy.gif");
        setTopText("AI ERROR");
        setBottomText(aiPrompt.toUpperCase());
      }
    } catch (err) {
      setPreviewUrl("https://media.giphy.com/media/3o7TKSjRrfIPjeiOkM/giphy.gif");
    } finally {
      setGeneratingAi(false);
    }
  };

  let bannerBg = "bg-[#B140FF]";
  let boxBg = "bg-white text-black border-black shadow-brutal";
  let activeItemClass = "bg-[#E4FF00] text-black border-black";
  let btnStyle = "bg-black text-[#E4FF00]";
  let inputBg = "focus:bg-yellow-50";
  let stickyBg = "bg-[#FFE600] text-black border-black";
  let rulesTitle = "THE_CODE_";
  let rulesList = ["No normie vibe.", "Ratio all L-memes.", "Stay cringe, stay toxic.", "Post or get banned."];

  if (currentPage === 'fresh') {
    bannerBg = "bg-[#0099FF]";
    activeItemClass = "bg-[#00FFCC] text-black border-black border-l-4";
    btnStyle = "bg-[#0099FF] text-white hover:bg-[#00FFCC] hover:text-black";
    inputBg = "focus:bg-cyan-50";
    stickyBg = "bg-[#00FFCC] text-black border-black";
    rulesTitle = "BEACH_VIBES_🌴";
    rulesList = ["Keep it pristine.", "High energy only.", "No absolute doomposting.", "Ride the upvote wave."];
  } else if (currentPage === 'trending') {
    bannerBg = "bg-[#FF4500]";
    activeItemClass = "bg-[#FFCC00] text-black border-black border-l-4";
    btnStyle = "bg-[#FF4500] text-white hover:bg-yellow-400 hover:text-black";
    inputBg = "focus:bg-orange-50";
    stickyBg = "bg-[#FF9900] text-black border-black";
    rulesTitle = "ALGORITHM_STATS_📈";
    rulesList = ["Farm that engagement.", "Riding trending vectors.", "Spam high quality reacts.", "Optimize your outputs."];
  } else if (currentPage === 'cursed') {
    bannerBg = "bg-red-600";
    boxBg = "bg-[#111] text-gray-300 border-red-600 shadow-[6px_6px_0px_0px_rgba(220,38,38,1)]";
    activeItemClass = "bg-[#39FF14] text-black border-red-600 border-l-4";
    btnStyle = "bg-red-600 text-white hover:bg-[#39FF14] hover:text-black";
    inputBg = "bg-[#222] text-white border-red-600 focus:bg-zinc-900";
    stickyBg = "bg-black text-red-500 border-red-600 shadow-[4px_4px_0px_0px_rgba(220,38,38,1)]";
    rulesTitle = "ABYSS_RULES_💀";
    rulesList = ["Abandon all hope.", "Pure internal corruption.", "Toxic output prioritized.", "Enter at your own risk."];
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleLaunch = async () => {
    if (!previewUrl && !caption.trim()) return alert("Enter text or attach an image file!");
    const newPost = {
      title: caption || topText || "System override description _",
      image_url: previewUrl || "https://media.giphy.com/media/3o7TKSjRrfIPjeiOkM/giphy.gif",
      top_text: topText,
      bottom_text: bottomText,
      creator_email: user
    };

    try {
      await fetch(`${API_BASE}/api/memes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
      });
      fetchMemes();
    } catch (err) {
      console.error("Backend sync failed");
    }

    setCaption('');
    setTopText('');
    setBottomText('');
    setPreviewUrl('');
  };

  const handleVote = async (id) => {
    setPosts(posts.map(p => p.id === id ? { ...p, votes: p.votes + 1 } : p));
  };

  const handleAddComment = async (id) => {
    if (!commentText.trim()) return;
    const newComment = { id: Date.now(), text: commentText, author: user };
    setPosts(posts.map(p => p.id === id ? { ...p, comments: [...p.comments, newComment] } : p));
    setCommentText('');
  };

  const filteredPosts = posts.filter(post => post.category === activeCategory);

  if (!token) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        <SpecialEffectsBackground type="auth" />
        <div className="relative z-10 w-full max-w-md border-4 border-black bg-white p-6 shadow-brutal-lg">
          <div className="bg-[#E4FF00] border-4 border-black text-center font-black text-3xl py-2 mb-6 shadow-brutal uppercase tracking-wider">
            MEMEVERSE_ AUTH_
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase mb-1">USER_ID_NAME:</label>
              <input 
                type="text" 
                required
                value={authForm.username}
                onChange={e => setAuthForm({ ...authForm, username: e.target.value })}
                className="w-full border-2 border-black p-3 font-mono font-bold focus:bg-yellow-50 focus:outline-none" 
                placeholder="ENTER_USERNAME..."
              />
            </div>
            {isRegistering && (
              <div>
                <label className="block text-xs font-black uppercase mb-1">EMAIL_ADDRESS:</label>
                <input 
                  type="email" 
                  required
                  value={authForm.email}
                  onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
                  className="w-full border-2 border-black p-3 font-mono font-bold focus:bg-yellow-50 focus:outline-none" 
                  placeholder="ENTER_EMAIL..."
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-black uppercase mb-1">ACCESS_CODE_KEY:</label>
              <input 
                type="password" 
                required
                value={authForm.password}
                onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                className="w-full border-2 border-black p-3 font-mono font-bold focus:bg-yellow-50 focus:outline-none" 
                placeholder="ENTER_PASSWORD..."
              />
            </div>

            {authError && <div className="border-2 border-black bg-red-400 text-black font-bold text-xs p-2 uppercase">{authError}</div>}

            <button type="submit" className="w-full border-4 border-black bg-black text-[#E4FF00] font-black py-4 uppercase shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer">
              {isRegistering ? 'EXECUTE_SIGNUP_ 💾' : 'ACCESS_SYSTEM_ 🚀'}
            </button>
          </form>

          <p className="text-center text-xs font-bold mt-4 underline cursor-pointer" onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? 'ALREADY_HAVE_AN_ACCOUNT?_LOGIN' : 'NEED_AN_ACCESS_KEY?_REGISTER'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative p-4 selection:bg-yellow-300">
      <SpecialEffectsBackground type={currentPage} />
      
      <div className="relative z-10">
        <header className={`border-4 p-4 mb-6 flex justify-between items-center shadow-brutal ${currentPage === 'cursed' ? 'bg-[#111] text-white border-red-600' : 'bg-white text-black border-black'}`}>
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setCurrentPage('fresh')}>
            <div className="bg-[#E4FF00] text-black border-2 border-black font-black text-2xl px-3 py-1 shadow-brutal">M</div>
            <h1 className="text-3xl font-black tracking-tighter">MEMEVERSE. <span className="text-xs font-mono bg-black text-white px-2 py-0.5 ml-2">USER: {user}</span></h1>
          </div>
          <nav className="flex gap-6 uppercase text-sm font-mono font-black">
            <button onClick={() => setCurrentPage('fresh')} className={`pb-1 cursor-pointer ${currentPage === 'fresh' ? 'underline text-cyan-600 scale-105' : 'text-gray-500'}`}>Fresh 🌊</button>
            <button onClick={() => setCurrentPage('trending')} className={`pb-1 cursor-pointer ${currentPage === 'trending' ? 'underline text-orange-600 scale-105' : 'text-gray-500'}`}>Trending 🔥</button>
            <button onClick={() => setCurrentPage('cursed')} className={`pb-1 cursor-pointer ${currentPage === 'cursed' ? 'underline text-lime-400 scale-105' : 'text-gray-400'}`}>Cursed ☣️</button>
          </nav>
          <div className="flex items-center gap-4">
            {backendError && <span className="bg-red-600 text-white border-2 border-black font-black text-[10px] px-2 py-1 shadow-brutal animate-pulse">⚡ FAILED TO CONNECT TO BACKEND FEED</span>}
            <button onClick={handleLogout} className={`border-2 border-black font-bold px-4 py-1 text-xs uppercase shadow-brutal cursor-pointer ${currentPage === 'cursed' ? 'bg-red-700 text-white' : 'bg-[#FFDEE9] text-black'}`}>LOGOUT _</button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-7xl mx-auto items-start">
          <div className="md:col-span-3 flex flex-col gap-6 md:sticky md:top-4">
            <div className={`border-4 border-black p-4 shadow-brutal text-white ${bannerBg}`}>
              <h2 className="text-xl font-black underline">VIBE CHECK</h2>
              <p className="text-sm mt-1 font-mono tracking-widest bg-black/30 p-1 rounded inline-block">{activeCategory}</p>
            </div>
            <div className={`border-4 border-black p-4 shadow-brutal ${currentPage === 'cursed' ? 'bg-[#111] text-gray-300 border-red-600' : 'bg-white text-black'}`}>
              <h3 className="font-black border-b-2 border-current pb-2 mb-4">EXPLORE_</h3>
              <ul className="space-y-3 font-bold text-sm">
                {['#SHITPOSTING', '#EXAM_PAIN', '#AI_FAILS', '#CURSED', '#GEN_Z_LORE'].map((tag) => (
                  <li key={tag} onClick={() => setActiveCategory(tag)} className={`flex justify-between items-center border-b border-gray-200 pb-2 last:border-none cursor-pointer p-1 transition-all ${activeCategory === tag ? activeItemClass + " pl-2" : ''}`}>
                    <span>{tag}</span><span>→</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="md:col-span-6 flex flex-col gap-8">
            <div className={`border-4 border-black p-6 ${boxBg}`}>
              <h2 className="text-xl font-black uppercase mb-4 tracking-tight">POST_TO_{activeCategory}</h2>
              
              <div className="mb-4 flex gap-2">
                <input 
                  type="text" 
                  value={aiPrompt} 
                  onChange={(e) => setAiPrompt(e.target.value)} 
                  placeholder="AI MEME PROMPT GENERATOR..." 
                  className={`flex-1 border-2 border-black p-2 font-bold text-xs ${inputBg}`}
                />
                <button 
                  onClick={handleAiGenerate} 
                  disabled={generatingAi} 
                  className="border-2 border-black bg-purple-500 text-white font-black text-xs px-3 py-2 shadow-brutal cursor-pointer"
                >
                  {generatingAi ? 'GENERATING...' : 'AI GEN 🤖'}
                </button>
              </div>

              {/* IMAGE PREVIEW CONTAINER WITH IMPACT FONT OVERLAYS */}
              <div className={`border-4 border-dashed border-black min-h-[180px] flex flex-col items-center justify-center p-2 text-center my-4 relative overflow-hidden ${currentPage === 'cursed' ? 'bg-zinc-900 border-red-600' : 'bg-gray-50'}`}>
                {previewUrl ? (
                  <div className="relative w-full flex justify-center items-center">
                    <img src={previewUrl} alt="Preview" className="max-h-[240px] object-contain border-2 border-black shadow-brutal w-full" />
                    {/* Top Impact Tagline */}
                    {topText && (
                      <div className="absolute top-2 left-0 right-0 px-2 text-center font-black text-xl md:text-2xl tracking-wider text-white uppercase" style={{ textShadow: '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0px 3px 6px rgba(0,0,0,0.9)' }}>
                        {topText}
                      </div>
                    )}
                    {/* Bottom Impact Tagline */}
                    {bottomText && (
                      <div className="absolute bottom-2 left-0 right-0 px-2 text-center font-black text-xl md:text-2xl tracking-wider text-white uppercase" style={{ textShadow: '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0px 3px 6px rgba(0,0,0,0.9)' }}>
                        {bottomText}
                      </div>
                    )}
                  </div>
                ) : (
                  <label className="cursor-pointer w-full py-8">
                    <span className="font-black text-sm uppercase underline text-purple-600">SELECT MEME FILE OR USE AI GEN</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                )}
              </div>

              {/* Tagline Inputs */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <input type="text" value={topText} onChange={(e) => setTopText(e.target.value)} placeholder="TOP TAGLINE..." className={`border-2 border-black p-2 font-bold text-xs uppercase ${inputBg}`} />
                <input type="text" value={bottomText} onChange={(e) => setBottomText(e.target.value)} placeholder="BOTTOM TAGLINE..." className={`border-2 border-black p-2 font-bold text-xs uppercase ${inputBg}`} />
              </div>

              <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="POST DESCRIPTION / TITLE..." className={`w-full border-2 border-black p-3 font-bold mb-4 focus:outline-none ${inputBg}`} />
              <button onClick={handleLaunch} className={`w-full border-4 border-black font-black py-4 uppercase shadow-brutal transition-all cursor-pointer ${btnStyle}`}>LAUNCH_IT 🚀</button>
            </div>

            <div className="flex flex-col gap-6">
              <h3 className={`text-xl font-black uppercase tracking-tight border-b-4 pb-2 ${currentPage === 'cursed' ? 'border-red-600 text-red-500' : 'border-black text-black'}`}>FEED_CHANNEL_ ({activeCategory})</h3>
              {loadingMemes ? (
                <div className="border-4 p-8 text-center font-bold uppercase">LOADING_FEED_DATABASE...</div>
              ) : filteredPosts.length === 0 ? (
                <div className={`border-4 p-8 text-center font-bold uppercase tracking-wider ${currentPage === 'cursed' ? 'bg-[#111] border-red-600 text-red-900 border-dashed' : 'bg-white border-black text-gray-400'}`}>Empty channel feed _</div>
              ) : (
                filteredPosts.map(post => (
                  <div key={post.id} className={`border-4 p-4 ${currentPage === 'cursed' ? 'bg-[#111111] text-gray-100 border-red-600 shadow-[6px_6px_0px_0px_rgba(220,38,38,1)]' : 'bg-white text-black border-black shadow-brutal'}`}>
                    <p className="font-bold mb-4 text-sm">{post.caption}</p>
                    
                    {/* Meme Image Feed Card with Impact Font Overlays */}
                    {post.image && (
                      <div className="relative w-full flex justify-center items-center mb-4">
                        <img src={post.image} alt="Meme" className="w-full max-h-[350px] object-contain border-2 border-black mx-auto" />
                        {post.top_text && (
                          <div className="absolute top-3 left-0 right-0 px-4 text-center font-black text-2xl tracking-wider text-white uppercase" style={{ textShadow: '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0px 4px 8px rgba(0,0,0,0.9)' }}>
                            {post.top_text}
                          </div>
                        )}
                        {post.bottom_text && (
                          <div className="absolute bottom-3 left-0 right-0 px-4 text-center font-black text-2xl tracking-wider text-white uppercase" style={{ textShadow: '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0px 4px 8px rgba(0,0,0,0.9)' }}>
                            {post.bottom_text}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center border-t-2 border-current pt-3">
                      <button onClick={() => handleVote(post.id)} className="border-2 border-black bg-[#E4FF00] text-black font-black text-xs px-3 py-1 shadow-brutal cursor-pointer">🔺 RATIO_ {post.votes}</button>
                      <button onClick={() => setOpenPostId(openPostId === post.id ? null : post.id)} className="text-xs font-black border-2 border-black px-3 py-1 shadow-brutal bg-[#FFDEE9] text-black cursor-pointer">💬 COMMENTS ({post.comments.length})_</button>
                    </div>
                    {openPostId === post.id && (
                      <div className={`mt-4 border-t-2 pt-4 p-3 border ${currentPage === 'cursed' ? 'bg-[#1a1a1a] border-red-600' : 'bg-gray-50 border-black'}`}>
                        <div className="space-y-2 mb-3 max-h-[120px] overflow-y-auto">
                          {post.comments.map(c => <div key={c.id} className="bg-white text-black p-2 border border-black text-xs"><p className="font-bold">{c.text} <span className="text-[10px] text-gray-500">({c.author || 'Anon'})</span></p></div>)}
                        </div>
                        <div className="flex gap-2">
                          <input type="text" value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="ADD_REPLY..." className="flex-1 border p-2 text-xs font-bold text-black" />
                          <button onClick={() => handleAddComment(post.id)} className="border bg-black text-white px-3 text-xs font-black cursor-pointer">SUBMIT_</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="md:col-span-3 md:sticky md:top-4">
            <div className={`border-4 p-5 shadow-brutal md:rotate-2 ${stickyBg}`}>
              <h3 className="text-xl font-black border-b-2 border-current pb-2 mb-4 tracking-tight">{rulesTitle}</h3>
              <ol className="list-decimal list-inside space-y-3 font-bold text-xs uppercase leading-relaxed">
                {rulesList.map((rule, idx) => <li key={idx}>{rule}</li>)}
              </ol>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}