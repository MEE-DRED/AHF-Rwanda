import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { isAdminEmail } from '../admin';

// Returns the signed-in admin user, or null. Used by every /api/admin/* route.
export async function getAdminUser() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {
          /* read-only in route handlers; middleware refreshes the session */
        },
      },
    }
  );
  const { data } = await supabase.auth.getUser(); // validates the JWT with Supabase
  const user = data.user;
  return user && isAdminEmail(user.email) ? user : null;
}
