const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ocgnvudioridoitoddai.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZ252dWRpb3JpZG9pdG9kZGFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODcxNzk4OCwiZXhwIjoyMDg0MjkzOTg4fQ.vFddMtGLOAA4dU1sg_301vn8vzBVbEl0TRCRuNOfq1Q';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyMigration() {
  console.log('🔍 Verifying migration...\n');

  try {
    // Check if we can select the new column
    const { data, error } = await supabase
      .from('subscribers')
      .select('subscription_duration_months')
      .limit(1);

    if (error) {
      console.error('❌ Migration verification failed:', error.message);
      console.log('\nThe column might not exist yet. Please ensure the migration ran successfully.');
      return false;
    }

    console.log('✅ Migration verified successfully!');
    console.log('✅ Column "subscription_duration_months" exists in subscribers table');

    if (data && data.length > 0) {
      console.log('✅ Sample data:', data[0]);
    } else {
      console.log('ℹ️  No subscribers in database yet (this is normal)');
    }

    console.log('\n🎉 The duration slider feature is ready to use!');
    console.log('📍 Visit: https://newsletter-app-cyan.vercel.app/preferences');

    return true;
  } catch (err) {
    console.error('❌ Error:', err.message);
    return false;
  }
}

verifyMigration();
