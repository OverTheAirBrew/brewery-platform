'use client';

import Link from 'next/link';
import { styled } from '@mui/material';
import Image from 'next/image';
import { FC } from 'react';

const LinkStyled = styled(Link)(() => ({
  height: '70px',
  width: '200px',
  overflow: 'hidden',
  display: 'block',
}));

const DivStyled = styled('div')(() => ({
  height: '70px',
  width: '200px',
  overflow: 'hidden',
  display: 'block',
}));

interface ILogoProps {
  addHyperLink?: boolean;
}

export const Logo: FC<ILogoProps> = ({ addHyperLink }) => {
  if (!addHyperLink) {
    return (
      <DivStyled>
        <Image src="/logo.svg" alt="logo" height={70} width={190} priority />
      </DivStyled>
    );
  }

  return (
    <LinkStyled href="/dashboard">
      <Image src="/logo.svg" alt="logo" height={70} width={190} priority />
    </LinkStyled>
  );
};
