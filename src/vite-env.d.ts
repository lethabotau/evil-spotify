/// <reference types="vite/client" />

declare module '*.mp4' {
  const src: string
  export default src
}

interface ImportMetaEnv {
  readonly VITE_SPOTIFY_CLIENT_ID: string
  readonly VITE_REDIRECT_URI: string
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
