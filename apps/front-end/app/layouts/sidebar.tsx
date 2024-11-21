import { useLocation } from '@remix-run/react';
import { Sidebar as FSidebar } from 'flowbite-react';
import type { FC } from 'react';
import { menuItems } from './menu-items';

export const Sidebar: FC = function () {
  const { pathname } = useLocation();

  return (
    <FSidebar aria-label="Sidebar with multi-level dropdown example">
      <div className="flex h-full flex-col justify-between py-2">
        <div>
          <FSidebar.Items>
            <FSidebar.ItemGroup>
              {menuItems.map((item, index) => {
                if (item.group) {
                  return (
                    <h5
                      className="text-link font-bold text-xs caption"
                      key={index}
                    >
                      <span className="hide-menu leading-21 dark:text-white">
                        {item.title}
                      </span>
                    </h5>
                  );
                }
                return (
                  <FSidebar.Item
                    key={index}
                    href={item.link?.href}
                    icon={item.icon}
                    className={
                      pathname == item.link?.href
                        ? 'bg-gray-100 dark:bg-gray-700'
                        : ''
                    }
                    active={pathname === item.link?.href}
                  >
                    {item.title}
                  </FSidebar.Item>
                );
              })}
            </FSidebar.ItemGroup>
          </FSidebar.Items>
        </div>
      </div>
    </FSidebar>
  );
};
