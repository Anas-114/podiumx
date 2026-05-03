import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Result } from '../../types';
import { motion } from 'motion/react';
import { ArrowLeft, Download, FileText, ImageIcon, ExternalLink } from 'lucide-react';
import { jsPDF } from 'jspdf';

export default function PosterView() {
  const { id } = useParams();
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      if (!id) return;
      const docRef = doc(db, 'results', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setResult({ id: docSnap.id, ...docSnap.data() } as Result);
      }
      setLoading(false);
    };
    fetchResult();
  }, [id]);

  const downloadImage = async () => {
    if (!result?.posterUrl) return;
    const response = await fetch(result.posterUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PodiumX_${result.programName}_Result.png`;
    link.click();
  };

  const downloadPDF = async () => {
    if (!result?.posterUrl || !result.programName) return;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [400, 600]
    });
    
    // Convert current poster image to Base64 for PDF
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = result.posterUrl;
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        doc.addImage(dataUrl, 'PNG', 0, 0, 400, 600);
        doc.save(`PodiumX_${result.programName}.pdf`);
    };
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading Poster...</div>;
  if (!result) return <div className="p-8 text-center">Poster not found.</div>;

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8 flex flex-col items-center">
        <div className="w-full max-w-lg flex justify-between items-center">
            <Link to={`/result/${id}`} className="text-white/60 hover:text-white flex items-center gap-2">
                <ArrowLeft className="w-5 h-5" />
                Back
            </Link>
            <h1 className="text-xl font-bold tracking-tight">Official Poster</h1>
            <div className="w-10 h-10" /> {/* Spacer */}
        </div>

        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative shadow-[0_40px_80px_rgba(0,0,0,0.8)] rounded-3xl overflow-hidden border border-white/10"
        >
            <img 
                src={result.posterUrl} 
                alt="Competition Poster" 
                className="w-full max-w-[400px] h-auto block"
            />
        </motion.div>

        <div className="w-full max-w-lg flex flex-col gap-4">
             <div className="flex gap-4">
                <button 
                  onClick={downloadImage}
                  className="flex-1 glass p-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all active:scale-95"
                >
                    <ImageIcon className="w-5 h-5 text-brand-primary" />
                    Download PNG
                </button>
                <button 
                  onClick={downloadPDF}
                  className="flex-1 glass p-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all active:scale-95"
                >
                    <FileText className="w-5 h-5 text-brand-primary" />
                    Download PDF
                </button>
             </div>
             
             <button 
              onClick={() => {
                if (result.posterUrl) window.open(result.posterUrl, '_blank');
              }}
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] text-white/40 flex items-center justify-center gap-2 hover:text-white"
             >
                <ExternalLink className="w-4 h-4" />
                Open Original File
             </button>
        </div>
    </div>
  );
}
