import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Trophy, LogIn, Mail, Lock } from 'lucide-react';

export default function LandingPage() {
  const { user, profile } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (user && profile) {
    return <Navigate to={profile.role === 'admin' ? '/admin' : '/dashboard'} />;
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-height-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card p-8 rounded-3xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 orange-gradient rounded-2xl flex items-center justify-center mb-4 shadow-lg ring-1 ring-white/10">
            <Trophy className="text-black w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold tracking-tighter mb-2">PodiumX</h1>
          <p className="text-white/40 text-center font-medium">Your elite competition results management partner.</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-4 h-4 text-white/40" />
              <input 
                type="email" 
                placeholder="Email Address" 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-brand-primary transition-colors text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-4 h-4 text-white/40" />
              <input 
                type="password" 
                placeholder="Password" 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-brand-primary transition-colors text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-xs px-1">{error}</p>}

          <button 
            type="submit" 
            className="w-full orange-gradient text-black font-black py-4 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
          >
            {isLogin ? <LogIn className="w-4 h-4" /> : null}
            {isLogin ? 'Login to Dashboard' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-white/60 hover:text-white transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </button>
        </div>

        <div className="my-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="text-white/30 text-xs uppercase tracking-widest">Or continue with</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        <button 
          onClick={handleGoogle}
          className="w-full bg-white text-black font-medium py-3 rounded-xl hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
          Google Authentication
        </button>
      </motion.div>
    </div>
  );
}
