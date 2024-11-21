import type { LinksFunction } from '@remix-run/node';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react';
import { Flowbite, ThemeModeScript } from 'flowbite-react';
import theme from './flowbite-theme';
import styles from './tailwind.css?url';

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
  {
    rel: 'stylesheet',
    href: styles,
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light only" />
        <Meta />
        <Links />
        <ThemeModeScript />
      </head>
      <body className="bg-gray-50 dark:bg-gray-900">
        <Flowbite theme={{ theme }}>
          {children}
          <ScrollRestoration />
          <Scripts />
        </Flowbite>
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
