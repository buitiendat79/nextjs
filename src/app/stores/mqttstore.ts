import { create } from 'zustand';

import { connectMQTT, disconnectMQTT } from '@/lib/mqtt';

interface MatchStore {
  messages: string[];
  addMessage: (msg: string) => void;
  connect: () => void;
  disconnect: () => void;
}

export const useMQTTStore = create<MatchStore>((set) => ({
  messages: [],

  addMessage: (msg) =>
    set((state) => ({
      messages: [...state.messages, msg],
    })),
    
  connect: () => {
    connectMQTT((msg) => {
      set((state) => ({
        messages: [...state.messages, msg],
      }));
    });
  },
  disconnect: () => {
    disconnectMQTT();
  },
}));
