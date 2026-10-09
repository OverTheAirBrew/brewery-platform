import { Form, NavLink } from 'react-router';
import { Fragment, useEffect, useState } from 'react';

import type { AuthUser } from '../lib/auth.server';
import { SIDEBAR_MENU } from '../menu-config';

interface AppShellProps {
  user: AuthUser;
  title: string;
  children: React.ReactNode;
}

function userInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const initials = parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  return initials || 'U';
}

function formatSectionTitle(sectionKey: string) {
  return sectionKey
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function AppShell({ user, title, children }: AppShellProps) {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `nav-link ${isActive ? 'active' : ''}`;
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    setIsDarkMode(
      document.documentElement.getAttribute('data-bs-theme') === 'dark',
    );
  }, []);

  const setTheme = (theme: 'light' | 'dark') => {
    if (typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement;
    if (theme === 'dark') {
      root.setAttribute('data-bs-theme', 'dark');
    } else {
      root.removeAttribute('data-bs-theme');
    }

    setIsDarkMode(theme === 'dark');

    try {
      window.localStorage.setItem('tabler-theme', theme);
    } catch {
      // Ignore storage errors (private mode, disabled storage).
    }
  };

  const toggleTheme = () => {
    if (typeof document === 'undefined') {
      return;
    }

    const current =
      document.documentElement.getAttribute('data-bs-theme') === 'dark'
        ? 'dark'
        : 'light';
    setTheme(current === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="page">
      <aside className="navbar navbar-vertical navbar-expand-lg">
        <div className="container-fluid">
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#sidebar-menu"
            aria-controls="sidebar-menu"
            aria-expanded="false"
            aria-label="Toggle sidebar navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="navbar-brand">
            <NavLink to="/" end className="text-reset text-decoration-none">
              <img
                src="/logos/primary.svg"
                alt="Over The Air Brew"
                className="navbar-brand-image navbar-brand-logo-primary"
              />
              <img
                src="/logos/small.svg"
                alt="Over The Air Brew"
                className="navbar-brand-image navbar-brand-logo-small"
              />
            </NavLink>

            <button
              type="button"
              className="btn btn-action btn-sm d-none d-lg-inline-flex ms-auto"
              data-bs-toggle="sidebar-folded"
              aria-pressed="false"
              aria-label="Pin sidebar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="icon"
              >
                <path d="M15 4.5l-4 4l-4 1.5l-1.5 1.5l7 7l1.5 -1.5l1.5 -4l4 -4" />
                <path d="M9 15l-4.5 4.5" />
                <path d="M14.5 4l5.5 5.5" />
              </svg>
            </button>
          </div>

          <div className="navbar-footer">
            <ul className="navbar-nav">
              <li className="nav-item dropup">
                <a
                  href="#"
                  className="nav-link"
                  data-bs-toggle="dropdown"
                  aria-label="Open user menu"
                >
                  <span className="avatar avatar-sm">
                    {userInitials(user.name)}
                  </span>
                  <div className="nav-link-title">
                    {user.name}
                    <div className="small text-secondary">{user.email}</div>
                  </div>
                </a>
                <div className="dropdown-menu">
                  <a className="dropdown-item" href="#">
                    Profile
                  </a>
                  <a className="dropdown-item" href="#">
                    Settings &amp; Privacy
                  </a>
                  <a className="dropdown-item" href="#">
                    Help
                  </a>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-item-text py-2">
                    <div className="d-flex w-100 align-items-center justify-content-between gap-3">
                      <span>Theme</span>
                      <div className="d-inline-flex align-items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          className={`icon ${isDarkMode ? 'text-secondary' : 'text-warning'}`}
                        >
                          <path d="M12 3a1 1 0 0 0 0 2a1 1 0 0 0 0 -2" />
                          <path d="M12 21a1 1 0 0 0 0 2a1 1 0 0 0 0 -2" />
                          <path d="M4.22 4.22a1 1 0 0 0 1.42 1.42a1 1 0 0 0 -1.42 -1.42" />
                          <path d="M18.36 18.36a1 1 0 0 0 1.42 1.42a1 1 0 0 0 -1.42 -1.42" />
                          <path d="M1 12a1 1 0 0 0 2 0a1 1 0 0 0 -2 0" />
                          <path d="M21 12a1 1 0 0 0 2 0a1 1 0 0 0 -2 0" />
                          <path d="M4.22 19.78a1 1 0 0 0 1.42 -1.42a1 1 0 0 0 -1.42 1.42" />
                          <path d="M18.36 5.64a1 1 0 0 0 1.42 -1.42a1 1 0 0 0 -1.42 1.42" />
                          <circle cx="12" cy="12" r="4" />
                        </svg>
                        <div className="form-check form-switch m-0">
                          <input
                            id="theme-switch"
                            type="checkbox"
                            className="form-check-input"
                            role="switch"
                            aria-label="Toggle light and dark mode"
                            checked={isDarkMode}
                            onChange={toggleTheme}
                          />
                        </div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          className={`icon ${isDarkMode ? 'text-primary' : 'text-secondary'}`}
                        >
                          <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Form method="post" action="/logout">
                    <button type="submit" className="dropdown-item">
                      Sign out
                    </button>
                  </Form>
                </div>
              </li>
            </ul>
          </div>

          <nav
            className="collapse navbar-collapse"
            id="sidebar-menu"
            aria-label="Sidebar"
          >
            <ul className="navbar-nav pt-lg-3">
              {Object.entries(SIDEBAR_MENU).map(([headerKey, items]) => (
                <Fragment key={headerKey}>
                  <li className="nav-section-title">
                    {formatSectionTitle(headerKey)}
                  </li>
                  {items.map((item) => {
                    const Icon = item.icon;

                    return (
                      <li className="nav-item" key={`${headerKey}-${item.to}`}>
                        <NavLink
                          to={item.to}
                          end={item.end}
                          className={navLinkClass}
                        >
                          <span className="nav-link-icon">
                            <Icon
                              className="icon"
                              size={24}
                              stroke={2}
                              aria-hidden
                            />
                          </span>
                          <span className="nav-link-title">{item.label}</span>
                        </NavLink>
                      </li>
                    );
                  })}
                </Fragment>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      <div className="page-wrapper">
        <div className="page-header d-print-none">
          <div className="container-xl">
            <div className="row g-2 align-items-center">
              <div className="col">
                <h2 className="page-title">{title}</h2>
              </div>
            </div>
          </div>
        </div>

        <div className="page-body">
          <div className="container-xl">
            <main id="content">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}
