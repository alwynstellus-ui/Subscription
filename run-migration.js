const { createClient } = require('@supabase/supabase-js');

// Hardcoded credentials from .env.local
const supabaseUrl = 'https://ocgnvudioridoitoddai.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZ252dWRpb3JpZG9pdG9kZGFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODcxNzk4OCwiZXhwIjoyMDg0MjkzOTg4fQ.vFddMtGLOAA4dU1sg_301vn8vzBVbEl0TRCRuNOfq1Q';

console.log('🚀 Starting migration...');
console.log('📍 Supabase URL:', supabaseUrl);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('');
  console.log('📝 Executing migration: add subscription_duration_months column');
  console.log('');

  try {
    // Step 1: Add column
    console.log('Step 1: Adding column...');
    const { data: data1, error: error1 } = await supabase
      .rpc('exec_sql', {
        sql: 'ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS subscription_duration_months INTEGER DEFAULT 12;'
      });

    if (error1) {
      console.log('⚠️  Cannot use exec_sql RPC (not available)');
      console.log('');
      console.log('🔧 Alternative: You need to run this in Supabase SQL Editor:');
      console.log('   https://supabase.com/dashboard/project/ocgnvudioridoitoddai/sql/new');
      console.log('');
      console.log('📋 Copy and paste this SQL:');
      console.log('');
      console.log('ALTER TABLE subscribers');
      console.log('ADD COLUMN IF NOT EXISTS subscription_duration_months INTEGER DEFAULT 12;');
      console.log('');
      console.log('COMMENT ON COLUMN subscribers.subscription_duration_months IS \'Duration of subscription in months (3, 6, 9, 12, 24, 60)\';');
      console.log('');
      console.log('ALTER TABLE subscribers');
      console.log('ADD CONSTRAINT valid_duration_months');
      console.log('CHECK (subscription_duration_months IN (3, 6, 9, 12, 24, 60));');
      console.log('');
      return;
    }

    console.log('✅ Column added successfully');
    console.log('');
    console.log('✅ Migration completed!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('');
    console.log('🔧 Please run the migration manually in Supabase SQL Editor:');
    console.log('   https://supabase.com/dashboard/project/ocgnvudioridoitoddai/sql/new');
  }
}

runMigration();
