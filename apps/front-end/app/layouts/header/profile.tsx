import { Link } from '@remix-run/react';
import { Dropdown } from 'flowbite-react';
import { FC } from 'react';
import { MdOutlineAccountBox, MdOutlineLogout } from 'react-icons/md';

interface ProfileProps {
  emailHash: string;
}

export const Profile: FC<ProfileProps> = ({ emailHash }) => {
  return (
    <div className="relative group/menu ps-15 shrink-0">
      <Dropdown
        label=""
        className="w-screen sm:w-[200px] rounded-sm"
        dismissOnClick={false}
        renderTrigger={() => (
          <span className=" hover:text-primary hover:bg-lightprimary rounded-full flex justify-center items-center cursor-pointer group-hover/menu:bg-lightprimary group-hover/menu:text-primary">
            <img
              src={`https://gravatar.com/avatar/${emailHash}`}
              alt="logo"
              height="35"
              width="35"
              className="rounded-full"
            />
          </span>
        )}
      >
        <Dropdown.Item
          as={Link}
          to="/"
          className="px-4 py-2 flex justify-between items-center bg-hover group/link w-full text-co"
          // key={index}
        >
          <div className="w-full">
            <div className="ps-0 flex items-center gap-3 w-full">
              {/* <Icon icon={items.icon} className="text-lg text-bodytext dark:text-darklink group-hover/link:text-primary" /> */}
              <MdOutlineAccountBox />
              <div className="w-3/4 ">
                <h5 className="mb-0 text-sm text-bodytext dark:text-darklink group-hover/link:text-primary">
                  My Account
                </h5>
              </div>
            </div>
          </div>
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item
          as={Link}
          to="/logout"
          className="px-4 py-2 flex justify-between items-center bg-hover group/link w-full"
        >
          <div className="w-full">
            <div className="ps-0 flex items-center gap-3 w-full">
              {/* <Icon icon={items.icon} className="text-lg text-bodytext dark:text-darklink group-hover/link:text-primary" /> */}
              <MdOutlineLogout color="red" />
              <div className="w-3/4 ">
                <h5 className="mb-0 text-sm text-bodytext dark:text-darklink group-hover/link:text-primary">
                  Logout
                </h5>
              </div>
            </div>
          </div>
        </Dropdown.Item>
      </Dropdown>
    </div>
  );
};
