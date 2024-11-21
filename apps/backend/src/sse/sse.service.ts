import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  DisplayUpdatedMessage,
  LoginCallback,
} from '@overtheairbrew/socket-events';
import { filter, fromEvent, map } from 'rxjs';
export interface IMessage<Data> {
  Topic: string;
  Message: Data;
}

export interface IIdMessage<Data> extends IMessage<Data> {
  IdField: keyof Data;
}

@Injectable()
export class SseService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  private sseIdMessages: IIdMessage<any>[] = [
    LoginCallback,
    DisplayUpdatedMessage,
  ];
  private sseMessages: IMessage<any>[] = [];

  emitEvent<Data>(message: IMessage<Data>) {
    return async (data: Data) => {
      this.eventEmitter.emit(message.Topic, data);
    };
  }

  subscribeForId(topic: string, id: string) {
    const message = this.sseIdMessages.find(
      (message) => message.Topic === topic,
    );

    if (!message) throw new BadRequestException(`Invalid topic name: ${topic}`);

    const source = fromEvent(this.eventEmitter, message.Topic);
    return source
      .pipe(
        filter((data: typeof message.Message) => {
          console.log(data[message.IdField] === id);
          return data[message.IdField] === id;
        }),
      )
      .pipe(map((data) => new MessageEvent(message.Topic, { data })));
  }

  subscribe(topic: string) {
    const message = this.sseMessages.find((message) => message.Topic === topic);

    if (!message) throw new BadRequestException(`Invalid topic name: ${topic}`);

    return fromEvent(this.eventEmitter, message.Topic).pipe(
      map((data) => {
        return new MessageEvent(message.Topic, { data });
      }),
    );
  }

  // private eventSubjects: Map<string, Subject<any>> = new Map();

  // emitEvent<T>(data: IMessage<T>) {
  //   return async (message: T) => {
  //     if (!this.eventSubjects.has(data.Topic)) return;

  //     const eventSubject = this.eventSubjects.get(data.Topic);
  //     eventSubject!.next(message);
  //   };
  // }

  // clearEvent(id: string) {
  //   const eventSubject = this.eventSubjects.get(id);
  //   if (eventSubject) {
  //     eventSubject.complete();
  //     this.eventSubjects.delete(id);
  //   }
  // }

  // isEventActive(id: string) {
  //   return this.eventSubjects.has(id);
  // }

  // getObservable(eventId: string): Observable<any> {
  //   if (!this.eventSubjects.has(eventId)) {
  //     this.eventSubjects.set(eventId, new Subject<any>());
  //   }

  //   const eventSubject = this.eventSubjects.get(eventId);
  //   return eventSubject!.asObservable().pipe(map((data) => ({ data })));
  // }
}
