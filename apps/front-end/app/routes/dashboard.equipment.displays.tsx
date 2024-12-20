import { DisplayDto } from '@overtheairbrew/models';
import { LoaderFunctionArgs } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { Button, Table } from 'flowbite-react';
import { fetch } from '../fetch';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { body } = await fetch<DisplayDto[]>(request)(
    `${process.env.API_BASE_URL}/displays`,
  );

  return {
    displays: body,
  };
};

export default function DashboardCellarBeverages() {
  const { displays } = useLoaderData<typeof loader>();

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="lg:col-span-12 col-span-12">
        <h1>Displays</h1>
      </div>
      <div className="lg:col-span-12 col-span-12">
        <div className="overflow-x-auto w-full">
          <Table>
            <Table.Head>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>Pair Code</Table.HeadCell>
              <Table.HeadCell className="w-10">
                <span className="sr-only">Edit</span>
              </Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {displays.map((display, index) => (
                <Table.Row
                  key={index}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {display.name}
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {display.deviceCode}
                  </Table.Cell>
                  <Table.Cell className="text-right">
                    <Button.Group>
                      <Button color="gray" size="sm">
                        Edit
                      </Button>
                      <Button
                        color="gray"
                        as={Link}
                        to={`/displays/hyperpixel2r/${display.deviceCode}`}
                        target="_blank"
                        rel="noreferrer"
                        size="sm"
                      >
                        View
                      </Button>
                      <Button color="red" size="sm">
                        Delete
                      </Button>
                    </Button.Group>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </div>
    </div>
  );
}
