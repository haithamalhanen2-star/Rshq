import React, { useState, useEffect } from 'react';
import { User, Service, Order } from '../types';
import { StorageEngine } from '../lib/storage';
import { translations, Language } from '../lib/translations';
import { motion } from 'motion/react';
const offersTodayBanner = "/src/assets/images/offers_today_1783080453671.jpg";
import { 
  Instagram, 
  Facebook, 
  Youtube, 
  Send, 
  Twitter, 
  Gamepad2, 
  Search, 
  Sparkles, 
  AlertCircle, 
  CheckCircle, 
  ArrowRightLeft, 
  TrendingUp, 
  Award, 
  Clock, 
  Layers,
  ArrowLeft,
  ArrowRight,
  X,
  Wallet,
  ShoppingBag,
  Mail
} from 'lucide-react';
import { UserPost } from '../types';

interface HomeSectionProps {
  lang: Language;
  user: User;
  onOrderPlaced: () => void;
  refreshTrigger?: number;
}

export default function HomeSection({ lang, user, onOrderPlaced, refreshTrigger }: HomeSectionProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Marketplace states
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [marketFilter, setMarketFilter] = useState<'all' | 'sell' | 'buy'>('all');
  
  // Ordering state
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [orderStep, setOrderStep] = useState<'summary' | 'form'>('summary');
  const [quantity, setQuantity] = useState<number>(1000);
  const [targetLinkOrId, setTargetLinkOrId] = useState('');
  const [extraDetails, setExtraDetails] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedDescriptionService, setSelectedDescriptionService] = useState<Service | null>(null);

  const t = translations[lang];

  useEffect(() => {
    // Load services from Storage
    setServices(StorageEngine.getServices());
  }, [refreshTrigger]);

  useEffect(() => {
    // Load approved posts
    setPosts(StorageEngine.getPosts().filter(p => p.status === 'approved'));
  }, [refreshTrigger]);

  // Filter lists
  const staticSections = [
    {
      id: 'offers',
      labelAr: 'عروض اليوم',
      labelEn: "Today's Offers",
      category: 'all',
      platform: 'offers',
      color: 'bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-600',
      isOffer: true
    },
    {
      id: 'instagram',
      labelAr: 'خدمات انستكرام',
      labelEn: 'Instagram Services',
      category: 'smm',
      platform: 'instagram',
      color: 'bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600'
    },
    {
      id: 'telegram',
      labelAr: 'خدمات تلكرام',
      labelEn: 'Telegram Services',
      category: 'smm',
      platform: 'telegram',
      color: 'bg-[#24A1DE]'
    },
    {
      id: 'tiktok',
      labelAr: 'خدمات تيك توك',
      labelEn: 'TikTok Services',
      category: 'smm',
      platform: 'tiktok',
      color: 'bg-black'
    },
    {
      id: 'youtube',
      labelAr: 'خدمات يوتيوب',
      labelEn: 'YouTube Services',
      category: 'smm',
      platform: 'youtube',
      color: 'bg-[#FF0000]'
    },
    {
      id: 'facebook',
      labelAr: 'خدمات فيسبوك',
      labelEn: 'Facebook Services',
      category: 'smm',
      platform: 'facebook',
      color: 'bg-[#1877F2]'
    },
    {
      id: 'twitter',
      labelAr: 'خدمات تويتر',
      labelEn: 'Twitter Services',
      category: 'smm',
      platform: 'twitter',
      color: 'bg-black'
    },
    {
      id: 'games',
      labelAr: 'شحن ألعاب والبطاقات',
      labelEn: 'Game Top-Up',
      category: 'games',
      platform: 'games',
      color: 'bg-gradient-to-tr from-teal-500 to-emerald-600'
    }
  ];

  // Dynamically find other platforms (e.g. from custom platforms added by admin)
  const knownPlatforms = new Set(staticSections.map(s => s.platform.toLowerCase()));
  const dynamicSections: typeof staticSections = [];

  services.forEach(service => {
    const platLower = service.platform?.toLowerCase();
    const catLower = service.category?.toLowerCase();
    if (
      platLower && 
      !knownPlatforms.has(platLower) && 
      platLower !== 'all' && 
      platLower !== 'games' && 
      platLower !== 'offers' &&
      platLower !== 'pubg' &&
      platLower !== 'yalla_ludo' &&
      platLower !== 'other_games' &&
      catLower !== 'games'
    ) {
      const exists = dynamicSections.some(s => s.id === platLower);
      if (!exists) {
        const capitalized = service.platform.charAt(0).toUpperCase() + service.platform.slice(1);
        dynamicSections.push({
          id: platLower,
          labelAr: `خدمات ${service.platform}`,
          labelEn: `${capitalized} Services`,
          category: service.category,
          platform: service.platform,
          color: 'bg-gradient-to-tr from-indigo-500 to-purple-600'
        });
      }
    }
  });

  const sectionsList = [...staticSections, ...dynamicSections];

  const getServiceCountForSection = (section: typeof sectionsList[0]) => {
    if (section.id === 'games') {
      return services.filter(s => s.category === 'games').length;
    }
    if (section.id === 'offers') {
      return services.filter(s => s.platform?.toLowerCase() === 'offers').length;
    }
    return services.filter(s => s.platform?.toLowerCase() === section.platform?.toLowerCase()).length;
  };

  const renderSectionIcon = (platformId: string, color: string) => {
    const iconClass = "w-7 h-7 text-white";
    switch (platformId) {
      case 'offers':
        return (
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-md shadow-orange-500/10 ${color}`}>
            <Sparkles className="w-7 h-7 text-white animate-pulse" />
          </div>
        );
      case 'instagram':
        return (
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-md shadow-pink-500/10 ${color}`}>
            <Instagram className={iconClass} />
          </div>
        );
      case 'telegram':
        return (
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-md shadow-sky-500/10 ${color}`}>
            <Send className="w-6.5 h-6.5 -translate-x-0.5 translate-y-0.5 rotate-45" />
          </div>
        );
      case 'tiktok':
        return (
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-md shadow-black/10 ${color}`}>
            <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.95 1.14 2.29 1.88 3.73 2.15v3.91a8.21 8.21 0 0 1-5.18-1.72c-.11-.08-.22-.16-.31-.25v6.52c-.05 1.88-.65 3.73-1.72 5.2a8.3 8.3 0 0 1-5.44 3.75 8.44 8.44 0 0 1-6.73-1.16c-1.63-1.11-2.91-2.73-3.6-4.59A8.32 8.32 0 0 1 .46 11.23a8.35 8.35 0 0 1 3.59-5.74 8.36 8.36 0 0 1 5.39-1.57c.01 1.29.01 2.58.01 3.87-.93-.27-1.93-.2-2.79.22a4.42 4.42 0 0 0-2.45 3.39c-.27 1.45.15 2.99 1.13 4.04a4.42 4.42 0 0 0 4.19 1.44c1.19-.24 2.22-1.04 2.76-2.14.3-.61.43-1.3.42-1.99V.02z" />
            </svg>
          </div>
        );
      case 'youtube':
        return (
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-md shadow-red-500/10 ${color}`}>
            <Youtube className={iconClass} />
          </div>
        );
      case 'facebook':
        return (
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-md shadow-blue-600/10 ${color}`}>
            <Facebook className={iconClass} />
          </div>
        );
      case 'twitter':
        return (
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-md shadow-slate-950/10 ${color}`}>
            <Twitter className={iconClass} />
          </div>
        );
      case 'games':
        return (
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-md shadow-emerald-600/10 ${color}`}>
            <Gamepad2 className={iconClass} />
          </div>
        );
      default:
        return (
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-md ${color}`}>
            <Sparkles className={iconClass} />
          </div>
        );
    }
  };

  const renderSectionIconMini = (platformId: string) => {
    const iconClass = "w-4.5 h-4.5 text-white";
    const wrapperClass = "w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm";
    switch (platformId?.toLowerCase()) {
      case 'offers':
        return (
          <div className={`${wrapperClass} bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-600`}>
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
        );
      case 'instagram':
        return (
          <div className={`${wrapperClass} bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600`}>
            <Instagram className={iconClass} />
          </div>
        );
      case 'telegram':
        return (
          <div className={`${wrapperClass} bg-[#24A1DE]`}>
            <Send className="w-3.5 h-3.5 -translate-x-0.2 translate-y-0.2 rotate-45" />
          </div>
        );
      case 'tiktok':
        return (
          <div className={`${wrapperClass} bg-black`}>
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.95 1.14 2.29 1.88 3.73 2.15v3.91a8.21 8.21 0 0 1-5.18-1.72c-.11-.08-.22-.16-.31-.25v6.52c-.05 1.88-.65 3.73-1.72 5.2a8.3 8.3 0 0 1-5.44 3.75 8.44 8.44 0 0 1-6.73-1.16c-1.63-1.11-2.91-2.73-3.6-4.59A8.32 8.32 0 0 1 .46 11.23a8.35 8.35 0 0 1 3.59-5.74 8.36 8.36 0 0 1 5.39-1.57c.01 1.29.01 2.58.01 3.87-.93-.27-1.93-.2-2.79.22a4.42 4.42 0 0 0-2.45 3.39c-.27 1.45.15 2.99 1.13 4.04a4.42 4.42 0 0 0 4.19 1.44c1.19-.24 2.22-1.04 2.76-2.14.3-.61.43-1.3.42-1.99V.02z" />
            </svg>
          </div>
        );
      case 'youtube':
        return (
          <div className={`${wrapperClass} bg-[#FF0000]`}>
            <Youtube className={iconClass} />
          </div>
        );
      case 'facebook':
        return (
          <div className={`${wrapperClass} bg-[#1877F2]`}>
            <Facebook className={iconClass} />
          </div>
        );
      case 'twitter':
        return (
          <div className={`${wrapperClass} bg-black`}>
            <Twitter className={iconClass} />
          </div>
        );
      case 'pubg':
      case 'yalla_ludo':
      case 'other_games':
        return (
          <div className={`${wrapperClass} bg-gradient-to-tr from-teal-500 to-emerald-600`}>
            <Gamepad2 className={iconClass} />
          </div>
        );
      default:
        return (
          <div className={`${wrapperClass} bg-indigo-600`}>
            <Sparkles className={iconClass} />
          </div>
        );
    }
  };

  const platformsSmm = [
    { id: 'all', labelAr: 'الكل', labelEn: 'All', icon: Layers },
    { id: 'facebook', labelAr: 'فيسبوك', labelEn: 'Facebook', icon: Facebook },
    { id: 'tiktok', labelAr: 'تيك توك', labelEn: 'TikTok', icon: TrendingUp },
    { id: 'instagram', labelAr: 'انستغرام', labelEn: 'Instagram', icon: Instagram },
    { id: 'telegram', labelAr: 'تليجرام', labelEn: 'Telegram', icon: Send },
    { id: 'twitter', labelAr: 'تويتر (X)', labelEn: 'Twitter (X)', icon: Twitter },
    { id: 'youtube', labelAr: 'يوتيوب', labelEn: 'YouTube', icon: Youtube },
  ];

  const platformsGames = [
    { id: 'all', labelAr: 'الكل', labelEn: 'All', icon: Layers },
    { id: 'pubg', labelAr: 'ببجي موبايل', labelEn: 'PUBG Mobile', icon: Gamepad2 },
    { id: 'yalla_ludo', labelAr: 'يلا لودو', labelEn: 'Yalla Ludo', icon: TrophyIcon },
    { id: 'other_games', labelAr: 'ألعاب أخرى', labelEn: 'Other Games', icon: Gamepad2 },
  ];

  // Dynamic platforms builder
  const getPlatformsForCategory = () => {
    let baseList = selectedCategory === 'games' 
      ? platformsGames 
      : (selectedCategory === 'smm' 
          ? platformsSmm 
          : [{ id: 'all', labelAr: 'الكل', labelEn: 'All', icon: Layers }]);
    
    const activeServices = services.filter(s => selectedCategory === 'all' || s.category === selectedCategory);
    const customPlatforms = activeServices
      .map(s => s.platform)
      .filter(p => !baseList.some(item => item.id === p));
    
    const uniqueCustom = Array.from(new Set(customPlatforms)) as string[];
    const fullList = [...baseList];
    uniqueCustom.forEach(plat => {
      fullList.push({
        id: plat,
        labelAr: plat,
        labelEn: plat,
        icon: Sparkles
      });
    });
    
    return fullList;
  };

  // Dynamic categories list
  const uniqueCategories = Array.from(new Set(services.map(s => s.category))) as string[];
  const categoriesList = [
    { id: 'all', labelAr: 'الكل', labelEn: 'All', icon: Layers },
    { id: 'smm', labelAr: 'رشق ومتابعين', labelEn: 'SMM Services', icon: TrendingUp },
    { id: 'games', labelAr: 'شحن ألعاب', labelEn: 'Game Charging', icon: Gamepad2 },
  ];
  
  uniqueCategories.forEach(cat => {
    if (cat !== 'smm' && cat !== 'games' && cat) {
      categoriesList.push({
        id: cat,
        labelAr: cat === 'custom' ? (lang === 'ar' ? 'مخصص' : 'Custom') : cat,
        labelEn: cat === 'custom' ? 'Custom' : cat,
        icon: Sparkles
      });
    }
  });

  function TrophyIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
        <path d="M12 2a6 6 0 0 1 6 6v5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6z" />
      </svg>
    );
  }

  // Handle Category Change
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSelectedPlatform('all');
    setSelectedService(null);
  };

  // Filter Services
  const filteredServices = services.filter(service => {
    // 1. Category check
    if (selectedCategory !== 'all' && service.category !== selectedCategory) {
      return false;
    }
    // 2. Platform check
    if (selectedPlatform !== 'all' && selectedPlatform !== 'games' && service.platform?.toLowerCase() !== selectedPlatform.toLowerCase()) {
      return false;
    }
    // 3. Search query check
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchAr = service.nameAr.toLowerCase().includes(q) || service.descriptionAr.toLowerCase().includes(q);
      const matchEn = service.nameEn.toLowerCase().includes(q) || service.descriptionEn.toLowerCase().includes(q);
      const matchPlatform = service.platform.toLowerCase().includes(q);
      return matchAr || matchEn || matchPlatform;
    }
    return true;
  });

  // Calculate order price live
  const calculateCost = (service: Service, qty: number) => {
    if (service.category !== 'games') {
      const pricePer1000 = service.pricePer1000 || 0;
      return Math.round((qty / 1000) * pricePer1000);
    } else {
      return service.fixedPrice || 0;
    }
  };

  // Pre-fill quantity when service changes
  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setOrderStep('summary');
    setError('');
    setSuccess('');
    if (service.category !== 'games') {
      setQuantity(service.minOrder || 1000);
    } else {
      setQuantity(1);
    }
    setTargetLinkOrId('');
    setExtraDetails('');
  };

  // Submit Order
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedService) return;

    if (!targetLinkOrId.trim()) {
      setError(t.requiredLinkOrId);
      return;
    }

    // Validation quantity
    if (selectedService.category !== 'games') {
      const min = selectedService.minOrder || 100;
      const max = selectedService.maxOrder || 10000;
      if (quantity < min || quantity > max) {
        setError(t.invalidQuantity);
        return;
      }
    }

    const cost = calculateCost(selectedService, quantity);

    // Points balance check
    const users = StorageEngine.getUsers();
    const currentUserIndex = users.findIndex(u => u.id === user.id);
    if (currentUserIndex === -1) return;

    if (users[currentUserIndex].points < cost) {
      setError(t.notEnoughPoints);
      return;
    }

    // Deduct points
    users[currentUserIndex].points -= cost;
    StorageEngine.saveUsers(users);

    // Push new order
    const orders = StorageEngine.getOrders();
    const newOrder: Order = {
      id: 'ord-' + Math.floor(100000 + Math.random() * 900000),
      userId: user.id,
      userEmail: user.email,
      serviceId: selectedService.id,
      serviceNameAr: selectedService.nameAr,
      serviceNameEn: selectedService.nameEn,
      platform: selectedService.platform,
      category: selectedService.category,
      quantity: selectedService.category !== 'games' ? quantity : (selectedService.packageSize || 1),
      targetLinkOrId: targetLinkOrId,
      extraDetails: extraDetails,
      totalCost: cost,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    orders.push(newOrder);
    StorageEngine.saveOrders(orders);

    StorageEngine.addNotification(
      'admin',
      `طلب جديد: ${newOrder.serviceNameAr}`,
      `New Order: ${newOrder.serviceNameEn}`,
      `قام المستخدم ${user.email} بطلب خدمة ${newOrder.serviceNameAr} بكمية ${newOrder.quantity} وبتكلفة ${cost} نقطة.`,
      `User ${user.email} ordered ${newOrder.serviceNameEn} (Qty: ${newOrder.quantity}) for ${cost} points.`,
      'order',
      newOrder.id
    );

    setSuccess(t.orderSuccess);
    setSelectedService(null);
    onOrderPlaced(); // notify parent to refresh user info & orders list
  };

  return (
    <div className="space-y-6 pb-24 text-right" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Banner Intro */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 to-indigo-950 p-6 md:p-8 border border-indigo-200/20 shadow-lg shadow-indigo-100/40 text-white">
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-white/10 text-emerald-300 rounded-full border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              {lang === 'ar' ? 'خصم خاص 15% على شحن ألعاب هذا الأسبوع!' : 'Special 15% discount on Games Top-up this week!'}
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
              {lang === 'ar' ? 'اختر خدمتك وابدأ الانتشار فوراً' : 'Boost Your Social Traffic and Top-Up Seamlessly'}
            </h2>
            <p className="text-indigo-100 text-xs md:text-sm">
              {lang === 'ar' 
                ? 'استمتع بأقوى نظام رشق آلي سريع وموثوق لدعم حسابات فيسبوك، تيك توك، انستغرام، يوتيوب وألعابك المفضلة كببجي ويلا لودو.' 
                : 'Premium SMM provider and top-up portal for Instagram, TikTok, Facebook, PUBG and more.'}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center flex-shrink-0 min-w-[140px] shadow-inner">
            <p className="text-indigo-200 text-[10px] uppercase font-bold tracking-wider mb-1">
              {t.userPoints}
            </p>
            <p className="text-2xl font-black text-emerald-300">
              {user.points.toLocaleString('en-US')}
            </p>
            <p className="text-indigo-200 text-[10px] mt-1">
              {lang === 'ar' ? 'نقاط جاهزة' : 'Points Active'}
            </p>
          </div>
        </div>
      </div>

      {/* Sections and Platforms Title & Grid (الأقسام) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-extrabold text-indigo-950 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
            <span>{lang === 'ar' ? 'الأقسام والمنصات الرئيسية' : 'Categories & Platforms'}</span>
          </h3>
          {(selectedPlatform !== 'all' || selectedCategory !== 'all') && (
            <button 
              onClick={() => { setSelectedCategory('all'); setSelectedPlatform('all'); setSelectedService(null); }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-100/50 transition-all shadow-sm"
            >
              {lang === 'ar' ? 'إعادة تعيين / الكل' : 'Reset / View All'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {sectionsList.map(section => {
            const isSelected = selectedPlatform.toLowerCase() === section.platform.toLowerCase() && 
              (section.id === 'games' 
                ? selectedCategory === 'games' 
                : (section.id === 'offers' 
                    ? selectedPlatform.toLowerCase() === 'offers' 
                    : selectedCategory.toLowerCase() === section.category.toLowerCase()));
            const count = getServiceCountForSection(section);

            return (
              <motion.button
                key={section.id}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (isSelected) {
                    // Toggle off to show all SMM
                    setSelectedCategory('all');
                    setSelectedPlatform('all');
                  } else {
                    setSelectedCategory(section.category);
                    setSelectedPlatform(section.platform);
                  }
                  setSelectedService(null);
                }}
                className={`p-5 rounded-3xl border text-center flex flex-col items-center justify-center gap-3.5 transition-all bg-white relative overflow-hidden ${
                  isSelected
                    ? 'border-indigo-600 shadow-lg shadow-indigo-100/50 ring-2 ring-indigo-500/10'
                    : 'border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Brand Logo Wrapper */}
                {renderSectionIcon(section.id, section.color)}

                {/* Text details */}
                <div className="space-y-0.5 text-center">
                  <h4 className="font-extrabold text-slate-900 text-xs md:text-sm">
                    {lang === 'ar' ? section.labelAr : section.labelEn}
                  </h4>
                  <span className="inline-block text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                    {lang === 'ar' ? `خدمات : ${count}` : `${count} Services`}
                  </span>
                </div>

                {/* Small indicator when selected */}
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-indigo-600 animate-ping"></div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* User Marketplace / سوق المستخدمين (بيع وشراء) */}
      <div className="space-y-4 pt-6 border-t border-slate-200/50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1">
          <h3 className="text-base font-extrabold text-indigo-950 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#58309a] animate-pulse" />
            <span>{lang === 'ar' ? 'سوق المستخدمين (بيع وشراء)' : 'User Marketplace (Buy & Sell)'}</span>
          </h3>
          
          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
            <button
              type="button"
              onClick={() => setMarketFilter('all')}
              className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all shrink-0 ${
                marketFilter === 'all' 
                  ? 'bg-[#58309a] text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {lang === 'ar' ? 'جميع الإعلانات' : 'All Ads'}
            </button>
            <button
              type="button"
              onClick={() => setMarketFilter('sell')}
              className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all shrink-0 ${
                marketFilter === 'sell' 
                  ? 'bg-rose-600 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {lang === 'ar' ? 'منشورات البيع' : 'Sell Posts'}
            </button>
            <button
              type="button"
              onClick={() => setMarketFilter('buy')}
              className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all shrink-0 ${
                marketFilter === 'buy' 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {lang === 'ar' ? 'منشورات الشراء' : 'Buy Posts'}
            </button>
          </div>
        </div>

        {/* Grid or list of approved posts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(() => {
            const displayedPosts = posts.filter(post => {
              if (marketFilter === 'all') return true;
              return post.type === marketFilter;
            });

            if (displayedPosts.length === 0) {
              return (
                <div className="col-span-full bg-white border border-slate-100 rounded-3xl p-8 text-center text-slate-400 text-xs">
                  {lang === 'ar' 
                    ? 'لا توجد أي منشورات معتمدة معروضة حالياً في هذا القسم. اضغط على زر "إضافة منشور" في الشريط بالأسفل لنشر إعلانك!' 
                    : 'No approved posts available in this category. Click "Add Post" in the bottom bar to publish yours!'}
                </div>
              );
            }

            return displayedPosts.map(post => (
              <motion.div
                key={post.id}
                whileHover={{ y: -4 }}
                className="border border-slate-100 rounded-3xl p-5 transition-all text-right bg-white shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  {/* Badges row */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                      post.type === 'sell'
                        ? 'bg-rose-50 text-rose-600 border border-rose-100'
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                      {post.type === 'sell' ? (lang === 'ar' ? 'بيع' : 'Sell') : (lang === 'ar' ? 'شراء' : 'Buy')}
                    </span>
                    <span className="text-xs font-black text-[#58309a] bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                      {post.price}
                    </span>
                  </div>

                  {/* Post content */}
                  <h4 className="font-extrabold text-slate-900 text-sm mt-3.5 leading-tight line-clamp-1">
                    {post.title}
                  </h4>
                  <p className="text-slate-500 text-[11px] mt-1.5 leading-relaxed line-clamp-3">
                    {post.description}
                  </p>

                  {/* Optional Image */}
                  {post.image && (
                    <div className="mt-3.5 rounded-2xl overflow-hidden border border-slate-100 h-28 bg-slate-50 flex items-center justify-center">
                      <img 
                        src={post.image} 
                        alt={post.title} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover select-none" 
                      />
                    </div>
                  )}
                </div>

                {/* Footer contact details */}
                <div className="flex items-center justify-between gap-2 mt-4 pt-3.5 border-t border-slate-100">
                  <div className="flex flex-col items-start min-w-0 text-right space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold truncate flex items-center gap-1.5 min-w-0">
                      <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="truncate">{post.userEmail}</span>
                    </span>
                    {post.contactMethod && (
                      <span className="text-[10px] text-emerald-600 font-bold truncate flex items-center gap-1.5 min-w-0">
                        <Send className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span className="truncate">{post.contactMethod}</span>
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const valueToCopy = post.contactMethod || post.userEmail;
                      navigator.clipboard.writeText(valueToCopy);
                      alert(
                        lang === 'ar' 
                          ? `تم نسخ وسيلة التواصل الخاصة بالمعلن: ${valueToCopy}` 
                          : `Advertiser contact copied: ${valueToCopy}`
                      );
                    }}
                    className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-100/50 transition-all shrink-0"
                  >
                    {lang === 'ar' ? 'تواصل' : 'Contact'}
                  </button>
                </div>
              </motion.div>
            ));
          })()}
        </div>
      </div>

      {/* Services & Ordering Modal - ONLY shown when a platform/box is selected */}
      {selectedPlatform !== 'all' && (
        <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-md z-50 overflow-y-auto p-4 flex justify-center items-center">
          <div 
            className="bg-white border border-slate-100 rounded-[32px] w-full max-w-2xl shadow-2xl animate-fade-in my-auto flex flex-col max-h-[90vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            {selectedService ? (
              <div className="p-5 bg-[#58309a] text-white flex items-center justify-between gap-4 select-none">
                {/* Back / Close button */}
                {orderStep === 'form' ? (
                  <button 
                    type="button"
                    onClick={() => {
                      setOrderStep('summary');
                      setError('');
                    }}
                    className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all shrink-0"
                  >
                    {lang === 'ar' ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={() => {
                      setSelectedService(null);
                      setError('');
                    }}
                    className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all shrink-0"
                  >
                    {lang === 'ar' ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
                  </button>
                )}

                <h3 className="text-sm md:text-base font-black text-white text-right flex-1 select-none pr-1 truncate">
                  {lang === 'ar' ? selectedService.nameAr : selectedService.nameEn}
                </h3>

                {/* X button on the other side to close the modal entirely */}
                <button 
                  type="button"
                  onClick={() => {
                    setSelectedPlatform('all');
                    setSelectedCategory('all');
                    setSelectedService(null);
                    setSearchQuery('');
                    setError('');
                    setSuccess('');
                  }}
                  className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="p-5 pb-4 border-b border-slate-100 flex items-center justify-between gap-4">
                <button 
                  onClick={() => {
                    setSelectedPlatform('all');
                    setSelectedCategory('all');
                    setSelectedService(null);
                    setSearchQuery('');
                    setError('');
                    setSuccess('');
                  }}
                  className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/50 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all shadow-sm shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100/60">
                    {filteredServices.length} {lang === 'ar' ? 'خدمة' : 'Services'}
                  </span>
                  <h3 className="text-base font-black text-indigo-950 flex items-center gap-2">
                    <span>
                      {(() => {
                        const found = sectionsList.find(s => s.platform.toLowerCase() === selectedPlatform.toLowerCase());
                        return found ? (lang === 'ar' ? found.labelAr : found.labelEn) : selectedPlatform;
                      })()}
                    </span>
                  </h3>
                </div>
              </div>
            )}

            {/* Modal Body / Scrollable Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Case 1: Success Message */}
              {success ? (
                <div className="text-center py-8 space-y-4 max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle className="w-10 h-10 animate-bounce" />
                  </div>
                  <h4 className="text-lg font-black text-slate-900">
                    {lang === 'ar' ? 'تم تقديم طلبك بنجاح!' : 'Order Placed Successfully!'}
                  </h4>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    {success}
                  </p>
                  <button
                    onClick={() => {
                      setSuccess('');
                      setSelectedService(null);
                      setSelectedPlatform('all');
                      setSelectedCategory('all');
                      setSearchQuery('');
                    }}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-500/15"
                  >
                    {lang === 'ar' ? 'العودة للرئيسية' : 'Return to Home'}
                  </button>
                </div>
              ) : selectedService ? (
                /* Case 2: Ordering Form (Step 2) */
                orderStep === 'summary' ? (
                  <div className="space-y-6">
                    {/* The beautiful purple summary container */}
                    <div className="bg-[#58309a] rounded-[2rem] p-6 text-white text-right relative overflow-hidden shadow-xl">
                      {/* Subtly animated decorative blur circles inside */}
                      <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
                      <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-400/10 rounded-full blur-3xl pointer-events-none"></div>

                      <h3 className="text-lg font-black text-center mb-6 leading-tight select-none">
                        {lang === 'ar' ? selectedService.nameAr : selectedService.nameEn}
                      </h3>

                      {/* Three-column stats grid inside the purple card */}
                      <div className="grid grid-cols-3 gap-2 border border-white/10 rounded-2xl bg-white/5 p-4 text-center divide-x divide-white/10 rtl:divide-x-reverse">
                        <div className="space-y-1">
                          <span className="text-[10px] text-purple-200 block font-bold leading-none">
                            {selectedService.category !== 'games' 
                              ? (lang === 'ar' ? 'المعدل لكل 1000' : 'Rate per 1000') 
                              : (lang === 'ar' ? 'السعر الثابت' : 'Fixed Price')
                            }
                          </span>
                          <span className="text-base font-black text-white block">
                            {selectedService.category !== 'games' 
                              ? (selectedService.pricePer1000?.toLocaleString('en-US') ?? '0') 
                              : (selectedService.fixedPrice?.toLocaleString('en-US') ?? '0')
                            }
                          </span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-purple-200 block font-bold leading-none">
                            {lang === 'ar' ? 'اقل طلب' : 'Min Order'}
                          </span>
                          <span className="text-base font-black text-white block">
                            {selectedService.category !== 'games' ? (selectedService.minOrder?.toLocaleString('en-US') ?? '100') : '1'}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-purple-200 block font-bold leading-none">
                            {lang === 'ar' ? 'اقصى طلب' : 'Max Order'}
                          </span>
                          <span className="text-base font-black text-white block truncate px-1">
                            {selectedService.category !== 'games' ? (selectedService.maxOrder?.toLocaleString('en-US') ?? '1,000,000') : '1'}
                          </span>
                        </div>
                      </div>

                      {/* Green button inside the purple container */}
                      <button
                        type="button"
                        onClick={() => setOrderStep('form')}
                        className="w-full mt-6 py-3.5 px-4 bg-[#239934] hover:bg-[#1e852d] active:scale-[0.99] text-white font-extrabold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2"
                      >
                        <ShoppingBag className="w-5 h-5 shrink-0" />
                        <span>{lang === 'ar' ? 'شراء هذه الخدمة' : 'Purchase This Service'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Case 2.2: Ordering Input Form (Step 2) */
                  <form onSubmit={handlePlaceOrder} className="space-y-4 text-right">
                    {error && (
                      <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl text-center flex items-center justify-center gap-2 font-bold">
                        <AlertCircle className="w-4 h-4" />
                        <span>{error}</span>
                      </div>
                    )}

                    {/* Points Status Row (Grid) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Total Points Box */}
                      <div className="bg-slate-100/70 border border-slate-200/40 rounded-2xl p-4 flex items-center justify-between gap-4">
                        <div className="w-9 h-9 rounded-xl bg-slate-200/60 flex items-center justify-center text-slate-500 shrink-0">
                          <Wallet className="w-5 h-5" />
                        </div>
                        <div className="text-right flex-1 min-w-0">
                          <span className="text-[10px] text-slate-500 font-bold block mb-0.5 leading-none">
                            {lang === 'ar' ? 'نقاطك الكلية' : 'Your Total Points'}
                          </span>
                          <span className="text-base font-black text-slate-800 leading-tight block">
                            {user.points?.toLocaleString('en-US') ?? 0} {t.points}
                          </span>
                        </div>
                      </div>

                      {/* Deducted Points Box */}
                      <div className="bg-slate-100/70 border border-slate-200/40 rounded-2xl p-4 flex items-center justify-between gap-4">
                        <div className="w-9 h-9 rounded-xl bg-slate-200/60 flex items-center justify-center text-slate-500 shrink-0">
                          <Wallet className="w-5 h-5" />
                        </div>
                        <div className="text-right flex-1 min-w-0">
                          <span className="text-[10px] text-slate-500 font-bold block mb-0.5 leading-none">
                            {lang === 'ar' ? 'النقاط التي سيتم استقطاعها منك' : 'Points To Deduct'}
                          </span>
                          <span className="text-base font-black text-indigo-700 leading-tight block">
                            {calculateCost(selectedService, quantity)?.toLocaleString('en-US') ?? 0} {t.points}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Notes Box */}
                    <div className="bg-[#f0eefc] border border-[#e1dcf7] rounded-2xl p-4 text-right">
                      <span className="text-xs font-black text-indigo-950 block mb-1">
                        {lang === 'ar' ? 'الملاحظات :' : 'Notes :'}
                      </span>
                      <p className="text-indigo-900/80 text-xs leading-relaxed font-medium">
                        {lang === 'ar' ? selectedService.descriptionAr : selectedService.descriptionEn}
                      </p>
                    </div>

                    {/* Quantity Selector Box */}
                    {selectedService.category !== 'games' && (
                      <div className="bg-slate-100/70 border border-slate-200/40 rounded-2xl p-4 space-y-1.5 text-right">
                        <label className="block text-slate-700 text-xs font-black text-right">
                          {lang === 'ar' ? 'ادخل العدد المطلوب' : 'Enter Required Quantity'}
                        </label>
                        <input
                          type="number"
                          required
                          value={quantity || ''}
                          min={selectedService.minOrder}
                          max={selectedService.maxOrder}
                          onChange={e => setQuantity(parseInt(e.target.value) || 0)}
                          className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-800 font-extrabold focus:outline-none focus:ring-2 focus:ring-[#58309a]/20 focus:border-[#58309a] text-sm text-right"
                          placeholder={`${selectedService.minOrder}...`}
                        />
                        <span className="block text-[10px] text-slate-400 font-bold text-right">
                          {lang === 'ar' 
                            ? `يجب ان يكون العدد أكبر من ${selectedService.minOrder} وأصغر من ${selectedService.maxOrder}` 
                            : `Quantity must be between ${selectedService.minOrder} and ${selectedService.maxOrder}`
                          }
                        </span>
                      </div>
                    )}

                    {/* Link / Player ID Box */}
                    <div className="bg-slate-100/70 border border-slate-200/40 rounded-2xl p-4 space-y-1.5 text-right">
                      <label className="block text-slate-700 text-xs font-black text-right">
                        {selectedService.category !== 'games' 
                          ? (lang === 'ar' ? 'ادخل الرابط المراد زيادته' : 'Enter Target URL') 
                          : (lang === 'ar' ? 'ادخل معرف اللاعب الخاص بك' : 'Enter Player ID')
                        }
                      </label>
                      <input
                        type="text"
                        required
                        value={targetLinkOrId}
                        onChange={e => setTargetLinkOrId(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-800 font-extrabold focus:outline-none focus:ring-2 focus:ring-[#58309a]/20 focus:border-[#58309a] text-sm text-right font-mono"
                        placeholder={selectedService.category !== 'games' ? 'https://instagram.com/...' : '1234567890'}
                      />
                      <span className="block text-[10px] text-slate-400 font-bold text-right">
                        {selectedService.category !== 'games' 
                          ? (lang === 'ar' ? 'رابط المنشور او الفيديو او الملف الشخصي المراد زيادته' : 'URL to post, video, or profile')
                          : (lang === 'ar' ? 'معرف الحساب الخاص بك في اللعبة' : 'Your unique account ID in the game')
                        }
                      </span>
                    </div>

                    {/* Gaming details Box */}
                    {selectedService.category === 'games' && (
                      <div className="bg-slate-100/70 border border-slate-200/40 rounded-2xl p-4 space-y-1.5 text-right">
                        <label className="block text-slate-700 text-xs font-black text-right">
                          {lang === 'ar' ? 'ادخل تفاصيل إضافية (اختياري)' : 'Enter Extra Details (Optional)'}
                        </label>
                        <input
                          type="text"
                          value={extraDetails}
                          onChange={e => setExtraDetails(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-800 font-extrabold focus:outline-none focus:ring-2 focus:ring-[#58309a]/20 focus:border-[#58309a] text-sm text-right"
                          placeholder="e.g. AL-NUAIMI"
                        />
                        <span className="block text-[10px] text-slate-400 font-bold text-right">
                          {lang === 'ar' ? 'اسم اللاعب أو أي تفاصيل إضافية للتحقق' : 'Player nickname or any additional validation details'}
                        </span>
                      </div>
                    )}

                    {/* Submit Buy button */}
                    <button
                      type="submit"
                      className="w-full py-4 px-4 bg-[#808990] hover:bg-[#6c747a] text-white font-black text-sm rounded-2xl transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
                    >
                      <span>{t.submitOrder}</span>
                    </button>
                  </form>
                )
              ) : (
                /* Case 3: Browse Services (Step 1) */
                <div className="space-y-4">
                  {/* Today's Offers Featured Banner Section inside the modal */}
                  {selectedPlatform === 'offers' && (
                    <div 
                      className="relative overflow-hidden rounded-3xl border border-amber-200 shadow-sm bg-gradient-to-br from-amber-50 to-rose-50 p-4 text-right"
                    >
                      <div className="absolute top-0 left-0 w-24 h-24 bg-amber-200/20 rounded-full blur-3xl pointer-events-none"></div>
                      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 justify-between">
                        <div className="space-y-1 text-right flex-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold text-[9px] animate-pulse">
                            🔥 {lang === 'ar' ? 'أقوى العروض لفترة محدودة' : 'BEST DEALS - LIMITED TIME'}
                          </span>
                          <h4 className="text-sm font-black text-rose-950 leading-tight">
                            {lang === 'ar' ? 'عروض اليوم الحصرية والخصومات الكبرى!' : "Today's Exclusive SMM & Gaming Deals!"}
                          </h4>
                          <p className="text-slate-600 text-[10px] leading-relaxed">
                            {lang === 'ar' 
                              ? 'باقات خاصة مخفضة بنسبة تصل إلى 50%. العروض تتحدث تلقائياً طوال اليوم لضمان أفضل سعر.'
                              : 'Up to 50% discount active today!'}
                          </p>
                        </div>
                        
                        {offersTodayBanner && (
                          <div className="relative w-full sm:w-28 h-16 rounded-xl overflow-hidden border border-amber-200 shrink-0 bg-slate-900 flex items-center justify-center">
                            <img 
                              src={offersTodayBanner} 
                              alt="Today's Offers Cover" 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover select-none"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Local Search Input inside the modal */}
                  <div className="relative">
                    <span className={`absolute inset-y-0 ${lang === 'ar' ? 'left-3' : 'right-3'} flex items-center text-slate-400`}>
                      <Search className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs text-right shadow-sm"
                      placeholder={t.searchService}
                    />
                  </div>

                  {/* Filtered services list specifically for this platform */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-0.5">
                    {filteredServices.length === 0 ? (
                      <div className="col-span-full bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center text-slate-400 text-xs">
                        {lang === 'ar' ? 'لم يتم العثور على أي خدمات تطابق شروط البحث!' : 'No services match the search filter.'}
                      </div>
                    ) : (
                      filteredServices.map(service => {
                        const isSMM = service.category !== 'games';
                        return (
                          <div
                            key={service.id}
                            className="border border-slate-100 hover:border-slate-200 rounded-2xl p-4 transition-all text-right bg-white shadow-sm flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-start gap-3">
                                {/* Service Custom Image or Platform Mini Icon */}
                                <div className="w-12 h-12 rounded-xl border border-slate-100 bg-slate-50 overflow-hidden shrink-0 shadow-sm flex items-center justify-center">
                                  {service.image ? (
                                    <img src={service.image} className="w-full h-full object-cover" alt="Service" referrerPolicy="no-referrer" />
                                  ) : (
                                    renderSectionIconMini(service.platform)
                                  )}
                                </div>

                                <div className="flex-1 space-y-1 min-w-0">
                                  <div className="flex justify-between items-center gap-2 flex-wrap">
                                    <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-50 text-slate-500 border border-slate-200/40">
                                      {service.platform.toUpperCase()}
                                    </span>
                                    <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                                      {isSMM 
                                        ? `${service.pricePer1000} ${t.points} / 1000` 
                                        : `${service.fixedPrice} ${t.points}`
                                      }
                                    </span>
                                  </div>
                                  <h4 className="font-extrabold text-slate-900 text-xs md:text-sm pt-1 truncate">
                                    {lang === 'ar' ? service.nameAr : service.nameEn}
                                  </h4>
                                  <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2 overflow-hidden text-ellipsis">
                                    {lang === 'ar' ? service.descriptionAr : service.descriptionEn}
                                  </p>
                                  {((lang === 'ar' ? service.descriptionAr : service.descriptionEn) || '').length > 40 && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedDescriptionService(service);
                                      }}
                                      className="text-[10px] text-indigo-600 hover:text-[#58309a] font-bold block mt-1 hover:underline text-right"
                                    >
                                      {lang === 'ar' ? 'عرض المزيد' : 'Show More'}
                                    </button>
                                  )}
                                </div>
                              </div>

                              {isSMM && (
                                <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-3 border-t border-slate-100 pt-2">
                                  <span className="flex items-center gap-1 font-medium">
                                    <Clock className="w-3 h-3 text-indigo-500" />
                                    {t.minOrder}: {service.minOrder}
                                  </span>
                                  <span className="font-medium">
                                    {t.maxOrder}: {service.maxOrder}
                                  </span>
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() => handleServiceSelect(service)}
                              className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-sm mt-3"
                            >
                              {lang === 'ar' ? 'طلب هذه الخدمة' : 'Request This Service'}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Service Description Modal */}
      {selectedDescriptionService && (
        <div 
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-[60] overflow-y-auto p-4 flex justify-center items-center text-right"
          onClick={() => setSelectedDescriptionService(null)}
        >
          <div 
            className="bg-white border border-slate-100 rounded-[24px] w-full max-w-md shadow-2xl animate-fade-in p-6 relative my-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedDescriptionService(null)}
              className="absolute top-4 left-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title / Service Name */}
            <h3 className="text-sm font-black text-slate-900 mb-4 pr-6 select-none border-b border-slate-100 pb-2">
              {lang === 'ar' ? 'تفاصيل ووصف الخدمة' : 'Service Description & Details'}
            </h3>

            <div className="bg-[#f0eefc] border border-[#e1dcf7] rounded-2xl p-5 text-right space-y-2">
              <h4 className="font-black text-[#58309a] text-xs md:text-sm leading-tight">
                {lang === 'ar' ? selectedDescriptionService.nameAr : selectedDescriptionService.nameEn}
              </h4>
              <p className="text-slate-700 text-xs leading-relaxed whitespace-pre-line font-medium">
                {lang === 'ar' ? selectedDescriptionService.descriptionAr : selectedDescriptionService.descriptionEn}
              </p>
            </div>

            <button
              onClick={() => {
                const s = selectedDescriptionService;
                setSelectedDescriptionService(null);
                handleServiceSelect(s);
              }}
              className="w-full mt-5 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl transition-all shadow-md shadow-indigo-500/10 text-xs"
            >
              {lang === 'ar' ? 'طلب هذه الخدمة' : 'Request This Service'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
