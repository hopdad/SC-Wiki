import {createClient} from '@supabase/supabase-js';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

let _supabase = null;

/**
 * Get the Supabase client. Returns null during SSR/build.
 * Configure SUPABASE_URL and SUPABASE_ANON_KEY in docusaurus.config.js customFields,
 * or set window.__SUPABASE_URL / window.__SUPABASE_ANON_KEY before the app loads.
 */
export function getSupabase() {
  if (!ExecutionEnvironment.canUseDOM) {
    return null;
  }
  if (!_supabase) {
    const url = window.__SUPABASE_URL || 'https://your-project.supabase.co';
    const key = window.__SUPABASE_ANON_KEY || 'your-anon-key';
    _supabase = createClient(url, key);
  }
  return _supabase;
}

/**
 * React hook to initialize Supabase from Docusaurus customFields config.
 * Call once in Root.js to set up the config before any components use getSupabase().
 */
export function useSupabaseConfig() {
  if (!ExecutionEnvironment.canUseDOM) return;
  try {
    const {siteConfig} = useDocusaurusContext();
    const custom = siteConfig?.customFields || {};
    if (custom.supabaseUrl) window.__SUPABASE_URL = custom.supabaseUrl;
    if (custom.supabaseAnonKey) window.__SUPABASE_ANON_KEY = custom.supabaseAnonKey;
  } catch {
    // Silently ignore if called outside React context
  }
}
