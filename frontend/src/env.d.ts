/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly DEV: boolean
  // Добавьте другие переменные окружения здесь
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Определение типов для Telegram WebApp
interface TelegramWebApp {
  initData: string;
  initDataUnsafe: any;
  colorScheme: string;
  viewportHeight: number;
  viewportStableHeight: number;
  isExpanded: boolean;
  ready(): void;
  expand(): void;
  close(): void;
  // Добавьте другие методы и свойства при необходимости
}

// Расширение глобального объекта Window
interface Window {
  Telegram?: {
    WebApp?: TelegramWebApp
  }
} 