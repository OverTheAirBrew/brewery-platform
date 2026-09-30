export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      LOG_LEVEL: 'error' | 'log' | 'debug' | 'verbose';

      DATABASE_TYPE: 'mysql';
      MYSQL_URL: string;
      MIGRATE: 'true' | 'false';

      MQTT_URL: string;
      REDIS_URL: string;

      PRIVATE_KEY: string;

      MQTT_POSTFIX: string;
    }
  }
}
