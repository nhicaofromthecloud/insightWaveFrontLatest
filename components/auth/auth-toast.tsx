'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

export function AuthToast({ authError }: { authError: string | null }) {
  useEffect(() => {
    if (authError === 'true') {
      toast.error('Please log in to access this page', {
        description: 'You need to be authenticated to view this content'
      });
    }
  }, [authError]);

  return null;
}
