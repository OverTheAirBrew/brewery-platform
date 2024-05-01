'use client';

import Link from 'next/link';
import { styled } from '@mui/material';
import Image from 'next/image';

const LinkStyled = styled(Link)(() => ({
  height: '70px',
  width: '200px',
  overflow: 'hidden',
  display: 'block',
}));

export const Logo = () => {
  return (
    <LinkStyled href="/dashboard">
      <Image src="/logo.svg" alt="logo" height={70} width={190} priority />
    </LinkStyled>
  );
};
