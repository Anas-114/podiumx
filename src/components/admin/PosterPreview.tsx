import { Trophy, Star, Medal } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Entry } from '../../types';

interface PosterPreviewProps {
  programName: string;
  category: string;
  resultNumber: number;
  winners: Entry[];
  id?: string;
  templateId?: string;
}

export default function PosterPreview({ 
  programName, 
  category, 
  resultNumber, 
  winners, 
  id,
  templateId = 'modern-dark'
}: PosterPreviewProps) {
  
  const top1 = winners.find(w => w.position === 1);
  const others = winners.filter(w => w.position > 1).sort((a,b) => a.position - b.position);

  const getTemplateStyles = () => {
    switch(templateId) {
        case 'minimal-light':
            return {
                bg: 'bg-[#F5F5F5]',
                text: 'text-black',
                subtext: 'text-black/40',
                accent: 'bg-black text-white',
                border: 'border-black/5',
                orb: 'bg-black opacity-5'
            };
        case 'royal-gold':
            return {
                bg: 'bg-[#0D0D0D]',
                text: 'text-white',
                subtext: 'text-brand-primary',
                accent: 'gold-gradient text-black',
                border: 'border-brand-primary/20',
                orb: 'bg-brand-primary opacity-20'
            };
        default: // modern-dark
            return {
                bg: 'bg-[#0A0A0A]',
                text: 'text-white',
                subtext: 'text-white/30',
                accent: 'bg-brand-primary text-black',
                border: 'border-white/5',
                orb: 'bg-brand-primary opacity-10'
            };
    }
  };

  const styles = getTemplateStyles();

  return (
    <div 
        id={id}
        className={cn("w-[340px] h-[520px] relative overflow-hidden flex flex-col items-center p-8 rounded-[2rem] border shadow-2xl", styles.bg, styles.border)}
        style={{ fontFamily: "'Inter', sans-serif" }}
    >
        {/* Orbs */}
        <div className={cn("absolute top-[-100px] right-[-100px] w-64 h-64 blur-[100px] rounded-full", styles.orb)} />
        
        <div className="text-center z-10 w-full pt-10">
            <span className={cn("text-[9px] uppercase tracking-[0.4em] font-black mb-4 block italic", styles.subtext)}>Competition Result</span>
            
            <h2 className={cn("text-3xl font-serif italic font-bold tracking-tight mb-4 leading-tight", styles.text)}>
                {programName}
            </h2>
            
            <span className={cn("px-4 py-1.5 border rounded-full text-[10px] font-black uppercase tracking-widest", 
                templateId === 'minimal-light' ? 'bg-black/5 border-black/10 text-black' : 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary'
            )}>
                {category} Category
            </span>
        </div>

        {/* Winners Section */}
        <div className="w-full mt-auto mb-6 z-10 space-y-4">
            {top1 ? (
                <div className={cn("glass-card p-5 rounded-[1.5rem] border relative overflow-hidden group", styles.border)}>
                    <div className={cn("absolute top-0 right-0 p-3 opacity-10", styles.text)}>
                         <Trophy className="w-10 h-10" />
                    </div>
                    
                    <div className="flex flex-col items-center">
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-3 shadow-lg", styles.accent)}>
                            <span className="font-black text-lg italic">1</span>
                        </div>
                        
                        <h3 className={cn("text-lg font-black text-center mb-0.5 leading-tight", styles.text)}>{top1.name}</h3>
                        <p className={cn("text-[9px] uppercase tracking-widest font-bold mb-2", styles.subtext)}>{top1.team}</p>
                        
                        <p className={cn("text-[10px] font-black tracking-wider uppercase", templateId === 'minimal-light' ? 'text-black/40' : 'text-white/60')}>
                            Winner
                        </p>
                    </div>
                </div>
            ) : (
                <div className={cn("h-32 glass rounded-3xl border border-dashed flex items-center justify-center text-xs italic", styles.border, styles.subtext)}>
                    Preview Data
                </div>
            )}

            {others.length > 0 && (
                <div className={cn(
                    "grid gap-3",
                    others.length === 1 ? "grid-cols-1" : "grid-cols-2"
                )}>
                    {others.map((winner) => (
                        <div key={winner.position} className={cn("glass-card p-3 rounded-2xl border flex flex-col items-center text-center", styles.border)}>
                             <div className={cn("w-6 h-6 rounded-full flex items-center justify-center mb-1 text-[10px] font-black italic", 
                                winner.position === 2 ? "silver-gradient text-black" : "bronze-gradient text-black"
                             )}>
                                {winner.position}
                             </div>
                             <h4 className={cn("text-[11px] font-bold truncate w-full", styles.text)}>{winner.name}</h4>
                             <p className={cn("text-[8px] uppercase tracking-widest font-medium opacity-60 truncate w-full", styles.text)}>{winner.team}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Brand */}
        <div className="mt-auto opacity-20">
           <p className={cn("text-[10px] font-black tracking-tighter uppercase", styles.text)}>Podium<span className="text-brand-primary">X</span></p>
        </div>
    </div>
  );
}
