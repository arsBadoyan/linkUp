declare module '@twa-dev/sdk' {
  interface MainButtonOptions {
    text?: string;
    color?: string;
    textColor?: string;
    isVisible?: boolean;
    isActive?: boolean;
    isProgressVisible?: boolean;
  }

  interface MainButton {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    onClick(callback: Function): void;
    offClick(callback: Function): void;
    setText(text: string): void;
    show(): void;
    hide(): void;
    enable(): void;
    disable(): void;
    showProgress(leaveActive?: boolean): void;
    hideProgress(): void;
    setParams(params: MainButtonOptions): void;
  }

  interface WebApp {
    initData: string;
    initDataUnsafe: any;
    colorScheme: string;
    viewportHeight: number;
    viewportStableHeight: number;
    isExpanded: boolean;
    MainButton: MainButton;
    ready(): void;
    expand(): void;
    close(): void;
    showPopup(params: {
      title?: string;
      message: string;
      buttons?: Array<{
        id?: string;
        type?: string;
        text: string;
      }>;
    }, callback?: (buttonId: string) => void): void;
    showAlert(message: string, callback?: () => void): void;
    showConfirm(message: string, callback?: (confirmed: boolean) => void): void;
    // Добавьте другие методы и свойства при необходимости
  }

  const WebApp: WebApp;
  export default WebApp;
}
