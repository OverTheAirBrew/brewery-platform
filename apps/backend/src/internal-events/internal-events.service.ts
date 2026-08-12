import { Queue } from 'bullmq';

export abstract class InternalEventMessage<TPayload> {
  // Protected branding makes this effectively nominal: plain objects cannot satisfy it.
  protected readonly __internalEventMessageBrand!: void;

  abstract readonly topic: string;
  constructor(public readonly payload: TPayload) {}
}

export class CustomQueue extends Queue {
  public async sendMessage<TPayload>(
    message: InternalEventMessage<TPayload>,
    dedupeId?: keyof TPayload,
  ): Promise<void> {
    try {
      const deduplication = dedupeId
        ? { id: String(message.payload[dedupeId]) }
        : undefined;

      await this.add(message.topic, message, {
        deduplication,
      });
    } catch (error) {
      console.error('Failed to send message to queue:', error);
    }
  }
}
