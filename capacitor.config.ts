import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.MFSeguridad.countries',
  appName: 'Zentry',
  webDir: 'www/browser',
  //bundledWebRuntime: false
  server: {
    androidScheme: 'https'
  }
};

export default config;
