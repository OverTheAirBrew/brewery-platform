import { GetKegResponse } from '@overtheairbrew/models';
import { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Button, Table } from 'flowbite-react';
import { PageWrapper } from '../components/page-wrapper';
import { fetch } from '../fetch';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { body } = await fetch<GetKegResponse[]>(request)(
    `${process.env.API_BASE_URL}/kegs`,
  );

  return {
    kegs: body,
  };
};

export default function DashboardCellarKegs() {
  const { kegs } = useLoaderData<typeof loader>();

  return (
    <PageWrapper header="All Kegs">
      <div className="overflow-x-auto w-full">
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>Name</Table.HeadCell>
            <Table.HeadCell>Producer</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
            <Table.HeadCell>Type</Table.HeadCell>
            <Table.HeadCell className="w10">
              <span className="sr-only">Edit</span>
            </Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {kegs.map((keg, index) => (
              <Table.Row
                key={index}
                className="bg-white dark:border-gray-700 dark:bg-gray-800"
              >
                <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                  {keg.beverage.name}
                </Table.Cell>
                <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                  {keg.beverage?.producer.name}
                </Table.Cell>
                <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                  {keg.status}
                </Table.Cell>
                <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                  {keg.type}
                </Table.Cell>
                <Table.Cell className="text-right">
                  <Button.Group>
                    <Button color="gray" size="sm">
                      Edit
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
    </PageWrapper>
  );
}
