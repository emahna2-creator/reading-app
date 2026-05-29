import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from './supabase.js';

const Fonts = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Klee+One:wght@400;600&family=DM+Mono:wght@300;400&family=Zen+Maru+Gothic:wght@400;500;700&display=swap');

    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

    :root{
      /* mint-forward cream palette — no dark backgrounds */
      --choco:       #5c3d2e;   /* text only */
      --choco-soft:  #9a7060;   /* secondary text */
      --cream:       #fdf6ec;   /* global bg */
      --cream2:      #f5ead6;   /* subtle surface */
      --white:       #ffffff;
      --mint:        #5bbfb5;   /* primary accent — slightly deeper for contrast */
      --mint-mid:    #7ecec6;   /* buttons, highlights */
      --mint-light:  #a8e0db;   /* borders, chips */
      --mint-pale:   #e0f5f3;   /* card bg tint */
      --mint-xpale:  #f0faf9;   /* very light bg */
      --mimosa:      #f5c842;
      --mimosa-pale: #fdf3bb;
      --mimosa-soft: #d4a820;
      --rule:        #d6ecea;   /* mint-tinted dividers */
      --ink3:        #9a8878;
    }

    body { font-family:'Zen Maru Gothic',sans-serif; background:var(--cream); color:var(--choco); }
    .klee { font-family:'Klee One', cursive; }
    .mono { font-family:'DM Mono', monospace; }

    /* === LAYOUT === */
    .app { display:flex; flex-direction:column; height:100vh; overflow:hidden; }

    /* topbar — cream bg, mint accent stripe */
    .topbar {
      display:flex; align-items:center; gap:12px;
      padding:10px 18px;
      background: var(--cream);
      border-bottom: 3px solid var(--mint-light);
      flex-shrink:0;
    }

    /* tabs */
    .tabs {
      display:flex; flex-shrink:0; padding:0 18px;
      background: var(--cream);
      border-bottom: 2px solid var(--mint-light);
      gap:2px;
    }
    .tab {
      font-family:'Klee One',cursive; font-size:12px;
      padding:9px 14px; border:none; background:transparent;
      color:var(--choco-soft); cursor:pointer;
      border-bottom:3px solid transparent; margin-bottom:-2px;
      letter-spacing:.04em; transition:color .15s,border-color .15s;
    }
    .tab.on { color:var(--mint); border-bottom-color:var(--mint); font-weight:600; }
    .tab:hover { color:var(--choco); }

    .content { flex:1; overflow-y:auto; padding:16px 18px; }

    /* === CARDS === */
    .card {
      background:var(--white); border:2px solid var(--mint-light);
      border-radius:14px; padding:14px;
      transition:box-shadow .15s, transform .15s;
      cursor:pointer; position:relative; overflow:hidden;
    }
    .card::before {
      content:''; position:absolute; left:0; top:0; bottom:0; width:4px;
      background:var(--book-color, var(--mint));
      border-radius:14px 0 0 14px;
    }
    .card:hover { box-shadow:0 4px 18px rgba(91,191,181,.18); transform:translateY(-2px); }
    .card.sel { border-color:var(--mint); box-shadow:0 4px 22px rgba(91,191,181,.28); transform:translateY(-2px); background:var(--mint-xpale); }

    /* cover */
    .cover { width:48px; height:66px; object-fit:cover; border-radius:4px; flex-shrink:0; border:1px solid var(--rule); }
    .cover-loading { width:48px; height:66px; flex-shrink:0; border-radius:4px; background:linear-gradient(90deg,var(--mint-pale) 25%,var(--mint-xpale) 50%,var(--mint-pale) 75%); background-size:200%; animation:shimmer 1.2s infinite; border:1px solid var(--rule); }
    @keyframes shimmer { 0%{background-position:200%} 100%{background-position:-200%} }
    .cover-ph {
      width:48px; height:66px; flex-shrink:0; border-radius:4px;
      background:var(--mint-pale); border:1.5px dashed var(--mint-light);
      display:flex; align-items:center; justify-content:center;
      font-size:9px; color:var(--mint); text-align:center; padding:4px; line-height:1.3;
    }

    /* badges */
    .badge {
      font-family:'Klee One',cursive; font-size:10px; padding:2px 8px;
      border-radius:999px; display:inline-block; font-weight:600;
    }
    .badge-reading { background:var(--mint-pale); color:var(--mint); border:1.5px solid var(--mint-light); }
    .badge-done    { background:var(--mimosa-pale); color:var(--mimosa-soft); border:1.5px solid var(--mimosa); }
    .badge-want    { background:var(--cream2); color:var(--choco-soft); border:1.5px solid #e0d0c0; }

    /* progress */
    .pbar { height:5px; background:var(--mint-pale); border-radius:99px; overflow:hidden; }
    .pfill { height:100%; border-radius:99px; transition:width .5s; }

    /* inputs */
    .inp {
      background:transparent; border:none;
      border-bottom:1.5px solid var(--mint-light);
      padding:6px 4px; font-family:'Zen Maru Gothic',sans-serif;
      font-size:13px; color:var(--choco); width:100%; outline:none;
    }
    .inp:focus { border-bottom-color:var(--mint); }
    .inp::placeholder { color:var(--ink3); }

    /* buttons */
    .btn { border:none; padding:8px 18px; font-family:'Klee One',cursive; font-size:13px; cursor:pointer; letter-spacing:.04em; border-radius:10px; transition:all .15s; }
    .btn-mint  { background:var(--mint); color:#fff; }
    .btn-mint:hover { background:var(--mint-mid); }
    .btn-mint:disabled { opacity:.4; cursor:not-allowed; }
    .btn-choco { background:var(--mint); color:#fff; }   /* repurpose: was dark, now mint */
    .btn-choco:hover { background:var(--mint-mid); }
    .btn-o { background:var(--white); color:var(--mint); border:1.5px solid var(--mint-light); }
    .btn-o:hover { background:var(--mint-pale); }
    .btn-mimosa { background:var(--mimosa); color:var(--choco); }
    .btn-mimosa:hover { background:var(--mimosa-soft); color:#fff; }

    /* section toggle */
    .stog { display:flex; align-items:center; gap:8px; padding:10px 0; cursor:pointer; border-bottom:1.5px solid var(--rule); user-select:none; }
    .arr { font-size:9px; color:var(--mint-light); transition:transform .2s; display:inline-block; }
    .arr.o { transform:rotate(90deg); }

    /* highlight blocks */
    .hl { border-left:3px solid currentColor; padding:10px 12px; margin-bottom:10px; border-radius:0 10px 10px 0; font-size:13px; line-height:1.9; }
    .hl.y { background:var(--mimosa-pale); color:var(--mimosa-soft); }
    .hl.y p { color:var(--choco); }
    .hl.p { background:#ffe8f0; color:#e07090; }
    .hl.p p { color:var(--choco); }
    .hl.b { background:var(--mint-pale); color:var(--mint); }
    .hl.b p { color:var(--choco); }

    /* modal */
    .modal-bg { position:fixed; inset:0; background:rgba(91,191,181,.18); backdrop-filter:blur(3px); display:flex; align-items:center; justify-content:center; z-index:200; }
    .modal { background:var(--cream); padding:24px; width:370px; max-width:92vw; border-radius:18px; box-shadow:0 8px 40px rgba(91,191,181,.22); border:2px solid var(--mint-light); max-height:88vh; overflow-y:auto; }

    /* toast */
    .toast { position:fixed; bottom:20px; right:20px; background:var(--mint); color:#fff; padding:10px 18px; font-family:'Klee One',cursive; font-size:12px; border-radius:999px; box-shadow:0 4px 20px rgba(91,191,181,.45); z-index:999; animation:su .3s ease; }
    @keyframes su { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
    .fin { animation:fi .25s ease; }
    @keyframes fi { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }

    /* timer ring */
    .tring { transition:stroke-dashoffset 1s linear; }

    /* calendar */
    .cal-wrap { background:var(--white); border-radius:16px; border:2px solid var(--mint-light); overflow:hidden; }
    .cal-header-row { display:grid; grid-template-columns:40px repeat(7,1fr); background:var(--mint); color:#fff; }
    .cal-dow { font-family:'Klee One',cursive; font-size:11px; text-align:center; padding:6px 2px; }
    .cal-row { display:grid; grid-template-columns:40px repeat(7,1fr); border-bottom:1px solid var(--rule); min-height:72px; }
    .cal-row:last-child { border-bottom:none; }
    .cal-week-label { background:var(--mint-xpale); display:flex; flex-direction:column; align-items:center; justify-content:center; border-right:1px solid var(--rule); padding:4px; gap:3px; }
    .cal-cell { border-right:1px solid var(--rule); padding:4px; position:relative; background:var(--white); }
    .cal-cell:last-child { border-right:none; }
    .cal-cell.other-month { background:var(--cream2); opacity:.6; }
    .cal-cell.today-cell { background:var(--mint-xpale); }
    .cal-cell.today-cell .day-num { background:var(--mint); color:#fff; border-radius:50%; width:20px; height:20px; display:flex; align-items:center; justify-content:center; }
    .day-num { font-family:'Klee One',cursive; font-size:11px; color:var(--choco-soft); width:20px; height:20px; display:flex; align-items:center; justify-content:center; }
    .cal-book-dot { display:flex; align-items:center; gap:2px; margin-top:2px; }
    .dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
    .cal-min-label { font-size:8px; font-family:'DM Mono'; color:var(--ink3); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

    /* import panel */
    .import-panel { background:var(--mint-pale); border:2px dashed var(--mint-light); border-radius:14px; padding:20px; text-align:center; }
    .import-drop { border:2px dashed var(--mint); border-radius:10px; padding:24px 16px; background:var(--white); cursor:pointer; transition:background .15s; }
    .import-drop:hover { background:var(--mint-xpale); }

    /* cover gallery */
    .cover-gallery { display:grid; grid-template-columns:repeat(auto-fill,minmax(80px,1fr)); gap:12px; }
    .gallery-item { display:flex; flex-direction:column; align-items:center; gap:6px; }
    .gallery-cover { width:80px; height:112px; object-fit:cover; border-radius:8px; box-shadow:0 3px 14px rgba(91,191,181,.2); border:2px solid var(--mint-light); }
    .gallery-cover-ph { width:80px; height:112px; background:var(--mint-pale); border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:9px; color:var(--mint); text-align:center; padding:6px; border:2px dashed var(--mint-light); line-height:1.4; }

    /* session log */
    .slog { display:flex; justify-content:space-between; align-items:center; padding:9px 14px; border-bottom:1px solid var(--rule); }
    .slog:last-child { border-bottom:none; }

    /* scroll */
    html,body,#root,.app,.content{background:var(--cream)!important;color:var(--choco)!important;color-scheme:light!important}
    .content{background:var(--cream)!important}
    ::-webkit-scrollbar { width:4px; }
    ::-webkit-scrollbar-thumb { background:var(--mint-light); border-radius:4px; }

    select { font-family:'Zen Maru Gothic',sans-serif; font-size:12px; background:var(--cream); border:1.5px solid var(--mint-light); padding:5px 10px; color:var(--choco); outline:none; border-radius:8px; }
    textarea { font-family:'Zen Maru Gothic',sans-serif; font-size:12px; resize:vertical; border:1.5px solid var(--rule); padding:10px; width:100%; background:var(--cream); color:var(--choco); outline:none; border-radius:8px; }
    textarea:focus { border-color:var(--mint); }
  `}</style>
);

// ── helpers ─────────────────────────────────────────────────────
const pad = n => String(n).padStart(2,'0');
const fmtT = s => `${pad(Math.floor(s/3600))}:${pad(Math.floor((s%3600)/60))}:${pad(s%60)}`;
const fmtM = m => m >= 60 ? `${Math.floor(m/60)}h${m%60>0 ? pad(m%60)+'m' : ''}` : `${m}m`;
const todayStr = () => new Date().toISOString().slice(0,10);
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate()+n); return r.toISOString().slice(0,10); };
const weekStartOf = d => { const r = new Date(d); r.setDate(r.getDate() - r.getDay()); return r.toISOString().slice(0,10); };
const monthStartOf = d => d.slice(0,7)+'-01';

const COLORS = ['#7ec8c0','#f5c842','#c4936a','#e07b7b','#8cba80','#a78bd4','#4a8fa8'];

// ── sample data ─────────────────────────────────────────────────
const INIT_BOOKS = [];

// ── StatusBadge ─────────────────────────────────────────────────
function StatusBadge({status}){
  if(status==='reading') return <span className="badge badge-reading">読中 📖</span>;
  if(status==='done')    return <span className="badge badge-done">読了 ✨</span>;
  return <span className="badge badge-want">積読 📚</span>;
}

// ── BookSearchSelect ─────────────────────────────────────────────
function BookSearchSelect({books, selectedId, onChange, filterFn}){
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const candidates = (filterFn ? books.filter(filterFn) : books)
    .filter(b => query === '' || b.title.includes(query) || b.author.includes(query) || (b.genre||'').includes(query));
  const selected = books.find(b => b.id === selectedId);

  useEffect(() => {
    const handler = e => { if(ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return(
    <div ref={ref} style={{position:'relative', flex:1, minWidth:0}}>
      <div onClick={()=>setOpen(o=>!o)}
        style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',
          background:'var(--white)',border:'1.5px solid '+(open?'var(--mint)':'var(--mint-light)'),borderRadius:10,
          cursor:'pointer'}}>
        {selected && <div style={{width:8,height:8,borderRadius:'50%',background:selected.color,flexShrink:0}}/>}
        <span className="klee" style={{fontSize:13,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'var(--choco)'}}>
          {selected ? selected.title : '本を選択…'}
        </span>
        <span style={{fontSize:10,color:'var(--mint)',flexShrink:0}}>{open?'▲':'▼'}</span>
      </div>

      {open && (
        <div className="fin" style={{position:'absolute',top:'calc(100% + 4px)',left:0,right:0,
          background:'var(--white)',border:'1.5px solid var(--mint-light)',borderRadius:10,
          boxShadow:'0 6px 24px rgba(91,191,181,.2)',zIndex:50,overflow:'hidden'}}>
          <div style={{padding:'8px 10px',borderBottom:'1px solid var(--rule)',display:'flex',alignItems:'center',gap:6}}>
            <span style={{fontSize:12,color:'var(--mint)'}}>🔍</span>
            <input autoFocus value={query} onChange={e=>setQuery(e.target.value)}
              placeholder="タイトル・著者で検索…"
              style={{flex:1,border:'none',outline:'none',fontSize:12,
                fontFamily:'Zen Maru Gothic,sans-serif',background:'transparent',color:'var(--choco)'}}/>
            {query && (
              <button onClick={()=>setQuery('')}
                style={{background:'none',border:'none',cursor:'pointer',fontSize:12,color:'var(--ink3)'}}>×</button>
            )}
          </div>
          <div style={{maxHeight:220,overflowY:'auto'}}>
            {candidates.length === 0
              ? <div style={{padding:'16px',textAlign:'center',fontSize:12,color:'var(--ink3)'}}>見つからなかった…📚</div>
              : candidates.map(b => (
                <div key={b.id}
                  onClick={()=>{ onChange(b.id); setOpen(false); setQuery(''); }}
                  style={{display:'flex',alignItems:'center',gap:10,padding:'9px 12px',cursor:'pointer',
                    background: b.id===selectedId ? 'var(--mint-pale)' : 'transparent'}}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--mint-xpale)'}
                  onMouseLeave={e=>e.currentTarget.style.background= b.id===selectedId?'var(--mint-pale)':'transparent'}>
                  <div style={{width:8,height:8,borderRadius:'50%',background:b.color,flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div className="klee" style={{fontSize:12,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{b.title}</div>
                    <div style={{fontSize:10,color:'var(--ink3)'}}>{b.author}</div>
                  </div>
                  <StatusBadge status={b.status}/>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}


// ── BookCover — proxies Amazon images via /api/cover ──────────
function BookCover({book, width=48, height=66, radius=4}){
  const [failed, setFailed] = useState(false);

  // Build proxy URL from coverUrl (Amazon) or isbn (Open Library fallback)
  const getUrl = () => {
    if(book.coverUrl && !failed) {
      // Route through our Vercel proxy to bypass CORS
      return `/api/cover?url=${encodeURIComponent(book.coverUrl)}`;
    }
    if(book.isbn) {
      const clean = book.isbn.replace(/[^0-9X]/gi,'');
      if(clean.length >= 10) return `https://covers.openlibrary.org/b/isbn/${clean}-M.jpg`;
    }
    return null;
  };

  const url = getUrl();
  const style = {width, height, borderRadius:radius, flexShrink:0, objectFit:'cover', border:'1px solid var(--rule)'};
  const ph = (
    <div style={{...style, background:'var(--mint-pale)', display:'flex', alignItems:'center',
      justifyContent:'center', fontSize:8, color:'var(--mint)', textAlign:'center',
      padding:4, lineHeight:1.4, border:'1.5px dashed var(--mint-light)', wordBreak:'break-all'}}>
      {book.title?.slice(0,12)}
    </div>
  );
  if(!url) return ph;
  return <img src={url} alt="" style={style} onError={()=>setFailed(true)}/>;
}

// ══════════════════════════════════════════════════════════════
// ① MONTHLY CALENDAR TIMELINE
// ══════════════════════════════════════════════════════════════
function MonthlyCalendar({books}){
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-indexed
  const today = todayStr();

  const dim = new Date(year, month+1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay(); // 0=Sun

  // pad to full weeks
  const cells = [];
  for(let i=0; i<firstDow; i++) cells.push({d: null});
  for(let d=1; d<=dim; d++) cells.push({d});
  while(cells.length % 7 !== 0) cells.push({d: null});

  const weeks = [];
  for(let i=0; i<cells.length; i+=7) weeks.push(cells.slice(i,i+7));

  // session map: date -> [{bookId, minutes, color, title}]
  const sessionMap = {};
  books.forEach(b=>{
    b.sessions.forEach(s=>{
      if(!sessionMap[s.date]) sessionMap[s.date]=[];
      sessionMap[s.date].push({bookId:b.id, minutes:s.minutes, color:b.color, title:b.title});
    });
  });

  const ym = `${year}-${pad(month+1)}`;
  const monthSessions = Object.entries(sessionMap).filter(([d])=>d.startsWith(ym));
  const monthTotal = monthSessions.reduce((a,[,v])=>a+v.reduce((x,s)=>x+s.minutes,0),0);
  const monthDays = monthSessions.length;

  // week total
  const weekTotal = (weekCells) => {
    let tot=0;
    weekCells.forEach(c=>{
      if(!c.d) return;
      const ds=`${year}-${pad(month+1)}-${pad(c.d)}`;
      (sessionMap[ds]||[]).forEach(s=>tot+=s.minutes);
    });
    return tot;
  };

  const DOW = ['日','月','火','水','木','金','土'];

  const prev=()=>{ if(month===0){setYear(y=>y-1);setMonth(11);}else setMonth(m=>m-1); };
  const next=()=>{ if(month===11){setYear(y=>y+1);setMonth(0);}else setMonth(m=>m+1); };

  return(
    <div>
      {/* header */}
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
        <button onClick={prev} style={{background:'none',border:'none',fontSize:20,cursor:'pointer',color:'var(--choco-soft)'}}>‹</button>
        <div>
          <span className="klee" style={{fontSize:24,fontWeight:600,color:'var(--choco)'}}>{year}年</span>
          <span className="klee" style={{fontSize:18,color:'var(--mint)',marginLeft:8}}>{month+1}月</span>
        </div>
        <button onClick={next} style={{background:'none',border:'none',fontSize:20,cursor:'pointer',color:'var(--choco-soft)'}}>›</button>
        <div style={{marginLeft:'auto',display:'flex',gap:16}}>
          <div style={{textAlign:'center'}}>
            <div className="klee" style={{fontSize:20,color:'var(--mint)',fontWeight:600}}>{fmtM(monthTotal)}</div>
            <div style={{fontSize:9,color:'var(--ink3)'}}>今月の読書時間</div>
          </div>
          <div style={{textAlign:'center'}}>
            <div className="klee" style={{fontSize:20,color:'var(--mimosa-soft)',fontWeight:600}}>{monthDays}日</div>
            <div style={{fontSize:9,color:'var(--ink3)'}}>読書した日</div>
          </div>
        </div>
      </div>

      {/* calendar */}
      <div className="cal-wrap">
        {/* dow header */}
        <div className="cal-header-row">
          <div style={{background:'var(--choco)',borderRight:'1px solid rgba(255,255,255,.15)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <span style={{fontSize:9,color:'rgba(255,255,255,.5)',fontFamily:'DM Mono'}}>週計</span>
          </div>
          {DOW.map((d,i)=>(
            <div key={d} className="cal-dow" style={{
              color: i===0?'#ffb3a7': i===6?'#a7e8e4':'var(--cream)',
              borderRight: i<6?'1px solid rgba(255,255,255,.1)':''
            }}>{d}</div>
          ))}
        </div>

        {/* weeks */}
        {weeks.map((wk,wi)=>{
          const wTotal = weekTotal(wk);
          return(
            <div key={wi} className="cal-row">
              {/* week label */}
              <div className="cal-week-label">
                {wTotal>0?(
                  <>
                    <div className="mono" style={{fontSize:9,color:'var(--mint)',fontWeight:'bold'}}>{fmtM(wTotal)}</div>
                    <div style={{fontSize:7,color:'var(--ink3)'}}>今週</div>
                  </>
                ):(
                  <div style={{fontSize:8,color:'var(--rule)'}}>—</div>
                )}
              </div>

              {wk.map((cell,ci)=>{
                if(!cell.d) return(
                  <div key={ci} className="cal-cell other-month" style={{borderRight:ci<6?'1px solid var(--rule)':''}}/>
                );
                const ds=`${year}-${pad(month+1)}-${pad(cell.d)}`;
                const isToday = ds===today;
                const isSun = ci===0, isSat = ci===6;
                const sessions = sessionMap[ds]||[];
                const dayTotal = sessions.reduce((a,s)=>a+s.minutes,0);
                const isDoneDay = books.some(b=>b.endDate===ds);

                // group sessions by book (merge same-book same-day entries)
                const byBook = {};
                sessions.forEach(s=>{
                  if(!byBook[s.bookId]) byBook[s.bookId]={...s,minutes:0};
                  byBook[s.bookId].minutes+=s.minutes;
                });
                const bookEntries = Object.values(byBook);
                const SHOW_MAX = 3; // dots visible without scroll

                return(
                  <div key={ci} className={`cal-cell${isToday?' today-cell':''}`}
                    style={{borderRight:ci<6?'1px solid var(--rule)':'',minHeight:bookEntries.length>2?80:72}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                      <div className="day-num" style={{
                        color: isSun?'#e07b7b': isSat?'var(--mint)':'var(--choco-soft)',
                      }}>{cell.d}</div>
                      {isDoneDay && <span style={{fontSize:9}} title="読了！">⭐</span>}
                    </div>

                    {/* book dots — show all books, stack compactly */}
                    {bookEntries.slice(0, SHOW_MAX).map((s,i)=>(
                      <div key={i} className="cal-book-dot" title={s.title+' '+fmtM(s.minutes)}>
                        <div className="dot" style={{background:s.color,flexShrink:0}}/>
                        <span className="cal-min-label">{fmtM(s.minutes)}</span>
                      </div>
                    ))}

                    {/* overflow badge when 4+ books */}
                    {bookEntries.length > SHOW_MAX && (
                      <div style={{display:'flex',alignItems:'center',gap:2,marginTop:1}}>
                        {bookEntries.slice(SHOW_MAX).map((s,i)=>(
                          <div key={i} style={{width:6,height:6,borderRadius:'50%',background:s.color}} title={s.title}/>
                        ))}
                        <span style={{fontSize:7,color:'var(--ink3)'}}>+{bookEntries.length-SHOW_MAX}</span>
                      </div>
                    )}

                    {/* day total when 2+ books */}
                    {bookEntries.length>1&&(
                      <div className="mono" style={{fontSize:7,color:'var(--mint)',marginTop:1,fontWeight:'bold'}}>
                        計{fmtM(dayTotal)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* legend */}
      <div style={{display:'flex',gap:12,marginTop:10,flexWrap:'wrap',alignItems:'center'}}>
        {books.filter(b=>b.sessions.some(s=>s.date.startsWith(ym))).map(b=>(
          <div key={b.id} style={{display:'flex',alignItems:'center',gap:5}}>
            <div style={{width:10,height:10,borderRadius:'50%',background:b.color}}/>
            <span style={{fontSize:9,color:'var(--choco-soft)'}}>{b.title.length>10?b.title.slice(0,10)+'…':b.title}</span>
          </div>
        ))}
        <div style={{display:'flex',alignItems:'center',gap:4}}>
          <span style={{fontSize:10}}>⭐</span>
          <span style={{fontSize:9,color:'var(--ink3)'}}>読了日</span>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ② SESSION LOG
// ══════════════════════════════════════════════════════════════
function SessionLog({books}){
  const [period,setPeriod]=useState('week');
  const [open,setOpen]=useState({});
  const today=todayStr();

  const inPeriod=d=>{
    if(period==='week') return d>=weekStartOf(today)&&d<=today;
    if(period==='month') return d>=monthStartOf(today)&&d<=today;
    return true;
  };

  const allSessions=books.flatMap(b=>
    b.sessions.filter(s=>inPeriod(s.date)).map(s=>({...s,bookId:b.id,bookTitle:b.title,bookColor:b.color}))
  ).sort((a,b)=>b.date.localeCompare(a.date)||b.start.localeCompare(a.start));

  const totalMin=allSessions.reduce((a,s)=>a+s.minutes,0);
  const byBook={};
  allSessions.forEach(s=>{
    if(!byBook[s.bookId]) byBook[s.bookId]={title:s.bookTitle,color:s.bookColor,minutes:0,sessions:[]};
    byBook[s.bookId].minutes+=s.minutes;
    byBook[s.bookId].sessions.push(s);
  });

  return(
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14,flexWrap:'wrap'}}>
        <h2 className="klee" style={{fontSize:16,fontWeight:600}}>📋 セッションログ</h2>
        <div style={{marginLeft:'auto',display:'flex',gap:4}}>
          {[['week','今週'],['month','今月'],['all','全期間']].map(([v,l])=>(
            <button key={v} onClick={()=>setPeriod(v)}
              style={{padding:'5px 12px',fontSize:11,fontFamily:'Klee One',cursor:'pointer',borderRadius:8,
                background:period===v?'var(--mint)':'transparent',
                color:period===v?'#fff':'var(--choco-soft)',
                border:period===v?'none':'1.5px solid var(--rule)'}}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* summary */}
      <div style={{display:'flex',gap:12,padding:'12px 16px',background:'linear-gradient(135deg,var(--mint-pale),var(--mimosa-pale))',borderRadius:12,marginBottom:14,flexWrap:'wrap'}}>
        {[
          ['📖',fmtM(totalMin),'読書時間'],
          ['🎯',String(allSessions.length)+'回','セッション数'],
          ['📅',String(new Set(allSessions.map(s=>s.date)).size)+'日','読書日数'],
        ].map(([em,val,label])=>(
          <div key={label} style={{flex:1,textAlign:'center',minWidth:70}}>
            <div style={{fontSize:16}}>{em}</div>
            <div className="klee" style={{fontSize:18,color:'var(--choco)',fontWeight:600}}>{val}</div>
            <div style={{fontSize:9,color:'var(--ink3)'}}>{label}</div>
          </div>
        ))}
      </div>

      {Object.values(byBook).sort((a,b)=>b.minutes-a.minutes).map(bk=>{
        const bid=books.find(x=>x.title===bk.title)?.id;
        const isOpen=open[bid];
        return(
          <div key={bid} style={{marginBottom:8,border:'1.5px solid var(--rule)',borderRadius:12,overflow:'hidden'}}>
            <div className="stog" style={{padding:'10px 14px',border:'none'}}
              onClick={()=>setOpen(o=>({...o,[bid]:!o[bid]}))}>
              <div style={{width:10,height:10,borderRadius:'50%',background:bk.color,flexShrink:0}}/>
              <span className="klee" style={{fontSize:13,fontWeight:600,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{bk.title}</span>
              <span className="klee" style={{fontSize:13,color:'var(--mint)',flexShrink:0,fontWeight:600}}>{fmtM(bk.minutes)}</span>
              <span className="arr" style={{marginLeft:8,flexShrink:0}}>{isOpen?'▼':'▶'}</span>
            </div>
            {isOpen&&(
              <div style={{borderTop:'1px solid var(--rule)',background:'var(--mint-xpale)'}} className="fin">
                {bk.sessions.map(s=>(
                  <div key={s.id} className="slog">
                    <div>
                      <span className="mono" style={{fontSize:11,color:'var(--choco-soft)'}}>{s.date}</span>
                      <span className="mono" style={{fontSize:11,color:'var(--ink3)',marginLeft:8}}>{s.start}</span>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      {s.note&&<span style={{fontSize:10,color:'var(--ink3)',fontStyle:'italic'}}>{s.note}</span>}
                      <span className="klee" style={{fontSize:13,color:'var(--mint)',fontWeight:600}}>{fmtM(s.minutes)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {allSessions.length===0&&(
        <div style={{textAlign:'center',padding:'32px 0',color:'var(--ink3)'}}>
          <div style={{fontSize:32,marginBottom:8}}>📚</div>
          <p className="klee">この期間の読書記録はまだないよ！</p>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ③ BOOKSHELF
// ══════════════════════════════════════════════════════════════
function BookShelf({books,selectedId,onSelect,onEdit}){
  const [filter,setFilter]=useState('all');
  const [viewMode,setViewMode]=useState('list'); // list | gallery
  const today=todayStr();
  const ym=today.slice(0,7);

  const filtered=(()=>{
    if(filter==='all') return books;
    if(filter==='this-month') return books.filter(b=>b.sessions.some(s=>s.date.startsWith(ym)));
    return books.filter(b=>b.status===filter);
  })();

  return(
    <div>
      <div style={{display:'flex',gap:6,marginBottom:12,flexWrap:'wrap',alignItems:'center'}}>
        <div style={{display:'flex',gap:4,flex:1,flexWrap:'wrap'}}>
          {[['all','すべて'],['reading','読中'],['done','読了'],['want','積読'],['this-month','今月読んだ']].map(([v,l])=>(
            <button key={v} onClick={()=>{setFilter(v);if(v==='this-month')setViewMode('gallery');}}
              style={{fontSize:10,padding:'4px 10px',cursor:'pointer',fontFamily:'Klee One',borderRadius:8,
                background:filter===v?'var(--mint)':'var(--cream2)',
                color:filter===v?'#fff':'var(--choco-soft)',
                border:filter===v?'none':'1px solid var(--rule)'}}>
              {l}{v!=='this-month'&&`（${v==='all'?books.length:books.filter(b=>b.status===v).length}）`}
            </button>
          ))}
        </div>
        {/* view toggle */}
        <div style={{display:'flex',gap:2}}>
          <button onClick={()=>setViewMode('list')} title="リスト表示"
            style={{padding:'4px 8px',borderRadius:6,background:viewMode==='list'?'var(--choco)':'var(--cream2)',
              color:viewMode==='list'?'#fff':'var(--ink3)',border:'none',cursor:'pointer',fontSize:14}}>☰</button>
          <button onClick={()=>setViewMode('gallery')} title="表紙一覧"
            style={{padding:'4px 8px',borderRadius:6,background:viewMode==='gallery'?'var(--choco)':'var(--cream2)',
              color:viewMode==='gallery'?'#fff':'var(--ink3)',border:'none',cursor:'pointer',fontSize:14}}>⊞</button>
        </div>
      </div>

      {/* gallery mode */}
      {viewMode==='gallery'&&(
        <div>
          <p className="klee" style={{fontSize:11,color:'var(--ink3)',marginBottom:12}}>
            {filter==='this-month'?`📖 ${today.slice(0,7).replace('-','年')}月に読んだ本`:'📚 表紙一覧'}
          </p>
          <div className="cover-gallery">
            {filtered.map(book=>(
              <div key={book.id} className="gallery-item fin" onClick={()=>onSelect(book.id)}>
                <BookCover book={book} width={80} height={112} radius={8}/>
                <div style={{textAlign:'center',maxWidth:80}}>
                  <div style={{fontSize:9,color:'var(--choco-soft)',overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',fontFamily:'Zen Maru Gothic'}}>{book.title}</div>
                  <StatusBadge status={book.status}/>
                </div>
              </div>
            ))}
          </div>
          {filtered.length===0&&(
            <div style={{textAlign:'center',padding:'32px 0',color:'var(--ink3)'}}>
              <div style={{fontSize:32,marginBottom:8}}>📚</div>
              <p className="klee">まだ記録がないよ！</p>
            </div>
          )}
        </div>
      )}

      {/* list mode */}
      {viewMode==='list'&&(
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {filtered.map(book=>{
            const totalMin=book.sessions.reduce((a,s)=>a+s.minutes,0);
            const prog=book.totalPages?Math.round(book.currentPage/book.totalPages*100):0;
            return(
              <div key={book.id} className={`card fin ${selectedId===book.id?'sel':''}`}
                style={{'--book-color':book.color}} onClick={()=>onSelect(book.id)}>
                <div style={{paddingLeft:8,display:'flex',gap:12}}>
                  <BookCover book={book}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:6}}>
                      <div style={{minWidth:0}}>
                        <div className="klee" style={{fontSize:14,fontWeight:600,lineHeight:1.4,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{book.title}</div>
                        <div style={{fontSize:10,color:'var(--ink3)',marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{book.author}</div>
                      </div>
                      <StatusBadge status={book.status}/>
                    </div>
                    {book.status!=='want'&&(
                      <div style={{marginTop:8}}>
                        <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                          <span className="mono" style={{fontSize:9,color:'var(--ink3)'}}>{book.currentPage}/{book.totalPages}p</span>
                          <span className="mono" style={{fontSize:9,color:'var(--ink3)'}}>{fmtM(totalMin)}</span>
                        </div>
                        <div className="pbar"><div className="pfill" style={{width:prog+'%',background:book.color}}/></div>
                      </div>
                    )}
                    <div style={{marginTop:6,display:'flex',gap:6,alignItems:'center',flexWrap:'wrap'}}>
                      <span style={{fontSize:9,color:'var(--ink3)',background:'var(--cream2)',padding:'2px 8px',borderRadius:99}}>{book.genre}</span>
                      {book.highlights.length>0&&<span style={{fontSize:9,color:'var(--mimosa-soft)',background:'var(--mimosa-pale)',padding:'2px 8px',borderRadius:99}}>✦ {book.highlights.length}件</span>}
                      <button onClick={e=>{e.stopPropagation();onEdit(book)}}
                        style={{marginLeft:'auto',fontSize:9,background:'none',border:'none',color:'var(--ink3)',cursor:'pointer'}}>✏️ 編集</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// HIGHLIGHT PANEL
// ══════════════════════════════════════════════════════════════
function HighlightPanel({books,selectedId,onSelectBook,onAddHighlight}){
  const book=books.find(b=>b.id===selectedId)||books[0];
  const [showImport,setShowImport]=useState(false);
  const [kindleText,setKindleText]=useState('');
  const [openSec,setOpenSec]=useState({hl:true,memo:true});
  const [memos,setMemos]=useState({});
  const [copied,setCopied]=useState(false);

  const importKindle=()=>{
    if(!kindleText.trim())return;
    kindleText.split('\n').filter(l=>l.trim().length>5).forEach(line=>{
      onAddHighlight(book.id,{text:line.trim(),color:'y',page:null,note:''});
    });
    setKindleText('');setShowImport(false);
  };

  const copyAll=()=>{
    const txt=[`【${book.title}】`,'','▶ ハイライト',
      ...book.highlights.map((h,i)=>`${i+1}. ${h.text}${h.note?' ← '+h.note:''}`),
      '','▶ メモ', memos[book.id]||'（なし）',
    ].join('\n');
    navigator.clipboard.writeText(txt).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),1500)}).catch(()=>{});
  };

  return(
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12,flexWrap:'wrap'}}>
        <BookSearchSelect books={books} selectedId={selectedId} onChange={onSelectBook}/>
        <button onClick={copyAll}
          style={{padding:'5px 14px',borderRadius:999,fontSize:11,fontFamily:'Klee One',cursor:'pointer',
            background:copied?'var(--mint)':'var(--mimosa)',color:copied?'#fff':'var(--choco)',border:'none'}}>
          {copied?'✅ コピーした！':'📋 一括コピー'}
        </button>
      </div>

      {book&&(
        <div style={{display:'flex',gap:12,padding:'12px',borderRadius:12,background:'var(--mint-pale)',marginBottom:14}}>
          <BookCover book={book}/>
          <div>
            <div className="klee" style={{fontSize:14,fontWeight:600}}>{book.title}</div>
            <div style={{fontSize:10,color:'var(--ink3)',marginTop:2}}>{book.author}</div>
            <div style={{marginTop:6,display:'flex',gap:6,flexWrap:'wrap',alignItems:'center'}}>
              <StatusBadge status={book.status}/>
              {book.startDate&&<span className="mono" style={{fontSize:9,color:'var(--ink3)'}}>{book.startDate}〜{book.endDate||'読書中'}</span>}
            </div>
          </div>
        </div>
      )}

      {/* highlights */}
      <div className="stog" onClick={()=>setOpenSec(s=>({...s,hl:!s.hl}))}>
        <span className={`arr ${openSec.hl?'o':''}`}>▶</span>
        <span className="klee" style={{fontSize:13,fontWeight:600}}>✨ ハイライト</span>
        <span className="mono" style={{fontSize:10,color:'var(--ink3)',marginLeft:'auto'}}>{book?.highlights.length||0}件</span>
      </div>
      {openSec.hl&&(
        <div className="fin" style={{marginTop:10}}>
          <button className="btn btn-mimosa" style={{fontSize:11,padding:'5px 12px',marginBottom:10}}
            onClick={()=>setShowImport(v=>!v)}>Kindleから取り込む 📱</button>
          {showImport&&(
            <div style={{padding:14,background:'var(--cream2)',borderRadius:10,marginBottom:12}} className="fin">
              <p style={{fontSize:10,color:'var(--ink3)',marginBottom:8}}>ハイライトを1行1件で貼り付けてね！</p>
              <textarea value={kindleText} onChange={e=>setKindleText(e.target.value)}
                placeholder={'大切なものは目に見えない。\n内心をうかがい知るのは難しい。'} rows={5}/>
              <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:8}}>
                <button className="btn btn-o" style={{fontSize:11,padding:'5px 12px'}} onClick={()=>setShowImport(false)}>キャンセル</button>
                <button className="btn btn-mint" style={{fontSize:11,padding:'5px 12px'}} onClick={importKindle}>取り込む！</button>
              </div>
            </div>
          )}
          {(book?.highlights||[]).length===0
            ?<p style={{fontSize:12,color:'var(--ink3)',padding:'12px 0'}}>まだハイライトがないよ〜</p>
            :(book.highlights).map(h=>(
              <div key={h.id} className={`hl ${h.color}`}>
                <p>{h.text}</p>
                <div style={{display:'flex',gap:8,marginTop:6,alignItems:'center'}}>
                  {h.page&&<span className="mono" style={{fontSize:9,color:'var(--ink3)'}}>p.{h.page}</span>}
                  {h.note&&<span style={{fontSize:11,color:'var(--ink3)',fontStyle:'italic'}}>→ {h.note}</span>}
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* memo */}
      <div className="stog" style={{marginTop:8}} onClick={()=>setOpenSec(s=>({...s,memo:!s.memo}))}>
        <span className={`arr ${openSec.memo?'o':''}`}>▶</span>
        <span className="klee" style={{fontSize:13,fontWeight:600}}>📝 読書メモ</span>
      </div>
      {openSec.memo&&(
        <div className="fin" style={{marginTop:10}}>
          <textarea rows={6} placeholder="感想・気づき・引用など何でも！"
            value={memos[book?.id]||''} onChange={e=>setMemos(m=>({...m,[book.id]:e.target.value}))}
            style={{background:'var(--mimosa-pale)',borderColor:'var(--mimosa)'}}/>
          <div style={{display:'flex',justifyContent:'flex-end',marginTop:6}}>
            <button onClick={()=>navigator.clipboard.writeText(memos[book?.id]||'').catch(()=>{})}
              style={{padding:'4px 12px',borderRadius:99,fontSize:10,fontFamily:'Klee One',cursor:'pointer',
                background:'var(--mimosa)',color:'var(--choco)',border:'none'}}>
              📋 メモをコピー
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// TIMER
// ══════════════════════════════════════════════════════════════
function TimerPanel({books,onSaveSession}){
  const readingBooks=books.filter(b=>b.status==='reading');
  const [selId,setSelId]=useState(readingBooks[0]?.id||books[0].id);
  const [running,setRunning]=useState(false);
  const [elapsed,setElapsed]=useState(0);
  const [startTime,setStartTime]=useState('');
  const ivRef=useRef(null);
  const book=books.find(b=>b.id===selId);
  const goal=30;
  const totalMin=book?.sessions.reduce((a,s)=>a+s.minutes,0)||0;

  const toggle=()=>{
    if(running){
      clearInterval(ivRef.current);setRunning(false);
      if(elapsed>=60) onSaveSession(selId,Math.round(elapsed/60),startTime);
    } else {
      const now=new Date();
      setStartTime(`${pad(now.getHours())}:${pad(now.getMinutes())}`);
      setRunning(true);
      ivRef.current=setInterval(()=>setElapsed(e=>e+1),1000);
    }
  };
  const reset=()=>{clearInterval(ivRef.current);setRunning(false);setElapsed(0);setStartTime('');};
  useEffect(()=>()=>clearInterval(ivRef.current),[]);

  const pct=Math.min(elapsed/(goal*60),1);
  const r=52,circ=2*Math.PI*r,dash=circ*(1-pct);
  const color=book?.color||'var(--mint)';

  return(
    <div>
      <div style={{marginBottom:14}}>
        <label className="klee" style={{fontSize:12,color:'var(--ink3)',marginBottom:6,display:'block'}}>読む本 📖</label>
        <BookSearchSelect books={books} selectedId={selId} onChange={setSelId}
          filterFn={b=>b.status!=='want'}/>
      </div>

      {book&&(
        <div style={{display:'flex',gap:10,alignItems:'center',padding:'12px',borderRadius:12,background:'var(--mint-xpale)',marginBottom:14}}>
          <BookCover book={book} width={40} height={56} radius={6}/>
          <div style={{flex:1}}>
            <div className="klee" style={{fontSize:13,fontWeight:600}}>{book.title}</div>
            <div style={{fontSize:10,color:'var(--ink3)'}}>{book.author}</div>
            <StatusBadge status={book.status}/>
          </div>
          <div style={{textAlign:'right'}}>
            <div className="klee" style={{fontSize:16,color:'var(--mint)',fontWeight:600}}>{fmtM(totalMin)}</div>
            <div style={{fontSize:9,color:'var(--ink3)'}}>累計読書時間</div>
          </div>
        </div>
      )}

      <div style={{display:'flex',alignItems:'center',gap:20}}>
        <div style={{position:'relative',flexShrink:0}}>
          <svg width={128} height={128} viewBox="0 0 128 128">
            <circle cx={64} cy={64} r={r} fill="none" stroke="var(--rule)" strokeWidth={7}/>
            <circle cx={64} cy={64} r={r} fill="none"
              stroke={running?color:'var(--ink3)'}
              strokeWidth={7} strokeDasharray={circ} strokeDashoffset={dash}
              strokeLinecap="round" transform="rotate(-90 64 64)" className="tring"/>
          </svg>
          <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
            <span className="mono" style={{fontSize:20,fontWeight:400,letterSpacing:'-.02em',color:'var(--choco)'}}>{fmtT(elapsed)}</span>
            <span style={{fontSize:8,color:'var(--ink3)',marginTop:2}}>目標{goal}分</span>
            {running&&startTime&&<span style={{fontSize:8,color:'var(--mint)'}}>{startTime}〜</span>}
          </div>
        </div>

        <div style={{flex:1}}>
          <button className={`btn ${running?'btn-choco':'btn-mint'}`} style={{width:'100%',marginBottom:6,fontSize:14}} onClick={toggle}>
            {running?'⏸ 一時停止':elapsed>0?'▶ 再開':'▶ 読書スタート！'}
          </button>
          {elapsed>0&&<button className="btn btn-o" style={{width:'100%',fontSize:11}} onClick={reset}>🔄 リセット</button>}

          <div style={{marginTop:14}}>
            <div className="klee" style={{fontSize:10,color:'var(--ink3)',marginBottom:6}}>最近のセッション</div>
            {(book?.sessions||[]).slice(-4).reverse().map((s,i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid var(--rule)',fontSize:11}}>
                <span className="mono" style={{color:'var(--choco-soft)'}}>{s.date} <span style={{color:'var(--ink3)'}}>{s.start}</span></span>
                <span className="klee" style={{color:'var(--mint)',fontWeight:600}}>{fmtM(s.minutes)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// IMPORT PANEL (Notion CSV → JSON)
// ══════════════════════════════════════════════════════════════
function ImportPanel({onImport, onTogglImport}){
  const [status, setStatus] = useState('idle'); // idle | parsing | done | error
  const [togglStatus, setTogglStatus] = useState('idle');
  const [count, setCount] = useState(0);
  const [togglCount, setTogglCount] = useState(0);
  const fileRef = useRef(null);
  const togglRef = useRef(null);

  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/);
    if(lines.length < 2) return [];
    const headers = lines[0].replace(/^\uFEFF/,'').split(',').map(h => h.trim().replace(/^"|"$/g,''));

    const rows = [];
    let i = 1;
    while(i < lines.length){
      // handle quoted fields that contain newlines
      let line = lines[i];
      while((line.match(/"/g)||[]).length % 2 !== 0 && i+1 < lines.length){
        i++; line += '\n' + lines[i];
      }
      if(!line.trim()){ i++; continue; }

      const values = [];
      let cur = '', inQ = false;
      for(let ci=0; ci<line.length; ci++){
        const ch = line[ci];
        if(ch==='"' && !inQ){ inQ=true; }
        else if(ch==='"' && inQ && line[ci+1]==='"'){ cur+='"'; ci++; }
        else if(ch==='"' && inQ){ inQ=false; }
        else if(ch===',' && !inQ){ values.push(cur); cur=''; }
        else { cur+=ch; }
      }
      values.push(cur);

      const row = {};
      headers.forEach((h,j) => row[h] = (values[j]||'').trim());
      rows.push(row);
      i++;
    }
    return rows;
  };

  const parseDate = s => {
    if(!s) return null;
    const m = s.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
    if(m) return `${m[1]}-${String(m[2]).padStart(2,'0')}-${String(m[3]).padStart(2,'0')}`;
    return null;
  };

  const decodeCover = raw => {
    if(!raw) return '';
    // CSV exports the URL directly
    if(raw.startsWith('https://') || raw.startsWith('http://')) return raw;
    // Fallback: encoded JSON format (older exports)
    try {
      const dec = decodeURIComponent(raw);
      const m = dec.match(/"source"\s*:\s*"(https?:\/\/[^"]+)"/);
      if(m) return m[1];
    } catch{}
    return '';
  };

  const COLORS = ['#5bbfb5','#f5c842','#c4936a','#e07b7b','#8cba80','#a78bd4','#4a8fa8'];

  const toMinutes = s => {
    const p = (s||'').trim().split(':');
    if(p.length===3) return parseInt(p[0])*60+parseInt(p[1])+Math.round(parseInt(p[2])/60);
    return 0;
  };

  const handleTogglFile = async (file) => {
    if(!file) return;
    setTogglStatus('parsing');
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      // rows: Project, Member, Email, Duration, Duration%
      const sessions = rows
        .filter(r => r['Project'] && r['Project'] !== 'Without project' && !r['Project'].startsWith('G検定') )
        .map(r => ({
          projectName: r['Project'].trim(),
          totalMinutes: toMinutes(r['Duration']),
        }))
        .filter(s => s.totalMinutes > 0);
      setTogglCount(sessions.length);
      setTogglStatus('done');
      onTogglImport(sessions);
    } catch(e) {
      console.error(e);
      setTogglStatus('error');
    }
  };

  const handleFile = async (file) => {
    if(!file) return;
    setStatus('parsing');
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      const books = rows.map((row, i) => {
        const finished = parseDate(row['読了日'] || row['読了日']);
        const start    = parseDate(row['追加日'] || row['追加日']);
        const tags     = (row['タグ']||'').split(',').map(t=>t.trim()).filter(Boolean);
        const cover    = decodeCover(row['カバー画像']||'');
        const hlCount  = parseInt(row['ハイライト数']||'0')||0;
        return {
          id: Date.now() + i,
          title:     (row['タイトル']||'').trim(),
          author:    (row['著者']||'').trim(),
          genre:     tags[0] || '',
          status:    finished ? 'done' : 'want',
          totalPages: 0, currentPage: 0,
          startDate: start,
          endDate:   finished,
          coverUrl:  cover,
          color:     COLORS[i % COLORS.length],
          highlights: [],
          sessions:  [],
          highlightCount: hlCount,
          product:   row['プロダクト']||'',
          isbn:      row['ISBNコード']||'',
          publisher: row['出版社']||'',
          notionUrl: row['アプリで開く']||'',
        };
      }).filter(b => b.title);
      setCount(books.length);
      setStatus('done');
      onImport(books);
    } catch(e) {
      console.error(e);
      setStatus('error');
    }
  };

  const onDrop = e => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if(file) handleFile(file);
  };

  return(
    <div style={{maxWidth:480,margin:'0 auto'}}>
      <h2 className="klee" style={{fontSize:16,fontWeight:600,marginBottom:6}}>📥 Notionからインポート</h2>
      <p style={{fontSize:11,color:'var(--ink3)',marginBottom:16}}>
        NotionのKokuDoku BooksをCSVでエクスポートして、ここにドロップするだけ！<br/>
        <span style={{color:'var(--mint)'}}>Notion → エクスポート → CSV → すべてのプロパティ</span> で取得できるよ
      </p>

      {status === 'done' ? (
        <div style={{background:'var(--mint-pale)',borderRadius:12,padding:24,textAlign:'center'}}>
          <div style={{fontSize:40,marginBottom:8}}>🎉</div>
          <div className="klee" style={{fontSize:18,color:'var(--mint)',fontWeight:600}}>{count}冊インポートできたよ！</div>
          <div style={{fontSize:11,color:'var(--ink3)',marginTop:6}}>本棚タブで確認してね</div>
          <button className="btn btn-mint" style={{marginTop:14}} onClick={()=>setStatus('idle')}>
            もう一度インポート
          </button>
        </div>
      ) : status === 'parsing' ? (
        <div style={{textAlign:'center',padding:32,color:'var(--ink3)'}}>
          <div style={{fontSize:32,marginBottom:8,animation:'spin 1s linear infinite',display:'inline-block'}}>🌀</div>
          <p className="klee">解析中…</p>
        </div>
      ) : status === 'error' ? (
        <div style={{background:'#ffe8e8',borderRadius:12,padding:20,textAlign:'center'}}>
          <div style={{fontSize:32}}>😢</div>
          <p className="klee" style={{color:'#e07b7b',marginTop:6}}>読み込めなかった…NotionのCSVか確認してね</p>
          <button className="btn btn-o" style={{marginTop:10}} onClick={()=>setStatus('idle')}>やり直す</button>
        </div>
      ) : (
        <div>
          {/* Notion CSV */}
          <p className="klee" style={{fontSize:12,fontWeight:600,color:'var(--choco)',marginBottom:8}}>📚 Notion（本棚データ）</p>
          <div className="import-drop"
            onDrop={onDrop} onDragOver={e=>e.preventDefault()}
            onClick={()=>fileRef.current?.click()}>
            <input ref={fileRef} type="file" accept=".csv" style={{display:'none'}}
              onChange={e=>handleFile(e.target.files[0])}/>
            <div style={{fontSize:32,marginBottom:6}}>📂</div>
            <div className="klee" style={{fontSize:13,color:'var(--mint)',fontWeight:600}}>CSVをドロップ or タップして選択</div>
            <div style={{fontSize:10,color:'var(--ink3)',marginTop:3}}>KokuDoku Books の _all.csv</div>
          </div>

          {/* Toggl CSV */}
          <p className="klee" style={{fontSize:12,fontWeight:600,color:'var(--choco)',margin:'16px 0 8px'}}>⏱ Toggl Track（読書時間）</p>
          <div className="import-drop"
            onDrop={e=>{e.preventDefault();handleTogglFile(e.dataTransfer.files[0]);}}
            onDragOver={e=>e.preventDefault()}
            onClick={()=>togglRef.current?.click()}>
            <input ref={togglRef} type="file" accept=".csv" style={{display:'none'}}
              onChange={e=>handleTogglFile(e.target.files[0])}/>
            <div style={{fontSize:32,marginBottom:6}}>⏱</div>
            <div className="klee" style={{fontSize:13,color:'var(--mint)',fontWeight:600}}>Toggl CSVをドロップ or タップして選択</div>
            <div style={{fontSize:10,color:'var(--ink3)',marginTop:3}}>Reports → Summary → Download CSV</div>
          </div>
        </div>
      )}

      <div style={{marginTop:16,padding:'12px 16px',background:'var(--cream2)',borderRadius:10}}>
        <p className="klee" style={{fontSize:11,fontWeight:600,marginBottom:6}}>📖 インポートされるデータ</p>
        <div style={{fontSize:10,color:'var(--ink3)',lineHeight:1.8}}>
          ✓ タイトル・著者・ジャンル（タグ）<br/>
          ✓ 読了日・追加日・ステータス<br/>
          ✓ 表紙画像・ISBN・出版社<br/>
          ✓ Togglの読書時間（プロジェクト名で本と自動マッチング）
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ADD/EDIT BOOK MODAL
// ══════════════════════════════════════════════════════════════
function AddBookModal({onAdd,onClose,editBook}){
  const [step,setStep]=useState(editBook?'form':'isbn');
  const [isbn,setIsbn]=useState(editBook?.isbn||'');
  const [title,setTitle]=useState(editBook?.title||'');
  const [author,setAuthor]=useState(editBook?.author||'');
  const [genre,setGenre]=useState(editBook?.genre||'');
  const [pages,setPages]=useState(String(editBook?.totalPages||''));
  const [status,setStatus]=useState(editBook?.status||'want');
  const [coverUrl,setCoverUrl]=useState(editBook?.coverUrl||'');
  const [color,setColor]=useState(editBook?.color||COLORS[0]);
  const [loading,setLoading]=useState(false);

  const fetchISBN=async()=>{
    if(!isbn.trim())return;
    setLoading(true);
    try{
      const r=await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn.trim()}`);
      const d=await r.json();
      if(d.items?.[0]){
        const info=d.items[0].volumeInfo;
        setTitle(info.title||'');
        setAuthor((info.authors||[]).join(' / '));
        setPages(String(info.pageCount||''));
        setGenre(info.categories?.[0]||'');
        setCoverUrl(info.imageLinks?.thumbnail?.replace('http:','https:')||'');
      }
    }catch{}
    setLoading(false);
    setStep('form');
  };

  const submit=()=>{
    if(!title.trim())return;
    onAdd({
      ...(editBook||{}),
      title,author,isbn,genre,coverUrl,color,status,
      totalPages:parseInt(pages)||0,
      currentPage:editBook?.currentPage||0,
      startDate:editBook?.startDate||(status!=='want'?todayStr():null),
      endDate:editBook?.endDate||(status==='done'?todayStr():null),
    });
  };

  return(
    <div className="modal-bg">
      <div className="modal fin">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
          <h3 className="klee" style={{fontSize:16,fontWeight:600}}>{editBook?'📝 本を編集':'📚 本を追加'}</h3>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'var(--ink3)'}}>×</button>
        </div>

        {step==='isbn'&&!editBook?(
          <div>
            <label className="klee" style={{fontSize:11,color:'var(--ink3)'}}>ISBNまたはバーコード番号</label>
            <div style={{display:'flex',gap:8,marginTop:8}}>
              <input className="inp" value={isbn} onChange={e=>setIsbn(e.target.value.replace(/\D/g,''))}
                placeholder="9784..." onKeyDown={e=>e.key==='Enter'&&fetchISBN()} style={{flex:1}}/>
              <button className="btn btn-mint" onClick={fetchISBN} disabled={loading} style={{whiteSpace:'nowrap'}}>
                {loading?'検索中…':'🔍 検索'}
              </button>
            </div>
            <button onClick={()=>setStep('form')} style={{background:'none',border:'none',fontSize:11,color:'var(--ink3)',cursor:'pointer',textDecoration:'underline',marginTop:12,display:'block'}}>
              手動で入力する
            </button>
          </div>
        ):(
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div><label className="klee" style={{fontSize:10,color:'var(--ink3)'}}>タイトル *</label>
              <input className="inp" value={title} onChange={e=>setTitle(e.target.value)} style={{marginTop:4}}/></div>
            <div><label className="klee" style={{fontSize:10,color:'var(--ink3)'}}>著者</label>
              <input className="inp" value={author} onChange={e=>setAuthor(e.target.value)} style={{marginTop:4}}/></div>
            <div style={{display:'flex',gap:10}}>
              <div style={{flex:1}}><label className="klee" style={{fontSize:10,color:'var(--ink3)'}}>ジャンル</label>
                <input className="inp" value={genre} onChange={e=>setGenre(e.target.value)} style={{marginTop:4}}/></div>
              <div style={{flex:1}}><label className="klee" style={{fontSize:10,color:'var(--ink3)'}}>ページ数</label>
                <input className="inp" type="number" value={pages} onChange={e=>setPages(e.target.value)} style={{marginTop:4}}/></div>
            </div>
            <div><label className="klee" style={{fontSize:10,color:'var(--ink3)'}}>表紙URL（任意）</label>
              <input className="inp" value={coverUrl} onChange={e=>setCoverUrl(e.target.value)} placeholder="https://..." style={{marginTop:4}}/></div>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <label className="klee" style={{fontSize:10,color:'var(--ink3)'}}>ステータス</label>
              <select value={status} onChange={e=>setStatus(e.target.value)}>
                <option value="want">積読</option>
                <option value="reading">読中</option>
                <option value="done">読了</option>
              </select>
            </div>
            <div>
              <label className="klee" style={{fontSize:10,color:'var(--ink3)',display:'block',marginBottom:6}}>ライン色</label>
              <div style={{display:'flex',gap:6}}>
                {COLORS.map(c=>(
                  <div key={c} onClick={()=>setColor(c)}
                    style={{width:22,height:22,background:c,cursor:'pointer',borderRadius:'50%',
                      border:color===c?'3px solid var(--choco)':'3px solid transparent',transition:'border .1s'}}/>
                ))}
              </div>
            </div>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:4}}>
              {!editBook&&<button className="btn btn-o" style={{fontSize:11}} onClick={()=>setStep('isbn')}>戻る</button>}
              <button className="btn btn-o" style={{fontSize:11}} onClick={onClose}>キャンセル</button>
              <button className="btn btn-mint" onClick={submit} disabled={!title.trim()}>{editBook?'💾 保存':'✨ 追加する'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════
export default function App(){
  const [tab,setTab]=useState('shelf');
  const [books,setBooks]=useState([]);
  const [selId,setSelId]=useState(null);
  const [showAdd,setShowAdd]=useState(false);
  const [editBook,setEditBook]=useState(null);
  const [toast,setToast]=useState(null);
  const [loading,setLoading]=useState(true);

  const showToast=msg=>{setToast(msg);setTimeout(()=>setToast(null),2200)};

  // ── Supabase: load all data ──────────────────────────────────
  useEffect(()=>{
    const loadData = async () => {
      setLoading(true);
      try {
        const [booksRes, sessionsRes, highlightsRes] = await Promise.all([
          supabase.from('books').select('*').order('created_at', {ascending:false}),
          supabase.from('sessions').select('*'),
          supabase.from('highlights').select('*'),
        ]);
        if(booksRes.error) throw booksRes.error;
        const raw = booksRes.data || [];
        const sessions = sessionsRes.data || [];
        const highlights = highlightsRes.data || [];
        const merged = raw.map(b => ({
          id: b.id,
          title: b.title,
          author: b.author || '',
          genre: b.genre || '',
          status: b.status || 'want',
          totalPages: b.total_pages || 0,
          currentPage: b.current_page || 0,
          startDate: b.start_date,
          endDate: b.end_date,
          coverUrl: b.cover_url || '',
          color: b.color || '#5bbfb5',
          isbn: b.isbn || '',
          publisher: b.publisher || '',
          highlightCount: b.highlight_count || 0,
          notionUrl: b.notion_url || '',
          product: b.product || '',
          sessions: sessions.filter(s=>s.book_id===b.id).map(s=>({
            id: s.id, date: s.date, start: s.start_time||'00:00',
            minutes: s.minutes||0, note: s.note||''
          })),
          highlights: highlights.filter(h=>h.book_id===b.id).map(h=>({
            id: h.id, text: h.text, color: h.color||'y',
            page: h.page, note: h.note||''
          })),
        }));
        setBooks(merged);
        if(merged.length > 0) setSelId(merged[0].id);
      } catch(e) {
        console.error('Load error:', e);
        showToast('データの読み込みに失敗しました');
      }
      setLoading(false);
    };
    loadData();
  }, []);

  // ── Supabase: save / update book ────────────────────────────
  const upsertBook = async (book) => {
    const row = {
      id: String(book.id), title: book.title, author: book.author||'', genre: book.genre||'',
      status: book.status, total_pages: book.totalPages||0, current_page: book.currentPage||0,
      start_date: book.startDate||null, end_date: book.endDate||null,
      cover_url: book.coverUrl||'', color: book.color||'#5bbfb5',
      isbn: book.isbn||'', publisher: book.publisher||'',
      highlight_count: book.highlightCount||0,
      notion_url: book.notionUrl||'', product: book.product||'',
      updated_at: new Date().toISOString(),
    };
    const {error} = await supabase.from('books').upsert(row);
    if(error) console.error('upsert error:', error);
  };

  const importBooks = async (newBooks) => {
    const existing = new Set(books.map(b=>b.title));
    const fresh = newBooks.filter(b => !existing.has(b.title));
    if(fresh.length===0){ showToast('新しい本はありませんでした'); return; }
    const rows = fresh.map(b=>({
      id: String(b.id), title: b.title, author: b.author||'', genre: b.genre||'',
      status: b.status||'want', total_pages: b.totalPages||0, current_page: 0,
      start_date: b.startDate||null, end_date: b.endDate||null,
      cover_url: b.coverUrl||'', color: b.color||'#5bbfb5',
      isbn: b.isbn||'', publisher: b.publisher||'',
      highlight_count: b.highlightCount||0,
      notion_url: b.notionUrl||'', product: b.product||'',
    }));
    const CHUNK=50;
    for(let i=0;i<rows.length;i+=CHUNK){
      const {error}=await supabase.from('books').upsert(rows.slice(i,i+CHUNK));
      if(error) console.error('import error:',error);
    }
    setBooks(prev=>[...fresh.map(b=>({...b,sessions:[],highlights:[]})),...prev]);
    setTab('shelf');
    showToast(`📚 ${fresh.length}冊インポートしました！`);
  };

  const importTogglSessions = async (togglSessions) => {
    let matched=0;
    for(const book of books){
      const match=togglSessions.find(s=>{
        const tName=s.projectName.toLowerCase().replace(/\s+/g,'');
        const bName=book.title.toLowerCase().replace(/\s+/g,'');
        return tName===bName||bName.includes(tName)||tName.includes(bName.slice(0,6));
      });
      if(!match) continue;
      if(book.sessions.some(s=>s.note==='Toggl')) continue;
      const sessionRow={
        id:'toggl-'+book.id, book_id:String(book.id),
        date:book.endDate||book.startDate||todayStr(),
        start_time:'00:00', minutes:match.totalMinutes, note:'Toggl',
      };
      await supabase.from('sessions').upsert(sessionRow);
      matched++;
    }
    const {data}=await supabase.from('sessions').select('*');
    setBooks(prev=>prev.map(b=>({
      ...b,
      sessions:(data||[]).filter(s=>s.book_id===String(b.id)).map(s=>({
        id:s.id,date:s.date,start:s.start_time||'00:00',minutes:s.minutes||0,note:s.note||''
      }))
    })));
    showToast(`⏱ ${matched}冊の読書時間を反映しました！`);
  };

  const addBook = async (data) => {
    const isEdit = !!data.id;
    const id = isEdit ? String(data.id) : String(Date.now());
    const book = {...data, id, highlights:data.highlights||[], sessions:data.sessions||[]};
    await upsertBook(book);
    if(isEdit){
      setBooks(bs=>bs.map(b=>b.id===id?{...b,...book}:b));
      showToast('✅ 更新しました！');
    } else {
      setBooks(bs=>[{...book,highlights:[],sessions:[]},...bs]);
      setSelId(id);
      showToast('📚 本を追加しました！');
    }
    setShowAdd(false); setEditBook(null);
  };

  const addHighlight = async (bookId, hl) => {
    const row={
      id:String(Date.now()), book_id:String(bookId),
      text:hl.text, color:hl.color||'y',
      page:hl.page?String(hl.page):null, note:hl.note||'',
    };
    await supabase.from('highlights').insert(row);
    setBooks(bs=>bs.map(b=>b.id===bookId?{...b,highlights:[...b.highlights,{...row}]}:b));
    showToast('✨ ハイライトを追加しました！');
  };

  const saveSession = async (bookId, minutes, start) => {
    const row={
      id:String(Date.now()), book_id:String(bookId),
      date:todayStr(), start_time:start||'--:--', minutes, note:'',
    };
    await supabase.from('sessions').insert(row);
    setBooks(bs=>bs.map(b=>{
      if(b.id!==bookId) return b;
      const newCur=Math.min(b.currentPage+Math.round(minutes*1.2),b.totalPages||9999);
      return{...b,sessions:[...b.sessions,{id:row.id,date:row.date,start:row.start_time,minutes,note:''}],currentPage:newCur};
    }));
    await supabase.from('books').update({current_page:Math.min((books.find(b=>b.id===bookId)?.currentPage||0)+Math.round(minutes*1.2),books.find(b=>b.id===bookId)?.totalPages||9999)}).eq('id',String(bookId));
    showToast(`🎉 ${fmtM(minutes)}記録したよ！`);
  };

  const TABS=[['shelf','📚 本棚'],['calendar','📅 カレンダー'],['log','📋 ログ'],['hl','✨ ハイライト'],['timer','⏱ タイマー'],['import','📥 取込']];
  if(loading) return(
    <>
      <Fonts/>
      <div style={{height:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'var(--cream)',gap:16}}>
        <div style={{fontSize:48}}>📚</div>
        <div className="klee" style={{fontSize:16,color:'var(--mint)'}}>読書録を読み込み中…</div>
        <div style={{width:120,height:4,background:'var(--mint-light)',borderRadius:99,overflow:'hidden'}}>
          <div style={{height:'100%',background:'var(--mint)',borderRadius:99,animation:'loading 1.2s ease-in-out infinite'}}/>
        </div>
        <style>{`@keyframes loading{0%{width:0%}50%{width:80%}100%{width:100%}}`}</style>
      </div>
    </>
  );
  const today=todayStr();
  const totalAll=books.flatMap(b=>b.sessions).reduce((a,s)=>a+s.minutes,0);

  return(
    <>
      <Fonts/>
      <div className="app">
        {/* topbar */}
        <div className="topbar">
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:36,height:36,borderRadius:'50%',background:'var(--mint)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>📖</div>
            <div>
              <div className="klee" style={{fontSize:19,fontWeight:600,color:'var(--mint)',letterSpacing:'.04em',lineHeight:1}}>読書録</div>
              <div className="mono" style={{fontSize:8,color:'var(--ink3)',letterSpacing:'.15em'}}>MY READING LOG</div>
            </div>
          </div>
          <div style={{marginLeft:'auto',display:'flex',gap:10,alignItems:'center'}}>
            <div style={{textAlign:'right'}}>
              <div className="mono" style={{fontSize:11,color:'var(--mint)',fontWeight:'bold'}}>{fmtM(totalAll)}</div>
              <div style={{fontSize:8,color:'var(--ink3)'}}>累計読書時間</div>
            </div>
            <button className="btn btn-mint" style={{padding:'7px 16px',fontSize:12}} onClick={()=>{setEditBook(null);setShowAdd(true)}}>
              ＋ 追加
            </button>
          </div>
        </div>

        {/* tabs */}
        <div className="tabs">
          {TABS.map(([k,l])=>(
            <button key={k} className={`tab ${tab===k?'on':''}`} onClick={()=>setTab(k)}>{l}</button>
          ))}
        </div>

        {/* content */}
        <div className="content">
          {tab==='shelf'&&<BookShelf books={books} selectedId={selId} onSelect={setSelId}
            onEdit={b=>{setEditBook(b);setShowAdd(true)}}/>}
          {tab==='calendar'&&<MonthlyCalendar books={books}/>}
          {tab==='log'&&<SessionLog books={books}/>}
          {tab==='hl'&&<HighlightPanel books={books} selectedId={selId} onSelectBook={setSelId} onAddHighlight={addHighlight}/>}
          {tab==='timer'&&<TimerPanel books={books} onSaveSession={saveSession}/>}
          {tab==='import'&&<ImportPanel onImport={importBooks} onTogglImport={importTogglSessions}/>}
        </div>

        {/* footer */}
        <div style={{borderTop:'2px solid var(--mint-light)',padding:'6px 18px',display:'flex',justifyContent:'space-between',flexShrink:0,background:'var(--mint-xpale)'}}>
          <span className="mono" style={{fontSize:8,color:'var(--ink3)'}}>{today}</span>
          <span className="klee" style={{fontSize:9,color:'var(--choco-soft)'}}>今月 {fmtM(books.flatMap(b=>b.sessions).filter(s=>s.date.startsWith(today.slice(0,7))).reduce((a,s)=>a+s.minutes,0))}</span>
        </div>
      </div>

      {showAdd&&<AddBookModal onAdd={addBook} onClose={()=>{setShowAdd(false);setEditBook(null)}} editBook={editBook}/>}
      {toast&&<div className="toast">{toast}</div>}
    </>
  );
}
