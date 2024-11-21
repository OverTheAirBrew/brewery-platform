import { IconType } from 'react-icons';
import { GiBarrel, GiTap } from 'react-icons/gi';
import { MdLocalDrink, MdOutlineBusiness } from 'react-icons/md';
import { SlScreenDesktop } from 'react-icons/sl';
import { RequireOnlyOne } from '../../lib/require-one-of';

interface ItemType {
  title: string;
  link: {
    href: string;
    external?: boolean;
  };
  group: boolean;
  icon?: IconType;
}

export type MenuItemType = RequireOnlyOne<ItemType, 'link' | 'group'>;

export const menuItems: MenuItemType[] = [
  {
    title: 'Equipment',
    group: true,
  },
  {
    title: 'Displays',
    link: {
      href: '/dashboard/equipment/displays',
    },
    icon: SlScreenDesktop,
  },
  {
    title: 'Taps',
    link: {
      href: '/dashboard/equipment/taps',
    },
    icon: GiTap,
  },
  {
    title: 'Cellar',
    group: true,
  },
  {
    title: 'Producers',
    link: {
      href: '/dashboard/cellar/producers',
    },
    icon: MdOutlineBusiness,
  },
  {
    title: 'Beverages',
    link: {
      href: '/dashboard/cellar/beverages',
    },
    icon: MdLocalDrink,
  },
  {
    title: 'Kegs',
    link: {
      href: '/dashboard/cellar/kegs',
    },
    icon: GiBarrel,
  },
];
