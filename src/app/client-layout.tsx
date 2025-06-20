'use client';

import { useEffect, useState } from 'react';
import ContextProvider from '@/context/ContextProvider';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <ContextProvider>{children}</ContextProvider>;
}
