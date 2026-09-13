import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ibgckqkoxmamddaixwud.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliZ2NrcWtveG1hbWRkYWl4d3VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyODI5MzcsImV4cCI6MjEwNDg1ODkzN30.nDuCgmK90Pr4UpoglE3TdI06CoaT0A_l21DZi64xmVk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
