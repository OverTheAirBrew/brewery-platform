import { NextApiRequest, NextApiResponse } from 'next';
import { register, collectDefaultMetrics, Counter } from 'prom-client';

// Create a custom counter metric for counting HTTP requests
const httpRequestCount = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'statusCode'],
});

// Initialize Prometheus metrics collection
collectDefaultMetrics();

// Export a middleware function to expose a /metrics endpoint
export default function (req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', register.contentType);
  res.setHeader('Cache-Control', 'no-store');
  res.send(register.metrics());
}

// Export the custom counter metric for use in your application
export { httpRequestCount };
