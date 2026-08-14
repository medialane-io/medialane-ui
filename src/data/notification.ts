export type NotificationType =
  | "offer"
  | "offer_accepted"
  | "sale"
  | "listing"
  | "mint"
  | "transfer"
  | "asset_received"
  | "cancelled"
  | "announcement";

export type NotificationPriority = "normal" | "spotlight";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  image: string | null;
  href: string;
  timestamp: string;
  isUnread: boolean;
  priority: NotificationPriority;

  celebratory?: boolean;

  metadata?: {
    amount?: string;
    currency?: string;
    txHash?: string;
    assetName?: string;
  };
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  image: string | null;
  href: string;
  created_at: string;
  pinned?: boolean;
}
