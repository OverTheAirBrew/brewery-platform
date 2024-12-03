import { TokenResponseDto } from '@overtheairbrew/models';
import { LoaderFunctionArgs } from '@remix-run/node';
import { Outlet, useLoaderData, useLocation } from '@remix-run/react';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '../components/ui/sidebar';
import { authenticator } from '../services/auth.server';

import { AppSidebar } from '../components/app-sidebar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '../components/ui/breadcrumb';
import { Separator } from '../components/ui/separator';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { pathname } = new URL(request.url);

  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: `/login?returnTo=${pathname}`,
  });

  return {
    ...user as TokenResponseDto
  };
};

export default function DashboardLayout() {
  const {emailHash, username } = useLoaderData<typeof loader>();
  const { pathname } = useLocation();
  const pathParts = pathname.split('/');
  
  const capitalizeFirstLetter = (val: string) => {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
  };
  
  const generateBreadcrumbItems = (parts:string[]) => {
    const breadcrumbs: React.JSX.Element[] = []
    
    for(const part of parts) {
      console.log(part)

      breadcrumbs.push(
        <BreadcrumbItem key={part} className="hidden md:block">
          <BreadcrumbLink href="#">
            {capitalizeFirstLetter(part)}
          </BreadcrumbLink>
        </BreadcrumbItem>
      )
      breadcrumbs.push(<BreadcrumbSeparator key={`${part}-seperator`} className="hidden md:block" />)

    }
    
    breadcrumbs.pop();

    return <BreadcrumbList>{breadcrumbs}</BreadcrumbList>
  }

  return (
    <SidebarProvider>
      <AppSidebar emailHash={emailHash} username={username}  />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              {
                generateBreadcrumbItems(pathParts)
              }
            </Breadcrumb>
          </div>
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
