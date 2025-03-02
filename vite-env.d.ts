/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_WEATHER_API_KEY: string;
    // 필요한 환경 변수를 추가
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }