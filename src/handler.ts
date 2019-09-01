import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import lambdaApi from 'lambda-api';
import * as middlewares from '@src/middlewares';

const { MIME } = middlewares;
const app = lambdaApi({ version: 'v0.1.2', base: 'api/v1/jsons', logger: true });

app.use(middlewares.preHandler);

app.get(
  '/:id',
  middlewares.validateHeaders({
    contentType: MIME.APPLICATION_JSON
  }),
  middlewares.findById
);
app.post(
  '/operate',
  middlewares.validateHeaders({
    accept: MIME.APPLICATION_JSON,
    contentType: MIME.APPLICATION_JSON
  }),
  middlewares.operate
);

//@ts-ignore
app.use(middlewares.errorHander);

export const v1: APIGatewayProxyHandler = async (event, _context) => {
  return await app.run(event, _context);
}
