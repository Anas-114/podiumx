import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Result, Entry } from '../../types';
import { motion } from 'motion/react';
import { Trophy, ArrowLeft, Download, Eye, Medal, Star, Share2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function ResultDetail() {
  const { id } = useParams();
  const [result, setResult] = useState<Result | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      const resDoc = await getDoc(doc(db, 'results', id));
      if (resDoc.exists()) {
        setResult({ id: resDoc.id, ...resDoc.data() } as Result);
        
        const entQuery = query(collection(db, `results/${id}/entries`), orderBy('position'));
        const entSnap = await getDocs(entQuery);
        setEntries(entSnap.docs.map(d => ({ id: d.id, ...d.data() } as Entry)));
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (!result) return <div className="p-8 text-center">Result not found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors group">
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Back to Results
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <span className="text-[10px] font-black tracking-[0.3em] text-brand-primary uppercase mb-2 block">Competition Result</span>
          <h1 className="text-4xl font-black tracking-tighter mb-2">{result.programName}</h1>
          <div className="flex gap-3">
             <span className="glass px-4 py-1.5 rounded-full text-xs font-bold text-white/60 uppercase">{result.category}</span>
             <span className="glass px-4 py-1.5 rounded-full text-xs font-bold text-white/60 uppercase">Scope: {result.resultScope}</span>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
             <Link 
              to={`/poster/${result.id}`}
              className="flex-1 md:flex-none gold-gradient text-black font-bold px-8 py-3 rounded-2xl flex items-center justify-center gap-2"
             >
                <Eye className="w-5 h-5" />
                View Poster
             </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Winners Standings */}
        <div className="md:col-span-2 space-y-4">
           {entries.map((entry, index) => (
             <motion.div 
               key={entry.id}
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: index * 0.1 }}
               className={cn(
                 "glass-card p-6 rounded-3xl flex items-center gap-6 relative overflow-hidden",
                 entry.position === 1 ? "border-brand-primary/30" : ""
               )}
             >
               {entry.position === 1 && <div className="absolute top-0 right-0 p-3 gold-gradient text-black rounded-bl-2xl">
                 <Trophy className="w-5 h-5" />
               </div>}

               <div className={cn(
                 "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0",
                 entry.position === 1 ? "gold-gradient" : entry.position === 2 ? "silver-gradient" : "bronze-gradient"
               )}>
                 <span className="text-black font-black text-2xl">{entry.position}</span>
               </div>

               <div className="flex-1">
                  <h3 className="text-xl font-bold tracking-tight">{entry.name}</h3>
                  <p className="text-brand-primary font-black uppercase tracking-widest text-[10px] mb-2">{entry.team}</p>
                  <div className="flex gap-4">
                     <div className="flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-white/30" />
                        <span className="text-xs text-white/60 font-bold uppercase tracking-widest">Grade {entry.grade}</span>
                     </div>
                     <div className="flex items-center gap-1.5">
                        <Medal className="w-3.5 h-3.5 text-white/30" />
                        <span className="text-xs text-white/60 font-bold uppercase tracking-widest">{entry.points} Points</span>
                     </div>
                  </div>
               </div>
             </motion.div>
           ))}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
           <div className="glass-card p-6 rounded-3xl space-y-4">
              <h4 className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Quick Stats</h4>
              <div className="space-y-3">
                 <div className="flex justify-between items-center">
                    <span className="text-sm text-white/60">Total Points</span>
                    <span className="font-mono text-brand-primary">{entries.reduce((sum, e) => sum + e.points, 0)}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-sm text-white/60">Participants</span>
                    <span className="font-mono">{entries.length}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-sm text-white/60">Result ID</span>
                    <span className="font-mono text-[10px]">#{result.resultNumber}</span>
                 </div>
              </div>
           </div>

           <button className="w-full glass p-4 rounded-3xl flex items-center justify-center gap-2 hover:bg-white/5 transition-colors">
              <Share2 className="w-5 h-5 text-white/40" />
              <span className="font-bold text-sm">Share Result</span>
           </button>
        </div>
      </div>
    </div>
  );
}
