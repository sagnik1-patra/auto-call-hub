import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.7c82d77d724443118d004ca6a89ac350',
  appName: 'auto-call-hub',
  webDir: 'dist',
  server: {
    url: 'https://7c82d77d-7244-4311-8d00-4ca6a89ac350.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
