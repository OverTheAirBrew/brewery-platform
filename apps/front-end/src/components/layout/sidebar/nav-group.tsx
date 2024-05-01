import { ListSubheader, Theme, styled } from '@mui/material';
import { FC } from 'react';
import { ITitle } from './menu-items';

interface IItemType {
  item: ITitle;
}

export const NavGroup: FC<IItemType> = ({ item }) => {
  const ListSubheaderStyle = styled((props: Theme | any) => (
    <ListSubheader disableSticky {...props} />
  ))(({ theme }) => ({
    ...theme.typography.overline,
    fontWeight: '700',
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(0),
    color: theme.palette.text.primary,
    lineHeight: '26px',
    padding: '3px 12px',
  }));
  return <ListSubheaderStyle>{item.subheader}</ListSubheaderStyle>;
};
