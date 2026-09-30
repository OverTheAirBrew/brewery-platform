export enum CommunicationType {
  None = 'none',
  MQTT = 'mqtt',
}

export type TopicResponse = {
  subscribeTopics: string[];
  publishTopics: string[];
};
