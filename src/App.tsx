import React, { useState, useEffect } from 'react';
import { User } from './types';
import { StorageEngine } from './lib/storage';
import { translations, Language } from './lib/translations';

// Subsections
import AuthSection from './components/AuthSection';
import HomeSection from './components/HomeSection';
import OrdersSection from './components/OrdersSection';
import ProfileSection from './components/ProfileSection';
import AdminSection from './components/AdminSection';
import ContactBtn from './components/ContactBtn';

// Icons
import { 
  Home, 
  ShoppingBag, 
  User as UserIcon, 
  ShieldAlert, 
  Languages, 
  HelpCircle, 
  MessageCircle, 
  Zap, 
  PlusCircle, 
  Lock,
  Handshake,
  X,
  CheckCircle,
  AlertCircle,
  Send,
  Bell,
  Trash2
} from 'lucide-react';
import { UserPost, MediationRequest, AppNotification } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [lang, setLang] = useState<Language>('ar');
  const [activeTab, setActiveTab] = useState<'home' | 'orders' | 'profile'>('home');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(true);

  // New States for Market posts & Escrow Mediation
  const [showAddPostModal, setShowAddPostModal] = useState(false);
  const [showMediationModal, setShowMediationModal] = useState(false);

  // Add Post Form states
  const [postType, setPostType] = useState<'sell' | 'buy'>('sell');
  const [postTitle, setPostTitle] = useState('');
  const [postDescription, setPostDescription] = useState('');
  const [postPrice, setPostPrice] = useState('');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [postContactMethod, setPostContactMethod] = useState('');
  const [postSuccessMsg, setPostSuccessMsg] = useState('');
  const [postErrorMsg, setPostErrorMsg] = useState('');

  // Mediation Form states
  const [medType, setMedType] = useState<'sell' | 'buy'>('sell');
  const [medDescription, setMedDescription] = useState('');
  const [medAmount, setMedAmount] = useState('');
  const [medNotes, setMedNotes] = useState('');
  const [medSuccessMsg, setMedSuccessMsg] = useState('');
  const [medErrorMsg, setMedErrorMsg] = useState('');

  // Notifications states
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  useEffect(() => {
    if (user) {
      const allNotifs = StorageEngine.getNotifications();
      const userNotifs = allNotifs.filter(n => {
        if (user.role === 'admin') {
          return n.userId === 'admin';
        } else {
          return n.userId === user.id;
        }
      });
      userNotifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotifications(userNotifs);
    } else {
      setNotifications([]);
    }
  }, [user, refreshTrigger]);

  const handleMarkAllNotificationsAsRead = async () => {
    const allNotifs = StorageEngine.getNotifications();
    const updated = allNotifs.map(n => {
      const isMine = user?.role === 'admin' ? n.userId === 'admin' : n.userId === user?.id;
      if (isMine) {
        return { ...n, read: true };
      }
      return n;
    });
    await StorageEngine.saveNotifications(updated);
    handleRefreshData();
  };

  const handleClearAllNotifications = async () => {
    const allNotifs = StorageEngine.getNotifications();
    const updated = allNotifs.filter(n => {
      const isMine = user?.role === 'admin' ? n.userId === 'admin' : n.userId === user?.id;
      return !isMine;
    });
    await StorageEngine.saveNotifications(updated);
    handleRefreshData();
  };

  const t = translations[lang];

  useEffect(() => {
    // Force fetch all latest database collections on start to ensure localStorage is hydrated
    const initData = async () => {
      try {
        await StorageEngine.forceFetchAllFromFirestore();
      } catch (err) {
        console.error("Failed to hydrate data from Firestore on app launch:", err);
      } finally {
        setLoading(false);
      }
    };
    initData();

    // Initialize real-time synchronization with Firestore
    StorageEngine.initializeFirebaseSync(() => {
      handleRefreshData();
    });
  }, []);

  useEffect(() => {
    // Check session on load
    if (!loading) {
      const loggedUser = StorageEngine.getSessionUser();
      if (loggedUser) {
        setUser(loggedUser);
      }
    }
  }, [refreshTrigger, loading]);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setActiveTab('home');
    setShowAdminPanel(false);
  };

  const handleLogout = () => {
    StorageEngine.setSessionUser(null);
    setUser(null);
    setShowAdminPanel(false);
  };

  const toggleLanguage = () => {
    setLang(prev => (prev === 'ar' ? 'en' : 'ar'));
  };

  const handleRefreshData = () => {
    // Trigger redraw for balances or order modifications
    setRefreshTrigger(prev => prev + 1);
  };

  const handleAddPostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPostErrorMsg('');
    setPostSuccessMsg('');

    if (!postTitle.trim() || !postDescription.trim() || !postPrice.trim()) {
      setPostErrorMsg(lang === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة.' : 'Please fill in all required fields.');
      return;
    }

    try {
      const posts = StorageEngine.getPosts();
      const newPost: UserPost = {
        id: 'post-' + Math.floor(100000 + Math.random() * 900000),
        userId: user!.id,
        userEmail: user!.email,
        type: postType,
        title: postTitle,
        description: postDescription,
        price: postPrice,
        image: postImageUrl.trim() || undefined,
        contactMethod: postContactMethod.trim() || undefined,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      posts.push(newPost);
      StorageEngine.savePosts(posts);

      setPostSuccessMsg(lang === 'ar' 
        ? 'تم تقديم المنشور بنجاح! سيظهر للجميع في السوق فور موافقة الإدارة عليه بعد مراجعته.' 
        : 'Your post was submitted successfully! It will appear in the marketplace once approved by the admin.'
      );

      // Clear fields
      setPostTitle('');
      setPostDescription('');
      setPostPrice('');
      setPostImageUrl('');
      setPostContactMethod('');
      
      // Refresh local cache & database lists
      handleRefreshData();
    } catch (err) {
      setPostErrorMsg(lang === 'ar' ? 'حدث خطأ أثناء حفظ المنشور.' : 'Error saving your post.');
    }
  };

  const handleMediationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMedErrorMsg('');
    setMedSuccessMsg('');

    if (!medDescription.trim() || !medAmount.trim()) {
      setMedErrorMsg(lang === 'ar' ? 'يرجى ملء تفاصيل ومبلغ الصفقة.' : 'Please enter deal description and amount.');
      return;
    }

    try {
      const mediations = StorageEngine.getMediations();
      const newMed: MediationRequest = {
        id: 'med-' + Math.floor(100000 + Math.random() * 900000),
        userId: user!.id,
        userEmail: user!.email,
        type: medType,
        description: medDescription,
        amount: medAmount,
        notes: medNotes,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      mediations.push(newMed);
      StorageEngine.saveMediations(mediations);

      StorageEngine.addNotification(
        'admin',
        `طلب وساطة جديد بقيمة ${newMed.amount}`,
        `New Mediation Request for ${newMed.amount}`,
        `قام المستخدم ${user!.email} بتقديم طلب وساطة جديد بقيمة ${newMed.amount} نقطة. التفاصيل: ${newMed.description}`,
        `User ${user!.email} submitted a new mediation request for ${newMed.amount} points. Details: ${newMed.description}`,
        'mediation',
        newMed.id
      );

      setMedSuccessMsg(lang === 'ar'
        ? 'تم تسجيل طلب الوساطة الخاص بك بنجاح! سيقوم الدعم والوسيط المعتمد بالتواصل معك قريباً عبر تليجرام أو واتساب لإكمال الإجراءات.'
        : 'Your mediation request was recorded successfully! An official mediator will contact you shortly via Telegram or WhatsApp.'
      );

      // Clear fields
      setMedDescription('');
      setMedAmount('');
      setMedNotes('');

      handleRefreshData();
    } catch (err) {
      setMedErrorMsg(lang === 'ar' ? 'حدث خطأ أثناء تسجيل طلب الوساطة.' : 'Error recording mediation request.');
    }
  };

  // While fetching from Firestore for the first time, show high-fidelity loader
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
        {/* Decorative Blur Orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="w-full max-w-sm bg-white border border-slate-100 rounded-3xl p-8 shadow-xl shadow-indigo-100/35 text-center z-10 flex flex-col items-center gap-4 animate-pulse">
          <div className="p-4 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-2xl">
            <Zap className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-lg font-black text-indigo-950 mt-2">
            {lang === 'ar' ? 'النعيمي لخدمات الـ SMM والألعاب' : 'Al-Nuaimi SMM & Game Services'}
          </h2>
          <p className="text-xs text-slate-500 font-bold">
            {lang === 'ar' ? 'جاري الاتصال بقاعدة البيانات السحابية وتحديث الحسابات...' : 'Connecting to Cloud Firestore and refreshing database...'}
          </p>
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mt-2"></div>
        </div>
      </div>
    );
  }

  // If user is not authenticated, display Auth flow
  if (!user) {
    return (
      <div className="bg-slate-50 min-h-screen relative text-right">
        {/* Absolute Language toggle on Login screen */}
        <div className="absolute top-4 left-4 z-50">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 text-xs font-bold shadow-sm transition-all"
          >
            <Languages className="w-4 h-4 text-indigo-600" />
            <span>{t.langToggle}</span>
          </button>
        </div>
        <AuthSection lang={lang} onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans relative flex flex-col justify-between antialiased">
      {/* Absolute Decorative elements */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Container */}
      <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col px-4 pt-4 md:pt-6">
        
        {/* Header Navigation Section */}
        <header 
          className="bg-white/95 backdrop-blur-md border border-slate-100 shadow-md shadow-indigo-100/30 rounded-3xl p-4 md:p-5 flex items-center justify-between mb-6 z-20 sticky top-4"
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        >
          {/* Left side actions (Language & Admin panel trigger if eligible) */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs font-bold transition-all"
            >
              <Languages className="w-4 h-4 text-indigo-600" />
              <span>{t.langToggle}</span>
            </button>

            {/* Notification Bell Button */}
            <button
              onClick={() => setShowNotificationsModal(true)}
              className="relative flex items-center justify-center p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 transition-all"
              title={lang === 'ar' ? 'الإشعارات' : 'Notifications'}
            >
              <Bell className={`w-4 h-4 text-indigo-600 ${notifications.some(n => !n.read) ? 'animate-bounce' : ''}`} />
              {notifications.some(n => !n.read) && (
                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-600 text-[8px] font-black text-white ring-1 ring-white">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>

            {user.role === 'admin' && (
              <button
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all border ${
                  showAdminPanel 
                    ? 'bg-rose-600 text-white border-rose-500 shadow shadow-rose-500/10' 
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200/50'
                }`}
              >
                <Lock className="w-4 h-4 shrink-0" />
                <span>{showAdminPanel ? (lang === 'ar' ? 'الرئيسية' : 'Exit Admin') : t.adminPanel}</span>
              </button>
            )}
          </div>

          {/* Right side logo */}
          <div className="text-right flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <h1 className="text-base font-black text-indigo-950 leading-none">
                {t.logoTitle}
              </h1>
              <span className="text-[10px] text-slate-500 font-bold block mt-1">
                {t.logoSub}
              </span>
            </div>
            <div className="inline-flex p-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl shadow-inner">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
          </div>
        </header>

        {/* Core content slot */}
        <main className="flex-1">
          {showAdminPanel && user.role === 'admin' ? (
            <AdminSection 
              lang={lang} 
              onRefreshParent={handleRefreshData} 
              refreshTrigger={refreshTrigger}
            />
          ) : (
            <>
              {activeTab === 'home' && (
                <HomeSection 
                  lang={lang} 
                  user={user} 
                  onOrderPlaced={handleRefreshData} 
                  refreshTrigger={refreshTrigger}
                />
              )}
              {activeTab === 'orders' && (
                <OrdersSection 
                  lang={lang} 
                  user={user} 
                  refreshTrigger={refreshTrigger} 
                />
              )}
              {activeTab === 'profile' && (
                <ProfileSection 
                  lang={lang} 
                  user={user} 
                  onLogout={handleLogout} 
                  onPointsUpdate={handleRefreshData} 
                  refreshTrigger={refreshTrigger}
                />
              )}
            </>
          )}
        </main>

        {/* Professional designer footer credit always visible */}
        <footer className="text-center py-6 text-[11px] text-slate-400 mt-8 border-t border-slate-200/50 space-y-1">
          <p className="font-bold tracking-wider text-slate-500 uppercase">
            {t.designerCredit}
          </p>
          <p className="font-mono text-[9px] text-slate-400">
            {lang === 'ar' 
              ? 'بوابة رشق المتابعين وشحن الألعاب المؤتمتة المتكاملة - إصدار 2026.1' 
              : 'Durable Automated SMM & Esports Distribution - v2026.1'}
          </p>
        </footer>
      </div>

      {/* Floating Customer Helpdesk button */}
      <ContactBtn lang={lang} refreshTrigger={refreshTrigger} />

      {/* Persistent Bottom Tab Navigation Bar */}
      {!showAdminPanel && (
        <nav 
          className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 z-45 py-2 px-3 md:px-12 flex items-end justify-around h-16 shadow-2xl shadow-indigo-100/50"
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        >
          {/* Tab 1: Home */}
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center gap-0.5 transition-all flex-1 py-1 rounded-xl ${
              activeTab === 'home' 
                ? 'text-indigo-600 font-extrabold bg-indigo-50/80' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[9px] font-black tracking-tight">{t.navHome}</span>
          </button>

          {/* Tab 2: Orders */}
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex flex-col items-center justify-center gap-0.5 transition-all flex-1 py-1 rounded-xl ${
              activeTab === 'orders' 
                ? 'text-indigo-600 font-extrabold bg-indigo-50/80' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-[9px] font-black tracking-tight">{t.navOrders}</span>
          </button>

          {/* Tab 3: Mediation (وساطة) - Raised purple circle in center */}
          <div className="flex flex-col items-center justify-center flex-1 relative -top-3.5 z-50">
            <button
              onClick={() => {
                setMedErrorMsg('');
                setMedSuccessMsg('');
                setShowMediationModal(true);
              }}
              className="w-14 h-14 rounded-full bg-[#58309a] hover:bg-[#46257e] text-white flex items-center justify-center shadow-lg border-4 border-white transition-all duration-300 transform hover:scale-110 active:scale-95 shrink-0"
            >
              <Handshake className="w-6 h-6" />
            </button>
            <span className="text-[9px] font-black text-indigo-950 mt-1">
              {lang === 'ar' ? 'وساطة' : 'Mediation'}
            </span>
          </div>

          {/* Tab 4: Add Post (إضافة منشور) */}
          <button
            onClick={() => {
              setPostErrorMsg('');
              setPostSuccessMsg('');
              setShowAddPostModal(true);
            }}
            className="flex flex-col items-center justify-center gap-0.5 transition-all flex-1 py-1 rounded-xl text-slate-400 hover:text-slate-600"
          >
            <PlusCircle className="w-5 h-5 text-indigo-600" />
            <span className="text-[9px] font-black tracking-tight">
              {lang === 'ar' ? 'إضافة منشور' : 'Add Post'}
            </span>
          </button>

          {/* Tab 5: Account */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center justify-center gap-0.5 transition-all flex-1 py-1 rounded-xl ${
              activeTab === 'profile' 
                ? 'text-indigo-600 font-extrabold bg-indigo-50/80' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <UserIcon className="w-5 h-5" />
            <span className="text-[9px] font-black tracking-tight">{t.navProfile}</span>
          </button>
        </nav>
      )}

      {/* Modal 1: Add Post (إضافة منشور) */}
      {showAddPostModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-50 overflow-y-auto p-4 flex justify-center items-center">
          <div 
            className="bg-white border border-slate-100 rounded-[32px] w-full max-w-lg shadow-2xl animate-fade-in my-auto flex flex-col max-h-[90vh] overflow-hidden text-right"
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4">
              <button 
                onClick={() => {
                  setShowAddPostModal(false);
                  setPostSuccessMsg('');
                  setPostErrorMsg('');
                }}
                className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/50 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all shadow-sm shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-base font-black text-indigo-950">
                {lang === 'ar' ? 'إضافة منشور بيع أو شراء' : 'Add Sale or Purchase Post'}
              </h3>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {postSuccessMsg ? (
                <div className="text-center py-6 space-y-4 max-w-sm mx-auto animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h4 className="text-base font-black text-slate-900">
                    {lang === 'ar' ? 'تم تقديم المنشور!' : 'Post Submitted!'}
                  </h4>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    {postSuccessMsg}
                  </p>
                  <button
                    onClick={() => {
                      setShowAddPostModal(false);
                      setPostSuccessMsg('');
                    }}
                    className="w-full py-3 px-4 bg-[#58309a] hover:bg-[#46257e] text-white font-black text-xs rounded-xl transition-all shadow-md"
                  >
                    {lang === 'ar' ? 'موافق' : 'Okay'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAddPostSubmit} className="space-y-4">
                  {postErrorMsg && (
                    <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{postErrorMsg}</span>
                    </div>
                  )}

                  {/* Operation Type */}
                  <div className="space-y-1.5">
                    <label className="block text-slate-700 text-xs font-black">
                      {lang === 'ar' ? 'نوع العملية' : 'Transaction Type'}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPostType('sell')}
                        className={`py-2.5 px-4 rounded-xl font-black text-xs border transition-all ${
                          postType === 'sell'
                            ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-500/10'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {lang === 'ar' ? 'بيع حساب / خدمة' : 'Sell Account / Service'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPostType('buy')}
                        className={`py-2.5 px-4 rounded-xl font-black text-xs border transition-all ${
                          postType === 'buy'
                            ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/10'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {lang === 'ar' ? 'شراء حساب / خدمة' : 'Buy Account / Service'}
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="block text-slate-700 text-xs font-black">
                      {lang === 'ar' ? 'عنوان المنشور' : 'Post Title'}
                    </label>
                    <input
                      type="text"
                      required
                      value={postTitle}
                      onChange={e => setPostTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#58309a]/20 focus:border-[#58309a] text-xs text-right"
                      placeholder={lang === 'ar' ? 'مثال: حساب ببجي مستودع لفل 72' : 'e.g. PUBG Account level 72'}
                    />
                  </div>

                  {/* Price */}
                  <div className="space-y-1.5">
                    <label className="block text-slate-700 text-xs font-black">
                      {lang === 'ar' ? 'السعر المقترح' : 'Proposed Price'}
                    </label>
                    <input
                      type="text"
                      required
                      value={postPrice}
                      onChange={e => setPostPrice(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#58309a]/20 focus:border-[#58309a] text-xs text-right"
                      placeholder={lang === 'ar' ? 'مثال: 50,000 د.ع أو 40$' : 'e.g. 50,000 IQD or $40'}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="block text-slate-700 text-xs font-black">
                      {lang === 'ar' ? 'تفاصيل ومواصفات المنشور' : 'Details & Specifications'}
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={postDescription}
                      onChange={e => setPostDescription(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#58309a]/20 focus:border-[#58309a] text-xs text-right leading-relaxed"
                      placeholder={lang === 'ar' ? 'اكتب تفاصيل الحساب، الأسلحة المطورة، الإنجازات وطريقة التسليم...' : 'Write account details, specifications, achievements...'}
                    />
                  </div>

                  {/* Contact Method */}
                  <div className="space-y-1.5">
                    <label className="block text-slate-700 text-xs font-black flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold">({lang === 'ar' ? 'اختياري للتواصل المباشر' : 'Optional for direct contact'})</span>
                      <span>{lang === 'ar' ? 'طريقة التواصل الخاصة بك' : 'Your Contact Method'}</span>
                    </label>
                    <input
                      type="text"
                      value={postContactMethod}
                      onChange={e => setPostContactMethod(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#58309a]/20 focus:border-[#58309a] text-xs text-right"
                      placeholder={lang === 'ar' ? 'مثال: تلكرام @user أو واتساب 075xxxx' : 'e.g. Telegram @user or WhatsApp 075xxxx'}
                    />
                  </div>

                  {/* Optional Image URL */}
                  <div className="space-y-1.5">
                    <label className="block text-slate-700 text-xs font-black flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold">({lang === 'ar' ? 'اختياري' : 'Optional'})</span>
                      <span>{lang === 'ar' ? 'رابط صورة توضيحية' : 'Illustration Image URL'}</span>
                    </label>
                    <input
                      type="url"
                      value={postImageUrl}
                      onChange={e => setPostImageUrl(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#58309a]/20 focus:border-[#58309a] text-xs text-left font-mono"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  {/* Note on approval */}
                  <p className="text-[10px] text-slate-400 font-bold bg-slate-50 p-3 rounded-xl border border-slate-100 leading-normal">
                    ⚠️ {lang === 'ar' 
                      ? 'سيخضع المنشور لمراجعة دقيقة من الإدارة قبل تفعيله وظهوره في السوق للجميع لمنع إعلانات الاحتيال.' 
                      : 'Your ad will be carefully audited by the administration before activation to avoid scams.'}
                  </p>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 bg-[#58309a] hover:bg-[#46257e] text-white font-black text-xs rounded-xl transition-all shadow-md active:scale-[0.99]"
                  >
                    {lang === 'ar' ? 'تقديم طلب النشر فوراً' : 'Submit Publication Request'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Mediation Request (وساطة بيع وشراء) */}
      {showMediationModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-50 overflow-y-auto p-4 flex justify-center items-center">
          <div 
            className="bg-white border border-slate-100 rounded-[32px] w-full max-w-lg shadow-2xl animate-fade-in my-auto flex flex-col max-h-[90vh] overflow-hidden text-right"
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4">
              <button 
                onClick={() => {
                  setShowMediationModal(false);
                  setMedSuccessMsg('');
                  setMedErrorMsg('');
                }}
                className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/50 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all shadow-sm shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-base font-black text-indigo-950 flex items-center gap-1.5 justify-end">
                <span>{lang === 'ar' ? 'نظام الوساطة المعتمد للبيع والشراء' : 'Trusted Buy/Sell Mediation'}</span>
                <Handshake className="w-5 h-5 text-[#58309a]" />
              </h3>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {medSuccessMsg ? (
                <div className="text-center py-6 space-y-4 max-w-sm mx-auto animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h4 className="text-base font-black text-slate-900">
                    {lang === 'ar' ? 'تم تسجيل طلب الوساطة!' : 'Mediation Request Saved!'}
                  </h4>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    {medSuccessMsg}
                  </p>
                  <button
                    onClick={() => {
                      setShowMediationModal(false);
                      setMedSuccessMsg('');
                    }}
                    className="w-full py-3 px-4 bg-[#58309a] hover:bg-[#46257e] text-white font-black text-xs rounded-xl transition-all shadow-md"
                  >
                    {lang === 'ar' ? 'موافق' : 'Okay'}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Mediation Intro Banner */}
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 p-4 rounded-2xl space-y-1.5">
                    <h4 className="text-xs font-black text-indigo-950 flex items-center gap-1">
                      <span>{lang === 'ar' ? 'كيف يعمل نظام الوساطة المضمون؟' : 'How does mediation work?'}</span>
                    </h4>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {lang === 'ar' 
                        ? 'عند تقديم الطلب، يقوم وسيط رسمي معتمد وموثوق من إدارتنا بالاتصال بك وبالمشتري/البائع. نحتفظ بالمبلغ والبيانات ونشرف على التسليم لضمان عدم تعرض أي طرف للاحتيال.' 
                        : 'A trusted staff mediator manages your deal escrow. We hold assets securely and manage delivery safely to avoid scams.'}
                    </p>
                  </div>

                  <form onSubmit={handleMediationSubmit} className="space-y-4">
                    {medErrorMsg && (
                      <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-bold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{medErrorMsg}</span>
                      </div>
                    )}

                    {/* Operation Type */}
                    <div className="space-y-1.5">
                      <label className="block text-slate-700 text-xs font-black">
                        {lang === 'ar' ? 'أنت في هذه الصفقة:' : 'In this transaction, you are the:'}
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setMedType('sell')}
                          className={`py-2.5 px-4 rounded-xl font-black text-xs border transition-all ${
                            medType === 'sell'
                              ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-500/10'
                              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {lang === 'ar' ? 'البائع (أريد بيع حساب)' : 'Seller (I am selling)'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setMedType('buy')}
                          className={`py-2.5 px-4 rounded-xl font-black text-xs border transition-all ${
                            medType === 'buy'
                              ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/10'
                              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {lang === 'ar' ? 'المشتري (أريد شراء حساب)' : 'Buyer (I am buying)'}
                        </button>
                      </div>
                    </div>

                    {/* Deal Description */}
                    <div className="space-y-1.5">
                      <label className="block text-slate-700 text-xs font-black">
                        {lang === 'ar' ? 'تفاصيل ومواصفات الصفقة' : 'Deal Specifications'}
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={medDescription}
                        onChange={e => setMedDescription(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#58309a]/20 focus:border-[#58309a] text-xs text-right leading-relaxed"
                        placeholder={lang === 'ar' ? 'اكتب هنا ما يتم وساطته بالتفصيل (مثل: حساب ببجي مشحون 20 سيزون مع الطرف الآخر البريد...)' : 'Details of what is being mediated (e.g., PUBG account, level 70...)'}
                      />
                    </div>

                    {/* Amount */}
                    <div className="space-y-1.5">
                      <label className="block text-slate-700 text-xs font-black">
                        {lang === 'ar' ? 'مبلغ الصفقة المتفق عليه وطريقة الدفع' : 'Agreed Amount & Payment Method'}
                      </label>
                      <input
                        type="text"
                        required
                        value={medAmount}
                        onChange={e => setMedAmount(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#58309a]/20 focus:border-[#58309a] text-xs text-right"
                        placeholder={lang === 'ar' ? 'مثال: 120,000 د.ع آسيا سيل' : 'e.g. 120,000 IQD via AsiaCell'}
                      />
                    </div>

                    {/* Extra Notes */}
                    <div className="space-y-1.5">
                      <label className="block text-slate-700 text-xs font-black">
                        {lang === 'ar' ? 'ملاحظات إضافية للوسيط' : 'Extra Notes for Mediator'}
                      </label>
                      <textarea
                        rows={2}
                        value={medNotes}
                        onChange={e => setMedNotes(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#58309a]/20 focus:border-[#58309a] text-xs text-right leading-relaxed"
                        placeholder={lang === 'ar' ? 'أي شروط خاصة أو حسابات تواصل تليجرام للطرف الآخر...' : 'Any extra specifications or telegram handles of the other party...'}
                      />
                    </div>

                    {/* Static Support Contact Details */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2.5">
                      <span className="block text-[10px] text-slate-400 font-bold">
                        📞 {lang === 'ar' ? 'بيانات التواصل المباشر مع الوسيط المعتمد للتسريع:' : 'Direct Contact handles for express mediation:'}
                      </span>
                      <div className="grid grid-cols-2 gap-3.5">
                        <a
                          href={StorageEngine.getContactSettings().telegramChannel}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#229ED9]/10 hover:bg-[#229ED9]/20 text-[#229ED9] rounded-xl border border-[#229ED9]/20 text-xs font-black transition-all"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Telegram Support</span>
                        </a>
                        <a
                          href={StorageEngine.getContactSettings().whatsappLink}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] rounded-xl border border-[#25D366]/20 text-xs font-black transition-all"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp Support</span>
                        </a>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full py-3.5 px-4 bg-[#58309a] hover:bg-[#46257e] text-white font-black text-xs rounded-xl transition-all shadow-md active:scale-[0.99]"
                    >
                      {lang === 'ar' ? 'تسجيل طلب الوساطة المضمونة' : 'Register Secure Mediation'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Real-time Notifications List */}
      {showNotificationsModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-50 overflow-y-auto p-4 flex justify-center items-center">
          <div 
            className="bg-white border border-slate-100 rounded-[32px] w-full max-w-lg shadow-2xl animate-fade-in my-auto flex flex-col max-h-[90vh] overflow-hidden text-right"
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4">
              <button 
                onClick={() => setShowNotificationsModal(false)}
                className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/50 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all shadow-sm shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-base font-black text-indigo-950 flex items-center gap-1.5 justify-end">
                <span>{lang === 'ar' ? 'مركز الإشعارات والتنبيهات' : 'Notifications Center'}</span>
                <Bell className="w-5 h-5 text-indigo-600" />
              </h3>
            </div>

            {/* Actions Panel */}
            {notifications.length > 0 && (
              <div className="px-6 py-3 bg-slate-50 border-b border-slate-100/80 flex justify-between items-center text-xs">
                <button
                  onClick={handleClearAllNotifications}
                  className="text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'مسح الكل' : 'Clear All'}</span>
                </button>
                <button
                  onClick={handleMarkAllNotificationsAsRead}
                  className="text-indigo-600 hover:text-indigo-800 font-black transition-colors"
                >
                  {lang === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all as read'}
                </button>
              </div>
            )}

            {/* List */}
            <div className="p-6 overflow-y-auto flex-1 space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto border border-slate-100">
                    <Bell className="w-8 h-8 text-slate-300" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700">
                    {lang === 'ar' ? 'لا توجد إشعارات جديدة' : 'No new notifications'}
                  </h4>
                  <p className="text-slate-400 text-[11px]">
                    {lang === 'ar' ? 'سوف تظهر هنا الإشعارات والتحديثات الفورية.' : 'Real-time alerts and state updates will appear here.'}
                  </p>
                </div>
              ) : (
                notifications.map(notif => {
                  return (
                    <div 
                      key={notif.id}
                      className={`p-4 rounded-2xl border transition-all relative ${
                        notif.read 
                          ? 'bg-white border-slate-100 text-slate-700' 
                          : 'bg-indigo-50/40 border-indigo-100/70 text-indigo-950 shadow-sm'
                      }`}
                    >
                      {/* Unread Indicator Dot */}
                      {!notif.read && (
                        <span className="absolute top-4 left-4 w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                      )}

                      <div className="flex gap-3">
                        {/* Icon based on type */}
                        <div className="p-2 bg-white rounded-xl border border-slate-100 h-9 w-9 flex items-center justify-center shrink-0 shadow-sm text-indigo-600">
                          {notif.type === 'order' ? (
                            <ShoppingBag className="w-4 h-4" />
                          ) : notif.type === 'mediation' ? (
                            <Handshake className="w-4 h-4" />
                          ) : (
                            <Bell className="w-4 h-4" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0 text-right">
                          <h5 className="font-extrabold text-xs md:text-sm text-indigo-950">
                            {lang === 'ar' ? notif.titleAr : notif.titleEn}
                          </h5>
                          <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">
                            {lang === 'ar' ? notif.messageAr : notif.messageEn}
                          </p>
                          <span className="block text-[9px] text-slate-400 mt-2 font-mono">
                            {new Date(notif.createdAt).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
