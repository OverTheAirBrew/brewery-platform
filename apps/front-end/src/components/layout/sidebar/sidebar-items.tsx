import { Box, List } from '@mui/material';
import { usePathname } from 'next/navigation';
import { FC } from 'react';
import { IItem, ITitle, MenuItems } from './menu-items';
import { NavGroup } from './nav-group';
import { NavItem } from './nav-item';

interface ISidebarItemsProps {}

export const SidebarItems: FC<ISidebarItemsProps> = ({}) => {
  const pathname = usePathname();

  return (
    <Box sx={{ px: 3 }}>
      <List sx={{ pt: 0 }} className="sidebarNav" component="div">
        {MenuItems.map((item, id) => {
          if (item.hasOwnProperty('subheader')) {
            const i = item as ITitle;
            return <NavGroup item={i} key={i.subheader} />;
          }

          const i = item as IItem;
          return (
            <NavItem
              key={id}
              id={id.toString()}
              item={i}
              currentPath={pathname}
            />
          );
        })}
      </List>
    </Box>
  );
};
