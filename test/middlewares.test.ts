import path from 'path';
import dotenv from 'dotenv';

const file = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env';
dotenv.config({ path: path.resolve(process.cwd(), file) });

import { operate } from '@src/middlewares';
import { Operator, Format } from '@src/db/knex';

describe('#middlewares', () => {
  describe('#operate(req)', () => {
    describe('given JSON data', () => {
      const input = JSON.stringify({ hello: { test: "world" } });

      describe('when beautify JSON', () => {
        let result;

        beforeAll(() => {
          // @ts-ignore
          result = operate({
            body: {
              input,
              inputFormat: Format.JSON,
              operator: Operator.BEAUTIFY_JSON,
              outputFormat: Format.JSON,
              outputSpace: 2,
              outputStable: false
            }
          });
        });

        test('should return beautified JSON', () => {
          expect(result.output).toEqual('{\n  "hello": {\n    "test": "world"\n  }\n}');
        });
      });

      describe('when convert JSON to XML', () => {
        let result;

        beforeAll(() => {
          // @ts-ignore
          result = operate({
            body: {
              input,
              inputFormat: Format.JSON,
              operator: Operator.CONVERT_JSON_TO_XML,
              outputFormat: Format.XML,
              outputSpace: 2,
              outputStable: false
            }
          });
        });

        test('should return XML', () => {
          expect(result.output).toEqual('<hello>\n  <test>world</test>\n</hello>');
        });
      });
    });
  });
});
