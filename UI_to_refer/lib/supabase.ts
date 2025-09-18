import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nckesiywrprkozozuucq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ja2VzaXl3cnBya296b3p1dWNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxOTgxMDcsImV4cCI6MjA3Mzc3NDEwN30.mbEKgNeD3F1YqLixgenuBjlegHj-UcBIS5h-JRAU860';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
