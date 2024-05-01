'use client';

import { FC, PropsWithChildren, useState } from 'react';
import { styled, Container, Box } from '@mui/material';
import { Sidebar } from '../../components/layout/sidebar/sidebar';
import { Header } from '../../components/layout/header';

const MainWrapper = styled('div')(() => ({
  display: 'flex',
  minHeight: '100vh',
  width: '100%',
}));

const PageWrapper = styled('div')(() => ({
  display: 'flex',
  flexGrow: 1,
  paddingBottom: '60px',
  flexDirection: 'column',
  zIndex: 1,
  backgroundColor: 'transparent',
}));

const DashboardLayout: FC<PropsWithChildren> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <MainWrapper>
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onSidebarClose={() => setMobileSidebarOpen(false)}
      />
      <PageWrapper className="page-wrapper">
        <Header toggleMobileSidebar={() => setMobileSidebarOpen(true)} />
        <Container
          sx={{
            paddingTop: '20px',
            minWidth: '100%',
          }}
        >
          <Box sx={{ minHeight: 'calc(100vh - 170px)', width: '100%' }}>
            {children}
          </Box>
        </Container>
      </PageWrapper>
    </MainWrapper>
  );
};

export default DashboardLayout;
