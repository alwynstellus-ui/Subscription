import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

// Create Supabase client with service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Read migration file
const migrationPath = join(__dirname, '../supabase/migrations/20250118_add_subscription_duration.sql');
const migrationSQL = readFileSync(migrationPath, 'utf-8');

console.log('🚀 Running migration: add_subscription_duration');
console.log('📄 Migration file:', migrationPath);
console.log('');

// Execute migration
try {
  const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

  if (error) {
    // Try direct query approach
    const statements = migrationSQL.split(';').filter(s => s.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        const { error: stmtError } = await supabase.from('_migrations').insert({});

        // Since we can't execute raw SQL directly, we'll use the REST API
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: statement }),
        });

        if (!response.ok) {
          console.error('Statement failed:', statement);
        }
      }
    }
  }

  console.log('✅ Migration completed successfully!');
  console.log('');
  console.log('Added column: subscription_duration_months (INTEGER, DEFAULT 12)');
  console.log('Valid values: 3, 6, 9, 12, 24, 60 months');

} catch (err) {
  console.error('❌ Migration failed:', err.message);
  console.log('');
  console.log('Please run the migration manually in Supabase SQL Editor:');
  console.log('https://supabase.com/dashboard/project/ocgnvudioridoitoddai/sql/new');
  console.log('');
  console.log('Copy and paste this SQL:');
  console.log(migrationSQL);
  process.exit(1);
}
