import Json from '@src/db/models/Json';
import { Heror, NotFoundError, NotAcceptableError, BadRequestError, UnprocessableEntityError } from 'heror';
import { Request, Response, NextFunction } from 'lambda-api';
import jsonStableStringify from 'json-stable-stringify';
import jsontoxml from 'jsontoxml';
import * as validators from '@src/validators';
import { Operator, Format } from '@src/db/knex';

export async function findById(req: validators.findByIdReq) {
  validators.findById(req);
  const { id } = req.params;
  const json = await Json.query().findById(id);

  if (!json) throw new NotFoundError();

  return json;
}

export function operate(req: validators.OperateReq) {
  const { input, inputFormat, operator, outputFormat, outputSpace, outputStable  } = req.body;
  let result;
  let json;

  validators.operate(req);

  try {
    json = JSON.parse(input);
  } catch (err) {
    throw new BadRequestError('Invalid JSON');
  }

  if (json === null || json === undefined || typeof json !== 'object') throw new BadRequestError('Invalid JSON');

  if (outputStable) {
    json = jsonStableStringify(json, { space: outputSpace || 0 });
  } else {
    json = JSON.stringify(json, null, outputSpace || 0);
  }

  if (
    operator === Operator.BEAUTIFY_JSON
    && inputFormat === Format.JSON
    && outputFormat === Format.JSON) {
    result = json;
  } else if (
    operator === Operator.CONVERT_JSON_TO_XML
    && inputFormat === Format.JSON
    && outputFormat === Format.XML) {
    result = jsontoxml(json, { prettyPrint: true, indent: Array(outputSpace + 1).join(' ') });
    result = result.substr(1, result.length - 2);
  } else {
    throw new UnprocessableEntityError(`Invalid format`);
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

export function preHandler(req: Request, res: Response, next: NextFunction) {
  const { query, params, body } = req;

  req.log.info(JSON.stringify({ query, params, body }));
  next();
}

export function errorHander(err: Error, req: Request, res: Response, next: NextFunction) {
  // @ts-ignore
  const { _state: resState, _statusCode: resStatusCode } = res;
  const defaultMessage = 'Oops...something went wrong';

  if (err instanceof Heror) {
    const { statusCode, error, message } = err;

    res.status(statusCode).send({
      statusCode,
      error,
      message: statusCode === 500 ? defaultMessage : message
    });
  } else if(resState === 'error' && resStatusCode) {
    res.status(resStatusCode).send({
      statusCode: resStatusCode,
      message: resStatusCode === 500 ? defaultMessage : err.message
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
