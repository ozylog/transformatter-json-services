import knex, { Format, Operator } from '@src/db/knex';
import { Model } from 'objection';

Model.knex(knex);

export default class Json extends Model {
  public static tableName = 'jsons';

  public id!: string;
  public userId!: string | null;
  public input!: string | null;
  public inputFormat!: Format | null;
  public operator!: Operator | null;
  public output!: string | null;
  public outputFormat!: Format | null;
  public outputSpace!: number | null;
  public outputStable!: boolean | null;
  public updatedAt!: Date;
  public deletedAt!: Date | null;
}
