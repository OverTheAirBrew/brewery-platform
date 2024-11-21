import { DarkThemeToggle, Navbar as FNavbar } from 'flowbite-react';
import type { FC } from 'react';
import { Logo } from '../components/logo';
import { Profile } from './header/profile';

interface INavbarProps {
  emailHash: string;
}

export const Navbar: FC<INavbarProps> = function ({ emailHash }) {
  return (
    <FNavbar fluid>
      <div className="w-full p-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FNavbar.Brand href="/">
              {/* <img alt="" src="/images/logo.svg" className="mr-3 h-6 sm:h-8" />
              <span className="self-center whitespace-nowrap text-2xl font-semibold dark:text-white">
                Flowbite
              </span> */}
              <Logo />
            </FNavbar.Brand>
          </div>
          <div className="flex items-center gap-3">
            <Profile emailHash={emailHash} />
            {/* <iframe
              height="30"
              src="https://ghbtns.com/github-btn.html?user=themesberg&repo=flowbite-react-admin-dashboard&type=star&count=true&size=large"
              title="GitHub"
              width="90"
              className="hidden sm:block"
            />
            <Button color="primary" href="https://flowbite.com/pro/">
              Upgrade to Pro
            </Button> */}
            <DarkThemeToggle />
          </div>
        </div>
      </div>
    </FNavbar>
  );
};
