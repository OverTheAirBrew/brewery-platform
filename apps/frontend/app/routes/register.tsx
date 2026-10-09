import { data, Form, Link, redirect, useActionData } from 'react-router';

import { createUserSession, getOptionalUser } from '../lib/auth.server';
import type { ActionFunctionArgs } from 'react-router';

interface ActionData {
  error?: string;
}

export function meta() {
  return [
    { title: 'Register | Brewery Platform' },
    { name: 'description', content: 'Register page for Brewery Platform.' },
  ];
}

export async function loader({ request }: { request: Request }) {
  const user = await getOptionalUser(request);
  if (user) {
    throw redirect('/');
  }
  return data({});
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');

  if (!name || !email || !password) {
    return data<ActionData>(
      { error: 'Name, email and password are required.' },
      { status: 400 },
    );
  }

  if (password !== confirmPassword) {
    return data<ActionData>(
      { error: 'Passwords do not match.' },
      { status: 400 },
    );
  }

  return createUserSession({ name, email }, '/');
}

export default function RegisterPage() {
  const actionData = useActionData<ActionData>();

  return (
    <div className="page page-center">
      <div className="container container-tight py-4">
        <div className="text-center mb-4">
          <Link to="/login" className="navbar-brand navbar-brand-autodark">
            Brewery Platform
          </Link>
        </div>

        <div className="card card-md">
          <div className="card-body">
            <h2 className="h2 text-center mb-4">Create your account</h2>

            <Form method="post" className="d-grid gap-3">
              <div>
                <label htmlFor="name" className="form-label">
                  Full name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="form-control"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="form-label">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-control"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="form-control"
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className="form-control"
                  required
                />
              </div>

              {actionData?.error && (
                <div className="alert alert-danger mb-0">
                  {actionData.error}
                </div>
              )}

              <button type="submit" className="btn btn-primary w-100">
                Register
              </button>
            </Form>
          </div>
        </div>

        <div className="text-center text-secondary mt-3">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
