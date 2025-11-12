export abstract class MqttMessage<TPayload> {
  protected readonly __mqtttMessageBrand!: void;

  protected abstract readonly topic: string | ((payload: TPayload) => string);

  public getTopic(payload: TPayload): string {
    if (typeof this.topic === 'string') {
      return this.topic;
    }

    return this.topic(payload);
  }

  constructor(public readonly payload: TPayload) {}
}
