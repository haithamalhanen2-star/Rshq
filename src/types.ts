export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  password?: string;
  points: number;
  role: UserRole;
  referralCode: string;
  referredBy?: string;
  createdAt: string;
}

export interface Service {
  id: string;
  category: 'smm' | 'games';
  platform: string; // 'facebook' | 'tiktok' | 'instagram' | 'telegram' | 'twitter' | 'youtube' | 'pubg' | 'yalla_ludo' | 'other_games'
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  pricePer1000?: number; // SMM: Points per 1000 items
  fixedPrice?: number; // Games: Points for package
  packageSize?: number; // For SMM or Games, e.g. "1000 Followers" or "660 UC"
  minOrder?: number;
  maxOrder?: number;
  image?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  serviceId: string;
  serviceNameAr: string;
  serviceNameEn: string;
  platform: string;
  category: 'smm' | 'games';
  quantity: number;
  targetLinkOrId: string; // URL for SMM, Player ID for games
  extraDetails?: string; // Character Name or Region
  totalCost: number;
  status: OrderStatus;
  createdAt: string;
}

export interface Referral {
  id: string;
  referrerId: string;
  referredUserId: string;
  rewardPoints: number;
  createdAt: string;
}

export interface PaymentRequest {
  id: string;
  userId: string;
  userEmail: string;
  amountPoints: number;
  amountCash: number;
  method: string;
  transactionId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export type MediationStatus = 'pending' | 'contacted' | 'completed' | 'cancelled';

export interface UserPost {
  id: string;
  userId: string;
  userEmail: string;
  type: 'sell' | 'buy';
  title: string;
  description: string;
  price: string;
  image?: string;
  status: 'pending' | 'approved' | 'rejected';
  contactMethod?: string;
  createdAt: string;
}

export interface MediationRequest {
  id: string;
  userId: string;
  userEmail: string;
  type: 'sell' | 'buy';
  description: string;
  amount: string;
  notes: string;
  adminNotes?: string;
  status: MediationStatus;
  createdAt: string;
}

export interface AdminLog {
  id: string;
  adminId: string;
  adminEmail: string;
  actionType: string;
  details: string;
  createdAt: string;
}

export interface SystemSettings {
  id: string; // 'contacts'
  telegramChannel: string;
  telegramDetail: string;
  whatsappLink: string;
  whatsappDetail: string;
}

export interface AppNotification {
  id: string;
  userId: string; // 'admin' if for admins, otherwise specific userId
  titleAr: string;
  titleEn: string;
  messageAr: string;
  messageEn: string;
  type: 'order' | 'mediation' | 'general';
  targetId?: string;
  read: boolean;
  createdAt: string;
}

