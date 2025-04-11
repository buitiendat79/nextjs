// components/CounterWithRef.tsx
'use client';

import mqtt from 'mqtt';
import { useEffect, useRef } from 'react';

export default function CounterWithRef() {
  const counterRef = useRef(0);

  useEffect(() => {
    const client = mqtt.connect('wss://devapi.uniscore.vn:443/mqtt', {
      username: 'football',
      password: 'football123',
    });

    client.on('connect', () => {
      console.log('MQTT connected with ref');
      client.subscribe('r2s', (err) => {
        if (err) {
          console.error('Subscribe failed:', err);
        }
      });
    });

    client.on('message', (topic, message) => {
      if (topic === 'r2s') {
        console.log('Message received:', message.toString());
        counterRef.current += 1;
        console.log('Ref counter:', counterRef.current);
      }
    });

    return () => {
      client.end();
    };
  }, []);

  return (
    <div className="p-4 bg-green-100 rounded shadow text-green-800">
      <h2 className="font-bold mb-2">Counter useRef</h2>
      <p>Counter: {counterRef.current}</p>
      <p className="text-xs text-gray-600">
      </p>
    </div>
  );
}
