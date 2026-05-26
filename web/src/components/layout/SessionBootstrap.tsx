'use client';

import { useEffect } from 'react';
import { bootstrapAuthSession } from '@/lib/auth';

export function SessionBootstrap() {
  useEffect(() => {
    void bootstrapAuthSession();
  }, []);

  return null;
}
