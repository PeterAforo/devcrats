'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { AvatarUploadPrompt } from '@/components/avatar-upload-prompt';
import { useAuthStore } from '@/store/auth-store';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isDemoMode } = useAuthStore();
  const [showAvatarPrompt, setShowAvatarPrompt] = useState(false);

  useEffect(() => {
    // Show avatar upload prompt if user has no photo (skip in demo mode)
    if (user && !user.avatarUrl && !isDemoMode) {
      const dismissed = sessionStorage.getItem('avatar-prompt-dismissed');
      if (!dismissed) {
        setShowAvatarPrompt(true);
      }
    }
  }, [user, isDemoMode]);

  const handleClosePrompt = () => {
    setShowAvatarPrompt(false);
    sessionStorage.setItem('avatar-prompt-dismissed', '1');
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-6 bg-muted/30">{children}</main>
      </div>
      <AvatarUploadPrompt open={showAvatarPrompt} onClose={handleClosePrompt} />
    </div>
  );
}
