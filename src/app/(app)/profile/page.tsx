import { createClient } from '@/lib/supabase/server';
import { ProfileView } from '@/components/profile/profile-view';

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if user signed up with email/password (has password identity)
  const hasPassword = user?.app_metadata?.providers?.includes('email') ?? false;

  return (
    <ProfileView
      userEmail={user?.email ?? ''}
      hasPassword={hasPassword}
    />
  );
}
