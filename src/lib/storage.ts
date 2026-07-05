import { User, Service, Order, PaymentRequest, Referral, UserPost, MediationRequest, AdminLog, SystemSettings, AppNotification } from '../types';
import { db } from './firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, getDocs } from 'firebase/firestore';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };

  try {
    const sessionStr = sessionStorage.getItem('alnuaimi_session');
    if (sessionStr) {
      const u = JSON.parse(sessionStr);
      errInfo.authInfo.userId = u.id;
      errInfo.authInfo.email = u.email;
    }
  } catch (e) {}

  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function cleanObjectForFirestore(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(cleanObjectForFirestore);
  }

  const cleaned: any = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val !== undefined) {
      cleaned[key] = cleanObjectForFirestore(val);
    }
  }
  return cleaned;
}


// Default SMM and Game Services
const DEFAULT_SERVICES: Service[] = [
  // Instagram
  {
    id: 'smm-ig-followers',
    category: 'smm',
    platform: 'instagram',
    nameAr: 'متابعين انستغرام - حقيقيين ثابتين',
    nameEn: 'Instagram Followers - Real Non-Drop',
    descriptionAr: 'زيادة متابعين انستغرام حقيقيين مع ضمان التعويض لمدة 30 يومًا.',
    descriptionEn: 'High-quality real Instagram followers with 30-day refill guarantee.',
    pricePer1000: 150, // 150 points per 1000
    minOrder: 100,
    maxOrder: 10000,
  },
  {
    id: 'smm-ig-likes',
    category: 'smm',
    platform: 'instagram',
    nameAr: 'لايكات انستغرام - سريعة جداً',
    nameEn: 'Instagram Likes - Super Fast',
    descriptionAr: 'لايكات فورية لجميع منشوراتك وصورك على انستغرام.',
    descriptionEn: 'Instant likes for your Instagram posts and photos.',
    pricePer1000: 40,
    minOrder: 50,
    maxOrder: 20000,
  },
  {
    id: 'smm-ig-views',
    category: 'smm',
    platform: 'instagram',
    nameAr: 'مشاهدات ريلز وفيديوهات انستغرام',
    nameEn: 'Instagram Reels & Video Views',
    descriptionAr: 'مشاهدات ريلز فائقة السرعة لتحسين ظهور حسابك وإكسبلور.',
    descriptionEn: 'Super fast views for Reels to boost explore algorithm placement.',
    pricePer1000: 10,
    minOrder: 100,
    maxOrder: 100000,
  },

  // TikTok
  {
    id: 'smm-tt-followers',
    category: 'smm',
    platform: 'tiktok',
    nameAr: 'متابعين تيك توك - سرعة قصوى',
    nameEn: 'TikTok Followers - Maximum Speed',
    descriptionAr: 'احصل على متابعين تيك توك حقيقيين لزيادة شعبيتك وإمكانية البث المباشر.',
    descriptionEn: 'Get real TikTok followers to boost your reputation and unlock LIVE.',
    pricePer1000: 180,
    minOrder: 100,
    maxOrder: 25000,
  },
  {
    id: 'smm-tt-likes',
    category: 'smm',
    platform: 'tiktok',
    nameAr: 'لايكات تيك توك - حقيقية آمنة',
    nameEn: 'TikTok Likes - Real & Safe',
    descriptionAr: 'زيادة إعجابات فيديوهات تيك توك لرفع فرصة دخول الإكسبلور.',
    descriptionEn: 'Increase likes on your TikTok videos to maximize your For You page chance.',
    pricePer1000: 60,
    minOrder: 100,
    maxOrder: 50000,
  },
  {
    id: 'smm-tt-views',
    category: 'smm',
    platform: 'tiktok',
    nameAr: 'مشاهدات تيك توك - ملايين المشاهدات',
    nameEn: 'TikTok Views - High Retention',
    descriptionAr: 'مشاهدات فورية لتيك توك بأسعار رمزية ومناسبة جداً.',
    descriptionEn: 'Instant TikTok views at incredibly low point rates.',
    pricePer1000: 5,
    minOrder: 1000,
    maxOrder: 1000000,
  },

  // Facebook
  {
    id: 'smm-fb-followers',
    category: 'smm',
    platform: 'facebook',
    nameAr: 'متابعين صفحات وحسابات فيسبوك',
    nameEn: 'Facebook Page & Profile Followers',
    descriptionAr: 'زيادة متابعين لصفحتك العامة أو حسابك الشخصي لتفعيل ميزات الأرباح.',
    descriptionEn: 'Add high-quality followers to your page or profile to unlock monetization.',
    pricePer1000: 220,
    minOrder: 200,
    maxOrder: 20000,
  },
  {
    id: 'smm-fb-likes',
    category: 'smm',
    platform: 'facebook',
    nameAr: 'لايكات وتفاعلات منشورات فيسبوك',
    nameEn: 'Facebook Post Likes & Reactions',
    descriptionAr: 'لايكات أو تفاعلات (لايك، واو، أحببته) لمنشوراتك الشخصية والصفحات.',
    descriptionEn: 'Post likes or custom reactions (Like, Love, Wow) for your posts.',
    pricePer1000: 80,
    minOrder: 100,
    maxOrder: 15000,
  },

  // Telegram
  {
    id: 'smm-tg-members',
    category: 'smm',
    platform: 'telegram',
    nameAr: 'أعضاء قنوات ومجموعات تليجرام',
    nameEn: 'Telegram Channel & Group Members',
    descriptionAr: 'أعضاء حقيقيين ونشطين لقناتك أو مجموعتك على التليجرام لزيادة الثقة.',
    descriptionEn: 'Real-looking members for your Telegram channel or group to build trust.',
    pricePer1000: 120,
    minOrder: 100,
    maxOrder: 30000,
  },
  {
    id: 'smm-tg-views',
    category: 'smm',
    platform: 'telegram',
    nameAr: 'مشاهدات منشورات تليجرام - آخر 5 منشورات',
    nameEn: 'Telegram Post Views - Last 5 Posts',
    descriptionAr: 'توزيع التفاعل التلقائي على آخر منشورات قناتك بشكل منسق.',
    descriptionEn: 'Views distributed automatically across the latest channel posts.',
    pricePer1000: 15,
    minOrder: 500,
    maxOrder: 100000,
  },

  // Twitter (X)
  {
    id: 'smm-tw-followers',
    category: 'smm',
    platform: 'twitter',
    nameAr: 'متابعين تويتر (منصة X) - جودة عالية',
    nameEn: 'Twitter (X) Followers - High Quality',
    descriptionAr: 'متابعين لحسابك الشخصي على تويتر لتوثيق وتكبير حسابك.',
    descriptionEn: 'Get organic-looking followers on Twitter/X to grow your digital authority.',
    pricePer1000: 300,
    minOrder: 50,
    maxOrder: 500,
  },

  // YouTube
  {
    id: 'smm-yt-subs',
    category: 'smm',
    platform: 'youtube',
    nameAr: 'مشتركي قنوات يوتيوب - حقيقيين وثابتين',
    nameEn: 'YouTube Subscribers - Safe & Non-Drop',
    descriptionAr: 'مشتركين يوتيوب حقيقيين لمساعدتك في الوصول إلى شروط تفعيل الربح (1000 مشترك).',
    descriptionEn: 'Real YouTube subscribers to help you satisfy partner monetization thresholds.',
    pricePer1000: 600,
    minOrder: 50,
    maxOrder: 2000,
  },
  {
    id: 'smm-yt-views',
    category: 'smm',
    platform: 'youtube',
    nameAr: 'مشاهدات يوتيوب - زيادة مدة المشاهدة',
    nameEn: 'YouTube Views - Watch Time Booster',
    descriptionAr: 'زيادة مشاهدات يوتيوب مع زيادة نسبة الاحتفاظ لمقاطع الفيديو الخاصة بك.',
    descriptionEn: 'Increase views with custom video retention rates to boost search ranking.',
    pricePer1000: 110,
    minOrder: 100,
    maxOrder: 50000,
  },

  // Game: PUBG
  {
    id: 'game-pubg-60uc',
    category: 'games',
    platform: 'pubg',
    nameAr: 'ببجي موبايل - 60 UC شحن فوري',
    nameEn: 'PUBG Mobile - 60 UC Instant',
    descriptionAr: 'شحن فوري ومباشر لحسابك عن طريق الايدي (ID) الرسمي.',
    descriptionEn: 'Direct instant top-up to your account via player ID.',
    fixedPrice: 65,
    packageSize: 60,
  },
  {
    id: 'game-pubg-325uc',
    category: 'games',
    platform: 'pubg',
    nameAr: 'ببجي موبايل - 325 UC شحن فوري',
    nameEn: 'PUBG Mobile - 325 UC Instant',
    descriptionAr: 'شحن فوري ومباشر لحسابك عن طريق الايدي (ID) الرسمي مع الهدايا.',
    descriptionEn: 'Direct instant top-up via player ID + bonus diamonds.',
    fixedPrice: 320,
    packageSize: 325,
  },
  {
    id: 'game-pubg-660uc',
    category: 'games',
    platform: 'pubg',
    nameAr: 'ببجي موبايل - 660 UC شحن فوري',
    nameEn: 'PUBG Mobile - 660 UC Instant',
    descriptionAr: 'احصل على تذكرة الرويال باس فوراً بشحن 660 شدة ببجي.',
    descriptionEn: 'Unlock the Royal Pass immediately with 660 UC package.',
    fixedPrice: 620,
    packageSize: 660,
  },

  // Game: Yalla Ludo
  {
    id: 'game-yl-gold-1m',
    category: 'games',
    platform: 'yalla_ludo',
    nameAr: 'يلا لودو - 1 مليون ذهب',
    nameEn: 'Yalla Ludo - 1 Million Gold Coins',
    descriptionAr: 'شحن الذهب في لعبة يلا لودو عن طريق الايدي (ID) لفتح غرف الألعاب.',
    descriptionEn: 'Add gold coins in Yalla Ludo via Player ID for gaming tables.',
    fixedPrice: 150,
    packageSize: 1000000,
  },
  {
    id: 'game-yl-dia-1000',
    category: 'games',
    platform: 'yalla_ludo',
    nameAr: 'يلا لودو - 1000 مجوهرات شحن مباشر',
    nameEn: 'Yalla Ludo - 1000 Diamonds',
    descriptionAr: 'مجوهرات يلا لودو لرفع مستواك وشراء ثيمات النرد والبطاقات.',
    descriptionEn: 'Get 1000 Diamonds to unlock custom dice, cards and room themes.',
    fixedPrice: 280,
    packageSize: 1000,
  },

  // Game: Free Fire & others
  {
    id: 'game-ff-100dia',
    category: 'games',
    platform: 'other_games',
    nameAr: 'فري فاير - 110 جوهرة شحن فوري',
    nameEn: 'Free Fire - 110 Diamonds Instant',
    descriptionAr: 'شحن جواهر فري فاير عن طريق معرف اللاعب ID مع مكافآت الشحن.',
    descriptionEn: 'Top up Free Fire Diamonds via Player ID with deposit bonuses.',
    fixedPrice: 90,
    packageSize: 110,
  },
  {
    id: 'game-ff-530dia',
    category: 'games',
    platform: 'other_games',
    nameAr: 'فري فاير - 530 جوهرة شحن فوري',
    nameEn: 'Free Fire - 530 Diamonds Instant',
    descriptionAr: 'شحن باقة النخبة من جواهر فري فاير فوراً.',
    descriptionEn: 'Elite Free Fire Diamonds bundle delivered in minutes.',
    fixedPrice: 420,
    packageSize: 530,
  },
  {
    id: 'smm-offer-ig-10k',
    category: 'smm',
    platform: 'offers',
    nameAr: '🔥 عرض اليوم: 10,000 متابع انستغرام ثابت',
    nameEn: '🔥 Special Offer: 10,000 Instagram Followers',
    descriptionAr: 'عرض حصرى مميز - متابعين جودة عالية مع ثبات كامل وضمان مدى الحياة بخصم 50%!',
    descriptionEn: 'Special deal of the day - High quality followers with lifetime non-drop warranty at 50% off!',
    pricePer1000: 80,
    minOrder: 10000,
    maxOrder: 10000,
  },
  {
    id: 'smm-offer-tt-5k',
    category: 'smm',
    platform: 'offers',
    nameAr: '⚡ عرض اليوم: 5,000 متابع تيك توك حقيقي',
    nameEn: '⚡ Special Offer: 5,000 TikTok Followers',
    descriptionAr: 'زيادة سريعة وآمنة لحسابك على تيك توك لتفعيل البث المباشر والأرباح!',
    descriptionEn: 'Quick and secure boost to activate TikTok stream and creator rewards!',
    pricePer1000: 100,
    minOrder: 5000,
    maxOrder: 5000,
  },
  {
    id: 'game-offer-pubg-660',
    category: 'games',
    platform: 'offers',
    nameAr: '🎁 عرض اليوم: 660 شدة ببجي + 60 شدة مجاناً',
    nameEn: '🎁 Special Offer: PUBG 660 UC + 60 Bonus',
    descriptionAr: 'شحن فوري ومباشر عن طريق الايدي الرسمي للاعب مع باقة إضافية مجانية بخصم مميز.',
    descriptionEn: 'Instant top-up via player ID plus a free bonus UC bundle.',
    fixedPrice: 500,
    packageSize: 720,
  }
];

export class StorageEngine {
  static deletedIds = new Set<string>();

  // Save or update changes non-destructively to avoid overwriting/deleting records from other devices
  static async syncChangesToFirestore<T extends { id: string }>(
    collectionName: string,
    oldList: T[],
    newList: T[]
  ): Promise<void> {
    // 1. Save new or modified items
    for (const item of newList) {
      const oldItem = oldList.find(o => o.id === item.id);
      if (!oldItem || JSON.stringify(oldItem) !== JSON.stringify(item)) {
        try {
          const cleaned = cleanObjectForFirestore(item);
          await setDoc(doc(db, collectionName, item.id), cleaned);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `${collectionName}/${item.id}`);
        }
      }
    }
  }

  // Non-destructive seed for first-time database initialization
  static async seedFirestoreCollection<T extends { id: string }>(
    collectionName: string,
    initialList: T[]
  ): Promise<void> {
    for (const item of initialList) {
      try {
        const cleaned = cleanObjectForFirestore(item);
        await setDoc(doc(db, collectionName, item.id), cleaned);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `${collectionName}/${item.id}`);
      }
    }
  }

  // Force-fetch all collections directly from Firestore to guarantee freshest data bypassing sync latency
  static async forceFetchAllFromFirestore(): Promise<void> {
    // Determine if we need first-time database initialization/seeding
    let needsSeeding = false;
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      if (usersSnap.empty) {
        needsSeeding = true;
      }
    } catch (err) {
      console.warn("Failed to check if db needs seeding:", err);
    }

    const collections = ['users', 'services', 'orders', 'payments', 'referrals', 'posts', 'mediations', 'admin_logs', 'settings', 'notifications'];
    for (const colName of collections) {
      try {
        if (needsSeeding) {
          let initialData: any[] = [];
          if (colName === 'users') {
            initialData = this.getUsersRaw();
          } else if (colName === 'services') {
            initialData = this.getServicesRaw();
          } else if (colName === 'orders') {
            initialData = this.getOrdersRaw();
          } else if (colName === 'payments') {
            initialData = this.getPaymentRequestsRaw();
          } else if (colName === 'referrals') {
            initialData = this.getReferralsRaw();
          } else if (colName === 'posts') {
            initialData = this.getPostsRaw();
          } else if (colName === 'mediations') {
            initialData = this.getMediationsRaw();
          } else if (colName === 'admin_logs') {
            initialData = this.getAdminLogsRaw();
          } else if (colName === 'settings') {
            initialData = this.getSystemSettingsRaw();
          }

          if (initialData.length > 0) {
            await this.seedFirestoreCollection(colName, initialData);
          }
        }

        const snap = await getDocs(collection(db, colName));
        const items: any[] = [];
        snap.forEach(doc => {
          items.push(doc.data());
        });

        items.sort((a, b) => {
          const timeA = a.createdAt || a.id;
          const timeB = b.createdAt || b.id;
          return String(timeA).localeCompare(String(timeB));
        });

        const storageKey = colName === 'payments' ? 'alnuaimi_payments' : (colName === 'admin_logs' ? 'alnuaimi_admin_logs' : `alnuaimi_${colName}`);
        localStorage.setItem(storageKey, JSON.stringify(items));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, colName);
      }
    }
  }

  // Active sync flag
  static isSyncing = false;

  // Real-time synchronization
  static initializeFirebaseSync(onUpdate: () => void): void {
    if (this.isSyncing) return;
    this.isSyncing = true;

    const collections = ['users', 'services', 'orders', 'payments', 'referrals', 'posts', 'mediations', 'admin_logs', 'settings', 'notifications'];

    collections.forEach(colName => {
      onSnapshot(collection(db, colName), (snapshot) => {
        const items: any[] = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data && data.id) {
            // Skip item if it is in the process of being deleted
            if (this.deletedIds.has(data.id)) {
              return;
            }
          }
          items.push(data);
        });

        // Clean up completed deletions from our deletedIds tracker
        const rawIds = new Set<string>();
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data && data.id) {
            rawIds.add(data.id);
          }
        });
        for (const id of Array.from(this.deletedIds)) {
          if (!rawIds.has(id)) {
            this.deletedIds.delete(id);
          }
        }

        const storageKey = colName === 'payments' ? 'alnuaimi_payments' : (colName === 'admin_logs' ? 'alnuaimi_admin_logs' : `alnuaimi_${colName}`);
        const localData = localStorage.getItem(storageKey);

        items.sort((a, b) => {
          const timeA = a.createdAt || a.id;
          const timeB = b.createdAt || b.id;
          return String(timeA).localeCompare(String(timeB));
        });

        const fetchedDataStr = JSON.stringify(items);
        let shouldUpdate = false;

        if (localData) {
          try {
            const parsedLocal = JSON.parse(localData);
            parsedLocal.sort((a: any, b: any) => {
              const timeA = a.createdAt || a.id;
              const timeB = b.createdAt || b.id;
              return String(timeA).localeCompare(String(timeB));
            });
            if (JSON.stringify(parsedLocal) !== fetchedDataStr) {
              shouldUpdate = true;
            }
          } catch (e) {
            shouldUpdate = true;
          }
        } else {
          shouldUpdate = true;
        }

        if (shouldUpdate) {
          localStorage.setItem(storageKey, fetchedDataStr);
          onUpdate();
        }
      }, (error) => {
        console.error(`Firestore real-time subscription error on ${colName}:`, error);
      });
    });
  }

  // Raw default getters for seeding
  private static getUsersRaw(): User[] {
    const data = localStorage.getItem('alnuaimi_users');
    if (!data) {
      return [
        {
          id: 'u-admin',
          email: 'haithamzaidalqsaap@gmail.com',
          password: 'admin',
          points: 5000,
          role: 'admin',
          referralCode: 'HAITHAM99',
          createdAt: new Date().toISOString()
        },
        {
          id: 'u-admin-test',
          email: 'admin@alnuaimi.com',
          password: 'admin',
          points: 10000,
          role: 'admin',
          referralCode: 'ALNUAIMI',
          createdAt: new Date().toISOString()
        },
        {
          id: 'u-user1',
          email: 'user@gmail.com',
          password: 'user',
          points: 1500,
          role: 'user',
          referralCode: 'USER77',
          createdAt: new Date().toISOString()
        }
      ];
    }
    return JSON.parse(data);
  }

  private static getServicesRaw(): Service[] {
    const data = localStorage.getItem('alnuaimi_services');
    if (!data) return DEFAULT_SERVICES;
    return JSON.parse(data);
  }

  private static getOrdersRaw(): Order[] {
    const data = localStorage.getItem('alnuaimi_orders');
    if (!data) {
      return [
        {
          id: 'ord-1',
          userId: 'u-user1',
          userEmail: 'user@gmail.com',
          serviceId: 'smm-ig-followers',
          serviceNameAr: 'متابعين انستغرام - حقيقيين ثابتين',
          serviceNameEn: 'Instagram Followers - Real Non-Drop',
          platform: 'instagram',
          category: 'smm',
          quantity: 1000,
          targetLinkOrId: 'https://instagram.com/haitham_alnuaimi',
          totalCost: 150,
          status: 'completed',
          createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
        },
        {
          id: 'ord-2',
          userId: 'u-user1',
          userEmail: 'user@gmail.com',
          serviceId: 'game-pubg-660uc',
          serviceNameAr: 'ببجي موبايل - 660 UC شحن فوري',
          serviceNameEn: 'PUBG Mobile - 660 UC Instant',
          platform: 'pubg',
          category: 'games',
          quantity: 1,
          targetLinkOrId: '5128394012',
          extraDetails: 'AL-NUAIMI',
          totalCost: 620,
          status: 'processing',
          createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
        }
      ];
    }
    return JSON.parse(data);
  }

  private static getPaymentRequestsRaw(): PaymentRequest[] {
    const data = localStorage.getItem('alnuaimi_payments');
    if (!data) {
      return [
        {
          id: 'pay-1',
          userId: 'u-user1',
          userEmail: 'user@gmail.com',
          amountPoints: 1000,
          amountCash: 10,
          method: 'Zain Cash',
          transactionId: 'TXN938210492',
          status: 'approved',
          createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
        }
      ];
    }
    return JSON.parse(data);
  }

  private static getReferralsRaw(): Referral[] {
    const data = localStorage.getItem('alnuaimi_referrals');
    if (!data) return [];
    return JSON.parse(data);
  }

  private static getPostsRaw(): UserPost[] {
    const data = localStorage.getItem('alnuaimi_posts');
    if (!data) return [];
    return JSON.parse(data);
  }

  private static getMediationsRaw(): MediationRequest[] {
    const data = localStorage.getItem('alnuaimi_mediations');
    if (!data) return [];
    return JSON.parse(data);
  }

  private static getAdminLogsRaw(): AdminLog[] {
    const data = localStorage.getItem('alnuaimi_admin_logs');
    if (!data) return [];
    return JSON.parse(data);
  }

  // Synchronous getters used by UI
  static getUsers(): User[] {
    const data = localStorage.getItem('alnuaimi_users');
    if (!data) {
      const initial = this.getUsersRaw();
      localStorage.setItem('alnuaimi_users', JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  }

  static async saveUsers(users: User[]): Promise<void> {
    const oldData = this.getUsers();
    localStorage.setItem('alnuaimi_users', JSON.stringify(users));
    await this.syncChangesToFirestore('users', oldData, users);
  }

  static getServices(): Service[] {
    const data = localStorage.getItem('alnuaimi_services');
    if (!data) {
      localStorage.setItem('alnuaimi_services', JSON.stringify(DEFAULT_SERVICES));
      return DEFAULT_SERVICES;
    }
    return JSON.parse(data);
  }

  static async saveServices(services: Service[]): Promise<void> {
    const oldData = this.getServices();
    localStorage.setItem('alnuaimi_services', JSON.stringify(services));
    await this.syncChangesToFirestore('services', oldData, services);
  }

  static getOrders(): Order[] {
    const data = localStorage.getItem('alnuaimi_orders');
    if (!data) {
      const initial = this.getOrdersRaw();
      localStorage.setItem('alnuaimi_orders', JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  }

  static async saveOrders(orders: Order[]): Promise<void> {
    const oldData = this.getOrders();
    localStorage.setItem('alnuaimi_orders', JSON.stringify(orders));
    await this.syncChangesToFirestore('orders', oldData, orders);
  }

  static getPaymentRequests(): PaymentRequest[] {
    const data = localStorage.getItem('alnuaimi_payments');
    if (!data) {
      const initial = this.getPaymentRequestsRaw();
      localStorage.setItem('alnuaimi_payments', JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  }

  static async savePaymentRequests(payments: PaymentRequest[]): Promise<void> {
    const oldData = this.getPaymentRequests();
    localStorage.setItem('alnuaimi_payments', JSON.stringify(payments));
    await this.syncChangesToFirestore('payments', oldData, payments);
  }

  static getReferrals(): Referral[] {
    const data = localStorage.getItem('alnuaimi_referrals');
    if (!data) {
      const initial = this.getReferralsRaw();
      localStorage.setItem('alnuaimi_referrals', JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  }

  static async saveReferrals(referrals: Referral[]): Promise<void> {
    const oldData = this.getReferrals();
    localStorage.setItem('alnuaimi_referrals', JSON.stringify(referrals));
    await this.syncChangesToFirestore('referrals', oldData, referrals);
  }

  static getPosts(): UserPost[] {
    const data = localStorage.getItem('alnuaimi_posts');
    if (!data) {
      const initial = this.getPostsRaw();
      localStorage.setItem('alnuaimi_posts', JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  }

  static async savePosts(posts: UserPost[]): Promise<void> {
    const oldData = this.getPosts();
    localStorage.setItem('alnuaimi_posts', JSON.stringify(posts));
    await this.syncChangesToFirestore('posts', oldData, posts);
  }

  static getMediations(): MediationRequest[] {
    const data = localStorage.getItem('alnuaimi_mediations');
    if (!data) {
      const initial = this.getMediationsRaw();
      localStorage.setItem('alnuaimi_mediations', JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  }

  static async saveMediations(mediations: MediationRequest[]): Promise<void> {
    const oldData = this.getMediations();
    localStorage.setItem('alnuaimi_mediations', JSON.stringify(mediations));
    await this.syncChangesToFirestore('mediations', oldData, mediations);
  }

  static getAdminLogs(): AdminLog[] {
    const data = localStorage.getItem('alnuaimi_admin_logs');
    if (!data) {
      const initial = this.getAdminLogsRaw();
      localStorage.setItem('alnuaimi_admin_logs', JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  }

  static async saveAdminLogs(logs: AdminLog[]): Promise<void> {
    const oldData = this.getAdminLogs();
    localStorage.setItem('alnuaimi_admin_logs', JSON.stringify(logs));
    await this.syncChangesToFirestore('admin_logs', oldData, logs);
  }

  static async addAdminLog(adminId: string, adminEmail: string, actionType: string, details: string): Promise<void> {
    const logs = this.getAdminLogs();
    const newLog: AdminLog = {
      id: 'log-' + Math.random().toString(36).substring(2, 11),
      adminId,
      adminEmail,
      actionType,
      details,
      createdAt: new Date().toISOString()
    };
    logs.push(newLog);
    await this.saveAdminLogs(logs);
  }

  static getNotifications(): AppNotification[] {
    const data = localStorage.getItem('alnuaimi_notifications');
    if (!data) return [];
    return JSON.parse(data);
  }

  static async saveNotifications(notifications: AppNotification[]): Promise<void> {
    const oldData = this.getNotifications();
    localStorage.setItem('alnuaimi_notifications', JSON.stringify(notifications));
    await this.syncChangesToFirestore('notifications', oldData, notifications);
  }

  static async addNotification(
    userId: string,
    titleAr: string,
    titleEn: string,
    messageAr: string,
    messageEn: string,
    type: 'order' | 'mediation' | 'general',
    targetId?: string
  ): Promise<void> {
    const notifications = this.getNotifications();
    const newNotif: AppNotification = {
      id: 'notif-' + Math.random().toString(36).substring(2, 11),
      userId,
      titleAr,
      titleEn,
      messageAr,
      messageEn,
      type,
      targetId,
      read: false,
      createdAt: new Date().toISOString()
    };
    notifications.push(newNotif);
    await this.saveNotifications(notifications);
  }

  // Session storage management for logging in
  static getSessionUser(): User | null {
    const userJson = sessionStorage.getItem('alnuaimi_session');
    if (!userJson) return null;
    const session = JSON.parse(userJson);
    const users = this.getUsers();
    const updated = users.find(u => u.id === session.id);
    if (updated) {
      sessionStorage.setItem('alnuaimi_session', JSON.stringify(updated));
      return updated;
    }
    return session;
  }

  static setSessionUser(user: User | null): void {
    if (user) {
      sessionStorage.setItem('alnuaimi_session', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('alnuaimi_session');
    }
  }

  static deleteUser(userId: string): void {
    this.deletedIds.add(userId);
    const users = this.getUsers().filter(u => u.id !== userId);
    localStorage.setItem('alnuaimi_users', JSON.stringify(users));
    deleteDoc(doc(db, 'users', userId)).catch(err => {
      handleFirestoreError(err, OperationType.DELETE, `users/${userId}`);
    });
  }

  static deleteService(serviceId: string): void {
    this.deletedIds.add(serviceId);
    const services = this.getServices().filter(s => s.id !== serviceId);
    localStorage.setItem('alnuaimi_services', JSON.stringify(services));
    deleteDoc(doc(db, 'services', serviceId)).catch(err => {
      handleFirestoreError(err, OperationType.DELETE, `services/${serviceId}`);
    });
  }

  static deletePost(postId: string): void {
    this.deletedIds.add(postId);
    const posts = this.getPosts().filter(p => p.id !== postId);
    localStorage.setItem('alnuaimi_posts', JSON.stringify(posts));
    deleteDoc(doc(db, 'posts', postId)).catch(err => {
      handleFirestoreError(err, OperationType.DELETE, `posts/${postId}`);
    });
  }

  static deleteMediation(mediationId: string): void {
    this.deletedIds.add(mediationId);
    const mediations = this.getMediations().filter(m => m.id !== mediationId);
    localStorage.setItem('alnuaimi_mediations', JSON.stringify(mediations));
    deleteDoc(doc(db, 'mediations', mediationId)).catch(err => {
      handleFirestoreError(err, OperationType.DELETE, `mediations/${mediationId}`);
    });
  }

  // System Settings contact details
  private static getSystemSettingsRaw(): SystemSettings[] {
    const data = localStorage.getItem('alnuaimi_settings');
    if (!data) {
      return [
        {
          id: 'contacts',
          telegramChannel: 'https://t.me/predatorxi',
          telegramDetail: '@predatorxi',
          whatsappLink: 'https://wa.me/9647502302723',
          whatsappDetail: '07502302723'
        }
      ];
    }
    return JSON.parse(data);
  }

  static getContactSettings(): SystemSettings {
    const settings = this.getSystemSettingsRaw();
    const contact = settings.find(s => s.id === 'contacts');
    if (contact) return contact;
    return {
      id: 'contacts',
      telegramChannel: 'https://t.me/predatorxi',
      telegramDetail: '@predatorxi',
      whatsappLink: 'https://wa.me/9647502302723',
      whatsappDetail: '07502302723'
    };
  }

  static async saveContactSettings(contact: SystemSettings): Promise<void> {
    const oldData = this.getSystemSettingsRaw();
    const newList = [contact];
    localStorage.setItem('alnuaimi_settings', JSON.stringify(newList));
    await this.syncChangesToFirestore('settings', oldData, newList);
  }
}
