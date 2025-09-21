import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wlfhcvrudllyqytzrjoz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsZmhjdnJ1ZGxseXF5dHpyam96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0ODE1MzQsImV4cCI6MjA3NDA1NzUzNH0.A1n4UDBN5ozMcql3rLUhyfDrMmRYcmQMLVYnTu7XjtE'

export const supabase = createClient(supabaseUrl, supabaseKey)