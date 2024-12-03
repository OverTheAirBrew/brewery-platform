import { json, LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useRevalidator } from '@remix-run/react';

import { DisplayTapInformationDto } from '@overtheairbrew/models';
import { DisplayUpdatedMessage } from '@overtheairbrew/socket-events';
import { HyperPixel2rWrapper } from '../components/display-wrappers/hyperpixel2r';
import { Logo } from '../components/logo';
import { SerialDisplay } from '../components/serial-display';
import { fetch } from '../fetch';
import { useEventSourceWithId } from '../ota-event-source';
import { authenticator } from '../services/auth.server';

export async function loader({ request, params }: LoaderFunctionArgs) {
  console.log('HIT DISPLAYS HYPERPIXEL2R LOADER');

  const data = await authenticator.isAuthenticated(request, {
    failureRedirect: `/displays/hyperpixel2r/${params.serial}/login`,
  });

  const { body } = await fetch<DisplayTapInformationDto>(request)(
    `${process.env.API_BASE_URL}/displays/${params.serial}/tap-information`,
  );

  if (data instanceof Error) throw new Error('');

  return json(
    {
      body,
      serial: params.serial!,
      token: data!.token,
      apiUrl: process.env.API_BASE_URL!,
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}

export function action() {
  return {};
}

export default function DisplayHyperpixel() {
  const {
    body: { status, beverage },
    serial,
    token,
    apiUrl,
  } = useLoaderData<typeof loader>();
  const revalidation = useRevalidator();

  useEventSourceWithId(
    DisplayUpdatedMessage,
    serial,
    {
      apiUrl,
      token,
    },
    () => {
      revalidation.revalidate();
    },
  );

  if (status === 'UNREGISTERED') {
    return (
      <HyperPixel2rWrapper>
        <Logo />
        <br />
        <div>This device does not seem to be registered.</div>
        <div>
          Please register this device in the management console with code:
        </div>
        <br />
        <SerialDisplay serial={serial!} />
      </HyperPixel2rWrapper>
    );
  }

  if (status === 'TAPUNASSIGNED') {
    return (
      <HyperPixel2rWrapper>
        <Logo />
        <br />
        <div>This device is successfully registered.</div>
        <div>Please assign it to a tap in the admin console.</div>
      </HyperPixel2rWrapper>
    );
  }

  if (status === 'NOBEVERAGE') {
    return (
      <HyperPixel2rWrapper>
        <Logo />
        <br />
        <div>This device is successfully registered.</div>
        <div>There is no beverage assigned to this tap.</div>
      </HyperPixel2rWrapper>
    );
  }

  return (
    <HyperPixel2rWrapper>
      <img
        src={`${apiUrl}/beverages/${beverage!.id}/image`}
        alt="beverage"
        className="object-fill size-hyperpixel2r"
      />
    </HyperPixel2rWrapper>
  );
}
