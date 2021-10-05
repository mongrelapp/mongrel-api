import { Schema } from 'dynamoose';

export interface MongrelKey {
  database_id: string;
  key: string;
}

export interface Mongrel extends MongrelKey {
  value: string;
  is_active?: boolean;
}

export const MongrelSchema = new Schema({
  database_id: {
    type: String,
    hashKey: true,
    required: true,
  },
  key: {
    type: String,
    rangeKey: true,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  created_at: {
    type: Date,
    default: Date.now(),
    get: (v) => Number(v),
  },
  updated_at: {
    type: Date,
    default: null,
  },
});
