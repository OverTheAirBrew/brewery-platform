export namespace DisplayUpdatedMessage {
  export const Topic = 'DisplayUpdated';
  export const IdField = 'deviceCode';
  export interface Data {
    deviceCode: string;
  }
  export const Message: Data = {} as any;
}
