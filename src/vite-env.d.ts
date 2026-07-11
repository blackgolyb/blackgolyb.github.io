/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DATA_URL: string;
  readonly VITE_EMAILSJS_SERVICE_ID: string;
  readonly VITE_EMAILSJS_TEMPLATE_ID: string;
  readonly VITE_EMAILSJS_PUBLIC_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
