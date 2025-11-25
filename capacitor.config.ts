import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.barangay.bulletinboard',
  appName: 'Komunidad',
  webDir: 'www',
  plugins: {
    StatusBar: {
      style: 'Dark',
      backgroundColor: '#3465A4'
    }
  }
};

export default config;
