import { FC } from 'react';
import { IItem } from './menu-items';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  styled,
  useTheme,
} from '@mui/material';
import Link from 'next/link';

interface INavItemProps {
  id: string;
  item: IItem;
  currentPath: string;
  onClick?: React.MouseEvent<HTMLButtonElement, MouseEvent>;
}

export const NavItem: FC<INavItemProps> = ({
  id,
  item,
  currentPath,
  onClick,
}) => {
  const Icon = item.icon;
  const theme = useTheme();
  const itemIcon = <Icon stroke={1.5} size="1.3rem" />;

  const ListItemStyled = styled(ListItem)(() => ({
    padding: 0,
    '.MuiButtonBase-root': {
      whiteSpace: 'nowrap',
      marginBottom: '2px',
      padding: '8px 10px',
      borderRadius: '8px',
      backgroundColor: 'inherit',
      color: theme.palette.text.secondary,
      paddingLeft: '10px',
      '&:hover': {
        backgroundColor: theme.palette.primary.light,
        color: theme.palette.primary.main,
      },
      '&.Mui-selected': {
        color: 'white',
        backgroundColor: theme.palette.primary.main,
        '&:hover': {
          backgroundColor: theme.palette.primary.main,
          color: 'white',
        },
      },
    },
  }));

  return (
    <List component="div" disablePadding key={id}>
      <ListItemStyled>
        <ListItemButton
          component={Link}
          href={item.href}
          disabled={false}
          selected={currentPath === item.href}
          target={''}
          // onClick={onClick}
        >
          <ListItemIcon sx={{ minWidth: '36px', p: '3px 0', color: 'inherit' }}>
            {itemIcon}
          </ListItemIcon>
          <ListItemText>{item.title}</ListItemText>
        </ListItemButton>
      </ListItemStyled>
    </List>
  );
};
