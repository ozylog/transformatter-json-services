import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import lambdaApi from 'lambda-api';
import * as middlewares from '@src/middlewares';

const app = lambdaApi({ version: 'v1.0', base: 'v1', logger: true });

app.get('/:id', middlewares.findById);
app.post('/operate', middlewares.operate)

//@ts-ignore
app.use(middlewares.errorHander);

export const index: APIGatewayProxyHandler = async (event, _context) => {
  return await app.run(event, _context);
}
