/**
 * Утилитарный файл для безопасной работы с Telegram WebApp API
 */

// Безопасная проверка наличия Telegram WebApp API
export const isTelegramWebAppAvailable = (): boolean => {
  try {
    return typeof window !== 'undefined' && 
           typeof window.Telegram !== 'undefined' && 
           typeof window.Telegram.WebApp !== 'undefined';
  } catch (e) {
    return false;
  }
};

// Безопасная инициализация
export const safeReady = (): void => {
  if (isTelegramWebAppAvailable()) {
    try {
      window.Telegram?.WebApp?.ready();
    } catch (e) {
      console.warn('Error initializing Telegram WebApp:', e);
    }
  }
};

// Безопасный доступ к MainButton
export const safeMainButton = {
  show: (): void => {
    if (isTelegramWebAppAvailable()) {
      try {
        window.Telegram?.WebApp?.MainButton?.show();
      } catch (e) {
        console.warn('Error showing MainButton:', e);
      }
    }
  },
  hide: (): void => {
    if (isTelegramWebAppAvailable()) {
      try {
        window.Telegram?.WebApp?.MainButton?.hide();
      } catch (e) {
        console.warn('Error hiding MainButton:', e);
      }
    }
  },
  setText: (text: string): void => {
    if (isTelegramWebAppAvailable()) {
      try {
        window.Telegram?.WebApp?.MainButton?.setText(text);
      } catch (e) {
        console.warn('Error setting MainButton text:', e);
      }
    }
  },
  onClick: (callback: Function): void => {
    if (isTelegramWebAppAvailable()) {
      try {
        window.Telegram?.WebApp?.MainButton?.onClick(callback);
      } catch (e) {
        console.warn('Error setting MainButton onClick:', e);
      }
    }
  }
};

// Безопасный показ всплывающих окон
export const safeShowPopup = (params: {
  title?: string;
  message: string;
  buttons?: Array<{
    id?: string;
    type?: string;
    text?: string;
  }>;
}, callback?: (buttonId: string) => void): void => {
  if (isTelegramWebAppAvailable()) {
    try {
      window.Telegram?.WebApp?.showPopup(params, callback);
    } catch (e) {
      console.warn('Error showing popup:', e);
      // Запасной вариант - показать через alert
      alert(`${params.title ? params.title + ': ' : ''}${params.message}`);
    }
  } else {
    alert(`${params.title ? params.title + ': ' : ''}${params.message}`);
  }
};

export const safeShowAlert = (message: string, callback?: () => void): void => {
  if (isTelegramWebAppAvailable()) {
    try {
      window.Telegram?.WebApp?.showAlert(message, callback);
    } catch (e) {
      console.warn('Error showing alert:', e);
      alert(message);
      if (callback) callback();
    }
  } else {
    alert(message);
    if (callback) callback();
  }
};

export const safeShowConfirm = (message: string, callback?: (confirmed: boolean) => void): void => {
  if (isTelegramWebAppAvailable()) {
    try {
      window.Telegram?.WebApp?.showConfirm(message, callback);
    } catch (e) {
      console.warn('Error showing confirm:', e);
      const confirmed = confirm(message);
      if (callback) callback(confirmed);
    }
  } else {
    const confirmed = confirm(message);
    if (callback) callback(confirmed);
  }
};
