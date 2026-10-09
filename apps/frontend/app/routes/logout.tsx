import { destroyUserSession } from '../lib/auth.server';
import type { ActionFunctionArgs } from 'react-router';

export async function action({ request }: ActionFunctionArgs) {
  return destroyUserSession(request);
}
