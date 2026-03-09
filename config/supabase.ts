
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://azmtxhjtqodtaeoshrye.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6bXR4aGp0cW9kdGFlb3NocnllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTI4NTM1ODUsImV4cCI6MjAyODQyOTU4NX0.KvQovDvmATwBPc50oqnY_yJqjqoywZdSXm_bz5qn4V0';

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
