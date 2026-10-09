import { data, useLoaderData } from 'react-router';

import { ResourcePage } from '../../components/resource-page';
import { requireUser } from '../../lib/auth.server';
import { callBackend } from '../../lib/backend.server';

export const handle = {
  pageTitle: 'Users',
};

const ENDPOINT = '/api/users';

export async function loader({ request }: { request: Request }) {
  await requireUser(request);
  const response = await callBackend(ENDPOINT, { method: 'GET' });

  return data({
    endpoint: ENDPOINT,
    response,
    loadedAt: new Date().toISOString(),
  });
}

export async function action({ request }: { request: Request }) {
  await requireUser(request);

  // Submitting this action tells Remix to revalidate this route's loader data.
  return data({ ok: true, revalidatedAt: new Date().toISOString() });
}

export default function SettingsUsersPage() {
  const { endpoint, response, loadedAt } = useLoaderData<typeof loader>();

  return (
    <ResourcePage
      title="Users"
      description="Invite, remove, and manage user access for the platform."
      endpoint={endpoint}
      response={response}
      loadedAt={loadedAt}
    />
  );
}
