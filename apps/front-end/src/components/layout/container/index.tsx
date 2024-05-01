import { FC, PropsWithChildren } from 'react';
import { Helmet } from './helmet';

interface IPageContainerProps {
  title: string;
  description: string;
}

export const PageContainer: FC<PropsWithChildren<IPageContainerProps>> = ({
  children,
  title,
  description,
}) => (
  <div>
    <Helmet title={title} description={description} />
    {children}
  </div>
);
