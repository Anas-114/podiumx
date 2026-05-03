import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, addDoc, getDocs, onSnapshot, query, orderBy, limit, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../../lib/firebase';
import { Program, Result, CATEGORIES, OperationType } from '../../types';
import { handleFirestoreError } from '../../lib/utils';
import { Trophy, Plus, Trash, Eye, Send, Layout, ListChecks, Award, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PosterPreview from './PosterPreview';
import { toPng } from 'html-to-image';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leaderboard' | 'browse' | 'create' | 'programs'>('dashboard');
  const [programs, setPrograms] = useState<Program[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const { profile } = useAuth();
  
  useEffect(() => {
    const qPrograms = query(collection(db, 'programs'), orderBy('name'));
    const unsubscribePrograms = onSnapshot(qPrograms, (snapshot) => {
      setPrograms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Program)));
    });

    const qResults = query(collection(db, 'results'), orderBy('publishedAt', 'desc'));
    const unsubscribeResults = onSnapshot(qResults, (snapshot) => {
      setResults(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Result)));
    });

    return () => {
      unsubscribePrograms();
      unsubscribeResults();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#080808] flex">
      {/* Sidebar */}
      <aside className="w-68 border-r border-white/5 flex flex-col p-6 sticky top-0 h-screen shrink-0">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="w-8 h-8 orange-gradient rounded-lg flex items-center justify-center font-black text-black">X</div>
          <h2 className="text-xl font-bold tracking-tighter">Podium<span className="text-white/40">X</span></h2>
        </div>

        <div className="space-y-8 flex-1">
          <div>
            <p className="text-[10px] font-black tracking-widest text-white/20 uppercase mb-4 px-2">Main Menu</p>
            <nav className="space-y-1">
              <SidebarItem icon={<Layout className="w-4 h-4" />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
              <SidebarItem icon={<Trophy className="w-4 h-4" />} label="Leaderboard" active={activeTab === 'leaderboard'} onClick={() => setActiveTab('leaderboard')} />
              <SidebarItem icon={<Eye className="w-4 h-4" />} label="Browse Results" active={activeTab === 'browse'} onClick={() => setActiveTab('browse')} />
            </nav>
          </div>

          <div>
            <p className="text-[10px] font-black tracking-widest text-white/20 uppercase mb-4 px-2">Admin Panel</p>
            <nav className="space-y-1">
              <SidebarItem icon={<Plus className="w-4 h-4" />} label="Create Result" active={activeTab === 'create'} onClick={() => setActiveTab('create')} />
              <SidebarItem icon={<ListChecks className="w-4 h-4" />} label="Manage Programs" active={activeTab === 'programs'} onClick={() => setActiveTab('programs')} />
            </nav>
          </div>
        </div>

        <div className="mt-auto glass rounded-2xl p-4 border border-white/5">
          <p className="text-[10px] font-black tracking-widest text-white/20 uppercase mb-1">Signed in as</p>
          <p className="text-xs font-medium truncate">{profile?.email}</p>
          <button onClick={() => auth.signOut()} className="text-[10px] text-red-400/60 hover:text-red-400 mt-2 transition-colors">Sign Out</button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="p-6 flex items-center justify-between gap-4">
          <div className="flex-1 max-w-2xl relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-brand-primary transition-colors" />
            <input 
              placeholder="Search programs or teams..." 
              className="w-full bg-[#121212] border border-white/5 rounded-full py-3 pl-12 pr-6 text-sm focus:outline-none focus:border-brand-primary/50 transition-all"
            />
          </div>
          <button 
            onClick={() => setActiveTab('create')}
            className="orange-gradient text-black font-black text-xs px-6 py-3 rounded-xl uppercase tracking-widest flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Result
          </button>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 p-6 pt-0 overflow-y-auto">
          {activeTab === 'dashboard' && <RecentResults results={results} />}
          {activeTab === 'create' && <ResultForm programs={programs} resultsCount={results.length} onSuccess={() => setActiveTab('dashboard')} />}
          {activeTab === 'programs' && <ProgramManager programs={programs} />}
          {activeTab === 'leaderboard' && <div className="p-8 text-white/20 italic">Dashboard Integrated Leaderboard coming soon...</div>}
        </main>
      </div>

      {/* Right Column: Live Poster Preview */}
      <aside className="w-96 p-6 sticky top-0 h-screen shrink-0 overflow-y-auto border-l border-white/5 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">Live Poster Preview</h3>
            <button className="text-[10px] font-black text-brand-primary tracking-widest uppercase hover:underline">Download PNG</button>
          </div>
          
          <div className="flex-1 flex items-center justify-center">
            <PosterPreview 
                programName={"Inter-Collegiate Debate"}
                category={"CAMPUS GIRLS"}
                resultNumber={results[0]?.resultNumber || 42}
                winners={[
                  { name: "Samantha Roberts", team: "ST. XAVIER'S COLLEGE", position: 1, grade: "A" }
                ]}
                id="live-preview-standalone"
            />
          </div>
      </aside>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${active ? 'sidebar-item-active text-white' : 'text-white/40 hover:text-white/60'}`}
    >
      {icon}
      {label}
    </button>
  );
}

function RecentResults({ results }: { results: Result[] }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Recent Results</h2>
        <button className="glass px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white/40 ring-1 ring-white/5 active:bg-white/10">All Categories</button>
      </div>

      <div className="space-y-4">
        {results.map((result) => (
          <motion.div 
            key={result.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 rounded-3xl group cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-2">
                <span className="px-2 py-0.5 bg-brand-primary/10 border border-brand-primary/20 rounded text-[10px] font-black text-brand-primary uppercase tracking-wider">{result.category}</span>
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-0.5">#RES-0{result.resultNumber}</span>
              </div>
              <div className="flex -space-x-2">
                 <div className="w-8 h-8 rounded-full gold-gradient border-4 border-black flex items-center justify-center text-[10px] font-bold text-black italic shadow-lg">1st</div>
                 <div className="w-8 h-8 rounded-full silver-gradient border-4 border-black flex items-center justify-center text-[10px] font-bold text-black italic shadow-lg">2nd</div>
              </div>
            </div>
            
            <h3 className="text-2xl font-bold tracking-tight group-hover:text-brand-primary transition-colors mb-2">{result.programName}</h3>
            <p className="text-xs text-white/40 font-medium">Published 2 hours ago • Single Participant</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ProgramManager({ programs }: { programs: Program[] }) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'single' | 'group'>('single');
  const [maxParticipants, setMaxParticipants] = useState(1);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'programs'), {
        name,
        type,
        maxParticipants: Number(maxParticipants)
      });
      setName('');
      setMaxParticipants(1);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'programs');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2">Programs Master</h1>
          <p className="text-white/40">Define categories and participant limits.</p>
        </div>
      </div>

      <form onSubmit={handleAdd} className="glass-card p-6 rounded-3xl grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Program Name</label>
          <input 
            value={name} 
            onChange={e => setName(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-primary"
            placeholder="E.g. Drama, Song..."
            required
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Type</label>
          <select 
            value={type} 
            onChange={e => setType(e.target.value as any)}
            className="w-full bg-[#16213e] border border-white/10 rounded-xl px-4 py-3 focus:border-brand-primary"
          >
            <option value="single" className="bg-[#16213e]">Single</option>
            <option value="group" className="bg-[#16213e]">Group</option>
          </select>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Max Participants</label>
          <input 
            type="number"
            value={maxParticipants} 
            onChange={e => setMaxParticipants(Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-primary"
            required
          />
        </div>
        <button type="submit" className="gold-gradient text-black font-bold h-12 rounded-xl flex items-center justify-center gap-2">
          <Plus className="w-5 h-5" />
          Add Program
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {programs.map(p => (
           <motion.div 
            key={p.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-4 rounded-2xl flex justify-between items-center"
           >
             <div>
               <h3 className="font-bold">{p.name}</h3>
               <p className="text-xs text-white/40 uppercase">{p.type} • Up to {p.maxParticipants}</p>
             </div>
           </motion.div>
        ))}
      </div>
    </div>
  );
}

interface ParticipantInput {
  name: string;
  team: string;
  points: number;
  grade: 'A' | 'B' | 'C';
}

function ResultForm({ programs, resultsCount, onSuccess }: { programs: Program[], resultsCount: number, onSuccess?: () => void }) {
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [scope, setScope] = useState<'program' | 'team'>('program');
  const [participants, setParticipants] = useState<ParticipantInput[]>([{ name: '', team: '', points: 0, grade: 'A' }]);
  const [publishing, setPublishing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const selectedProgram = programs.find(p => p.id === selectedProgramId);

  const addParticipant = () => {
    setParticipants([...participants, { name: '', team: '', points: 0, grade: 'A' }]);
  };

  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const updateParticipant = (index: number, field: keyof ParticipantInput, value: any) => {
    const newParticipants = [...participants];
    newParticipants[index] = { ...newParticipants[index], [field]: value };
    setParticipants(newParticipants);
  };

  const getRankedParticipants = () => {
    return [...participants].sort((a, b) => {
      // 1. Points desc
      if (b.points !== a.points) return b.points - a.points;
      // 2. Grade priority A > B > C
      const priority = { 'A': 3, 'B': 2, 'C': 1 };
      return priority[b.grade] - priority[a.grade];
    }).slice(0, 3).map((p, i) => ({ ...p, position: i + 1 }));
  };

  const handlePublish = async () => {
    if (!selectedProgram) return;
    setPublishing(true);
    try {
      // 1. Sort and rank
      const ranked = getRankedParticipants();
      
      // 2. Capture Poster Image
      const posterElement = document.getElementById('poster-to-capture');
      if (!posterElement) throw new Error("Poster preview not found");
      
      const dataUrl = await toPng(posterElement, { quality: 1, pixelRatio: 2 });
      
      // 3. Upload to Storage
      const posterRef = ref(storage, `posters/${Date.now()}.png`);
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      await uploadBytes(posterRef, blob);
      const posterUrl = await getDownloadURL(posterRef);

      // 4. Save to Firestore
      const resultData = {
        programId: selectedProgramId,
        programName: selectedProgram.name,
        category,
        resultNumber: resultsCount + 1,
        resultScope: scope,
        publishedAt: serverTimestamp(),
        posterUrl
      };

      const resultRef = await addDoc(collection(db, 'results'), resultData);
      
      const batch = writeBatch(db);
      ranked.forEach(p => {
        const entryRef = doc(collection(db, `results/${resultRef.id}/entries`));
        batch.set(entryRef, {
            ...p,
            resultId: resultRef.id
        });
      });
      await batch.commit();

      // Reset
      setSelectedProgramId('');
      setParticipants([{ name: '', team: '', points: 0, grade: 'A' }]);
      setShowPreview(false);
      alert("Result published successfully!");

    } catch (err) {
      console.error(err);
      alert("Failed to publish result.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Publish Result</h1>
        <p className="text-white/40">Enter marks and generate the official poster. No manual ranking required.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Program</label>
                <select 
                  value={selectedProgramId} 
                  onChange={e => setSelectedProgramId(e.target.value)}
                  className="w-full bg-[#16213e] border border-white/10 rounded-xl px-4 py-3 focus:border-brand-primary h-12"
                  required
                >
                  <option value="">Select Program</option>
                  {programs.map(p => (
                    <option key={p.id} value={p.id} className="bg-[#16213e]">{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Category</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-[#16213e] border border-white/10 rounded-xl px-4 py-3 focus:border-brand-primary h-12"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c} className="bg-[#16213e]">{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
               <label className="block text-xs uppercase tracking-widest text-white/40">Result Scope</label>
               <div className="flex gap-4">
                  {['program', 'team'].map(s => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="scope" 
                        checked={scope === s} 
                        onChange={() => setScope(s as any)}
                        className="w-4 h-4 accent-brand-primary"
                      />
                      <span className="capitalize">{s} Result</span>
                    </label>
                  ))}
               </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold">Participants</h3>
               <button 
                onClick={addParticipant}
                className="text-brand-primary flex items-center gap-1 text-sm hover:underline"
               >
                 <Plus className="w-4 h-4" /> Add Member
               </button>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              <AnimatePresence>
                {participants.map((p, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3 relative"
                  >
                    <button 
                      onClick={() => removeParticipant(i)}
                      className="absolute top-2 right-2 text-white/20 hover:text-red-400"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input 
                        placeholder="Name" 
                        value={p.name}
                        onChange={e => updateParticipant(i, 'name', e.target.value)}
                        className="bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-sm"
                      />
                      <input 
                        placeholder="College/Team" 
                        value={p.team}
                        onChange={e => updateParticipant(i, 'team', e.target.value)}
                        className="bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase text-white/30 block mb-1">Points</label>
                        <input 
                          type="number"
                          value={p.points}
                          onChange={e => updateParticipant(i, 'points', Number(e.target.value))}
                          className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase text-white/30 block mb-1">Grade</label>
                        <select 
                          value={p.grade}
                          onChange={e => updateParticipant(i, 'grade', e.target.value)}
                          className="w-full bg-[#16213e] border border-white/5 rounded-lg px-3 py-2 text-sm"
                        >
                          <option value="A">A Grade</option>
                          <option value="B">B Grade</option>
                          <option value="C">C Grade</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex gap-4">
             <button 
              onClick={() => setShowPreview(!showPreview)}
              className="flex-1 glass text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
             >
               <Eye className="w-5 h-5" />
               {showPreview ? 'Hide Preview' : 'Preview Poster'}
             </button>
             <button 
              disabled={!selectedProgramId || publishing}
              onClick={handlePublish}
              className={`flex-1 gold-gradient text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 ${publishing ? 'opacity-50' : 'hover:opacity-90'}`}
             >
               {publishing ? 'Publishing...' : (
                 <>
                   <Send className="w-5 h-5" />
                   Publish Result
                 </>
               )}
             </button>
          </div>
        </div>

        {/* Poster Preview Area */}
        <div className="relative">
          <div className="sticky top-8 space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-white/40">Poster Canvas</h3>
            <div className="p-4 bg-black rounded-3xl border border-white/10 overflow-hidden">
               <PosterPreview 
                programName={selectedProgram?.name || "Program Name"}
                category={category}
                resultNumber={resultsCount + 1}
                winners={getRankedParticipants()}
                id="poster-to-capture"
               />
            </div>
            <p className="text-[10px] text-center text-white/20 italic">Posters are rendered as high-res PNGs and stored on the cloud automatically.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
