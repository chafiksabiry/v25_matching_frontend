/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_API_URL_GIGS: string;
    readonly VITE_MATCHING_API_URL: string;
    readonly VITE_QIANKUN: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }