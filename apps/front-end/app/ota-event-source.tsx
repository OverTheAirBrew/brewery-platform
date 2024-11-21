import { createContext, useContext, useEffect } from 'react';
import { getSession } from './services/session.server';

export interface EventSourceOptions {
  init?: EventSourceInit;
  enabled?: boolean;
  apiUrl: string;
  token?: string;
}

export type EventSourceMap = Map<
  string,
  { count: number; source: EventSource }
>;

interface IMessage<Data> {
  Topic: string;
  Message: Data;
}

interface IIdMessage<Data> extends IMessage<Data> {
  IdField: keyof Data;
}

const context = createContext<EventSourceMap>(
  new Map<string, { count: number; source: EventSource }>(),
);

export const EventSourceProvider = context.Provider;

const endpoint = 'sse';

export function useEventSourceWithId<TData>(
  message: IIdMessage<TData>,
  expectedId: string,
  options: EventSourceOptions,
  callback: (data: TData) => void,
) {
  const fullEndpoint = `${endpoint}/${message.Topic}/${expectedId}`;
  useEventSourceBase(message, fullEndpoint, options, callback);
}

export function useEventSource<TData>(
  message: IMessage<TData>,
  options: EventSourceOptions,
  callback: (data: TData) => void,
) {
  const fullEndpoint = `${endpoint}/${message.Topic}`;
  useEventSourceBase(message, fullEndpoint, options, callback);
}

function useEventSourceBase<TData>(
  message: IMessage<TData>,
  endpoint: string,
  { enabled = true, init, apiUrl, token }: EventSourceOptions,
  callback: (data: TData) => void,
) {
  const map = useContext(context);
  let fullUrl = `${apiUrl}/${endpoint}`;

  if (token) {
    fullUrl = `${fullUrl}?token=${token}`;
  }

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const key = [fullUrl, init?.withCredentials].join('::');

    const value = map.get(key) ?? {
      count: 0,
      source: new EventSource(fullUrl, init),
    };

    ++value.count;

    map.set(key, value);

    function handler(event: MessageEvent) {
      callback(JSON.parse(event.data));
    }

    value.source.addEventListener(message.Topic, handler);

    return () => {
      value.source.removeEventListener(message.Topic, handler);
      --value.count;
      if (value.count <= 0) {
        value.source.close();
        map.delete(key);
      }
    };
  });
}
