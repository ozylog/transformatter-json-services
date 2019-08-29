import Json from '@src/db/models/Json';
import { Heror, InternalServerError, NotFoundError, NotAcceptableError } from 'heror';
import { Request, Response, NextFunction } from 'lambda-api';
import jsonStableStringify from 'json-stable-stringify';
import * as validators from '@src/validators';
import { Operator, Format } from '@src/db/knex';

export async function findById(req: validators.findByIdReq) {
  validators.findById(req);
  const { id } = req.params;
  const json = await Json.query().findById(id);

  if (!json) throw new NotFoundError();

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

  return { output: result };
}

export function validateHeaders({ accept, contentType }: HeadersInput) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { headers } = req;
    if (contentType && headers.accept && headers.accept !== '*/*') {
      const contentTypes = Array.isArray(contentType) ? contentType : [ contentType ];

      if (!contentTypes.includes(headers.accept as MIME)) throw new NotAcceptableError(`Accept Headers should be assigned as [${contentTypes.join()}]`);
    }

    if (accept) {
      const accepts = Array.isArray(accept) ? accept : [ accept ];
      if (!headers['content-type'] || !accept.includes(headers['content-type'] as MIME)) throw new NotAcceptableError(`Content-Type Headers should be assigned as [${accepts.join()}]`);
    }

    next();
  };
}

export function errorHander(err: Error, req: Request, res: Response, next: NextFunction) {
  const defaultMessage = 'Oops...something went wrong';

  if (err instanceof Heror) {
    const { statusCode, error, message } = err;

    res.status(statusCode).send({
      statusCode,
      error,
      message: statusCode === 500 ? defaultMessage : message
    });
  } else {
    const { statusCode, error } = new InternalServerError();

    res.status(statusCode).send({
      statusCode,
      error,
      message: defaultMessage
    });
  }

  next();
}


interface HeadersInput {
  accept?: MIME | MIME[];
  contentType?: MIME | MIME[];
}

export const enum MIME {
  APPLICATION_JSON = 'application/json'
}
