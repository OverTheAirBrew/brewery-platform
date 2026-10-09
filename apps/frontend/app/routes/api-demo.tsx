import { data, Form, Link, useActionData, useLoaderData } from 'react-router';

import { requireUser } from '../lib/auth.server';
import { callBackend } from '../lib/backend.server';
import type { ActionFunctionArgs } from 'react-router';

export const handle = {
  pageTitle: 'Backend Data Demo',
};

type BackendPayload = Record<string, unknown> | null;

export function meta() {
  return [
    { title: 'Backend API Demo' },
    {
      name: 'description',
      content: 'Demonstrates GET and POST calls from Remix loaders/actions.',
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  await requireUser(request);
  const endpoint = '/health';

  try {
    const response = await callBackend<BackendPayload>(endpoint, {
      method: 'GET',
    });
    return data({ endpoint, response });
  } catch (error) {
    return data(
      {
        endpoint,
        response: {
          ok: false,
          status: 500,
          statusText: 'Request Failed',
          data: null,
          text: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 },
    );
  }
}

export async function action({ request }: ActionFunctionArgs) {
  await requireUser(request);
  const formData = await request.formData();
  const endpoint = String(formData.get('endpoint') ?? '/api/echo');
  const message = String(formData.get('message') ?? 'Hello backend');

  try {
    const response = await callBackend<BackendPayload>(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    return data({ endpoint, response });
  } catch (error) {
    return data(
      {
        endpoint,
        response: {
          ok: false,
          status: 500,
          statusText: 'Request Failed',
          data: null,
          text: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 },
    );
  }
}

export default function ApiDemo() {
  const { endpoint: healthEndpoint, response: healthResponse } =
    useLoaderData<typeof loader>();
  const actionResult = useActionData<typeof action>();

  return (
    <div className="row row-cards">
      <div className="col-12 col-lg-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Loader GET Example</h3>
          </div>
          <div className="card-body">
            <p className="text-secondary">
              Server-side loader request to <code>{healthEndpoint}</code>
            </p>
            <StatusBadge ok={healthResponse.ok} />
            <ResponseView
              payload={healthResponse.data}
              text={healthResponse.text}
            />
          </div>
        </div>
      </div>

      <div className="col-12 col-lg-6">
        <div className="card">
          <div className="card-header">
            <div className="d-flex align-items-center justify-content-between w-100">
              <h3 className="card-title mb-0">Action POST Example</h3>
              <Link to="/" className="btn btn-ghost-secondary btn-sm">
                Back
              </Link>
            </div>
          </div>
          <div className="card-body">
            <Form method="post" className="d-grid gap-3">
              <div>
                <label htmlFor="endpoint" className="form-label">
                  Endpoint
                </label>
                <input
                  id="endpoint"
                  name="endpoint"
                  type="text"
                  className="form-control"
                  defaultValue="/api/echo"
                />
              </div>
              <div>
                <label htmlFor="message" className="form-label">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  className="form-control"
                  rows={4}
                  defaultValue="Hello backend"
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Send POST Request
              </button>
            </Form>

            {actionResult && (
              <div className="mt-4">
                <p className="text-secondary mb-2">
                  Request to <code>{actionResult.endpoint}</code>
                </p>
                <StatusBadge ok={actionResult.response.ok} />
                <ResponseView
                  payload={actionResult.response.data}
                  text={actionResult.response.text}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ ok }: { ok: boolean }) {
  return (
    <span className={`badge ${ok ? 'bg-green' : 'bg-red'} mb-3`}>
      {ok ? 'Success' : 'Failed'}
    </span>
  );
}

function ResponseView({
  payload,
  text,
}: {
  payload: BackendPayload;
  text: string | null;
}) {
  const body = payload
    ? JSON.stringify(payload, null, 2)
    : (text ?? 'No response body');

  return (
    <div className="bg-dark-lt rounded p-3">
      <pre className="mb-0" style={{ maxHeight: '22rem', overflow: 'auto' }}>
        <code>{body}</code>
      </pre>
    </div>
  );
}
