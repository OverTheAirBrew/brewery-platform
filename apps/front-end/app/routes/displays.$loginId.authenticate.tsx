import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from '@remix-run/node';
import { Form, Link, useLoaderData } from '@remix-run/react';
import { fetch } from '../fetch';
import { authenticator } from '../services/auth.server';

import { DisplayLoginDto } from '@overtheairbrew/models';
import { Logo } from '../components/logo';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { pathname } = new URL(request.url);

  await authenticator.isAuthenticated(request, {
    failureRedirect: `/login?returnTo=${pathname}`,
  });

  try {
    const { body } = await fetch<DisplayLoginDto>(request)(
      `${process.env.API_BASE_URL}/displays/${params.loginId}/login-info`
    );

    console.log(body);

    return json(
      {
        ...body,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (e) {
    if (e.body.statusCode === 410) {
      return json(
        {
          status: 'KEY_EXPIRED',
        },
        {
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      );
    }

    return json(
      {
        status: 'UNKNOWN',
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  const loginId = params['loginId'];

  await fetch(request)(`${process.env.API_BASE_URL}/displays/authenticate`, {
    method: 'POST',
    body: {
      id: loginId,
    },
  });

  return redirect('/');
}

export default function DisplayAuthenticate() {
  const props = useLoaderData<typeof loader>();

  const authorizeDevice = (serial: string) => {
    return (
      <div>
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
          Device <strong>{serial}</strong> is requesting authorization to login.
        </h2>
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <Form method="post">
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Authorize
            </button>
          </Form>
        </div>
      </div>
    );
  };

  const error = () => {
    return (
      <div>
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
          The request for authorization for device has already been accepted.
        </h2>
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <Link
            to="/"
            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Go home
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <Logo />
      {!props.status && authorizeDevice(props.serial)}
      {props.status && error()}
    </div>
  );
}
