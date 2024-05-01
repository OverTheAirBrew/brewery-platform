'use client';
import { FC } from 'react';
import { Helmet as HelmetWrapper } from 'react-helmet-async';

export const Helmet: FC<{ title: string; description: string }> = ({
  title,
  description,
}) => (
  <HelmetWrapper>
    <title>{title}</title>
    <meta name="description" content={description} />
  </HelmetWrapper>
);
