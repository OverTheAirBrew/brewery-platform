import { Global, Module } from '@nestjs/common';
import { MqttService } from './mqtt-client.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../config';
import { MQTT_SERVICE } from './mqtt-client.abstractions';

@Global()
@Module({
  providers: [MqttService],
  exports: [MqttService],
  imports: [
    ClientsModule.registerAsync({
      clients: [
        {
          name: MQTT_SERVICE,
          useFactory: async (configService: ConfigService) => {
            const config = configService.get<ConfigType>('CONFIG');
            const mqttUrl = new URL(config!.mqtt.MQTT_URL);
            return {
              transport: Transport.MQTT,
              options: {
                url: `${mqttUrl.protocol}//${mqttUrl.hostname}`,
                port: parseInt(mqttUrl.port) || 1883,
                username: mqttUrl.username,
                password: mqttUrl.password,
              },
            };
          },
          inject: [ConfigService],
        },
      ],
      isGlobal: true,
    }),
  ],
})
export class MqttClientModule {}
