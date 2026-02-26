import { NextResponse } from "next/server";

export async function GET() {
  console.log('=== TEST API ===');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'exists' : 'MISSING');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'exists' : 'MISSING');
  
  return NextResponse.json({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'MISSING',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'MISSING',
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'configured' : 'MISSING',
  });
}
