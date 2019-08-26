import Json from '@src/db/models/Json';
import { Heror, InternalServerError } from 'heror';
import { Request, Response, NextFunction } from 'lambda-api';
import jsonStableStringify from 'json-stable-stringify';
import * as validators from '@src/validators';
import { Operator, Format } from '@src/db/knex';

export async function findById(req: validators.findByIdReq) {
  validators.findById(req);
  const { id } = req.params;
  const json = await Json.query().findById(id);

  return json;
}

export async function operate(req: validators.OperateReq) {
  validators.operate(req);
  const { input, inputFormat, operator, outputFormat, outputSpace, outputStable  } = req.body;
  let result;

  if (operator === Operator.BEAUTIFY_JSON && inputFormat === Format.JSON && outputFormat === Format.JSON) {
    const json = JSON.parse(input);

    if (outputStable) {
      result = jsonStableStringify(json, { space: outputSpace || 0 });
    } else {
      result = JSON.stringify(json, null, outputSpace || 0);
    }
  }

  return result;
}

export function errorHander(err: Error, req: Request, res: Response, next: NextFunction) {
  const defaultMessage = 'Oops...something went wrong';

  if (err instanceof Heror) {
    const { statusCode, error, message } = err;

    res.error(statusCode, error, statusCode === 500 ? defaultMessage : message);
  } else {
    const { statusCode, error } = new InternalServerError();

    res.error(statusCode, error, defaultMessage);
  }

  next();
}
