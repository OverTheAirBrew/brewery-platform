'use client';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { SessionProvider } from 'next-auth/react';
import { baselightTheme } from '../utils/theme/default';
import { HelmetProvider } from 'react-helmet-async';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider theme={baselightTheme}>
        <CssBaseline />
        <HelmetProvider>{children}</HelmetProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
