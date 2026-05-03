import { useState, useEffect } from 'react';
import { collectionGroup, getDocs, query } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Entry } from '../../types';
import { motion } from 'motion/react';
import { Trophy, Medal, Star, ArrowLeft, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface TeamScore {
  team: string;
  points: number;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<TeamScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      // Fetch all entries from all results subcollections
      const entriesSnap = await getDocs(collectionGroup(db, 'entries'));
      const teamMap: Record<string, number> = {};
      
      entriesSnap.docs.forEach(doc => {
        const data = doc.data() as Entry;
        teamMap[data.team] = (teamMap[data.team] || 0) + data.points;
      });

      const sorted = Object.entries(teamMap)
        .map(([team, points]) => ({ team, points }))
        .sort((a, b) => b.points - a.points);
      
      setLeaderboard(sorted);
      setLoading(false);
    };

    fetchLeaderboard();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-screen">Shifting standings...</div>;

  const top3 = leaderboard.slice(0, 3);
  const others = leaderboard.slice(3);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-12">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors">
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </Link>

      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-brand-primary/20">
            <TrendingUp className="w-4 h-4 text-brand-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Live Standings</span>
        </div>
        <h1 className="text-5xl font-black tracking-tighter">Team Leaderboard</h1>
        <p className="text-white/40 max-w-md mx-auto font-medium">Aggregated points from all competition programs across all categories.</p>
      </div>

      {/* Podium */}
      <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-0 pt-16">
        {/* 2nd */}
        {top3[1] && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full md:w-48 order-2 md:order-1"
          >
            <div className="glass-card mb-4 p-4 rounded-3xl text-center border-b-4 border-silver-gradient flex flex-col items-center">
                <Medal className="w-10 h-10 text-[#C0C0C0] mb-3" />
                <h3 className="font-bold text-lg leading-tight truncate w-full">{top3[1].team}</h3>
                <p className="text-2xl font-black text-brand-secondary">{top3[1].points}</p>
            </div>
            <div className="h-24 silver-gradient rounded-t-3xl opacity-20 hidden md:block" />
          </motion.div>
        )}

        {/* 1st */}
        {top3[0] && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full md:w-56 z-10 order-1 md:order-2"
          >
            <div className="glass-card mb-6 p-6 rounded-[2.5rem] text-center border-t-2 border-brand-primary/30 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3">
                    <Star className="w-5 h-5 text-brand-primary fill-brand-primary animate-pulse" />
                </div>
                <Trophy className="w-16 h-16 text-brand-primary mx-auto mb-4 drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]" />
                <h3 className="font-black text-2xl tracking-tight leading-tight truncate w-full">{top3[0].team}</h3>
                <p className="text-4xl font-black text-white mt-2">{top3[0].points}</p>
                <div className="mt-4 inline-flex px-3 py-1 bg-brand-primary text-black rounded-full text-[10px] font-black uppercase">Champion</div>
            </div>
            <div className="h-40 gold-gradient rounded-t-3xl opacity-30 shadow-[0_-20px_50px_rgba(255,215,0,0.2)] hidden md:block" />
          </motion.div>
        )}

        {/* 3rd */}
        {top3[2] && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full md:w-48 order-3"
          >
            <div className="glass-card mb-4 p-4 rounded-3xl text-center border-b-4 border-bronze-gradient flex flex-col items-center">
                <Medal className="w-10 h-10 text-[#CD7F32] mb-3" />
                <h3 className="font-bold text-lg leading-tight truncate w-full">{top3[2].team}</h3>
                <p className="text-2xl font-black text-brand-tertiary">{top3[2].points}</p>
            </div>
            <div className="h-16 bronze-gradient rounded-t-3xl opacity-20 hidden md:block" />
          </motion.div>
        )}
      </div>

      {/* List */}
      <div className="mt-12 space-y-3">
        <h4 className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold mb-6 ml-4">Extended Rankings</h4>
        {others.map((score, index) => (
          <motion.div 
            key={score.team}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-4 rounded-2xl flex items-center justify-between hover:bg-white/5 transition-all"
          >
            <div className="flex items-center gap-6">
                <span className="w-8 text-center text-white/20 font-black text-xl italic">{index + 4}</span>
                <div>
                   <h5 className="font-bold text-lg leading-tight">{score.team}</h5>
                   <p className="text-xs text-white/40 font-medium">Contested across multiple results</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-2xl font-black">{score.points}</p>
                <p className="text-[10px] uppercase font-bold text-white/30">Total Points</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
