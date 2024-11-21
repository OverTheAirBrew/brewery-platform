import { GetProducersResponse } from '@overtheairbrew/models';
import { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Button, Table } from 'flowbite-react';
import { PageWrapper } from '../components/page-wrapper';
import { fetch } from '../fetch';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { body } = await fetch<GetProducersResponse[]>(request)(
    `${process.env.API_BASE_URL}/producers`,
  );

  return {
    producers: body,
  };
};

export default function DashboardCellarProducers() {
  const { producers } = useLoaderData<typeof loader>();

  return (
    <PageWrapper header="All Producers">
      <div className="overflow-x-auto w-full">
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>Name</Table.HeadCell>
            <Table.HeadCell className="w10">
              <span className="sr-only">Edit</span>
            </Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {producers.map((producer, index) => (
              <Table.Row
                key={index}
                className="bg-white dark:border-gray-700 dark:bg-gray-800"
              >
                <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                  {producer.name}
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
