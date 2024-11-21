export interface IMessage<Data> {
  Topic: string;
  Message: Data;
}

export interface IIdMessage<Data> extends IMessage<Data> {
  IdField: keyof Data;
}
