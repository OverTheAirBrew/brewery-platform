import { data, useLoaderData } from 'react-router';

import { ResourcePage } from '../../components/resource-page';
import { requireUser } from '../../lib/auth.server';
import { callBackend } from '../../lib/backend.server';

export const handle = {
  pageTitle: 'Vessels',
};

const ENDPOINT = '/api/vessels';

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

export default function EquipmentVesselsPage() {
  const { endpoint, response, loadedAt } = useLoaderData<typeof loader>();

  return (
    <ResourcePage
      title="Vessels"
      description="Manage fermenters, kettles, and other vessels used in production."
      endpoint={endpoint}
      response={response}
      loadedAt={loadedAt}
    />
  );
}
