// components/CounterWithState.tsx
'use client';

import mqtt from 'mqtt';
import { useEffect, useState } from 'react';

export default function CounterWithState() {
  const [counter, setCounter] = useState(0);
  const [isHighlighted, setIsHighlighted] = useState(false);

  useEffect(() => {
    const client = mqtt.connect('wss://devapi.uniscore.vn:443/mqtt', {
      username: 'football',
      password: 'football123',
    });

    client.on('connect', () => {
      console.log('MQTT connected with state');
      client.subscribe('r2s', (err) => {
        if (err) {
          console.error('Subscribe failed:', err);
        }
      });
    });

    client.on('message', (topic, message) => {
      if (topic === 'r2s') {
        console.log('Message received:', message.toString());
        setCounter((prev) => prev + 1);
        setIsHighlighted(true);
      }
    });

    return () => {
      client.end();
    };
  }, []);

  useEffect(() => {
    if (isHighlighted) {
      const timer = setTimeout(() => {
        setIsHighlighted(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isHighlighted]);

  return (
    <div
      className="p-4 bg-blue-100 rounded shadow text-blue-800"
      style={{
        border: isHighlighted ? '2px solid red' : '2px solid transparent',
        transition: 'border-color 0.3s ease-in-out',
      }}
    >
      <h2 className="font-bold mb-2">useState</h2>
      <p>Counter: {counter}</p>
    </div>
  );
}
