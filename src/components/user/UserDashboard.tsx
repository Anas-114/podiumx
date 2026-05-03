import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Result, CATEGORIES, Program } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Calendar, Trophy, ChevronRight, LayoutGrid, List } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UserDashboard() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [teams, setTeams] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const q = query(collection(db, 'results'), orderBy('publishedAt', 'desc'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const resultsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Result));
      setResults(resultsData);
      
      // Extract unique teams for filter
      const allTeams = new Set<string>();
      for (const res of resultsData) {
         const entriesSnap = await getDocs(collection(db, `results/${res.id}/entries`));
         entriesSnap.docs.forEach(d => allTeams.add(d.data().team));
      }
      setTeams(Array.from(allTeams).sort());
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredResults = results.filter(r => {
    const matchesSearch = r.programName?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter ? r.category === categoryFilter : true;
    // Note: team filtering would ideally be done via a mapping or subquery, 
    // for simplicity here we pre-fetch teams but real filtering usually requires a different DB structure or client-side filter
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">Explore Results</h1>
          <p className="text-white/40 font-medium">Real-time competition updates and official posters.</p>
        </div>
        <div className="flex items-center gap-2">
            <Link 
                to="/leaderboard"
                className="glass px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-white/10 transition-colors"
            >
                <Trophy className="w-5 h-5 text-brand-primary" />
                Live Leaderboard
            </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-card p-4 rounded-3xl flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
          <input 
            placeholder="Search by Program Name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-brand-primary"
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
             <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
             <select 
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full bg-[#16213e] border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-sm appearance-none focus:outline-none"
             >
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
             </select>
          </div>
          <div className="flex glass rounded-2xl p-1">
            <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white/10 text-brand-primary' : 'text-white/30 hover:text-white'}`}
            >
                <LayoutGrid className="w-5 h-5" />
            </button>
            <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white/10 text-brand-primary' : 'text-white/30 hover:text-white'}`}
            >
                <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Results List */}
      {loading ? (
        <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {filteredResults.map((result) => (
              <ResultCard key={result.id} result={result} mode={viewMode} />
            ))}
          </div>
        </AnimatePresence>
      )}

      {!loading && filteredResults.length === 0 && (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
             <p className="text-white/30">No results found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}

function ResultCard({ result, mode }: { result: Result, mode: 'grid' | 'list', key?: React.Key }) {
    const publishedDate = result.publishedAt ? new Date((result.publishedAt as any).seconds * 1000).toLocaleDateString() : 'Just now';

    if (mode === 'list') {
        return (
            <Link to={`/result/${result.id}`}>
                <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-4 rounded-2xl flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-brand-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold">{result.programName}</h3>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] font-black uppercase text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-md">
                                    {result.category}
                                </span>
                                <span className="text-[10px] text-white/30 font-medium">#{result.resultNumber.toString().padStart(3, '0')}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="hidden md:block text-right">
                            <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-0.5">Published</p>
                            <p className="text-xs font-mono">{publishedDate}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/20" />
                    </div>
                </motion.div>
            </Link>
        );
    }

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
            className="group relative"
        >
            <Link to={`/result/${result.id}`}>
                <div className="glass-card overflow-hidden rounded-3xl h-full border border-white/5 group-hover:border-brand-primary/30 transition-all">
                    {/* Image Preview Overlay */}
                    <div className="h-48 bg-black/40 relative overflow-hidden">
                        {result.posterUrl ? (
                            <img src={result.posterUrl} alt="Poster" className="w-full h-full object-cover opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Trophy className="w-12 h-12 text-white/5" />
                            </div>
                        )}
                        <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-primary">
                                {result.category}
                            </span>
                        </div>
                    </div>

                    <div className="p-6 space-y-4">
                        <div>
                            <p className="text-[10px] font-black tracking-[0.2em] text-white/30 uppercase mb-1">Result #{result.resultNumber}</p>
                            <h3 className="text-xl font-bold tracking-tight line-clamp-1">{result.programName}</h3>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-white/5">
                            <div className="flex items-center gap-2 text-white/40">
                                <Calendar className="w-4 h-4" />
                                <span className="text-xs font-mono">{publishedDate}</span>
                            </div>
                            <div className="flex items-center gap-1 text-brand-primary text-xs font-black uppercase tracking-widest group-hover:gap-2 transition-all">
                                View Result
                                <ChevronRight className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
