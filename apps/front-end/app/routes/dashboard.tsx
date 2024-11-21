import { TokenResponseDto } from '@overtheairbrew/models';
import { LoaderFunctionArgs } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import { NavbarSidebarLayout } from '../layouts/nav-sidebar';
import { authenticator } from '../services/auth.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { pathname } = new URL(request.url);

  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: `/login?returnTo=${pathname}`,
  });

  return {
    emailHash: (user as TokenResponseDto).emailHash,
  };
};

export default function DashboardLayout() {
  const { emailHash } = useLoaderData<typeof loader>();

  return (
    <NavbarSidebarLayout emailHash={emailHash}>
      <div className="pt-16">
        <Outlet />
      </div>
    </NavbarSidebarLayout>
  );
}
