import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import lambdaApi from 'lambda-api';
import * as middlewares from '@src/middlewares';

const { MIME } = middlewares;
const app = lambdaApi({ version: 'v1.0', base: 'v1', logger: true });

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
