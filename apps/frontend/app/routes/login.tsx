import {
  data,
  Form,
  Link,
  redirect,
  useActionData,
  useLoaderData,
} from 'react-router';

import { createUserSession, getOptionalUser } from '../lib/auth.server';
import type { ActionFunctionArgs } from 'react-router';

interface ActionData {
  error?: string;
}

export function meta() {
  return [
    { title: 'Login | Brewery Platform' },
    { name: 'description', content: 'Login page for Brewery Platform.' },
  ];
}

export async function loader({ request }: { request: Request }) {
  const user = await getOptionalUser(request);
  if (user) {
    throw redirect('/');
  }

  const redirectTo = new URL(request.url).searchParams.get('redirectTo') ?? '/';
  return data({ redirectTo: redirectTo.startsWith('/') ? redirectTo : '/' });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const redirectToRaw = String(formData.get('redirectTo') ?? '/');
  const redirectTo = redirectToRaw.startsWith('/') ? redirectToRaw : '/';

  if (!email || !password) {
    return data<ActionData>(
      { error: 'Email and password are required.' },
      { status: 400 },
    );
  }

  const [localPart] = email.split('@');
  const fallbackName = localPart ? localPart.replace(/[._-]+/g, ' ') : 'User';

  return createUserSession(
    {
      name: fallbackName.replace(/\b\w/g, (char) => char.toUpperCase()),
      email,
    },
    redirectTo,
  );
}

export default function LoginPage() {
  const { redirectTo } = useLoaderData<typeof loader>();
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
            <h2 className="h2 text-center mb-4">Login to your account</h2>

            <Form method="post" className="d-grid gap-3">
              <input type="hidden" name="redirectTo" value={redirectTo} />

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

              {actionData?.error && (
                <div className="alert alert-danger mb-0">
                  {actionData.error}
                </div>
              )}

              <button type="submit" className="btn btn-primary w-100">
                Sign in
              </button>
            </Form>
          </div>
        </div>

        <div className="text-center text-secondary mt-3">
          No account yet? <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
}
