import { BeverageDto } from '@overtheairbrew/models';
import { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Button, Table } from 'flowbite-react';
import { fetch } from '../fetch';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { body } = await fetch<BeverageDto[]>(request)(
    `${process.env.API_BASE_URL}/beverages`
  );

  return {
    beverages: body,
  };
};

export default function DashboardCellarBeverages() {
  const { beverages } = useLoaderData<typeof loader>();

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="lg:col-span-12 col-span-12">
        <h1>Taps</h1>
      </div>
      <div className="lg:col-span-12 col-span-12">
        <div className="overflow-x-auto w-full">
          <Table>
            <Table.Head>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>Description</Table.HeadCell>
              <Table.HeadCell>Style</Table.HeadCell>
              <Table.HeadCell>ABV</Table.HeadCell>
              <Table.HeadCell className="w-10">
                <span className="sr-only">Edit</span>
              </Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {beverages.map((beverage, index) => (
                <Table.Row
                  key={index}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {beverage.name}
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {beverage.description}
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {beverage.style}
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {beverage.abv}
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
      </div>
    </div>
  );
}
