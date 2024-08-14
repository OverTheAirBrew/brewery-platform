export namespace DisplayUpdatedMessage {
  export const Topic = 'DisplayUpdated';
  export interface Data {
    deviceCode: string;
  }
  export const Message: Data = {} as any;
}
