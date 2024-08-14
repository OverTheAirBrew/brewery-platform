export module DisplayRegisteredMessage {
  export const Topic = 'NewDisplayRegistered';
  export interface Data {
    display_id: string;
  }
  export const Data: Data = {} as any;
}

export module NewTapBeerMessage {
  export const Topic = 'NewTapBeer';
  export interface Data {
    display_id: string;
  }
  export const Data: Data = {} as any;
}

export module TapConfiguredMessage {
  export const Topic = 'TapConfigured';
  export interface Data {
    display_id: string;
  }
  export const Data: Data = {} as any;
}
