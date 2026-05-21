import { useApiHealthPolling } from '../lib/api-health';

export function ApiHealthPoller() {
  useApiHealthPolling();
  return null;
}
