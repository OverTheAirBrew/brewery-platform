import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from '@react-router/dev/routes';

export default [
  route('login', 'routes/login.tsx'),
  route('register', 'routes/register.tsx'),
  route('logout', 'routes/logout.tsx'),
  layout('routes/app-layout.tsx', [
    index('routes/home.tsx'),
    route('api-demo', 'routes/api-demo.tsx'),
    ...prefix('equipment', [
      route('devices', 'routes/equipment/devices.tsx'),
      route('sensors', 'routes/equipment/sensors.tsx'),
      route('actors', 'routes/equipment/actors.tsx'),
      route('vessels', 'routes/equipment/vessels.tsx'),
    ]),
    ...prefix('settings', [
      route('users', 'routes/settings/users.tsx'),
      route('config', 'routes/settings/config.tsx'),
    ]),
  ]),
] satisfies RouteConfig;
