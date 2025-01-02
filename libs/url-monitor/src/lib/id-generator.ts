import { v4 } from 'uuid';

export interface IdGenerator {
  next(): string;
}

export class UUIDV4IdGenerator implements IdGenerator {
  next(): string {
    return v4();
  }
}
