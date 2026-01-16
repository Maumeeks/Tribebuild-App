import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

const Callback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        navigate('/login');
      } else if (data.session) {
        navigate('/plans');
      } else {
        supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session) navigate('/plans');
        });
        setTimeout(() => navigate('/login'), 3000);
      }
    };
    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
    </div>
  );
};

export default Callback;