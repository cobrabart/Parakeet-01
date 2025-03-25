// Interface for Telegram WebApp object
interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id: string;
    user: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    auth_date: string;
    hash: string;
  };
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color: string;
    text_color: string;
    hint_color: string;
    link_color: string;
    button_color: string;
    button_text_color: string;
    secondary_bg_color: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  ready(): void;
  expand(): void;
  close(): void;
  showPopup(params: any, callback: Function): void;
  showAlert(message: string, callback: Function): void;
  showConfirm(message: string, callback: Function): void;
  enableClosingConfirmation(): void;
  disableClosingConfirmation(): void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText(text: string): void;
    onClick(callback: Function): void;
    offClick(callback: Function): void;
    show(): void;
    hide(): void;
    enable(): void;
    disable(): void;
    showProgress(leaveActive: boolean): void;
    hideProgress(): void;
  };
  BackButton: {
    isVisible: boolean;
    onClick(callback: Function): void;
    offClick(callback: Function): void;
    show(): void;
    hide(): void;
  };
  openLink(url: string): void;
  onEvent(eventType: string, eventHandler: Function): void;
  offEvent(eventType: string, eventHandler: Function): void;
  openTelegramLink(url: string): void;
  setHeaderColor(color: string): void;
  setBackgroundColor(color: string): void;
  readTextFromClipboard(callback: Function): void;
  HapticFeedback: {
    impactOccurred(style: string): void;
    notificationOccurred(type: string): void;
    selectionChanged(): void;
  };
  isVersionAtLeast(version: string): boolean;
  sendData(data: string): void;
  CloudStorage: {
    setItem(key: string, value: string, callback: Function): void;
    getItem(key: string, callback: Function): void;
    getItems(keys: string[], callback: Function): void;
    removeItem(key: string, callback: Function): void;
    removeItems(keys: string[], callback: Function): void;
    getKeys(callback: Function): void;
  };
}

// Extend window interface to include Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

// Initialize Telegram Mini App
export function initTelegramApp() {
  if (window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    
    // Tell Telegram that the Mini App is ready
    tg.ready();
    
    // Enable back button on navigation if available
    tg.BackButton.onClick(() => {
      window.history.back();
    });
    
    // Apply Telegram theme colors if needed
    if (tg.themeParams) {
      document.documentElement.style.setProperty('--tg-bg-color', tg.themeParams.bg_color);
      document.documentElement.style.setProperty('--tg-text-color', tg.themeParams.text_color);
      document.documentElement.style.setProperty('--tg-hint-color', tg.themeParams.hint_color);
      document.documentElement.style.setProperty('--tg-link-color', tg.themeParams.link_color);
      document.documentElement.style.setProperty('--tg-button-color', tg.themeParams.button_color);
      document.documentElement.style.setProperty('--tg-button-text-color', tg.themeParams.button_text_color);
    }
  }
}

// Get user data from Telegram Mini App
export function getTelegramUser() {
  if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
    return window.Telegram.WebApp.initDataUnsafe.user;
  }
  return null;
}

// Show payment popup
export function showTelegramPayment(options: {
  title: string;
  description: string;
  amount: number;
  currency?: string;
  callback: (success: boolean) => void;
}) {
  if (!window.Telegram?.WebApp) {
    options.callback(false);
    return;
  }
  
  const tg = window.Telegram.WebApp;
  
  // In a real app, this would involve the Telegram Payments API
  // For this demo, we're simulating with a simple popup
  tg.showConfirm(
    `Process payment for ${options.title}?\n\nAmount: ${(options.amount / 100).toFixed(2)} ${options.currency || 'USD'}`,
    (confirmed) => {
      if (confirmed) {
        tg.showAlert("Payment successful!", () => {
          options.callback(true);
        });
      } else {
        options.callback(false);
      }
    }
  );
}

// Show back button
export function showTelegramBackButton() {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.BackButton.show();
  }
}

// Hide back button
export function hideTelegramBackButton() {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.BackButton.hide();
  }
}

// Show main button
export function showTelegramMainButton(text: string, onClick: () => void) {
  if (window.Telegram?.WebApp) {
    const mainButton = window.Telegram.WebApp.MainButton;
    mainButton.setText(text);
    mainButton.onClick(onClick);
    mainButton.show();
  }
}

// Hide main button
export function hideTelegramMainButton() {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.MainButton.hide();
  }
}
