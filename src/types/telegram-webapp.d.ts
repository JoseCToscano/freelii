// Define the Telegram WebApp types
interface WebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

interface WebAppThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
}

interface WebAppChat {
  id: number;
  type: "group" | "supergroup" | "channel";
  title: string;
  username?: string;
  photo_url?: string;
}

interface WebAppInitData {
  query_id?: string;
  user?: WebAppUser;
  receiver?: WebAppUser;
  chat?: WebAppChat;
  start_param?: string;
  auth_date: number;
  hash: string;
}

interface BiometricManager {
  isInited: boolean;
  isBiometricAvailable: boolean;
  biometricType: "finger" | "face" | "unknown";
  isAccessRequested: boolean;
  isAccessGranted: boolean;
  isBiometricTokenSaved: boolean;
  deviceId: string;

  init(callback?: () => void): void;
  requestAccess(
    params: { reason: string },
    callback?: (accessGranted: boolean) => void,
  ): void;
  authenticate(
    params: { reason: string },
    callback: (isAuthenticated: boolean, biometricToken?: string) => void,
  ): void;
  updateBiometricToken(
    token: string,
    callback?: (isUpdated: boolean) => void,
  ): void;
  openSettings(): void;
}

interface HapticFeedback {
  isSupported: boolean;

  selectionChanged(): void;
  impactOccurred(
    style:
      | "light"
      | "medium"
      | "heavy"
      | "rigid"
      | "soft"
      | "success"
      | "warning"
      | "error"
      | "selectionChanged",
  ): void;
  notificationOccurred(type: "success" | "warning" | "error"): void;
}

interface MainButton {
  text: string;
  color: string;
  textColor: string;
  isVisible: boolean;
  isActive: boolean;
  isProgressVisible: boolean;

  setText(text: string): MainButton;
  show(): MainButton;
  hide(): MainButton;
  enable(): MainButton;
  disable(): MainButton;
  showProgress(leaveActive?: boolean): MainButton;
  hideProgress(): MainButton;
  onClick(callback: () => void): void;
  offClick(callback: () => void): void;
}

interface BackButton {
  isVisible: boolean;

  show(): void;
  hide(): void;
  onClick(callback: () => void): void;
  offClick(callback: () => void): void;
}

// Updated WebApp interface to reflect more accurately the actual Telegram WebApp capabilities
type WebAppEvent =
  | "theme_changed"
  | "viewport_changed"
  | "main_button_pressed"
  | "back_button_pressed"
  | "settings_button_pressed"
  | "invoice_closed"
  | "scanQrPopupClosed"
  | "qrTextReceived";

type WebAppEventCallback = (e: { data?: string }) => void;

interface WebApp {
  initData: string;
  initDataUnsafe: WebAppInitData;
  version: string;
  platform: string;
  colorScheme: "light" | "dark";
  themeParams: WebAppThemeParams;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  isActive: boolean;
  isFullscreen: boolean;
  isOrientationLocked: boolean;
  isVerticalSwipesEnabled: boolean;
  BackButton: BackButton;
  MainButton: MainButton;
  SecondaryButton: SecondaryButton;
  SettingsButton: SettingsButton;
  BiometricManager: BiometricManager;
  HapticFeedback: HapticFeedback;
  Accelerometer: Sensor;
  Gyroscope: Sensor;
  DeviceOrientation: DeviceOrientation;
  CloudStorage: CloudStorage;
  LocationManager: LocationManager;

  ready(): void;
  close(options?: { reason?: string }): void;
  expand(): void;
  setHeaderColor(color: "bg_color" | "secondary_bg_color"): void;
  setBackgroundColor(color: string): void;
  setBottomBarColor(color: string): void;
  enableClosingConfirmation(): void;
  disableClosingConfirmation(): void;
  enableVerticalSwipes(): void;
  disableVerticalSwipes(): void;
  lockOrientation(): void;
  unlockOrientation(): void;
  requestFullscreen(): void;
  exitFullscreen(): void;
  isVersionAtLeast(version: string): boolean;
  addToHomeScreen(): void;
  checkHomeScreenStatus(callback: (isAdded: boolean) => void): void;
  invokeCustomMethod(
    method: string,
    params?: object,
    callback?: (result: never) => void,
  ): void;
  requestContact(
    callback: (contact: {
      phone_number: string;
      first_name: string;
      last_name?: string;
    }) => void,
  ): void;
  requestEmojiStatusAccess(callback: (isGranted: boolean) => void): void;
  requestWriteAccess(callback: (isGranted: boolean) => void): void;
  readTextFromClipboard(callback: (text: string) => void): void;
  shareMessage(msg_id: string, callback?: (success: boolean) => void): void;
  shareToStory(media_url: string, params?: object): void;
  openLink(url: string, options?: { try_instant_view?: boolean }): void;
  openInvoice(
    url: string,
    callback?: (result: { status: string }) => void,
  ): void;
  openTelegramLink(url: string, options?: { instant_view?: boolean }): void;
  switchInlineQuery(query: string, choose_chat_types?: Array<string>): void;
  sendData(data: string): void;
  showPopup(
    params: {
      title?: string;
      message: string;
      buttons?: Array<{
        id: string;
        type: "default" | "ok" | "close" | "cancel" | "destructive";
        text: string;
      }>;
    },
    callback?: (button_id: string) => void,
  ): void;
  showAlert(message: string, callback?: () => void): void;
  showConfirm(message: string, callback: (confirmed: boolean) => void): void;
  showScanQrPopup(
    params?: { text?: string },
    callback?: (data: string) => void,
  ): void;
  closeScanQrPopup(): void;
  onEvent(event: WebAppEvent, callback: () => void): void;
  offEvent(event: WebAppEvent, callback: () => void): void;
  downloadFile(
    params: { url: string; filename?: string },
    callback?: (progress: number) => void,
  ): void;
  setEmojiStatus(
    custom_emoji_id: string,
    params?: object,
    callback?: (result: boolean) => void,
  ): void;
}

interface SecondaryButton {
  onClick(callback: () => void): void;
  offClick(callback: () => void): void;
  show(): void;
  hide(): void;
}

interface SettingsButton {
  onClick(callback: () => void): void;
  offClick(callback: () => void): void;
  show(): void;
  hide(): void;
}

interface Sensor {
  start(callback: (data: { x: number; y: number; z: number }) => void): void;
  stop(): void;
}

interface DeviceOrientation {
  start(
    callback: (data: { alpha: number; beta: number; gamma: number }) => void,
  ): void;
  stop(): void;
}

interface CloudStorage {
  setItem(
    key: string,
    value: string,
    callback?: (success: boolean) => void,
  ): void;
  getItem(key: string, callback: (value: string | null) => void): void;
  getItems(
    keys: string[],
    callback: (items: Record<string, string>) => void,
  ): void;
  removeItem(key: string, callback?: (success: boolean) => void): void;
  removeItems(keys: string[], callback?: (success: boolean) => void): void;
}

interface LocationManager {
  init(
    callback: (location: {
      latitude: number;
      longitude: number;
      accuracy: number;
    }) => void,
  ): void;
  stop(): void;
}

interface WebView {
  onEvent(
    event: WebAppEvent,
    callback: (e: { height?: number; data?: string }) => void,
  ): void;
  offEvent(event: WebAppEvent, callback: (e: { height: number }) => void): void;
}

interface Window {
  Telegram: {
    WebApp: WebApp;
    WebView: WebView;
  };
}
