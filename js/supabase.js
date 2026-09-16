const SUPABASE_URL = "https://ebnxjlhiisrysnywvlpr.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ZZthT3fblMHZh7x7m6S3iQ_Sc1e9u7-";

window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);