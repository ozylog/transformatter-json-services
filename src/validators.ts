import Ajv from 'ajv';
import { BadRequestError } from 'heror';
import { Request } from 'lambda-api';
import { Format, Operator } from '@src/db/knex';

function getValidator() {
  const validator = new Ajv();

  return validator;
}

export function findById(req: findByIdReq) {
  const validator = getValidator();
  const schema = {
    type: 'object',
    properties: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: [ 'id' ]
      }
    },
    required: [ 'params' ]
  };

  const isValid = validator.validate(schema, req);

  if (!isValid) throw new BadRequestError(validator.errorsText());

  return;
}

export function operate(req: OperateReq) {
  const validator = getValidator();
  const schema = {
    type: 'object',
    properties: {
      body: {
        type: 'object',
        properties: {
          input: { type: 'string' },
          inputFormat: {
            type: 'string',
            enum: [ Format.JSON ]
          },
          operator: {
            type: 'string',
            enum: [ Operator.BEAUTIFY_JSON, Operator.CONVERT_JSON_TO_XML ]
          },
          outputFormat: {
            type: 'string',
            enum: [ Format.JSON ]
          },
          outputSpace: {
            type: 'integer',
            maximum: 9
          },
          outputStable: {
            type: 'boolean'
          }
        },
        required: [
          'input',
          'inputFormat',
          'operator',
          'outputFormat',
          'outputSpace',
          'outputStable'
        ]
      }
    },
    required: [ 'body' ]
  };

  const isValid = validator.validate(schema, req);

  if (!isValid) throw new BadRequestError(validator.errorsText());

  return;
}

export interface findByIdReq extends Request {
  params: {
    id: string;
  };
}

export interface OperateReq extends Request {
  body: {
    input: string;
    inputFormat: Format.JSON;
    operator: Operator,
    outputFormat: Format;
    outputSpace: number;
    outputStable: boolean;
  };
}
