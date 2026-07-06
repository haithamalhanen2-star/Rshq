import React, { useState, useEffect } from 'react';
import { User, Service, Order, PaymentRequest, UserPost, MediationRequest, AdminLog } from '../types';
import { StorageEngine } from '../lib/storage';
import { translations, Language } from '../lib/translations';
import { 
  Shield, 
  Settings, 
  ShoppingBag, 
  UserPlus, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  DollarSign, 
  Gamepad2, 
  Award, 
  ChevronDown, 
  ArrowLeft,
  RefreshCw,
  Instagram,
  Facebook,
  Youtube,
  Send,
  Twitter,
  Sparkles,
  Handshake,
  X,
  MessageSquare,
  AlertCircle,
  Terminal,
  Check
} from 'lucide-react';

interface AdminSectionProps {
  lang: Language;
  onRefreshParent: () => void;
  refreshTrigger?: number;
}
const toEnglishDigits = (str: string): string => {
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
  return str.replace(/[٠-٩]/g, (d) => String(arabicDigits.indexOf(d)));
};

export default function AdminSection({ lang, onRefreshParent, refreshTrigger }: AdminSectionProps) {
  const renderPlatformIconMini = (platformId: string) => {
    const wrapperClass = "w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm";
    const iconClass = "w-4.5 h-4.5 text-white";
    switch (platformId) {
      case 'offers':
        return (
          <div className={`${wrapperClass} bg-gradient-to-tr from-amber-400 to-rose-600`}>
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
            <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
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

  const [activeTab, setActiveTab] = useState<'orders' | 'services' | 'users' | 'payments' | 'marketplace' | 'mediations' | 'logs' | 'contacts'>('orders');

  // Dynamic Contact settings form states
  const [telegramChannel, setTelegramChannel] = useState('');
  const [telegramDetail, setTelegramDetail] = useState('');
  const [whatsappLink, setWhatsappLink] = useState('');
  const [whatsappDetail, setWhatsappDetail] = useState('');
  const [contactsSuccess, setContactsSuccess] = useState('');

  // Load contacts settings when tab switches to contacts
  useEffect(() => {
    if (activeTab === 'contacts') {
      const contacts = StorageEngine.getContactSettings();
      setTelegramChannel(contacts.telegramChannel);
      setTelegramDetail(contacts.telegramDetail);
      setWhatsappLink(contacts.whatsappLink);
      setWhatsappDetail(contacts.whatsappDetail);
      setContactsSuccess('');
    }
  }, [activeTab]);
  
  // Database States
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allPayments, setAllPayments] = useState<PaymentRequest[]>([]);
  
  // New Marketplace, Mediations, & Audit Logs States
  const [allPosts, setAllPosts] = useState<UserPost[]>([]);
  const [allMediations, setAllMediations] = useState<MediationRequest[]>([]);
  const [allLogs, setAllLogs] = useState<AdminLog[]>([]);

  // Editing UserPost States
  const [editingPost, setEditingPost] = useState<UserPost | null>(null);
  const [postEditTitle, setPostEditTitle] = useState('');
  const [postEditDescription, setPostEditDescription] = useState('');
  const [postEditPrice, setPostEditPrice] = useState('');
  const [postEditImageUrl, setPostEditImageUrl] = useState('');
  const [postEditContactMethod, setPostEditContactMethod] = useState('');

  // Mediation admin notes state
  const [mediationNotesInput, setMediationNotesInput] = useState<{ [medId: string]: string }>({});

  // Editing Service States
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceForm, setServiceForm] = useState<Partial<Service>>({
    category: 'smm',
    platform: 'instagram',
    nameAr: '',
    nameEn: '',
    descriptionAr: '',
    descriptionEn: '',
    pricePer1000: 100,
    fixedPrice: 100,
    packageSize: 1000,
    minOrder: 100,
    maxOrder: 10000,
    image: ''
  });

  // Adding Points States
  const [pointsInputUserId, setPointsInputUserId] = useState<string | null>(null);
  const [addPointsAmount, setAddPointsAmount] = useState<number>(500);

  // Custom Category and Platform inputs
  const [customCategory, setCustomCategory] = useState('');
  const [customPlatform, setCustomPlatform] = useState('');

  // Password editing state for users
  const [editingPasswordUserId, setEditingPasswordUserId] = useState<string | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState<string | null>(null);
  const [confirmDeletePostId, setConfirmDeletePostId] = useState<string | null>(null);
  const [confirmDeleteMediationId, setConfirmDeleteMediationId] = useState<string | null>(null);
  const [confirmDeleteServiceId, setConfirmDeleteServiceId] = useState<string | null>(null);
  const [confirmClearLogs, setConfirmClearLogs] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const t = translations[lang];

  // Initial load: fetch the latest data directly from Firestore
  useEffect(() => {
    const fetchLatest = async () => {
      setIsRefreshing(true);
      await StorageEngine.forceFetchAllFromFirestore();
      loadAllData();
      setIsRefreshing(false);
    };
    fetchLatest();
  }, []);

  useEffect(() => {
    loadAllData();
  }, [refreshTrigger]);

  const loadAllData = () => {
    setAllOrders(StorageEngine.getOrders());
    setAllServices(StorageEngine.getServices());
    setAllUsers(StorageEngine.getUsers());
    setAllPayments(StorageEngine.getPaymentRequests());
    
    // Fetch new Marketplace, Mediations, and Audit logs
    const posts = StorageEngine.getPosts();
    const meds = StorageEngine.getMediations();
    const logs = StorageEngine.getAdminLogs();

    setAllPosts(posts);
    setAllMediations(meds);
    setAllLogs(logs);

    // Hydrate mediation notes input state
    const notesMap: { [medId: string]: string } = {};
    meds.forEach(m => {
      notesMap[m.id] = m.adminNotes || '';
    });
    setMediationNotesInput(notesMap);
  };

  const handleSaveContacts = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactsSuccess('');
    try {
      const updated = {
        id: 'contacts',
        telegramChannel: telegramChannel.trim(),
        telegramDetail: telegramDetail.trim(),
        whatsappLink: whatsappLink.trim(),
        whatsappDetail: whatsappDetail.trim()
      };
      await StorageEngine.saveContactSettings(updated);

      const sessionUser = StorageEngine.getSessionUser();
      const adminId = sessionUser?.id || 'admin';
      const adminEmail = sessionUser?.email || 'admin@alnuaimi.com';
      await StorageEngine.addAdminLog(
        adminId,
        adminEmail,
        'update_contacts',
        lang === 'ar' 
          ? `تعديل بيانات التواصل (تلكرام: ${telegramDetail}، واتساب: ${whatsappDetail})`
          : `Updated contact channels (Telegram: ${telegramDetail}, WhatsApp: ${whatsappDetail})`
      );

      setContactsSuccess(lang === 'ar' ? 'تم حفظ وتحديث بيانات التواصل بنجاح!' : 'Contact settings saved successfully!');
      
      if (onRefreshParent) {
        onRefreshParent();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Administrative handlers for posts
  const handleApprovePost = async (postId: string) => {
    const posts = StorageEngine.getPosts();
    const idx = posts.findIndex(p => p.id === postId);
    if (idx !== -1) {
      const post = posts[idx];
      post.status = 'approved';
      await StorageEngine.savePosts(posts);

      // Send real-time notification to the user who created the post
      await StorageEngine.addNotification(
        post.userId,
        'تم قبول منشورك في السوق',
        'Your marketplace post was approved',
        `تمت الموافقة على منشورك (${post.title}) من قبل الإدارة وهو الآن معروض في السوق.`,
        `Your post (${post.title}) has been approved by the administration and is now live in the marketplace.`,
        'general',
        post.id
      );
      
      const sessionUser = StorageEngine.getSessionUser();
      const adminId = sessionUser?.id || 'admin';
      const adminEmail = sessionUser?.email || 'admin@alnuaimi.com';
      
      await StorageEngine.addAdminLog(
        adminId,
        adminEmail,
        'approve_post',
        lang === 'ar' 
          ? `تم قبول المنشور رقم: ${postId} بعنوان (${post.title})`
          : `Approved post ${postId} with title (${post.title})`
      );
      
      loadAllData();
      onRefreshParent();
    }
  };

  const handleRejectPost = async (postId: string) => {
    const posts = StorageEngine.getPosts();
    const idx = posts.findIndex(p => p.id === postId);
    if (idx !== -1) {
      const post = posts[idx];
      post.status = 'rejected';
      await StorageEngine.savePosts(posts);

      // Send real-time notification to the user who created the post
      await StorageEngine.addNotification(
        post.userId,
        'تم رفض منشورك في السوق',
        'Your marketplace post was rejected',
        `تم رفض منشورك (${post.title}) من قبل الإدارة.`,
        `Your post (${post.title}) has been rejected by the administration.`,
        'general',
        post.id
      );

      const sessionUser = StorageEngine.getSessionUser();
      const adminId = sessionUser?.id || 'admin';
      const adminEmail = sessionUser?.email || 'admin@alnuaimi.com';

      await StorageEngine.addAdminLog(
        adminId,
        adminEmail,
        'reject_post',
        lang === 'ar' 
          ? `تم رفض المنشور رقم: ${postId} بعنوان (${post.title})`
          : `Rejected post ${postId} with title (${post.title})`
      );

      loadAllData();
      onRefreshParent();
    }
  };

  const handleDeletePost = (postId: string) => {
    const posts = StorageEngine.getPosts();
    const target = posts.find(p => p.id === postId);
    StorageEngine.deletePost(postId);

    const sessionUser = StorageEngine.getSessionUser();
    const adminId = sessionUser?.id || 'admin';
    const adminEmail = sessionUser?.email || 'admin@alnuaimi.com';

    StorageEngine.addAdminLog(
      adminId,
      adminEmail,
      'delete_post',
      lang === 'ar' 
        ? `تم حذف المنشور رقم: ${postId} بعنوان (${target?.title || ''})`
        : `Deleted post ${postId} with title (${target?.title || ''})`
    );

    loadAllData();
    onRefreshParent();
  };

  const handleStartEditPost = (post: UserPost) => {
    setEditingPost(post);
    setPostEditTitle(post.title);
    setPostEditDescription(post.description);
    setPostEditPrice(post.price);
    setPostEditImageUrl(post.image || '');
    setPostEditContactMethod(post.contactMethod || '');
  };

  const handleSaveEditedPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    const posts = StorageEngine.getPosts();
    const idx = posts.findIndex(p => p.id === editingPost.id);
    if (idx !== -1) {
      posts[idx].title = postEditTitle;
      posts[idx].description = postEditDescription;
      posts[idx].price = postEditPrice;
      posts[idx].image = postEditImageUrl.trim() || undefined;
      posts[idx].contactMethod = postEditContactMethod.trim() || undefined;

      StorageEngine.savePosts(posts);

      const sessionUser = StorageEngine.getSessionUser();
      const adminId = sessionUser?.id || 'admin';
      const adminEmail = sessionUser?.email || 'admin@alnuaimi.com';

      StorageEngine.addAdminLog(
        adminId,
        adminEmail,
        'edit_post',
        lang === 'ar' 
          ? `تم تعديل بيانات المنشور رقم: ${editingPost.id}`
          : `Edited post details ${editingPost.id}`
      );

      setEditingPost(null);
      loadAllData();
      onRefreshParent();
    }
  };

  // Administrative handlers for mediation
  const handleMediationStatusChange = (medId: string, newStatus: MediationRequest['status']) => {
    const mediations = StorageEngine.getMediations();
    const idx = mediations.findIndex(m => m.id === medId);
    if (idx !== -1) {
      const oldStatus = mediations[idx].status;
      mediations[idx].status = newStatus;
      StorageEngine.saveMediations(mediations);

      // Create user notification
      const statusAr = newStatus === 'completed' ? 'مكتمل (تمت الموافقة) ✅' : newStatus === 'contacted' ? 'تم التواصل 📞' : newStatus === 'cancelled' ? 'ملغي ❌' : 'قيد الانتظار ⏳';
      const statusEn = newStatus === 'completed' ? 'Completed (Approved) ✅' : newStatus === 'contacted' ? 'Contacted 📞' : newStatus === 'cancelled' ? 'Cancelled ❌' : 'Pending ⏳';
      StorageEngine.addNotification(
        mediations[idx].userId,
        'تحديث طلب الوساطة الخاص بك',
        'Your Mediation Request Updated',
        `تم تحديث حالة طلب الوساطة الخاص بك بقيمة ${mediations[idx].amount} لتصبح: ${statusAr}`,
        `Your mediation request for ${mediations[idx].amount} has been updated to: ${statusEn}`,
        'mediation',
        medId
      );

      const sessionUser = StorageEngine.getSessionUser();
      const adminId = sessionUser?.id || 'admin';
      const adminEmail = sessionUser?.email || 'admin@alnuaimi.com';

      StorageEngine.addAdminLog(
        adminId,
        adminEmail,
        'update_mediation_status',
        lang === 'ar' 
          ? `تعديل حالة طلب الوساطة رقم: ${medId} من (${oldStatus}) إلى (${newStatus})`
          : `Updated mediation request ${medId} status from (${oldStatus}) to (${newStatus})`
      );

      loadAllData();
      onRefreshParent();
    }
  };

  const handleSaveMediationNotes = (medId: string) => {
    const notesValue = mediationNotesInput[medId] || '';
    const mediations = StorageEngine.getMediations();
    const idx = mediations.findIndex(m => m.id === medId);
    if (idx !== -1) {
      mediations[idx].adminNotes = notesValue;
      StorageEngine.saveMediations(mediations);

      const sessionUser = StorageEngine.getSessionUser();
      const adminId = sessionUser?.id || 'admin';
      const adminEmail = sessionUser?.email || 'admin@alnuaimi.com';

      StorageEngine.addAdminLog(
        adminId,
        adminEmail,
        'update_mediation_notes',
        lang === 'ar' 
          ? `إضافة/تعديل الملاحظات الإدارية لطلب الوساطة رقم: ${medId}`
          : `Added/Updated admin notes for mediation request ${medId}`
      );

      alert(lang === 'ar' ? 'تم حفظ الملاحظات الإدارية بنجاح!' : 'Admin notes saved successfully!');
      loadAllData();
      onRefreshParent();
    }
  };

  const handleDeleteMediation = (medId: string) => {
    StorageEngine.deleteMediation(medId);

    const sessionUser = StorageEngine.getSessionUser();
    const adminId = sessionUser?.id || 'admin';
    const adminEmail = sessionUser?.email || 'admin@alnuaimi.com';

    StorageEngine.addAdminLog(
      adminId,
      adminEmail,
      'delete_mediation',
      lang === 'ar' 
        ? `حذف طلب الوساطة رقم: ${medId}`
        : `Deleted mediation request ${medId}`
    );

    loadAllData();
    onRefreshParent();
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await StorageEngine.forceFetchAllFromFirestore();
    loadAllData();
    setIsRefreshing(false);
    onRefreshParent();
  };

  // Change order status SMM or game
  const handleOrderStatusChange = (orderId: string, newStatus: Order['status']) => {
    const orders = StorageEngine.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index].status = newStatus;
      StorageEngine.saveOrders(orders);
      setAllOrders(orders);
      onRefreshParent();
    }
  };

  // Manage Payment Deposits Approve or Reject
  const handlePaymentStatusChange = (paymentId: string, status: 'approved' | 'rejected') => {
    const payments = StorageEngine.getPaymentRequests();
    const users = StorageEngine.getUsers();
    
    const paymentIndex = payments.findIndex(p => p.id === paymentId);
    if (paymentIndex === -1) return;

    if (payments[paymentIndex].status !== 'pending') return; // already processed

    payments[paymentIndex].status = status;
    StorageEngine.savePaymentRequests(payments);

    // If approved, add points to the target user
    if (status === 'approved') {
      const targetUserId = payments[paymentIndex].userId;
      const userIndex = users.findIndex(u => u.id === targetUserId);
      if (userIndex !== -1) {
        users[userIndex].points += payments[paymentIndex].amountPoints;
        StorageEngine.saveUsers(users);
      }
    }

    loadAllData();
    onRefreshParent();
  };

  // Delete Service
  const handleDeleteService = (serviceId: string) => {
    StorageEngine.deleteService(serviceId);
    loadAllData();
    onRefreshParent();
  };

  // Save / Add / Edit Service Form submit
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    const services = StorageEngine.getServices();

    const finalCategory = serviceForm.category === 'custom' ? customCategory.trim() : (serviceForm.category || 'smm');
    const finalPlatform = serviceForm.platform === 'custom' ? customPlatform.trim() : (serviceForm.platform || 'instagram');

    if (editingService) {
      // Edit
      const updated = services.map(s => {
        if (s.id === editingService.id) {
          return {
            ...s,
            ...serviceForm,
            category: finalCategory,
            platform: finalPlatform,
            pricePer1000: finalCategory === 'smm' ? (serviceForm.pricePer1000 || 100) : undefined,
            fixedPrice: finalCategory !== 'smm' ? (serviceForm.fixedPrice || 100) : undefined,
            packageSize: serviceForm.packageSize || 1000,
            minOrder: finalCategory === 'smm' ? (serviceForm.minOrder || 100) : undefined,
            maxOrder: finalCategory === 'smm' ? (serviceForm.maxOrder || 10000) : undefined
          } as Service;
        }
        return s;
      });
      await StorageEngine.saveServices(updated);
    } else {
      // Create new
      const newService: Service = {
        id: 'service-' + Date.now(),
        category: finalCategory,
        platform: finalPlatform,
        nameAr: serviceForm.nameAr || 'اسم خدمة جديدة',
        nameEn: serviceForm.nameEn || 'New Service Name',
        descriptionAr: serviceForm.descriptionAr || '',
        descriptionEn: serviceForm.descriptionEn || '',
        pricePer1000: finalCategory === 'smm' ? (serviceForm.pricePer1000 || 100) : undefined,
        fixedPrice: finalCategory !== 'smm' ? (serviceForm.fixedPrice || 100) : undefined,
        packageSize: serviceForm.packageSize || 1000,
        minOrder: finalCategory === 'smm' ? (serviceForm.minOrder || 100) : undefined,
        maxOrder: finalCategory === 'smm' ? (serviceForm.maxOrder || 10000) : undefined,
        image: serviceForm.image || ''
      };
      services.push(newService);
      await StorageEngine.saveServices(services);
    }

    setShowServiceForm(false);
    setEditingService(null);
    setCustomCategory('');
    setCustomPlatform('');
    loadAllData();
    onRefreshParent();
  };

  // Open Edit service modal
  const handleOpenEditService = (service: Service) => {
    setEditingService(service);
    setServiceForm(service);

    const isStandardCategory = ['smm', 'games'].includes(service.category);
    if (!isStandardCategory) {
      setCustomCategory(service.category);
      setServiceForm(prev => ({ ...prev, category: 'custom' }));
    } else {
      setCustomCategory('');
    }

    const isStandardPlatform = ['facebook', 'tiktok', 'instagram', 'telegram', 'twitter', 'youtube', 'pubg', 'yalla_ludo', 'other_games'].includes(service.platform);
    if (!isStandardPlatform) {
      setCustomPlatform(service.platform);
      setServiceForm(prev => ({ ...prev, platform: 'custom' }));
    } else {
      setCustomPlatform('');
    }

    setShowServiceForm(true);
  };

  // Add Points Manually for users
  const handleAddPointsManual = (userId: string) => {
    const users = StorageEngine.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index].points += addPointsAmount;
      StorageEngine.saveUsers(users);
      setPointsInputUserId(null);
      loadAllData();
      onRefreshParent();
    }
  };

  // Change user role admin/user
  const handleToggleUserRole = (userId: string, currentRole: User['role']) => {
    const users = StorageEngine.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index].role = currentRole === 'admin' ? 'user' : 'admin';
      StorageEngine.saveUsers(users);
      loadAllData();
      onRefreshParent();
    }
  };

  // Change user password by Admin
  const handleChangeUserPassword = (userId: string) => {
    if (!newPasswordValue.trim()) return;
    const users = StorageEngine.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index].password = newPasswordValue.trim();
      StorageEngine.saveUsers(users);
      
      // Update session if it is current user
      const currentSession = StorageEngine.getSessionUser();
      if (currentSession && currentSession.id === userId) {
        currentSession.password = newPasswordValue.trim();
        StorageEngine.setSessionUser(currentSession);
      }

      setEditingPasswordUserId(null);
      setNewPasswordValue('');
      loadAllData();
      onRefreshParent();
    }
  };

  // Delete user from Database by Admin
  const handleDeleteUser = (userId: string) => {
    const session = StorageEngine.getSessionUser();
    if (session && session.id === userId) {
      return; // Safe guard
    }
    StorageEngine.deleteUser(userId);
    setConfirmDeleteUserId(null);
    loadAllData();
    onRefreshParent();
  };

  // Calculations for stats
  const totalSpentPoints = allOrders.reduce((acc, o) => acc + o.totalCost, 0);
  const pendingPaymentsCount = allPayments.filter(p => p.status === 'pending').length;

  return (
    <div className="space-y-6 pb-24 text-right animate-fade-in" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Admin Panel Welcome */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-rose-600 bg-rose-50 px-3 py-1 rounded-full font-bold border border-rose-100 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" />
            {lang === 'ar' ? 'لوحة المسؤول الشاملة' : 'Full Administrator Mode'}
          </span>
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className={`text-xs px-3 py-1 rounded-full font-bold border flex items-center gap-1.5 transition-all ${
              isRefreshing 
                ? 'bg-amber-50 text-amber-600 border-amber-200 cursor-not-allowed animate-pulse' 
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border-indigo-200'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? (lang === 'ar' ? 'جاري التحديث...' : 'Refreshing...') : (lang === 'ar' ? 'تحديث البيانات' : 'تحديث البيانات')}</span>
          </button>
        </div>
        <h2 className="text-xl font-black text-indigo-950">
          {t.adminDashboard}
        </h2>
      </div>

      {/* Admin Quick Statistics Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-100 p-4 rounded-2xl text-center shadow-sm">
          <p className="text-[10px] text-slate-500 font-bold">{t.statTotalOrders}</p>
          <p className="text-xl font-black text-indigo-950 mt-1">{allOrders.length}</p>
        </div>
        <div className="bg-white border border-slate-100 p-4 rounded-2xl text-center shadow-sm">
          <p className="text-[10px] text-slate-500 font-bold">{t.statTotalUsers}</p>
          <p className="text-xl font-black text-indigo-950 mt-1">{allUsers.length}</p>
        </div>
        <div className="bg-white border border-slate-100 p-4 rounded-2xl text-center shadow-sm">
          <p className="text-[10px] text-slate-500 font-bold">{t.statTotalPoints}</p>
          <p className="text-xl font-black text-emerald-700 mt-1">{totalSpentPoints}</p>
        </div>
        <div className="bg-white border border-slate-100 p-4 rounded-2xl text-center shadow-sm">
          <p className="text-[10px] text-slate-500 font-bold">{t.statPendingPayments}</p>
          <p className="text-xl font-black text-rose-600 mt-1">{pendingPaymentsCount}</p>
        </div>
      </div>

      {/* Selector Tabs */}
      <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-200/50 overflow-x-auto scrollbar-none gap-1 shadow-inner">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'orders' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-indigo-950'
          }`}
        >
          {t.manageOrders}
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'services' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-indigo-950'
          }`}
        >
          {t.manageServices}
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'users' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-indigo-950'
          }`}
        >
          {t.manageUsers}
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all whitespace-nowrap relative ${
            activeTab === 'payments' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-indigo-950'
          }`}
        >
          <span>{t.managePayments}</span>
          {pendingPaymentsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('marketplace')}
          className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all whitespace-nowrap relative ${
            activeTab === 'marketplace' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-indigo-950'
          }`}
        >
          <span>{lang === 'ar' ? 'السوق' : 'Market'}</span>
          {allPosts.filter(p => p.status === 'pending').length > 0 && (
            <span className="absolute top-1 right-1 px-1.5 py-0.5 bg-rose-600 text-white font-mono font-bold text-[8px] rounded-full">
              {allPosts.filter(p => p.status === 'pending').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('mediations')}
          className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all whitespace-nowrap relative ${
            activeTab === 'mediations' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-indigo-950'
          }`}
        >
          <span>{lang === 'ar' ? 'الوساطة' : 'Mediation'}</span>
          {allMediations.filter(m => m.status === 'pending').length > 0 && (
            <span className="absolute top-1 right-1 px-1.5 py-0.5 bg-purple-600 text-white font-mono font-bold text-[8px] rounded-full">
              {allMediations.filter(m => m.status === 'pending').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'logs' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-indigo-950'
          }`}
        >
          {lang === 'ar' ? 'السجلات' : 'Logs'}
        </button>
        <button
          onClick={() => setActiveTab('contacts')}
          className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'contacts' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-indigo-950'
          }`}
        >
          {lang === 'ar' ? 'حسابات التواصل' : 'Contact Channels'}
        </button>
      </div>

      {/* TAB CONTENT: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-indigo-950 px-1">{t.manageOrders}</h3>

          {allOrders.length === 0 ? (
            <div className="text-center text-slate-400 py-6 text-xs">{lang === 'ar' ? 'لا يوجد طلبات حالياً.' : 'No orders stored yet.'}</div>
          ) : (
            allOrders.map(order => (
              <div key={order.id} className="bg-white p-5 rounded-2xl border border-slate-100 space-y-3 text-right shadow-sm">
                <div className="flex justify-between items-center gap-4">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleOrderStatusChange(order.id, 'completed')}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold transition-all border border-emerald-100"
                    >
                      {lang === 'ar' ? 'مكتمل' : 'Complete'}
                    </button>
                    <button
                      onClick={() => handleOrderStatusChange(order.id, 'processing')}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-bold transition-all border border-indigo-100"
                    >
                      {lang === 'ar' ? 'جاري التنفيذ' : 'Process'}
                    </button>
                    <button
                      onClick={() => handleOrderStatusChange(order.id, 'cancelled')}
                      className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[10px] font-bold transition-all border border-rose-100"
                    >
                      {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400 font-bold">{order.id} • {order.userEmail}</span>
                    <h4 className="font-extrabold text-indigo-950 text-sm mt-0.5">{lang === 'ar' ? order.serviceNameAr : order.serviceNameEn}</h4>
                    <span className="text-[10px] text-slate-500 font-bold font-mono block mt-1">
                      📅 {new Date(order.createdAt || Date.now()).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] font-mono">
                  <div>
                    <span className="text-slate-400 block font-bold">{lang === 'ar' ? 'الكمية' : 'Qty'}</span>
                    <span className="text-slate-800 font-bold">{order.quantity}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold">{lang === 'ar' ? 'التكلفة' : 'Cost'}</span>
                    <span className="text-emerald-700 font-bold">{order.totalCost}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold">{lang === 'ar' ? 'الحالة' : 'Status'}</span>
                    <span className="text-amber-700 font-bold">{order.status}</span>
                  </div>
                </div>

                <div className="text-[11px] bg-slate-50 p-2 rounded border border-slate-100 text-left font-mono break-all text-slate-600">
                  <span className="text-slate-400 text-right block font-bold">{lang === 'ar' ? 'الحساب المستهدف / المعرف' : 'Target link or Player ID'}</span>
                  {order.targetLinkOrId}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB CONTENT: SERVICES CRUD */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setEditingService(null);
                setServiceForm({
                  category: 'smm',
                  platform: 'instagram',
                  nameAr: '',
                  nameEn: '',
                  descriptionAr: '',
                  descriptionEn: '',
                  pricePer1000: 100,
                  fixedPrice: 100,
                  packageSize: 1000,
                  minOrder: 100,
                  maxOrder: 10000,
                  image: ''
                });
                setCustomCategory('');
                setCustomPlatform('');
                setShowServiceForm(true);
              }}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addService}</span>
            </button>
            <h3 className="text-sm font-bold text-indigo-950 px-1">{t.manageServices}</h3>
          </div>

          {/* New/Edit Service Form Modal */}
          {showServiceForm && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-lg overflow-y-auto max-h-[90vh] shadow-2xl animate-fade-in">
                <div className="p-6 pb-3 border-b border-slate-100 flex items-center justify-between">
                  <button onClick={() => setShowServiceForm(false)} className="text-slate-500 text-xs font-bold hover:text-slate-800">{t.cancel}</button>
                  <h4 className="font-extrabold text-indigo-950 text-base">
                    {editingService ? t.editService : t.addService}
                  </h4>
                </div>

                <form onSubmit={handleSaveService} className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Category */}
                    <div>
                      <label className="block text-slate-600 text-xs font-bold mb-1 text-right">{t.serviceCategory}</label>
                      <select
                        value={serviceForm.category}
                        onChange={e => setServiceForm({ ...serviceForm, category: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="smm">SMM (رشق ومتابعين)</option>
                        <option value="games">Games (شحن ألعاب)</option>
                        <option value="custom">{lang === 'ar' ? 'مخصص / تصنيف جديد...' : 'Custom / New Category...'}</option>
                      </select>
                    </div>

                    {/* Platform */}
                    <div>
                      <label className="block text-slate-600 text-xs font-bold mb-1 text-right">{t.servicePlatform}</label>
                      <select
                        value={serviceForm.platform}
                        onChange={e => setServiceForm({ ...serviceForm, platform: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="facebook">Facebook</option>
                        <option value="tiktok">TikTok</option>
                        <option value="instagram">Instagram</option>
                        <option value="telegram">Telegram</option>
                        <option value="twitter">Twitter/X</option>
                        <option value="youtube">YouTube</option>
                        <option value="pubg">PUBG Mobile</option>
                        <option value="yalla_ludo">Yalla Ludo</option>
                        <option value="other_games">Other Games</option>
                        <option value="offers">{lang === 'ar' ? 'عروض اليوم' : "Today's Offers"}</option>
                        <option value="custom">{lang === 'ar' ? 'مخصص / منصة جديدة...' : 'Custom / New Platform...'}</option>
                      </select>
                    </div>
                  </div>

                  {/* Conditionally Render Custom Category Textbox */}
                  {serviceForm.category === 'custom' && (
                    <div className="animate-fade-in">
                      <label className="block text-slate-600 text-xs font-bold mb-1 text-right">{lang === 'ar' ? 'اسم التصنيف المخصص (مثال: حسابات مميزة)' : 'Custom Category Name (e.g. Premium Accounts)'}</label>
                      <input
                        type="text"
                        required
                        value={customCategory}
                        onChange={e => setCustomCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2 px-3 text-xs text-right focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        placeholder="Premium Accounts..."
                      />
                    </div>
                  )}

                  {/* Conditionally Render Custom Platform Textbox */}
                  {serviceForm.platform === 'custom' && (
                    <div className="animate-fade-in">
                      <label className="block text-slate-600 text-xs font-bold mb-1 text-right">{lang === 'ar' ? 'اسم المنصة المخصصة (مثال: Snapchat)' : 'Custom Platform Name (e.g. Snapchat)'}</label>
                      <input
                        type="text"
                        required
                        value={customPlatform}
                        onChange={e => setCustomPlatform(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2 px-3 text-xs text-right focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        placeholder="Snapchat..."
                      />
                    </div>
                  )}

                  {/* Name Ar */}
                  <div>
                    <label className="block text-slate-600 text-xs font-bold mb-1 text-right">{t.nameArLabel}</label>
                    <input
                      type="text"
                      required
                      value={serviceForm.nameAr}
                      onChange={e => setServiceForm({ ...serviceForm, nameAr: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2 px-3 text-xs text-right focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  {/* Name En */}
                  <div>
                    <label className="block text-slate-600 text-xs font-bold mb-1 text-right">{t.nameEnLabel}</label>
                    <input
                      type="text"
                      required
                      value={serviceForm.nameEn}
                      onChange={e => setServiceForm({ ...serviceForm, nameEn: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2 px-3 text-xs text-left focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  {/* Description Ar */}
                  <div>
                    <label className="block text-slate-600 text-xs font-bold mb-1 text-right">{t.descArLabel}</label>
                    <textarea
                      value={serviceForm.descriptionAr}
                      onChange={e => setServiceForm({ ...serviceForm, descriptionAr: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2 px-3 text-xs text-right h-16 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  {/* Description En */}
                  <div>
                    <label className="block text-slate-600 text-xs font-bold mb-1 text-right">{t.descEnLabel}</label>
                    <textarea
                      value={serviceForm.descriptionEn}
                      onChange={e => setServiceForm({ ...serviceForm, descriptionEn: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2 px-3 text-xs text-left h-16 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  {/* Service Image / Icon URL */}
                  <div>
                    <label className="block text-slate-600 text-xs font-bold mb-1 text-right">
                      {lang === 'ar' ? 'رابط صورة / أيقونة الخدمة (URL)' : 'Service Image / Icon (URL)'}
                    </label>
                    <input
                      type="text"
                      value={serviceForm.image || ''}
                      onChange={e => setServiceForm({ ...serviceForm, image: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2.5 px-3 text-xs text-left focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
                      placeholder="https://example.com/image.png"
                    />
                    <div className="mt-2 text-right">
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">
                        {lang === 'ar' ? 'أيقونات مقترحة سريعة (اضغط للاختيار):' : 'Suggested quick icons (click to select):'}
                      </span>
                      <div className="flex flex-wrap gap-1.5 justify-end">
                        {[
                          { name: 'Instagram', url: 'https://images.unsplash.com/photo-1611262588024-d12430b98920?w=150&auto=format&fit=crop&q=80' },
                          { name: 'TikTok', url: 'https://images.unsplash.com/photo-1598128558393-70ff21433be0?w=150&auto=format&fit=crop&q=80' },
                          { name: 'Facebook', url: 'https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=150&auto=format&fit=crop&q=80' },
                          { name: 'YouTube', url: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=150&auto=format&fit=crop&q=80' },
                          { name: 'Telegram', url: 'https://images.unsplash.com/photo-1614680376739-414d95ff43df?w=150&auto=format&fit=crop&q=80' },
                          { name: 'Twitter/X', url: 'https://images.unsplash.com/photo-1611605698335-8b15d27e03f9?w=150&auto=format&fit=crop&q=80' },
                          { name: 'PUBG UC', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=80' },
                          { name: 'Ludo Stars', url: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=150&auto=format&fit=crop&q=80' }
                        ].map(preset => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => setServiceForm({ ...serviceForm, image: preset.url })}
                            className="text-[10px] bg-slate-100 hover:bg-slate-200 text-indigo-700 px-2 py-0.5 rounded-lg border border-slate-200 font-medium transition-all"
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

<div className="grid grid-cols-2 gap-3">
                      {serviceForm.category === 'smm' ? (
                        <>
                          {/* Price per 1000 SMM */}
                          <div>
                            <label className="block text-slate-600 text-xs font-bold mb-1 text-right">{t.pricePer1000Label}</label>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={serviceForm.pricePer1000}
                              onChange={e => setServiceForm({ ...serviceForm, pricePer1000: parseInt(toEnglishDigits(e.target.value)) || 0 })}
                              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2 px-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                          </div>
                          {/* Package Size placeholder */}
                          <div>
                            <label className="block text-slate-600 text-xs font-bold mb-1 text-right">{t.packageSizeLabel}</label>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={serviceForm.packageSize}
                              onChange={e => setServiceForm({ ...serviceForm, packageSize: parseInt(toEnglishDigits(e.target.value)) || 0 })}
                              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2 px-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                          </div>
                        </>
                      ) : (
                        /* Fixed Price Games */
                        <div className="col-span-2">
                          <label className="block text-slate-600 text-xs font-bold mb-1 text-right">{t.fixedPriceLabel}</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={serviceForm.fixedPrice}
                            onChange={e => setServiceForm({ ...serviceForm, fixedPrice: parseInt(toEnglishDigits(e.target.value)) || 0 })}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2 px-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                        </div>
                      )}
                    </div>

                    {serviceForm.category === 'smm' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-600 text-xs font-bold mb-1 text-right">{t.minOrderLabel}</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={serviceForm.minOrder}
                            onChange={e => setServiceForm({ ...serviceForm, minOrder: parseInt(toEnglishDigits(e.target.value)) || 0 })}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2 px-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                        </div>
                         <div>
                        <label className="block text-slate-600 text-xs font-bold mb-1 text-right">{t.maxOrderLabel}</label>
                        <input
                          type="text"
inputMode="numeric"
value={serviceForm.maxOrder}
onChange={e => setServiceForm({ ...serviceForm, maxOrder: parseInt(toEnglishDigits(e.target.value)) || 0 })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2 px-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"    
                      />    
                      </div>
                    </div>
                  )}
                  

                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-500/10"
                  >
                    {t.save}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* List of current services */}
          <div className="space-y-2">
            {allServices.map(service => (
              <div key={service.id} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between text-right gap-4 shadow-sm">
                <div className="flex gap-2">
                  {confirmDeleteServiceId === service.id ? (
                    <div className="flex items-center gap-1 bg-rose-50 border border-rose-100 p-1 rounded-lg animate-pulse">
                      <span className="text-[9px] font-black text-rose-600 px-1">{lang === 'ar' ? 'تأكيد؟' : 'Confirm?'}</span>
                      <button
                        onClick={() => {
                          handleDeleteService(service.id);
                          setConfirmDeleteServiceId(null);
                        }}
                        className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[9px] font-black"
                      >
                        {lang === 'ar' ? 'نعم' : 'Yes'}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteServiceId(null)}
                        className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[9px] font-bold"
                      >
                        {lang === 'ar' ? 'لا' : 'No'}
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleOpenEditService(service)}
                        className="p-1.5 bg-slate-50 hover:bg-slate-100 text-indigo-600 rounded-lg border border-slate-200/60 transition-all shadow-sm"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteServiceId(service.id)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-100 transition-all shadow-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
                <div className="text-right flex-1">
                  <div className="flex items-center justify-end gap-2.5">
                    <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200/40 text-slate-500">
                      {service.platform}
                    </span>
                    <h5 className="font-extrabold text-indigo-950 text-xs">{lang === 'ar' ? service.nameAr : service.nameEn}</h5>
                    {service.image ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-100 shrink-0 shadow-sm flex items-center justify-center">
                        <img src={service.image} className="w-full h-full object-cover" alt="Service" referrerPolicy="no-referrer" />
                      </div>
                    ) : (
                      renderPlatformIconMini(service.platform)
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{lang === 'ar' ? service.descriptionAr : service.descriptionEn}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-indigo-950 px-1">{t.manageUsers}</h3>

          <div className="space-y-3">
            {allUsers.map(userItem => (
              <div key={userItem.id} className="bg-white p-5 rounded-2xl border border-slate-100 space-y-3 text-right shadow-sm">
                <div className="flex justify-between items-center gap-4">
                  <div className="flex gap-1.5 flex-wrap">
                    <button
                      onClick={() => setPointsInputUserId(pointsInputUserId === userItem.id ? null : userItem.id)}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold transition-all border border-emerald-100 shadow-sm"
                    >
                      {lang === 'ar' ? 'تعديل الرصيد' : 'Edit Balance'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingPasswordUserId(editingPasswordUserId === userItem.id ? null : userItem.id);
                        setNewPasswordValue('');
                      }}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-[10px] font-bold transition-all border border-amber-100 shadow-sm"
                    >
                      {lang === 'ar' ? 'تغيير الرمز' : 'Change Code'}
                    </button>
                    <button
                      onClick={() => handleToggleUserRole(userItem.id, userItem.role)}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-bold transition-all border border-indigo-100 shadow-sm"
                    >
                      {userItem.role === 'admin' ? (lang === 'ar' ? 'تنزيل لمستخدم' : 'Demote') : (lang === 'ar' ? 'ترقية لمشرف' : 'Promote')}
                    </button>
                    {StorageEngine.getSessionUser()?.id !== userItem.id && (
                      <>
                        {confirmDeleteUserId === userItem.id ? (
                          <div className="flex items-center gap-1 bg-rose-50 text-rose-700 px-2 py-0.5 rounded-lg border border-rose-100 animate-pulse text-[10px] font-black">
                            <span>{lang === 'ar' ? 'تأكيد؟' : 'Confirm?'}</span>
                            <button
                              onClick={() => handleDeleteUser(userItem.id)}
                              className="px-1.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[9px] font-black"
                            >
                              {lang === 'ar' ? 'نعم' : 'Yes'}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteUserId(null)}
                              className="px-1.5 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[9px] font-bold"
                            >
                              {lang === 'ar' ? 'لا' : 'No'}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteUserId(userItem.id)}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[10px] font-bold transition-all border border-rose-100 shadow-sm flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>{lang === 'ar' ? 'حذف العضو' : 'Delete'}</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                      userItem.role === 'admin' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-50 text-slate-500 border border-slate-200/40'
                    }`}>
                      {userItem.role === 'admin' ? (lang === 'ar' ? 'مشرف رئيسي' : 'Admin') : (lang === 'ar' ? 'عضو' : 'User')}
                    </span>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">ID: {userItem.id} • {t.referralCode}: {userItem.referralCode}</p>
                  </div>
                </div>

                {/* Email and Password Info row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-right">
                    <span className="text-[10px] text-slate-400 block font-bold">{lang === 'ar' ? 'كلمة المرور للرقم' : 'Password / Security Code'}</span>
                    <span className="text-xs text-slate-800 font-mono font-black select-all">{userItem.password || 'admin'}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-right">
                    <span className="text-[10px] text-slate-400 block font-bold">{lang === 'ar' ? 'البريد الإلكتروني للعضو' : 'Registered Email Address'}</span>
                    <span className="text-xs text-slate-800 font-bold select-all">{userItem.email}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-indigo-50/45 p-2.5 rounded-xl border border-indigo-100/40 text-xs px-4">
                  <span className="text-indigo-700 font-extrabold">{userItem.points.toLocaleString('en-US')} {t.points}</span>
                  <span className="text-slate-500 font-bold">{t.userPointsCol}</span>
                </div>

                {/* Inline Points adjustments */}
                {pointsInputUserId === userItem.id && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => handleAddPointsManual(userItem.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] shadow-sm shrink-0"
                    >
                      {lang === 'ar' ? 'إضافة رصيد' : 'Apply'}
                    </button>
                    <input
                      type="number"
                      value={addPointsAmount}
                      onChange={e => setAddPointsAmount(parseInt(e.target.value) || 0)}
                      className="bg-white border border-slate-200 rounded-lg text-slate-800 text-xs px-2 py-1.5 text-right flex-1 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <span className="text-slate-500 text-[10px] shrink-0 font-bold">{lang === 'ar' ? 'القيمة بالنقاط' : 'Points Amount'}</span>
                  </div>
                )}

                {/* Inline Password adjustments */}
                {editingPasswordUserId === userItem.id && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => handleChangeUserPassword(userItem.id)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[11px] shadow-sm shrink-0"
                    >
                      {lang === 'ar' ? 'تحديث الرمز' : 'Update'}
                    </button>
                    <input
                      type="text"
                      required
                      value={newPasswordValue}
                      onChange={e => setNewPasswordValue(e.target.value)}
                      placeholder={lang === 'ar' ? 'اكتب كلمة المرور الجديدة' : 'New password...'}
                      className="bg-white border border-slate-200 rounded-lg text-slate-800 text-xs px-2 py-1.5 text-right flex-1 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <span className="text-slate-500 text-[10px] shrink-0 font-bold">{lang === 'ar' ? 'الرمز الجديد' : 'New Code'}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: DEPOSIT NOTIFICATIONS APPROVALS */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-indigo-950 px-1">{t.managePayments}</h3>

          {allPayments.length === 0 ? (
            <div className="text-center text-slate-400 py-6 text-xs">{lang === 'ar' ? 'لا توجد طلبات شحن مضافة.' : 'No deposit logs.'}</div>
          ) : (
            allPayments.map(pay => (
              <div key={pay.id} className="bg-white p-5 rounded-2xl border border-slate-100 space-y-4 text-right shadow-sm animate-fade-in">
                <div className="flex justify-between items-center gap-4">
                  {pay.status === 'pending' ? (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handlePaymentStatusChange(pay.id, 'approved')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 shadow-sm"
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>{t.approve}</span>
                      </button>
                      <button
                        onClick={() => handlePaymentStatusChange(pay.id, 'rejected')}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[10px] font-bold transition-all border border-rose-100 flex items-center gap-1 shadow-sm"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>{t.reject}</span>
                      </button>
                    </div>
                  ) : (
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                      pay.status === 'approved' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : 'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                      {pay.status.toUpperCase()}
                    </span>
                  )}
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-mono font-bold">{pay.id} • {pay.userEmail}</span>
                    <h5 className="font-extrabold text-indigo-950 text-xs mt-0.5">{pay.method}</h5>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[10px] font-mono">
                  <div>
                    <span className="text-slate-400 block font-bold">{lang === 'ar' ? 'المبلغ الفعلي' : 'Cash Paid'}</span>
                    <span className="text-slate-800 font-bold">{pay.amountCash}$</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold">{lang === 'ar' ? 'النقاط المستحقة' : 'Points Credited'}</span>
                    <span className="text-emerald-700 font-bold">{pay.amountPoints}</span>
                  </div>
                  <div className="col-span-1">
                    <span className="text-slate-400 block font-bold">Transaction ID</span>
                    <span className="text-slate-700 font-bold text-[9px] truncate block">{pay.transactionId}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB CONTENT: MARKETPLACE ADMIN SECTION */}
      {activeTab === 'marketplace' && (
        <div className="space-y-4 animate-fade-in text-right" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <h3 className="text-sm font-bold text-indigo-950 px-1">
            {lang === 'ar' ? 'إدارة منشورات السوق (المستخدمين)' : 'Manage User Marketplace Posts'}
          </h3>

          {allPosts.length === 0 ? (
            <div className="text-center text-slate-400 py-12 bg-white rounded-2xl border border-slate-100 text-xs">
              {lang === 'ar' ? 'لا توجد منشورات مضافة بعد.' : 'No posts in the marketplace yet.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allPosts.map(post => (
                <div key={post.id} className="bg-white p-5 rounded-3xl border border-slate-100 flex flex-col justify-between shadow-sm space-y-4 text-right">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex gap-1.5 shrink-0">
                        {post.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprovePost(post.id)}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black transition-all flex items-center gap-1 shadow-sm"
                            >
                              <Check className="w-3 h-3" />
                              <span>{lang === 'ar' ? 'موافقة' : 'Approve'}</span>
                            </button>
                            <button
                              onClick={() => handleRejectPost(post.id)}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-[10px] font-black transition-all border border-rose-100 flex items-center gap-1 shadow-sm"
                            >
                              <X className="w-3 h-3" />
                              <span>{lang === 'ar' ? 'رفض' : 'Reject'}</span>
                            </button>
                          </>
                        )}
                        {confirmDeletePostId === post.id ? (
                          <div className="flex items-center gap-1 bg-rose-50 border border-rose-100 p-1 rounded-xl animate-pulse">
                            <span className="text-[9px] font-black text-rose-600 px-1">{lang === 'ar' ? 'تأكيد؟' : 'Confirm?'}</span>
                            <button
                              onClick={() => {
                                handleDeletePost(post.id);
                                setConfirmDeletePostId(null);
                              }}
                              className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[9px] font-black"
                            >
                              {lang === 'ar' ? 'نعم' : 'Yes'}
                            </button>
                            <button
                              onClick={() => setConfirmDeletePostId(null)}
                              className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[9px] font-bold"
                            >
                              {lang === 'ar' ? 'لا' : 'No'}
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => handleStartEditPost(post)}
                              className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/50 text-slate-500 hover:text-indigo-600 rounded-xl transition-all"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setConfirmDeletePostId(post.id)}
                              className="p-1.5 bg-rose-50/50 hover:bg-rose-50 border border-rose-100 text-rose-500 rounded-xl transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>

                      <div className="text-right">
                        <span className={`inline-block px-2 py-0.5 text-[8px] font-black rounded-full mb-1 border uppercase ${
                          post.type === 'sell'
                            ? 'bg-rose-50 text-rose-600 border-rose-100'
                            : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                          {post.type === 'sell' ? (lang === 'ar' ? 'عرض بيع' : 'SELL') : (lang === 'ar' ? 'طلب شراء' : 'BUY')}
                        </span>
                        <h4 className="font-extrabold text-indigo-950 text-xs">{post.title}</h4>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                      {post.description}
                    </p>

                    {post.image && (
                      <div className="relative rounded-2xl overflow-hidden aspect-video max-h-32 bg-slate-50 border border-slate-100">
                        <img 
                          src={post.image} 
                          alt={post.title} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                    <span className="font-mono text-indigo-950 font-black text-xs">{post.price}</span>
                    <div className="text-right flex flex-col items-end gap-0.5 min-w-0">
                      <span className="truncate w-full">{lang === 'ar' ? 'بواسطة: ' : 'By: '} {post.userEmail}</span>
                      {post.contactMethod && (
                        <span className="text-emerald-600 truncate w-full">{lang === 'ar' ? 'التواصل: ' : 'Contact: '} {post.contactMethod}</span>
                      )}
                    </div>
                  </div>

                  {/* Realtime Status Indicator */}
                  <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl text-[9px] font-bold border border-slate-100">
                    <span className={`px-2 py-0.5 rounded-full border ${
                      post.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : post.status === 'rejected'
                        ? 'bg-rose-50 text-rose-600 border-rose-100'
                        : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {post.status.toUpperCase()}
                    </span>
                    <span className="text-slate-400 font-mono">ID: {post.id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Edit Post Modal inside Admin */}
          {editingPost && (
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-50 p-4 flex justify-center items-center">
              <div className="bg-white border border-slate-100 rounded-[32px] w-full max-w-md shadow-2xl p-6 text-right space-y-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <button 
                    onClick={() => setEditingPost(null)}
                    className="p-1.5 bg-slate-50 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <h4 className="font-black text-indigo-950 text-sm">
                    {lang === 'ar' ? 'تعديل منشور السوق' : 'Edit Marketplace Post'}
                  </h4>
                </div>

                <form onSubmit={handleSaveEditedPost} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-slate-700 text-xs font-bold">{lang === 'ar' ? 'العنوان' : 'Title'}</label>
                    <input
                      type="text"
                      required
                      value={postEditTitle}
                      onChange={e => setPostEditTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-700 text-xs font-bold">{lang === 'ar' ? 'السعر المقترح' : 'Price'}</label>
                    <input
                      type="text"
                      required
                      value={postEditPrice}
                      onChange={e => setPostEditPrice(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-700 text-xs font-bold">{lang === 'ar' ? 'الوصف' : 'Description'}</label>
                    <textarea
                      required
                      rows={3}
                      value={postEditDescription}
                      onChange={e => setPostEditDescription(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-700 text-xs font-bold">{lang === 'ar' ? 'رابط الصورة' : 'Image URL'}</label>
                    <input
                      type="text"
                      value={postEditImageUrl}
                      onChange={e => setPostEditImageUrl(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-mono text-left"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-700 text-xs font-bold">{lang === 'ar' ? 'طريقة التواصل' : 'Contact Method'}</label>
                    <input
                      type="text"
                      value={postEditContactMethod}
                      onChange={e => setPostEditContactMethod(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-medium"
                      placeholder={lang === 'ar' ? 'تلكرام أو واتساب...' : 'Telegram or WhatsApp...'}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#58309a] hover:bg-[#46257e] text-white rounded-xl text-xs font-black transition-all shadow-md"
                  >
                    {lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: MEDIATIONS ADMIN SECTION */}
      {activeTab === 'mediations' && (
        <div className="space-y-4 animate-fade-in text-right" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <h3 className="text-sm font-bold text-indigo-950 px-1">
            {lang === 'ar' ? 'إدارة طلبات الوساطة المالية المضمونة' : 'Manage Secure Mediation requests'}
          </h3>

          {allMediations.length === 0 ? (
            <div className="text-center text-slate-400 py-12 bg-white rounded-2xl border border-slate-100 text-xs">
              {lang === 'ar' ? 'لا توجد طلبات وساطة حالياً.' : 'No active mediation requests.'}
            </div>
          ) : (
            <div className="space-y-4">
              {allMediations.map(med => (
                <div key={med.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm text-right space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    {/* Actions and Status Switches */}
                    <div className="flex flex-col gap-2">
                      {confirmDeleteMediationId === med.id ? (
                        <div className="flex items-center gap-1 bg-rose-50 border border-rose-100 p-1 rounded-lg animate-pulse">
                          <span className="text-[9px] font-black text-rose-600 px-1">{lang === 'ar' ? 'تأكيد؟' : 'Confirm?'}</span>
                          <button
                            onClick={() => {
                              handleDeleteMediation(med.id);
                              setConfirmDeleteMediationId(null);
                            }}
                            className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[9px] font-black"
                          >
                            {lang === 'ar' ? 'نعم' : 'Yes'}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteMediationId(null)}
                            className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[9px] font-bold"
                          >
                            {lang === 'ar' ? 'لا' : 'No'}
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleMediationStatusChange(med.id, 'contacted')}
                            className="px-2 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-[9px] font-black border border-sky-100 transition-all"
                          >
                            {lang === 'ar' ? 'تم التواصل' : 'Contacted'}
                          </button>
                          <button
                            onClick={() => handleMediationStatusChange(med.id, 'completed')}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-black transition-all"
                          >
                            {lang === 'ar' ? 'مكتملة' : 'Completed'}
                          </button>
                          <button
                            onClick={() => handleMediationStatusChange(med.id, 'cancelled')}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[9px] font-black border border-rose-100 transition-all"
                          >
                            {lang === 'ar' ? 'ملغية' : 'Cancelled'}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteMediationId(med.id)}
                            className="p-1.5 bg-slate-50 text-slate-400 hover:text-rose-600 border border-slate-200/50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <span className={`inline-block px-2.5 py-0.5 text-[8px] font-black rounded-full border mb-1 uppercase ${
                        med.type === 'sell'
                          ? 'bg-rose-50 text-rose-600 border-rose-100'
                          : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        {med.type === 'sell' ? (lang === 'ar' ? 'البائع' : 'SELLER') : (lang === 'ar' ? 'المشتري' : 'BUYER')}
                      </span>
                      <h4 className="font-extrabold text-indigo-950 text-xs">ID: {med.id}</h4>
                    </div>
                  </div>

                  {/* Spec box */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs space-y-2 leading-relaxed">
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px]">{lang === 'ar' ? 'صاحب الطلب:' : 'Requestor:'}</span>
                      <span className="text-indigo-950 font-black">{med.userEmail} ({med.userId})</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px]">{lang === 'ar' ? 'تفاصيل الصفقة والضمان:' : 'Deal details:'}</span>
                      <span className="text-slate-700 font-medium">{med.description}</span>
                    </div>
                    {med.notes && (
                      <div>
                        <span className="text-slate-400 font-bold block text-[10px]">{lang === 'ar' ? 'ملاحظات المستخدم الإضافية:' : 'User Notes:'}</span>
                        <span className="text-slate-600 font-medium italic">{med.notes}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px]">{lang === 'ar' ? 'المبلغ وطريقة الدفع:' : 'Amount & Method:'}</span>
                      <span className="text-emerald-700 font-extrabold font-mono text-xs">{med.amount}</span>
                    </div>
                  </div>

                  {/* Mediation Status */}
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className={`px-2.5 py-0.5 rounded-full border ${
                      med.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : med.status === 'contacted'
                        ? 'bg-sky-50 text-sky-700 border-sky-100'
                        : med.status === 'cancelled'
                        ? 'bg-rose-50 text-rose-600 border-rose-100'
                        : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {med.status.toUpperCase()}
                    </span>
                    <span className="text-slate-400 font-mono">{new Date(med.createdAt).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}</span>
                  </div>

                  {/* Admin notes edit */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <label className="block text-[10px] text-slate-500 font-black">
                      {lang === 'ar' ? '📝 الملاحظات والبيانات الإدارية والخاصة (تظهر للإدارة فقط):' : '📝 Admin Internal Notes (Private):'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={mediationNotesInput[med.id] || ''}
                        onChange={e => setMediationNotesInput({
                          ...mediationNotesInput,
                          [med.id]: e.target.value
                        })}
                        placeholder={lang === 'ar' ? 'سجل هنا أرقام الهواتف، حالة التسليم، إلخ...' : 'Notes...'}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium text-right focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                      <button
                        onClick={() => handleSaveMediationNotes(med.id)}
                        className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black transition-all shadow-sm shrink-0"
                      >
                        {lang === 'ar' ? 'حفظ' : 'Save'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: AUDIT LOGS ADMIN SECTION */}
      {activeTab === 'logs' && (
        <div className="space-y-4 animate-fade-in text-right" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <div className="flex justify-between items-center px-1">
            {confirmClearLogs ? (
              <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-100 p-1 rounded-lg animate-pulse">
                <span className="text-[10px] font-black text-rose-600 px-1">{lang === 'ar' ? 'مسح الكل بالتأكيد؟' : 'Clear all logs?'}</span>
                <button
                  onClick={() => {
                    StorageEngine.saveAdminLogs([]);
                    loadAllData();
                    setConfirmClearLogs(false);
                  }}
                  className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-black"
                >
                  {lang === 'ar' ? 'نعم' : 'Yes'}
                </button>
                <button
                  onClick={() => setConfirmClearLogs(false)}
                  className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[10px] font-bold"
                >
                  {lang === 'ar' ? 'لا' : 'No'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClearLogs(true)}
                className="text-[10px] text-rose-600 font-black hover:underline"
              >
                {lang === 'ar' ? 'تفريغ السجل نهائياً' : 'Clear All Logs'}
              </button>
            )}
            <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-1.5 justify-end">
              <span>{lang === 'ar' ? 'سجل العمليات والرقابة الإدارية' : 'Admin Operations Audit Log'}</span>
              <Terminal className="w-4 h-4 text-rose-600" />
            </h3>
          </div>

          {allLogs.length === 0 ? (
            <div className="text-center text-slate-400 py-12 bg-white rounded-2xl border border-slate-100 text-xs">
              {lang === 'ar' ? 'السجل فارغ حالياً.' : 'The audit log is empty.'}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-100 p-4 divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
              {allLogs.slice().reverse().map((log, index) => {
                if (!log) return null;
                const logId = log.id || `log-fallback-${index}`;
                const rawAction = log.actionType || (log as any).action || 'ACTION';
                const actionText = String(rawAction).replace(/_/g, ' ').toUpperCase();
                const logDetails = log.details ? String(log.details) : '';
                
                let dateStr = '';
                try {
                  const dateVal = log.createdAt || (log as any).timestamp;
                  const dateObj = dateVal ? new Date(dateVal) : new Date();
                  dateStr = isNaN(dateObj.getTime()) ? '---' : dateObj.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US');
                } catch (e) {
                  dateStr = '---';
                }

                return (
                  <div key={logId} className="py-3 text-right flex justify-between items-start gap-4 text-xs">
                    <span className="text-slate-400 font-mono text-[10px] shrink-0 mt-0.5">
                      {dateStr}
                    </span>
                    <div className="space-y-0.5">
                      <span className="text-indigo-950 font-black">
                        {actionText}
                      </span>
                      <p className="text-[11px] text-slate-600 font-medium">
                        {logDetails}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: CONTACT CHANNELS */}
      {activeTab === 'contacts' && (
        <div className="space-y-4 animate-fade-in text-right" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-1.5 justify-end">
            <span>{lang === 'ar' ? 'إعدادات قنوات التواصل والدعم' : 'Support & Contact Channels Settings'}</span>
            <Settings className="w-4 h-4 text-indigo-600" />
          </h3>

          <form onSubmit={handleSaveContacts} className="bg-white p-6 rounded-3xl border border-slate-100 space-y-4 shadow-sm">
            {contactsSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs rounded-xl text-center font-bold flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>{contactsSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* WhatsApp details */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-700">
                  {lang === 'ar' ? 'رابط واتساب المباشر' : 'WhatsApp Link URL'}
                </label>
                <input
                  type="text"
                  value={whatsappLink}
                  onChange={e => setWhatsappLink(e.target.value)}
                  placeholder="https://wa.me/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium text-left focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-700">
                  {lang === 'ar' ? 'رقم أو تفاصيل عرض واتساب' : 'WhatsApp Display Label/Number'}
                </label>
                <input
                  type="text"
                  value={whatsappDetail}
                  onChange={e => setWhatsappDetail(e.target.value)}
                  placeholder="07502302723"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium text-right focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Telegram details */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-700">
                  {lang === 'ar' ? 'رابط قناة تليجرام' : 'Telegram Channel URL'}
                </label>
                <input
                  type="text"
                  value={telegramChannel}
                  onChange={e => setTelegramChannel(e.target.value)}
                  placeholder="https://t.me/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium text-left focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-700">
                  {lang === 'ar' ? 'معرف أو تفاصيل تليجرام' : 'Telegram Display Label/Handle'}
                </label>
                <input
                  type="text"
                  value={telegramDetail}
                  onChange={e => setTelegramDetail(e.target.value)}
                  placeholder="@predatorxi"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium text-right focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all shadow-md"
              >
                {lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
