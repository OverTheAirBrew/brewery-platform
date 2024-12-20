import { GetBeverageRequest } from '@overtheairbrew/models';
import { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Button, Card } from 'flowbite-react';
import { PageWrapper } from '../components/page-wrapper';
import { fetch } from '../fetch';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { body } = await fetch<GetBeverageRequest[]>(request)(
    `${process.env.API_BASE_URL}/beverages`,
  );

  return {
    beverages: body,
    apiUrl: process.env.API_BASE_URL!,
  };
};

export default function DashboardCellarBeverages() {
  const { beverages, apiUrl } = useLoaderData<typeof loader>();

  return (
    <PageWrapper header="AllBeverages">
      <div className="grid grid-cols-3 gap-2">
        {beverages.map((beverage, index) => (
          <Card
            key={index}
            className="col-1 justify-normal"
            renderImage={() => (
              <img
                className="h-52 w-52 m-auto mb-0"
                src={`${apiUrl}/beverages/${beverage!.id}/image`}
                alt={beverage!.name}
              />
            )}
          >
            <div className="h-40 justify-normal">
              <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {beverage.name.trim()}
              </h5>
              <p className="font-normal text-gray-700 dark:text-gray-400">
                <span>{beverage.description}</span>
              </p>
              <p className="dark:text-white">
                <strong>Style:</strong> {beverage.style}
                <br />
                <strong>ABV: {beverage.abv}</strong>
              </p>
            </div>
            <p className="text-right">
              <Button.Group>
                <Button color="gray">Edit</Button>
                <Button color="failure">Delete</Button>
              </Button.Group>
            </p>
          </Card>
        ))}
      </div>
    </PageWrapper>
  );
}
