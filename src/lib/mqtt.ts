'use client';

import mqtt from 'mqtt';

let client: MqttClient | null = null;
const topic = 'r2s';

export const connectMQTT = (onMessageCallback: (payload: string) => void) => {
  if (client && client.connected) return;

  client = mqtt.connect('wss://devapi.uniscore.vn:443/mqtt', {
    username: 'football',
    password: 'football123',
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000,
    clean: true,
    clientId: `client_${Math.random().toString(16).substring(2, 8)}`,
    path: '/mqtt',
  });

  client.on('connect', () => {
    console.log('✅ MQTT connected');
    client?.subscribe(topic, (err) => {
      if (err) {
        console.error('Subscribe failed', err);
      } else {
        console.log(`Subscribed to topic "${topic}"`);
      }
    });
  });

  client.on('message', (_topic, message) => {
    const payload = message.toString();
    onMessageCallback(payload);
  });

  client.on('error', (err) => console.error('MQTT error:', err));
  client.on('close', () => console.log('MQTT disconnected'));
  client.on('reconnect', () => console.log('MQTT reconnecting'));
};

export const disconnectMQTT = () => {
  if (client && client.connected) {
    client.end(true);
    client = null;
  }
};
