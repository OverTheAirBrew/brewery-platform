export abstract class MqttMessage<TPayload> {
  protected readonly __mqtttMessageBrand!: void;

  public readonly options: {
    qos: number;
    retain: boolean;
  };
  public readonly payload: TPayload;

  constructor(
    payload: TPayload,
    options?: {
      qos?: number;
      retain?: boolean;
    },
  ) {
    this.payload = payload;
    this.options = {
      qos: options?.qos ?? 1,
      retain: options?.retain ?? false,
    };
  }

  protected abstract readonly topic: string | ((payload: TPayload) => string);

  public getTopic(payload: TPayload): string {
    if (typeof this.topic === 'string') {
      return this.topic;
    }

    return this.topic(payload);
  }
}
