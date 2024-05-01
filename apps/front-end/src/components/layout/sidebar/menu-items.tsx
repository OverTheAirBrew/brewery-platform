import {
  IconLayoutDashboard,
  IconSettings,
  IconSwitch2,
  IconTemperature,
  IconUser,
  TablerIconsProps,
  IconCpu2,
} from '@tabler/icons-react';

export interface ITitle {
  subheader: string;
}

export interface IItem {
  title: string;
  icon: (props: TablerIconsProps) => JSX.Element;
  href: string;
}

export const MenuItems: (ITitle | IItem)[] = [
  {
    subheader: 'Home',
  },
  {
    title: 'Dashboard',
    icon: IconLayoutDashboard,
    href: '/dashboard',
  },
  {
    subheader: 'Equipment',
  },
  {
    title: 'Devices',
    icon: IconCpu2,
    href: '/dashboard/equipment/devices',
  },
  {
    title: 'Actors',
    icon: IconSwitch2,
    href: '/equipment/actors',
  },
  {
    title: 'Sensors',
    icon: IconTemperature,
    href: '/equipment/sensors',
  },
  {
    subheader: 'Settings',
  },
  {
    title: 'Users',
    icon: IconUser,
    href: '/settings/users',
  },
  {
    title: 'Config',
    icon: IconSettings,
    href: '/settings/config',
  },
];
