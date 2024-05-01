import { Box, Drawer, useMediaQuery } from '@mui/material';
import { FC } from 'react';
import { SidebarItems } from './sidebar-items';
import Image from 'next/image';
import { Logo } from '../../shared/logo';

interface ISidebarProps {
  isMobileSidebarOpen: boolean;
  onSidebarClose: (event: React.MouseEvent<HTMLElement>) => void;
  isSidebarOpen: boolean;
}

export const Sidebar: FC<ISidebarProps> = ({
  isMobileSidebarOpen,
  onSidebarClose,
  isSidebarOpen,
}) => {
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up('lg'));

  const sidebarWidth = '270px';

  if (lgUp) {
    return (
      <Box sx={{ width: sidebarWidth, flexShrink: 0 }}>
        <Drawer
          anchor="left"
          open={isSidebarOpen}
          variant="permanent"
          PaperProps={{
            sx: {
              width: sidebarWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          <Box sx={{ height: '100%' }} style={{ marginTop: '20px' }}>
            <Box px={3}>
              <Logo />
            </Box>

            <Box>
              <SidebarItems />
            </Box>
          </Box>
        </Drawer>
      </Box>
    );
  }

  return (
    <Drawer
      anchor="left"
      open={isMobileSidebarOpen}
      onClose={onSidebarClose}
      variant="temporary"
      PaperProps={{
        sx: {
          width: sidebarWidth,
          boxShadow: (theme) => theme.shadows[8],
        },
      }}
    >
      <Box sx={{ height: '100%' }}>
        <Box px={2}>Hello</Box>
      </Box>
    </Drawer>
  );
};
