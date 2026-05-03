import { Trophy, Star, Medal } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PosterPreviewProps {
  programName: string;
  category: string;
  resultNumber: number;
  winners: Array<{
    name: string;
    team: string;
    position: number;
    grade: string;
  }>;
  id?: string;
}

export default function PosterPreview({ 
  programName, 
  category, 
  resultNumber, 
  winners,
  id 
}: PosterPreviewProps) {
  
  const top1 = winners.find(w => w.position === 1);

  return (
    <div 
        id={id}
        className="w-[340px] h-[520px] bg-[#0A0A0A] relative overflow-hidden flex flex-col items-center p-8 rounded-[2rem] border border-white/5 shadow-2xl"
        style={{ fontFamily: "'Inter', sans-serif" }}
    >
        {/* Orbs */}
        <div className="absolute top-[-100px] right-[-100px] w-64 h-64 bg-brand-primary opacity-10 blur-[100px] rounded-full" />
        
        <div className="text-center z-10 w-full pt-10">
            <span className="text-[9px] uppercase tracking-[0.4em] text-white/30 font-black mb-4 block italic">Competition Result</span>
            
            <h2 className="text-3xl font-serif italic font-bold tracking-tight text-white mb-4 leading-tight">
                {programName}
            </h2>
            
            <span className="px-4 py-1.5 bg-brand-primary/10 border border-brand-primary/20 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-primary">
                {category} Category
            </span>
        </div>

        {/* Winner Card */}
        <div className="w-full mt-auto mb-10 z-10">
            {top1 ? (
                <div className="glass-card p-6 rounded-[2rem] border border-white/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                         <Trophy className="w-12 h-12 text-white" />
                    </div>
                    
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(242,125,38,0.4)]">
                            <span className="text-black font-black text-xl italic">1</span>
                        </div>
                        
                        <h3 className="text-xl font-black text-white text-center mb-1 leading-tight">{top1.name}</h3>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-3">{top1.team}</p>
                        
                        <div className="h-px w-8 bg-white/20 mb-3" />
                        
                        <p className="text-xs font-black text-white/60 tracking-wider uppercase">98 Points</p>
                    </div>
                </div>
            ) : (
                <div className="h-40 glass rounded-3xl border border-dashed border-white/10 flex items-center justify-center text-white/10 text-xs italic">
                    Preview Data
                </div>
            )}
        </div>

        {/* Brand */}
        <div className="mt-auto opacity-20">
           <p className="text-[10px] font-black tracking-tighter uppercase">Podium<span className="text-brand-primary">X</span></p>
        </div>
    </div>
  );
}
