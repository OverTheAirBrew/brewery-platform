import { Outlet, useLoaderData, useMatches } from 'react-router';

import { AppShell } from '../components/app-shell';
import { requireUser } from '../lib/auth.server';

interface RouteHandle {
  pageTitle?: string;
}

export async function loader({ request }: { request: Request }) {
  const user = await requireUser(request);
  return { user };
}

export default function AppLayout() {
  const { user } = useLoaderData<typeof loader>();
  const matches = useMatches();
  const titledMatch = [...matches]
    .reverse()
    .find((match) => (match.handle as RouteHandle | undefined)?.pageTitle);

  const title =
    (titledMatch?.handle as RouteHandle | undefined)?.pageTitle ?? 'Dashboard';

  return (
    <AppShell user={user} title={title}>
      <Outlet />
    </AppShell>
  );
}
