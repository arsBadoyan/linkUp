declare module '@twa-dev/sdk' {
  interface WebApp {
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

  const WebApp: WebApp;
  export default WebApp;
}
