import { useThemeMode } from 'flowbite-react';
import logoLight from '../logo-white.svg';
import logo from '../logo.svg';

export const Logo = () => {
  const theme = useThemeMode();

  if (theme.mode === 'dark') {
    return (
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          className="mx-auto h-10 w-auto"
          src={logoLight}
          alt="Over The Air Brew Co"
        />
      </div>
    );
  }

  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-sm">
      <img
        className="mx-auto h-10 w-auto"
        src={logo}
        alt="Over The Air Brew Co"
      />
    </div>
  );
};
