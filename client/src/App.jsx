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
// 2. MAIN APPLICATION CONTAINER
// ==========================================
export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(localStorage.getItem('username') || '');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');

  const [currentPage, setCurrentPage] = useState('fresh');
  const [activeCategory, setActiveCategory] = useState('#EXAM_PAIN');
  const [caption, setCaption] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [openPostId, setOpenPostId] = useState(null);
  const [commentText, setCommentText] = useState('');

  // AI Studio States
  const [useAiMode, setUseAiMode] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [posts, setPosts] = useState([
    {
      id: 1,
      caption: "Me looking at my clean code template knowing damn well it won't work on the first run.",
      image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=500&auto=format&fit=crop&q=60",
      category: "#EXAM_PAIN",
      type: "fresh",
      timestamp: "2 MINS AGO",
      votes: 142,
      comments: [{ id: 101, text: "Realest post of the day 😂" }]
    }
  ]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = isRegistering ? 'register' : 'login';

    try {
      const response = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Authentication aborted');

      if (isRegistering) {
        alert('Registration complete! Switching to login mode.');
        setIsRegistering(false);
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        setToken(data.token);
        setUser(data.username);
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

  const handleGenerateAiImage = async () => {
    if (!aiPrompt.trim()) return alert("Enter an AI prompt first!");
    
    setIsGenerating(true);
    try {
      const res = await fetch('http://localhost:5000/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI generation failed');

      const freshImageUrl = `${data.imageUrl}${data.imageUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
      setPreviewUrl(freshImageUrl);
    } catch (err) {
      alert(`AI Error: ${err.message}`);
    } finally {
      setIsGenerating(false);
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

  const handleLaunch = () => {
    if (!previewUrl && !caption.trim()) return alert("Enter text or attach an image file!");
    const newPost = {
      id: Date.now(),
      caption: caption || "System override description _",
      image: previewUrl || null,
      category: activeCategory,
      type: currentPage,
      timestamp: "JUST NOW",
      votes: 1,
      comments: []
    };
    setPosts([newPost, ...posts]);
    setCaption('');
    setPreviewUrl('');
  };

  const handleVote = (id) => {
    setPosts(posts.map(p => p.id === id ? { ...p, votes: p.votes + 1 } : p));
  };

  const handleAddComment = (id) => {
    if (!commentText.trim()) return;
    setPosts(posts.map(p => p.id === id ? { ...p, comments: [...p.comments, { id: Date.now(), text: commentText }] } : p));
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

            <button type="submit" className="w-full border-4 border-black bg-black text-[#E4FF00] font-black py-3 uppercase shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer">
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
          <div><button onClick={handleLogout} className={`border-2 border-black font-bold px-4 py-1 text-xs uppercase shadow-brutal cursor-pointer ${currentPage === 'cursed' ? 'bg-red-700 text-white' : 'bg-[#FFDEE9] text-black'}`}>LOGOUT _</button></div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-7xl mx-auto items-start">
          {/* SIDEBAR */}
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

          {/* MAIN CARD FEED */}
          <div className="md:col-span-6 flex flex-col gap-8">
            <div className={`border-4 border-black p-6 ${boxBg}`}>
              <div className="flex justify-between items-center mb-4 border-b-2 border-black pb-2">
                <h2 className="text-xl font-black uppercase tracking-tight">POST_TO_{activeCategory}</h2>
                <button 
                  onClick={() => setUseAiMode(!useAiMode)}
                  className="text-xs font-black border-2 border-black px-2 py-1 bg-[#E4FF00] text-black shadow-brutal hover:bg-yellow-300 cursor-pointer uppercase"
                >
                  {useAiMode ? '📁 SWITCH_TO_UPLOAD' : '🤖 SWITCH_TO_AI_STUDIO'}
                </button>
              </div>

              {/* MODE A: AI GENERATION STUDIO */}
              {useAiMode ? (
                <div className="mb-4 border-2 border-black p-3 bg-purple-100 space-y-3">
                  <label className="block text-xs font-black uppercase text-black">AI_STUDIO_PROMPT_ENGINE:</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={aiPrompt} 
                      onChange={(e) => setAiPrompt(e.target.value)} 
                      placeholder="e.g. A funny futuristic cat coding React JS..." 
                      className="flex-1 border-2 border-black p-2 font-bold text-xs bg-white text-black focus:outline-none"
                    />
                    <button 
                      onClick={handleGenerateAiImage}
                      disabled={isGenerating}
                      className="border-2 border-black bg-black text-[#E4FF00] font-black px-4 text-xs shadow-brutal hover:bg-zinc-800 disabled:opacity-50 cursor-pointer"
                    >
                      {isGenerating ? 'GENERATING...' : 'GENERATE_✨'}
                    </button>
                  </div>
                </div>
              ) : (
                /* MODE B: STANDARD FILE UPLOAD */
                <label className={`block border-4 border-dashed border-black min-h-[140px] flex flex-col items-center justify-center p-4 text-center my-4 cursor-pointer relative ${currentPage === 'cursed' ? 'bg-zinc-900 border-red-600' : 'bg-gray-50'}`}>
                  {!previewUrl && <span className="font-black text-sm uppercase underline text-purple-600">SELECT MEME FILE FROM DISK</span>}
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              )}

              {/* PREVIEW CONTAINER */}
              {previewUrl && (
                <div className="relative mb-4 border-4 border-black bg-black p-2">
                  <img src={previewUrl} alt="Preview" className="max-h-[250px] object-contain mx-auto" />
                  <button 
                    onClick={() => setPreviewUrl('')} 
                    className="absolute top-2 right-2 border border-black bg-red-500 text-white text-xs px-2 py-1 font-black cursor-pointer shadow-brutal"
                  >
                    CLEAR_X
                  </button>
                </div>
              )}

              <input 
                type="text" 
                value={caption} 
                onChange={(e) => setCaption(e.target.value)} 
                placeholder="TYPE_CAPTION_HERE..." 
                className={`w-full border-2 border-black p-3 font-bold mb-4 focus:outline-none ${inputBg}`} 
              />
              
              <button 
                onClick={handleLaunch} 
                className={`w-full border-4 border-black font-black py-4 uppercase shadow-brutal transition-all cursor-pointer ${btnStyle}`}
              >
                LAUNCH_IT 🚀
              </button>
            </div>

            <div className="flex flex-col gap-6">
              <h3 className={`text-xl font-black uppercase tracking-tight border-b-4 pb-2 ${currentPage === 'cursed' ? 'border-red-600 text-red-500' : 'border-black text-black'}`}>FEED_CHANNEL_ ({activeCategory})</h3>
              {filteredPosts.length === 0 ? (
                <div className={`border-4 p-8 text-center font-bold uppercase tracking-wider ${currentPage === 'cursed' ? 'bg-[#111] border-red-600 text-red-900 border-dashed' : 'bg-white border-black text-gray-400'}`}>Empty channel feed _</div>
              ) : (
                filteredPosts.map(post => (
                  <div key={post.id} className={`border-4 p-4 ${currentPage === 'cursed' ? 'bg-[#111111] text-gray-100 border-red-600 shadow-[6px_6px_0px_0px_rgba(220,38,38,1)]' : 'bg-white text-black border-black shadow-brutal'}`}>
                    <p className="font-bold mb-4 text-sm">{post.caption}</p>
                    {post.image && <img src={post.image} alt="Meme" className="w-full max-h-[350px] object-contain border-2 border-black mb-4 mx-auto" />}
                    <div className="flex justify-between items-center border-t-2 border-current pt-3">
                      <button onClick={() => handleVote(post.id)} className="border-2 border-black bg-[#E4FF00] text-black font-black text-xs px-3 py-1 shadow-brutal cursor-pointer">🔺 RATIO_ {post.votes}</button>
                      <button onClick={() => setOpenPostId(openPostId === post.id ? null : post.id)} className="text-xs font-black border-2 border-black px-3 py-1 shadow-brutal bg-[#FFDEE9] text-black cursor-pointer">💬 COMMENTS ({post.comments.length})_</button>
                    </div>
                    {openPostId === post.id && (
                      <div className={`mt-4 border-t-2 pt-4 p-3 border ${currentPage === 'cursed' ? 'bg-[#1a1a1a] border-red-600' : 'bg-gray-50 border-black'}`}>
                        <div className="space-y-2 mb-3 max-h-[120px] overflow-y-auto">
                          {post.comments.map(c => <div key={c.id} className="bg-white text-black p-2 border border-black text-xs"><p className="font-bold">{c.text}</p></div>)}
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

          {/* STICKY RULES */}
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
