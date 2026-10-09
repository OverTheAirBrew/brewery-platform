import { Form } from 'react-router';

import type { BackendResponse } from '../lib/backend.server';

interface ResourcePageProps {
  title: string;
  description: string;
  endpoint: string;
  response: BackendResponse<unknown>;
  loadedAt: string;
}

export function ResourcePage({
  title,
  description,
  endpoint,
  response,
  loadedAt,
}: ResourcePageProps) {
  const body = response.data
    ? JSON.stringify(response.data, null, 2)
    : (response.text ?? 'No response body');

  return (
    <div className="row row-cards">
      <div className="col-12">
        <div className="card">
          <div className="card-header">
            <div className="d-flex align-items-center justify-content-between w-100 gap-3">
              <h3 className="card-title mb-0">{title}</h3>
              <Form method="post">
                <button type="submit" className="btn btn-primary btn-sm">
                  Revalidate Data
                </button>
              </Form>
            </div>
          </div>
          <div className="card-body">
            <p className="text-secondary mb-3">{description}</p>
            <div className="d-flex flex-wrap gap-2 mb-3">
              <span className={`badge ${response.ok ? 'bg-green' : 'bg-red'}`}>
                {response.ok ? 'Backend OK' : 'Backend Error'}
              </span>
              <span className="badge bg-secondary-lt text-secondary">
                Loaded: {new Date(loadedAt).toLocaleTimeString()}
              </span>
            </div>
            <p className="mb-2">
              <strong>Endpoint:</strong> <code>{endpoint}</code>
            </p>
            <div className="bg-dark-lt rounded p-3">
              <pre
                className="mb-0"
                style={{ maxHeight: '24rem', overflow: 'auto' }}
              >
                <code>{body}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
