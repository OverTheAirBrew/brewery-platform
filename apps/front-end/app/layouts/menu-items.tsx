import { IconType } from 'react-icons';
import { GiBarrel, GiTap } from 'react-icons/gi';
import { MdLocalDrink, MdOutlineBusiness } from 'react-icons/md';
import { SlScreenDesktop } from 'react-icons/sl';

export interface ItemType {
  title:string;
  children: {
    title: string;
    link: {
      href: string;
      external?: boolean;
    };
    icon: IconType;
  }[]
}



export const menuItems: ItemType[] = [
  {
    title: 'Equipment',
    children: [
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
    ]
  },
  {
    title: 'Cellar',
    children: [
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
    ]
  },
];
