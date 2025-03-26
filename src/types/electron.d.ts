
interface Window {
  electron?: {
    checkNotifications: () => Promise<any>;
    saveEmailConfig: (config: { username: string; password: string; serviceId: string }) => Promise<any>;
  };
}
