import { DisplayTapInformationUnauthenticatedDto } from '@overtheairbrew/models';
import { LoginCallback } from '@overtheairbrew/socket-events';
import { ActionFunctionArgs, json, LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useSubmit } from '@remix-run/react';
import { HyperPixel2rWrapper } from '../components/display-wrappers/hyperpixel2r';
import { SerialDisplay } from '../components/serial-display';
import { fetchNoToken } from '../fetch';
import { useEventSourceWithId } from '../ota-event-source';
import { authenticator } from '../services/auth.server';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  await authenticator.isAuthenticated(request, {
    successRedirect: `/displays/hyperpixel2r/${params.serial}`,
  });

  const { body } = await fetchNoToken<
    DisplayTapInformationUnauthenticatedDto,
    { serial: string; siteUrl: string }
  >(`${process.env.API_BASE_URL}/displays/generate-login-qr`, {
    method: 'POST',
    body: {
      serial: params.serial!,
      siteUrl: url.origin,
    },
  });

  console.log(process.env.API_BASE_URL);

  return json(
    {
      data: body,
      apiUrl: process.env.API_BASE_URL!,
      serial: params.serial!,
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}

export async function action({ request, context, params }: ActionFunctionArgs) {
  return await authenticator.authenticate('display', request, {
    successRedirect: `/displays/hyperpixel2r/${params.serial}`,
    context,
  });
}

export default function DisplayHyperpixel() {
  const { data, serial, apiUrl } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  useEventSourceWithId(
    LoginCallback,
    serial,
    {
      apiUrl,
      enabled: data.status === 'UNAUTHENTICATED',
    },
    (data: typeof LoginCallback.Message) => {
      const formData = new FormData();
      formData.append('token', data.deviceToken);
      submit(formData, { method: 'post' });
    },
  );

  return (
    <HyperPixel2rWrapper>
      <img
        className="size-48"
        src={data.qrCode}
        alt="qr barcode scan to visit"
      />
      <span>Scan the code login on this display.</span>
      <br />
      <span>It will identify with code:</span>
      <SerialDisplay serial={serial!} />
    </HyperPixel2rWrapper>
  );
}
