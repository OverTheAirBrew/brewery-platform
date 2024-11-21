import { Icon } from '@iconify/react';
import { Drawer, Navbar } from 'flowbite-react';
import { FC, useEffect, useState } from 'react';
import { Profile } from './profile';

interface HeaderProps {
  emailHash: string;
}

export const Header: FC<HeaderProps> = ({ emailHash }) => {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  });

  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);

  return (
    <>
      <header
        className={`sticky top-0 z-[2] ${
          isSticky
            ? 'bg-white dark:bg-dark shadow-md fixed w-full'
            : 'bg-transparent'
        }`}
      >
        <Navbar
          fluid
          className="rounded-none bg-transparent dark:bg-transparent py-4 sm:ps-6 !max-w-full sm:pe-10 $"
        >
          <span
            onClick={() => setIsOpen(true)}
            className="px-[15px] hover:text-primary dark:hover:text-primary text-link dark:text-darklink relative after:absolute after:w-10 after:h-10 after:rounded-full hover:after:bg-lightprimary  after:bg-transparent rounded-full xl:hidden flex justify-center items-center cursor-pointer"
          >
            <Icon icon="tabler:menu-2" height={20} />
          </span>
          <Navbar.Collapse className="xl:block">
            <div className="flex gap-0 items-center relative">
              {/* <Logo /> */}
            </div>
          </Navbar.Collapse>
          <div className="block">
            <div className="flex gap-0 items-center">
              {/* <Button
                color={'primary'}
                as={Link}
                size={'md'}
                to="https://adminmart.com/product/modernize-tailwind-nextjs-dashboard-template/"
                className="w-full rounded-md py-0"
              >
                Pro Version
              </Button> */}
              <Profile emailHash={emailHash} />
            </div>
          </div>
        </Navbar>
      </header>
      <Drawer open={isOpen} onClose={handleClose} className="w-130">
        <Drawer.Items>
          Hello
          {/* <MobileSidebar /> */}
        </Drawer.Items>
      </Drawer>
    </>
  );
};
