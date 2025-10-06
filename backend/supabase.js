// backend/supabase.js
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Use a neutral variable name to avoid collisions
const client = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE,
  {
    auth: { persistSession: false },
    global: { headers: { 'x-application-name': 'reform-her-backend' } },
  }
);

// Export ONLY a default. No named export here.
export default client;
