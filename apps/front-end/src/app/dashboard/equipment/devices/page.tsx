import { deviceTypesClient } from '../../../../lib/api';

const DevicesPage = async () => {
  const { data } = await deviceTypesClient.get();
  return <>HELLO: {JSON.stringify(data)}</>;
};

export default DevicesPage;
