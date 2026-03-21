import React from 'react';
import {AuthProvider} from '../contexts/AuthContext';
import {useSupabaseConfig} from '../lib/supabase';

export default function Root({children}) {
  useSupabaseConfig();
  return <AuthProvider>{children}</AuthProvider>;
}
