import { useLocation } from '@remix-run/react';
import { Breadcrumb } from 'flowbite-react';
import { FC, PropsWithChildren } from 'react';
import { FaHome } from 'react-icons/fa';

interface IPageWrapperProps {
  header: string;
}

export const PageWrapper: FC<PropsWithChildren<IPageWrapperProps>> = ({
  children,
  header,
}) => {
  const { pathname } = useLocation();
  const pathParts = pathname.split('/');

  const home = 'dashboard';

  const generateBreadcrumbs = () => {
    const capitalizeFirstLetter = (val: string) => {
      return String(val).charAt(0).toUpperCase() + String(val).slice(1);
    };

    const breadcrumbs = pathParts.map((path, index) => {
      const fullPath = pathParts.slice(0, index + 1).join('/');
      console.log(fullPath);

      if (path === home) {
        return (
          <Breadcrumb.Item key={index} href={fullPath}>
            <div className="flex items-center gap-x-3">
              <FaHome className="text-xl" />
              <span className="dark:text-white">
                {capitalizeFirstLetter(path)}
              </span>
            </div>
          </Breadcrumb.Item>
        );
      }

      return (
        <Breadcrumb.Item key={index} href={fullPath}>
          {capitalizeFirstLetter(path)}
        </Breadcrumb.Item>
      );
    });

    return breadcrumbs;
  };

  return (
    <>
      <div className="block items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:flex">
        <div className="mb-1 w-full">
          <div className="mb-4">
            <Breadcrumb className="mb-4">{generateBreadcrumbs()}</Breadcrumb>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              {header}
            </h1>
          </div>
          <div className="block items-center sm:flex">{children}</div>
        </div>
      </div>
    </>
  );
};
