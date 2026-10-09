import {
  IconApi,
  IconCpu,
  IconFlame,
  IconHome2,
  IconSettings,
  IconTemperature,
  IconToggleRight,
  IconUsers,
  type IconProps,
} from '@tabler/icons-react';
import type { ComponentType } from 'react';

export interface MenuItemConfig {
  to: string;
  label: string;
  icon: ComponentType<IconProps>;
  end?: boolean;
}

export const SIDEBAR_MENU: Record<string, MenuItemConfig[]> = {
  overview: [
    {
      to: '/',
      label: 'Dashboard',
      icon: IconHome2,
      end: true,
    },
  ],
  equipment: [
    {
      to: '/equipment/devices',
      label: 'Devices',
      icon: IconCpu,
    },
    {
      to: '/equipment/sensors',
      label: 'Sensors',
      icon: IconTemperature,
    },
    {
      to: '/equipment/actors',
      label: 'Actors',
      icon: IconToggleRight,
    },
    {
      to: '/equipment/vessels',
      label: 'Vessels',
      icon: IconFlame,
    },
  ],
  settings: [
    {
      to: '/settings/users',
      label: 'Users',
      icon: IconUsers,
    },
    {
      to: '/settings/config',
      label: 'Config',
      icon: IconSettings,
    },
  ],
};
