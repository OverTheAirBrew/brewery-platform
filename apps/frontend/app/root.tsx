import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';

import type { Route } from './+types/root';
import './app.css';

export const links: Route.LinksFunction = () => [
  { rel: 'stylesheet', href: '/styles/tabler-pro.min.css' },
  { rel: 'stylesheet', href: '/styles/tabler-themes.min.css' },
  { rel: 'stylesheet', href: '/styles/tabler-overrides.css' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-bs-navbar-position="vertical">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function () {
  try {
    var root = document.documentElement;
    var theme = window.localStorage.getItem('tabler-theme');
    if (theme === 'dark') {
      root.setAttribute('data-bs-theme', 'dark');
    } else if (theme === 'light') {
      root.removeAttribute('data-bs-theme');
    }

    var sidebar = window.localStorage.getItem('tabler-sidebar');
    if (sidebar && sidebar !== 'default') {
      root.setAttribute('data-bs-sidebar', sidebar);
    } else {
      root.removeAttribute('data-bs-sidebar');
    }
  } catch (e) {
    // Ignore storage access failures.
  }
})();`,
          }}
        />
        <Meta />
        <Links />
      </head>
      <body>
        <a href="#content" className="visually-hidden-focusable skip-link">
          Skip to main content
        </a>
        {children}
        <script src="/js/tabler-theme.min.js" defer></script>
        <script src="/js/tabler.min.js" defer></script>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details =
      error.status === 404
        ? 'The requested page could not be found.'
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="container-tight py-6">
      <div className="card border-danger">
        <div className="card-body">
          <h1 className="h2 mb-2">{message}</h1>
          <p className="text-secondary">{details}</p>
        </div>
      </div>
      {stack && (
        <pre className="mt-3 bg-dark-lt rounded p-3">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
