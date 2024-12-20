import { ActionFunctionArgs, json, LoaderFunctionArgs } from '@remix-run/node';
import { Button, Card, Label, TextInput } from 'flowbite-react';
import { Logo } from '../components/logo';
import { authenticator } from '../services/auth.server';
import { getSession } from '../services/session.server';

const getSuccessUrl = (returnTo: string | null, loginId: string | null) => {
  let successUrl = '/';

  if (returnTo) {
    successUrl = returnTo;
  } else if (loginId) {
    successUrl = `/displays/${loginId}/authenticate`;
  }

  return successUrl;
};

export async function action({ request, context }: ActionFunctionArgs) {
  const url = new URL(request.url);

  const loginId = url.searchParams.get('displayLoginId');
  const returnTo = url.searchParams.get('returnTo');

  return await authenticator.authenticate('user-pass', request, {
    successRedirect: getSuccessUrl(returnTo, loginId),
    failureRedirect: request.url,
    throwOnError: true,
    context,
  });
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const loginId = url.searchParams.get('displayLoginId');
  const returnTo = url.searchParams.get('returnTo');

  await authenticator.isAuthenticated(request, {
    successRedirect: getSuccessUrl(returnTo, loginId),
  });

  const session = await getSession(request.headers.get('Cookie'));

  const error = session.get('sessionErrorKey');
  return json({ error, loginId, returnTo });
}

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center px-6 lg:h-screen lg:gap-y-12">
      <div className="my-6 flex items-center gap-x-1 lg:my-0">
        <Logo />
      </div>
      <Card
        horizontal
        className="w-full md:max-w-screen-sm [&>img]:hidden md:[&>img]:w-96 md:[&>img]:p-0 md:[&>*]:w-full md:[&>*]:p-16 lg:[&>img]:block"
      >
        <h1 className="mb-3 text-2xl font-bold dark:text-white md:text-3xl">
          Sign in to the Brewery Platform
        </h1>
        <form method="POST">
          <div className="mb-4 flex flex-col gap-y-3">
            <Label htmlFor="email">Your email</Label>
            <TextInput
              id="email"
              name="email"
              placeholder="name@company.com"
              type="email"
            />
          </div>
          <div className="mb-6 flex flex-col gap-y-3">
            <Label htmlFor="password">Your password</Label>
            <TextInput
              id="password"
              name="password"
              placeholder="••••••••"
              type="password"
            />
          </div>
          <div className="mb-6">
            <Button type="submit" color="blue" className="w-full lg:w-auto">
              Login to your account
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
