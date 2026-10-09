import { Link, useLoaderData } from 'react-router';

import { requireUser } from '../lib/auth.server';

export const handle = {
  pageTitle: 'Dashboard',
};

export function meta() {
  return [
    { title: 'Brewery Frontend' },
    {
      name: 'description',
      content: 'Remix-style frontend scaffold with Tabler Pro-ready styling.',
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const user = await requireUser(request);
  return { user };
}

export default function Home() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className="row row-cards">
      <div className="col-sm-6 col-lg-3">
        <div className="card">
          <div className="card-body">
            <div className="d-flex align-items-center">
              <div className="subheader">Session</div>
            </div>
            <div className="h1 mb-0 mt-2">Active</div>
          </div>
        </div>
      </div>

      <div className="col-sm-6 col-lg-3">
        <div className="card">
          <div className="card-body">
            <div className="subheader">Backend</div>
            <div className="h1 mb-0 mt-2">Connected</div>
          </div>
        </div>
      </div>

      <div className="col-sm-6 col-lg-3">
        <div className="card">
          <div className="card-body">
            <div className="subheader">User</div>
            <div className="h3 mb-0 mt-2">{user.name}</div>
          </div>
        </div>
      </div>

      <div className="col-sm-6 col-lg-3">
        <div className="card">
          <div className="card-body">
            <div className="subheader">Environment</div>
            <div className="h5 mb-0 mt-2">{user.email}</div>
          </div>
        </div>
      </div>

      <div className="col-12 col-xl-8">
        <div className="card card-lg">
          <div className="card-header">
            <h3 className="card-title">Welcome back, {user.name}</h3>
          </div>
          <div className="card-body">
            <p className="text-secondary mb-3">
              This dashboard is built using native Tabler layout primitives,
              cards, navbars, and utility classes.
            </p>
            <Link to="/api-demo" className="btn btn-primary">
              Open GET/POST Demo
            </Link>
          </div>
        </div>
      </div>

      <div className="col-12 col-xl-4">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Setup Checklist</h3>
          </div>
          <div className="list-group list-group-flush">
            <div className="list-group-item">
              <div className="text-secondary">Set BACKEND_API_URL</div>
            </div>
            <div className="list-group-item">
              <div className="text-secondary">
                Login to establish a session cookie
              </div>
            </div>
            <div className="list-group-item">
              <div className="text-secondary">
                Test GET/POST on API Demo page
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
