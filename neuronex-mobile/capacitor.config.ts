import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nexa.neuronex',
  appName: 'Neuronex Pulse',
  webDir: 'www',
  server: {
    url: 'http://nexa-ai.dev/neuronex',
    cleartext: true
  }
};

export default config;
