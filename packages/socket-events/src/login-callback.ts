export namespace LoginCallback {
  export const Topic = 'LoginCallback';
  export const IdField = 'deviceCode';
  export interface Data {
    deviceCode: string;

    deviceToken: string;
  }
  export const Message: Data = {} as any;
}
