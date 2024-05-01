'use client';

import { PageContainer } from '../../components/layout/container';
import { DashboardCard } from '../../components/shared/dashboard-card';

const DashboardPage = () => {
  return (
    <PageContainer title="dashboard" description="dashboard">
      <DashboardCard title="Dashboard">
        <>Some Data</>
      </DashboardCard>
    </PageContainer>
  );
};

export default DashboardPage;
