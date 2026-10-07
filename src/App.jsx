import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Wrench, LogOut, PlusCircle, Search, Moon, Sun, Settings, Download, 
  RefreshCw, LayoutDashboard, Users, DollarSign, Store, Layers, Inbox, 
  Cog, CheckCircle, PackageCheck, Banknote, Laptop, BellRing, Send, 
  Clock, ArrowRight, ArrowRightCircle, List, Kanban, MessageSquare, 
  FileText, Edit3, Trash2, Plus, Phone, UserPlus, Receipt, Save, X, Check, Printer,
  Database, Sparkles, ShieldCheck
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { DEFAULT_TICKETS, DEFAULT_SETTINGS } from './data/mockData';
import { translations } from './i18n';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// ============================================================
//  🔔 SOUND ENGINE — Web Audio API (no external files needed)
// ============================================================
const playSound = (() => {
  let ctx = null;
  const getCtx = () => {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  };
  const play = (notes, type = 'sine', gainVal = 0.18) => {
    try {
      const ac = getCtx();
      // Resume AudioContext if browser suspended it (autoplay policy fix)
      const doPlay = () => {
        notes.forEach(([freq, start, dur]) => {
          const osc = ac.createOscillator();
          const gain = ac.createGain();
          osc.connect(gain);
          gain.connect(ac.destination);
          osc.type = type;
          osc.frequency.setValueAtTime(freq, ac.currentTime + start);
          gain.gain.setValueAtTime(0, ac.currentTime + start);
          gain.gain.linearRampToValueAtTime(gainVal, ac.currentTime + start + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + start + dur);
          osc.start(ac.currentTime + start);
          osc.stop(ac.currentTime + start + dur + 0.05);
        });
      };
      if (ac.state === 'suspended') {
        ac.resume().then(doPlay);
      } else {
        doPlay();
      }
    } catch (e) { /* silent fail */ }
  };
  return {
    newTicket:    () => play([[523,0,0.15],[659,0.15,0.15],[784,0.30,0.25]], 'sine', 0.15),
    success:      () => play([[523,0,0.1],[659,0.1,0.1],[784,0.2,0.1],[1047,0.3,0.3]], 'sine', 0.16),
    payment:      () => play([[880,0,0.08],[1109,0.08,0.08],[1319,0.16,0.12],[1760,0.28,0.2]], 'triangle', 0.14),
    whatsapp:     () => play([[660,0,0.07],[880,0.08,0.07],[660,0.16,0.07]], 'sine', 0.12),
    error:        () => play([[220,0,0.15],[180,0.15,0.2]], 'sawtooth', 0.1),
    deleteSound:  () => play([[300,0,0.08],[200,0.08,0.15]], 'sawtooth', 0.08),
    statusChange: () => play([[440,0,0.1],[554,0.12,0.15]], 'sine', 0.13),
  };
})();

export default function App() {
  // --- STATE ---
  const [lang, setLang] = useState(() => localStorage.getItem('sakaria_lang') || 'so');
  const [theme, setTheme] = useState(() => localStorage.getItem('sakaria_theme') || 'dark');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [ticketView, setTicketView] = useState('table'); // 'table' | 'kanban'
  const [dbConnected, setDbConnected] = useState(false);
  const [auth, setAuth] = useState(() => {
    try {
      const saved = localStorage.getItem('sakaria_auth');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      // Verify token structure exists
      if (!parsed?.token || !parsed?.user) {
        localStorage.removeItem('sakaria_auth');
        return null;
      }
      return parsed;
    } catch(e) {
      localStorage.removeItem('sakaria_auth');
      return null;
    }
  });
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [users, setUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState({ username: '', password: '', full_name: '', role: 'technician' });
  const [editingUser, setEditingUser] = useState(null);
  
  // Data
  const [tickets, setTickets] = useState(() => {
    const saved = localStorage.getItem('sakaria_tickets');
    return saved ? JSON.parse(saved) : DEFAULT_TICKETS;
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('sakaria_settings');
    const parsed = saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...parsed, phone: "+252 61 1616691" };
  });

  // Search & Filter
  const [globalSearch, setGlobalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [technicianFilter, setTechnicianFilter] = useState('ALL');
  const [customerSearch, setCustomerSearch] = useState('');

  const techniciansList = ['Sakaria', 'Cabdiraxmaan', 'Sakaria Dheere'];


  // Modals
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);

  // Ticket Form State
  const [formData, setFormData] = useState({
    custName: '',
    custPhone: '',
    deviceType: 'Laptop',
    brandModel: '',
    serial: '',
    accessories: '',
    password: '',
    issue: '',
    techNotes: '',
    status: 'Received',
    technician: 'Sakaria',
    labor: 20,
    parts: 0,
    discount: 0,
    paid: 0,
    method: 'Cash'
  });

  // Toasts
  const [toasts, setToasts] = useState([]);

  // Dictionary shorthand
  const t = translations[lang] || translations.so;

  
  // --- REAL BACKEND API SYNC ENGINE ---
  const API_BASE = '/api';
  const [cloudSynced, setCloudSynced] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchCloudData = async (isInitial = false) => {
    if (!auth?.token || auth?.token?.startsWith('fallback_token_')) return;
    try {
      setIsSyncing(true);
      const res = await fetch(`${API_BASE}/tickets`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.tickets)) {
          setCloudSynced(true);
          setDbConnected(true);
          setLastSyncTime(new Date().toLocaleTimeString());
          
          setTickets(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(data.tickets)) {
               if (!isInitial && prev.length > 0 && data.tickets.length > prev.length) playSound.newTicket();
               return data.tickets;
            }
            return prev;
          });
        }
      }
    } catch (e) {
      setDbConnected(false);
    } finally {
      setIsSyncing(false);
    }
  };

  // Persist tickets locally for seamless mobile & offline access
  useEffect(() => {
    if (tickets && Array.isArray(tickets) && tickets.length > 0) {
      try {
        localStorage.setItem('sakaria_tickets', JSON.stringify(tickets));
      } catch (e) {}
    }
  }, [tickets]);

  const forceCloudSync = () => {
    fetchCloudData(true);
    showToast(lang === 'so' ? '🔄 Xogta waa la cusbooneysiiyay' : '🔄 Synced Successfully!', 'success');
  };

  const pushToCloud = () => {}; // Dummy to prevent errors from old UI calls

  useEffect(() => {
    if (!auth?.token) return;
    fetchCloudData(true);
    const interval = setInterval(() => fetchCloudData(false), 3000);
    const handleFocus = () => fetchCloudData(false);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', handleFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('visibilitychange', handleFocus);
    };
  }, [auth]);
  


  // --- PERSISTENCE & THEME EFFECTS ---
  useEffect(() => {
    localStorage.setItem('sakaria_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('sakaria_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('sakaria_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('sakaria_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Toast Helper
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3500);
  };

  // --- STATS & COMPUTATIONS ---
  const stats = useMemo(() => {
    const total = tickets.length;
    const received = tickets.filter(tk => tk.status === 'Received').length;
    const repairing = tickets.filter(tk => tk.status === 'Repairing').length;
    const ready = tickets.filter(tk => tk.status === 'Ready').length;
    const delivered = tickets.filter(tk => tk.status === 'Delivered').length;

    let revenue = 0;
    let pending = 0;
    let partsCost = 0;

    tickets.forEach(tk => {
      revenue += Number(tk.pricing.paid) || 0;
      pending += Number(tk.pricing.balance) || 0;
      partsCost += Number(tk.pricing.parts) || 0;
    });

    return { total, received, repairing, ready, delivered, revenue, pending, partsCost };
  }, [tickets]);

  // Status progression order
  const statusFlow = ['Received', 'Repairing', 'Ready', 'Delivered'];

  const advanceStatus = async (ticketId) => {
    const tk = tickets.find(t => t.id === ticketId);
    if (!tk) return;
    const curIdx = statusFlow.indexOf(tk.status);
    if (curIdx < statusFlow.length - 1) {
      const nextStatus = statusFlow[curIdx + 1];
      const updated = { ...tk, status: nextStatus };
      
      // Optimistic update
      setTickets(tickets.map(item => item.id === ticketId ? updated : item));
      if (nextStatus === 'Ready' || nextStatus === 'Delivered') playSound.success();
      else playSound.statusChange();

      try {
        await fetch(`${API_BASE}/tickets/${ticketId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${auth.token}` },
          body: JSON.stringify({ status: nextStatus })
        });
        fetchCloudData();
      } catch (e) {}
    }
  };

  const deleteTicket = async (ticketId) => {
    const confirmMsg = lang === 'so' ? `Ma hubtaa inaad tirto tikidhka ${ticketId}?` : `Are you sure you want to delete ticket ${ticketId}?`;
    if (window.confirm(confirmMsg)) {
      playSound.deleteSound();
      setTickets(tickets.filter(tk => tk.id !== ticketId)); // Optimistic
      try {
        await fetch(`${API_BASE}/tickets/${ticketId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${auth.token}` }
        });
        showToast(lang === 'so' ? 'Tikidhka waa la tirtiray' : 'Ticket deleted', 'info');
        fetchCloudData();
      } catch(e) {}
    }
  };



  const getStatusLabel = (status) => {
    if (lang === 'so') {
      switch(status) {
        case 'Received': return '📥 La Helay';
        case 'Repairing': return '⚙️ Dayactir';
        case 'Ready': return '✅ Diyaar Ah';
        case 'Delivered': return '🚀 La Qaatay';
        default: return status;
      }
    } else {
      switch(status) {
        case 'Received': return '📥 Received';
        case 'Repairing': return '⚙️ Repairing';
        case 'Ready': return '✅ Ready';
        case 'Delivered': return '🚀 Delivered';
        default: return status;
      }
    }
  };

  // Refined pill badge styles
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Received': 
        return 'bg-sky-50 text-sky-700 border border-sky-200/80 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800/80 shadow-sm shadow-sky-500/10';
      case 'Repairing': 
        return 'bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/80 shadow-sm shadow-amber-500/10';
      case 'Ready': 
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/80 shadow-sm shadow-emerald-500/10';
      case 'Delivered': 
        return 'bg-purple-50 text-purple-700 border border-purple-200/80 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/80 shadow-sm shadow-purple-500/10';
      default: 
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  // Filtered Tickets (Role-Based: Technicians only see their own tickets!)
  const filteredTickets = useMemo(() => {
    const q = (globalSearch || '').toLowerCase().trim();
    return tickets.filter(tk => {
      // 🔒 TECHNICIAN SCOPE SECURITY: Technicians ONLY see tickets assigned to them!
      if (auth?.user?.role === 'technician') {
        const userTechName = (auth.user.full_name || auth.user.username || '').toLowerCase();
        const userShortName = (auth.user.username || '').toLowerCase();
        const ticketTechName = (tk.technician || tk.technician_name || '').toLowerCase();

        const isMine = ticketTechName.includes(userShortName) || 
                       userTechName.includes(ticketTechName) ||
                       ticketTechName.includes(userTechName);

        if (!isMine) return false;
      }

      const matchText = !q || 
        tk.id.toLowerCase().includes(q) ||
        tk.customer.name.toLowerCase().includes(q) ||
        tk.customer.phone.toLowerCase().includes(q) ||
        tk.device.brandModel.toLowerCase().includes(q) ||
        (tk.device.serial && tk.device.serial.toLowerCase().includes(q)) ||
        tk.issue.toLowerCase().includes(q);

      const matchStatus = statusFilter === 'ALL' || tk.status === statusFilter;

      let pStatus = 'Unpaid';
      if (tk.pricing.balance === 0) pStatus = 'Paid';
      else if (tk.pricing.paid > 0 && tk.pricing.balance > 0) pStatus = 'Partial';

      const matchPayment = paymentFilter === 'ALL' || pStatus === paymentFilter;
      const matchTechnician = technicianFilter === 'ALL' || (tk.technician || 'Sakaria') === technicianFilter;

      return matchText && matchStatus && matchPayment && matchTechnician;
    });
  }, [tickets, globalSearch, statusFilter, paymentFilter, technicianFilter, auth]);


  // Aggregated Customers
  const customerList = useMemo(() => {
    const map = {};
    tickets.forEach(tk => {
      const key = tk.customer.phone.trim();
      if (!map[key]) {
        map[key] = {
          name: tk.customer.name,
          phone: tk.customer.phone,
          email: tk.customer.email || '',
          tickets: [],
          totalSpent: 0,
          balanceDue: 0
        };
      }
      map[key].tickets.push(tk);
      map[key].totalSpent += Number(tk.pricing.paid) || 0;
      map[key].balanceDue += Number(tk.pricing.balance) || 0;
    });

    const list = Object.values(map);
    const q = customerSearch.toLowerCase().trim();
    return list.filter(c => !q || c.name.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q));
  }, [tickets, customerSearch]);

  // Open Ticket Modal for New
  const openNewTicketModal = (initialCust = null) => {
    setEditingTicket(null);
    setFormData({
      custName: initialCust?.name || '',
      custPhone: initialCust?.phone || '',
      deviceType: 'Laptop',
      brandModel: '',
      serial: '',
      accessories: '',
      password: '',
      issue: '',
      techNotes: '',
      status: 'Received',
      technician: 'Sakaria',
      labor: 20,
      parts: 0,
      discount: 0,
      paid: 0,
      method: 'Cash'
    });
    setIsTicketModalOpen(true);
  };

  // Open Ticket Modal for Edit
  const openEditTicketModal = (tk) => {
    setEditingTicket(tk);
    setFormData({
      custName: tk.customer.name,
      custPhone: tk.customer.phone,
      deviceType: tk.device.type || 'Laptop',
      brandModel: tk.device.brandModel,
      serial: tk.device.serial || '',
      accessories: tk.device.accessories || '',
      password: tk.device.password || '',
      issue: tk.issue,
      techNotes: tk.techNotes || '',
      status: tk.status,
      technician: tk.technician || 'Sakaria',
      labor: tk.pricing.labor,
      parts: tk.pricing.parts,
      discount: tk.pricing.discount || 0,
      paid: tk.pricing.paid,
      method: tk.pricing.method || 'Cash'
    });
    setIsTicketModalOpen(true);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const un = (loginForm.username || '').toLowerCase().trim();
    const pw = loginForm.password;

    // 1. Try Online Backend Server API first
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: un, password: pw })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.token && data.user) {
          setAuth({ token: data.token, user: data.user });
          localStorage.setItem('sakaria_auth', JSON.stringify({ token: data.token, user: data.user }));
          showToast(lang === 'so' ? 'Waa lagalay ✅' : 'Login successful ✅', 'success');
          playSound.success();
          return;
        }
      }
    } catch (err) {
      // Backend not reached (e.g. GitHub Pages or Mobile Web without running server)
    }

    // 2. Fallback Login (Guarantees Mobile & GitHub Pages work 100% anytime!)
    let fallbackUser = null;
    if (un === 'admin' && pw === 'Admin@Sakaria2026') {
      fallbackUser = { id: 1, username: 'admin', full_name: 'Admin (Sakaria Center)', role: 'admin' };
    } else if (un === 'sakaria' && pw === 'Tech@Sakaria123') {
      fallbackUser = { id: 2, username: 'sakaria', full_name: 'Sakaria Dheere', role: 'technician' };
    } else if (un === 'cabdiraxmaan' && pw === 'Tech@Sakaria123') {
      fallbackUser = { id: 3, username: 'cabdiraxmaan', full_name: 'Cabdiraxmaan', role: 'technician' };
    } else if (un === 'receptionist' && pw === 'Recep@Sakaria123') {
      fallbackUser = { id: 4, username: 'receptionist', full_name: 'Receptionist', role: 'receptionist' };
    }

    if (fallbackUser) {
      const fallbackAuth = { token: 'fallback_token_' + Date.now(), user: fallbackUser };
      setAuth(fallbackAuth);
      localStorage.setItem('sakaria_auth', JSON.stringify(fallbackAuth));
      showToast(lang === 'so' ? 'Waa lagalay ✅' : 'Logged in successfully ✅', 'success');
      playSound.success();
    } else {
      showToast(lang === 'so' ? 'Magaca ama Password-ka ma saxana!' : 'Invalid username or password!', 'error');
      playSound.error();
    }
  };
  
  const handleLogout = () => {
    setAuth(null);
    localStorage.removeItem('sakaria_auth');
    setTickets([]);
  };

  // Fetch Users (Admin only)
  const fetchUsers = async () => {
    if (!auth?.token || auth?.user?.role !== 'admin') return;
    try {
      const res = await fetch(`${API_BASE}/users`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch(e) { console.error('fetchUsers error:', e); }
  };

  // Save User (Create/Update)
  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      const isNew = !editingUser;
      const url = isNew ? `${API_BASE}/users` : `${API_BASE}/users/${editingUser.id}`;
      const method = isNew ? 'POST' : 'PUT';
      const body = isNew ? userForm : { full_name: userForm.full_name, role: userForm.role, ...(userForm.password ? { password: userForm.password } : {}) };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${auth.token}` },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        showToast(isNew ? 'User cusub waa la sameeyay ✅' : 'User waa la cusbooneysiiyay ✅', 'success');
        setShowUserModal(false);
        setEditingUser(null);
        setUserForm({ username: '', password: '', full_name: '', role: 'technician' });
        fetchUsers();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed', 'error');
      }
    } catch(e) { showToast('Network error', 'error'); }
  };

  // Delete User
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Ma hubtaa inaad tirto user-kan?')) return;
    try {
      const res = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (res.ok) {
        showToast('User waa la tirtiray', 'info');
        fetchUsers();
      }
    } catch(e) {}
  };

  // Fetch users when tab changes to users
  useEffect(() => {
    if (activeTab === 'users' && auth?.user?.role === 'admin') fetchUsers();
  }, [activeTab]);

  // Save Ticket Handler (API-based)
  const handleSaveTicket = async (e) => {
    e.preventDefault();
    const labor = parseFloat(formData.labor) || 0;
    const parts = parseFloat(formData.parts) || 0;
    const discount = parseFloat(formData.discount) || 0;
    const paid = parseFloat(formData.paid) || 0;

    const payload = {
      customer: { name: formData.custName.trim(), phone: formData.custPhone.trim() },
      device: { type: formData.deviceType, brandModel: formData.brandModel.trim(), serial: formData.serial.trim(), accessories: formData.accessories.trim(), password: formData.password.trim() },
      issue: formData.issue.trim(),
      techNotes: formData.techNotes.trim(),
      status: formData.status,
      technicianName: formData.technician.trim(),
      pricing: { labor, parts, discount, paid, method: formData.method }
    };

    try {
      const isNew = !editingTicket;
      const url = isNew ? `${API_BASE}/tickets` : `${API_BASE}/tickets/${editingTicket.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${auth.token}` },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast(lang === 'so' ? 'Waa la keydiyay ✅' : 'Saved successfully ✅', 'success');
        playSound.success();
        setIsTicketModalOpen(false);
        setEditingTicket(null);
        fetchCloudData();
        setFormData({
          custName: '', custPhone: '', deviceType: 'Laptop', brandModel: '', serial: '', accessories: '', password: '',
          issue: '', techNotes: '', status: 'Received', technician: 'Sakaria', labor: 20, parts: 0, discount: 0, paid: 0, method: 'Cash'
        });
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to save', 'error');
      }
    } catch(err) {
      showToast('Network Error - Server ma socdo', 'error');
    }
  };

  // WhatsApp helper - Formats Somali & International phone numbers perfectly
  const formatWhatsAppPhone = (phoneStr) => {
    if (!phoneStr) return '';
    let cleaned = phoneStr.toString().replace(/[^0-9]/g, '');
    if (!cleaned) return '';
    
    // Somali carrier numbers: 061, 062, 068, 077, etc.
    if (cleaned.startsWith('0')) {
      cleaned = '252' + cleaned.slice(1);
    } else if (!cleaned.startsWith('252') && (cleaned.length === 8 || cleaned.length === 9)) {
      cleaned = '252' + cleaned;
    }
    return cleaned;
  };

  const sendWhatsApp = (ticket) => {
    if (!ticket || !ticket.customer) {
      showToast(lang === 'so' ? 'Xogta tikidhka ma helin!' : 'Ticket data missing!', 'error');
      return;
    }

    const cleanPhone = formatWhatsAppPhone(ticket.customer.phone);
    if (!cleanPhone || cleanPhone.length < 8) {
      showToast(lang === 'so' ? 'Lambaranka macmiilka ma saxana! (Tusaale: 061XXXXXXX)' : 'Invalid customer phone number!', 'error');
      playSound.error();
      return;
    }

    const statusLabel = getStatusLabel(ticket.status);
    const shop = settings?.shopName || 'Sakaria Repair Center';
    const shopPhone = settings?.phone || '+252 61 1616691';

    const msg = lang === 'so'
      ? `Asc *${ticket.customer.name}*!\n\nWaxaan kaala soo xiriiraynaa *${shop}*.\n\n📦 *Tikidhka:* ${ticket.id}\n💻 *Qalabka:* ${ticket.device?.brandModel || 'Qalab'}\n⚡ *Xaaladda:* ${statusLabel}\n\n📊 *Xisaabta:* \n• Wadarta: $${ticket.pricing?.total || 0}\n• La Bixiyay: $${ticket.pricing?.paid || 0}\n• Hadhay (Balance): $${ticket.pricing?.balance || 0}\n\n${(ticket.status === 'Ready' || ticket.status === 'Delivered') ? '✅ Qalabkaagii waa diyaar! Waad soo doonan kartaa.\n\n' : ''}Mahadsanid! Tel: ${shopPhone}`
      : `Hello *${ticket.customer.name}*!\n\nUpdate from *${shop}*:\n\n📦 *Ticket:* ${ticket.id}\n💻 *Device:* ${ticket.device?.brandModel || 'Device'}\n⚡ *Status:* ${statusLabel}\n\n📊 *Billing:* \n• Total: $${ticket.pricing?.total || 0}\n• Paid: $${ticket.pricing?.paid || 0}\n• Balance Due: $${ticket.pricing?.balance || 0}\n\n${(ticket.status === 'Ready' || ticket.status === 'Delivered') ? '✅ Your device is ready for pickup!\n\n' : ''}Thank you! Tel: ${shopPhone}`;

    // Direct wa.me URL works seamlessly on Mobile App and WhatsApp Web
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;

    try {
      const win = window.open(waUrl, '_blank', 'noopener,noreferrer');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        window.location.href = waUrl;
      }
    } catch (e) {
      window.location.href = waUrl;
    }

    showToast(lang === 'so' ? `📲 Farriin WhatsApp loo diray ${ticket.customer.name}` : `📲 WhatsApp sent to ${ticket.customer.name}`, 'success');
    playSound.whatsapp();
  };



  // Data Export / Reset
  const exportBackup = () => {
    const payload = { exportedAt: new Date().toISOString(), version: '2.5-react-db', settings, tickets };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sakaria_Repair_Manager_DB_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(lang === 'so' ? 'Xogta oo dhan waa la soo dejiyay!' : 'Backup exported successfully!', 'success');
  };

  const resetData = () => {
    if (window.confirm(lang === 'so' ? 'Dib ma ugu celinaa xogtii tusaalaha ahayd?' : 'Reset to sample data?')) {
      setTickets(DEFAULT_TICKETS);
      setSettings(DEFAULT_SETTINGS);
      fetch('/api/reset', { method: 'POST' }).catch(err => console.error("Database reset error:", err));
      showToast(lang === 'so' ? 'Xogtii hore dib ayaa loo soo celiyay' : 'Reset to sample data', 'info');
    }
  };

  // --- CHART CONFIGURATIONS ---
  const statusChartData = {
    labels: [
      lang === 'so' ? 'La Helay' : 'Received',
      lang === 'so' ? 'Dayactir' : 'Repairing',
      lang === 'so' ? 'Diyaar' : 'Ready',
      lang === 'so' ? 'La Qaatay' : 'Delivered'
    ],
    datasets: [{
      data: [stats.received, stats.repairing, stats.ready, stats.delivered],
      backgroundColor: ['#0ea5e9', '#f59e0b', '#10b981', '#8b5cf6'],
      borderWidth: 2,
      borderColor: theme === 'dark' ? '#0f172a' : '#ffffff'
    }]
  };

  const brandCounts = useMemo(() => {
    const map = {};
    tickets.forEach(tk => {
      const brand = tk.device.brandModel.split(' ')[0] || 'Other';
      map[brand] = (map[brand] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [tickets]);

  const brandsChartData = {
    labels: brandCounts.map(b => b[0]),
    datasets: [{
      label: lang === 'so' ? 'Tirada' : 'Count',
      data: brandCounts.map(b => b[1]),
      backgroundColor: '#6366f1',
      borderRadius: 8
    }]
  };

  const formTotal = Math.max(0, (parseFloat(formData.labor) || 0) + (parseFloat(formData.parts) || 0) - (parseFloat(formData.discount) || 0));
  const formBalance = Math.max(0, formTotal - (parseFloat(formData.paid) || 0));

  if (!auth?.token) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-gray-50 text-slate-900'}`}>
        <div className={`w-full max-w-md p-8 rounded-2xl shadow-2xl ${theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-100'}`}>
          <div className="flex justify-center mb-6"><Wrench className="w-16 h-16 text-blue-500" /></div>
          <h1 className="text-2xl font-bold text-center mb-8">{lang === 'so' ? 'Soo Gal System-ka' : 'Login to System'}</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">{lang === 'so' ? 'Magaca' : 'Username'}</label>
              <input type="text" value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})} className={`w-full p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'} border focus:ring-2 focus:ring-blue-500 outline-none`} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{lang === 'so' ? 'Password-ka' : 'Password'}</label>
              <input type="password" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} className={`w-full p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'} border focus:ring-2 focus:ring-blue-500 outline-none`} required />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors">
              {lang === 'so' ? 'Gudaha Gal' : 'Sign In'}
            </button>
          </form>
        </div>
        {/* Toasts */}
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
          {toasts.map(t => (
            <div key={t.id} className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white animate-slide-up ${t.type === 'success' ? 'bg-emerald-500' : t.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}>
              {t.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="font-medium">{t.message}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* HEADER & TOPBAR (Glassmorphic) */}
      <header className="bg-white/85 dark:bg-[#0f172a]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-30 shadow-sm shadow-slate-900/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Database Badge */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600 dark:from-blue-400 dark:via-indigo-300 dark:to-violet-400 bg-clip-text text-transparent">
                    Sakaria Repair Manager
                  </h1>
                  <span className="text-amber-400 text-sm">⭐</span>
                    {auth?.user && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${auth.user.role === 'admin' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : auth.user.role === 'technician' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'}`}>
                        {auth.user.role.toUpperCase()} - {auth.user.full_name}
                      </span>
                    )}
                  
                  {/* Database Live Badge + Manual Sync Button */}
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={forceCloudSync}
                      className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition active:scale-95 ${
                        dbConnected || cloudSynced
                          ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' 
                          : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                      }`} 
                      title={lastSyncTime ? `Guji si aad u waafajiso (Sida u dambaysay: ${lastSyncTime})` : 'Click to sync live Cloud DB'}
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span>{cloudSynced ? '☁️ Cloud Sync Live' : (dbConnected ? 'Database' : 'Local')}</span>
                      <RefreshCw className="w-3 h-3 text-indigo-500 hover:rotate-180 transition-transform duration-500" />
                    </button>
                  </div>


                </div>
                <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400">{t.subtitle}</p>
              </div>
            </div>

            {/* Global Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-6">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input 
                  type="text" 
                  value={globalSearch}
                  onChange={(e) => {
                    setGlobalSearch(e.target.value);
                    if (e.target.value && activeTab !== 'tickets') setActiveTab('tickets');
                  }}
                  placeholder={lang === 'so' ? "Raadi macmiil, taleefan, tikidh (SRM-...), qalab..." : "Search customer, phone, ticket ID (SRM-...), device..."}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition"
                />
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* WhatsApp Quick Chat */}
              <a 
                href="https://wa.me/252611616691" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl shadow-md shadow-emerald-500/20 transition hover:scale-[1.02] active:scale-95"
                title="WhatsApp: +252 61 1616691"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">+252 61 1616691</span>
              </a>

              <button 
                onClick={() => openNewTicketModal()}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md shadow-indigo-500/20 transition hover:scale-[1.02] active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">{t.newTicket}</span>
              </button>

              {/* Language Switcher */}
              <button 
                onClick={() => setLang(l => l === 'so' ? 'en' : 'so')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
                title="Switch Language"
              >
                <span>{lang === 'so' ? '🇸🇴' : '🇬🇧'}</span>
                <span>{lang === 'so' ? 'SO' : 'EN'}</span>
              </button>

              {/* Dark / Light Toggle */}
              <button 
                onClick={() => setTheme(th => th === 'dark' ? 'light' : 'dark')}
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
              </button>

              {/* 🔴 LOGOUT BUTTON */}
              <button 
                onClick={handleLogout}
                className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition"
                title={lang === 'so' ? 'Ka Bax' : 'Logout'}
              >
                <LogOut className="w-4 h-4" />
              </button>

              {/* Backup / Settings Menu */}
              <div className="relative">
                <button 
                  onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)}
                  className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  <Settings className="w-4 h-4" />
                </button>
                {isSettingsMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1 text-sm z-50 animate-scale-up">
                    <button 
                      onClick={() => { exportBackup(); setIsSettingsMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                    >
                      <Download className="w-4 h-4 text-indigo-500" />
                      <span>{t.exportBackup}</span>
                    </button>
                    <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                    <button 
                      onClick={() => { resetData(); setIsSettingsMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>{t.resetSample}</span>
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Tab Navigation — Desktop only */}
        <div className="hidden sm:block border-t border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 no-scrollbar">
            {[
              { id: 'dashboard', label: t.navDashboard, icon: LayoutDashboard },
              { id: 'tickets', label: t.navTickets, icon: Wrench, count: tickets.length },
              { id: 'customers', label: t.navCustomers, icon: Users, count: customerList.length },
              { id: 'finances', label: t.navFinances, icon: DollarSign },
              { id: 'shopInfo', label: t.navShopInfo, icon: Store },
              ...(auth?.user?.role === 'admin' ? [{ id: 'users', label: '👥 Users', icon: Users }] : []),
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.count !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 sm:pb-6">

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Radiant Hero Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 border border-indigo-500/20 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div>
                  <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
                    <span className="flex items-center gap-1.5 bg-indigo-500/20 border border-indigo-400/30 px-2.5 py-0.5 rounded-full">
                      <Sparkles className="w-3 h-3 text-indigo-300" />
                      <span>{settings.shopName}</span>
                    </span>
                    <span>•</span>
                    <span className="text-slate-300">{new Date().toLocaleDateString(lang === 'so' ? 'so-SO' : 'en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">{t.dashboardGreeting}</h2>
                  <p className="text-indigo-200/90 text-sm mt-1.5 max-w-xl">{t.dashboardSub}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setActiveTab('tickets')} className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2.5 rounded-xl text-sm font-bold backdrop-blur-md transition hover:scale-105 active:scale-95">
                    {t.viewAllTickets} →
                  </button>
                  <button onClick={() => openNewTicketModal()} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/30 transition hover:scale-105 active:scale-95">
                    + {t.createTicket}
                  </button>
                </div>
              </div>
            </div>

            {/* Glowing Accent KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
              
              {/* Total Repairs */}
              <div className="glow-card bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t.kpiTotal}</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black">{stats.total}</span>
                  <span className="text-[11px] text-slate-400 block font-medium">{t.allTime}</span>
                </div>
              </div>

              {/* Received */}
              <div className="glow-card bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 to-blue-500"></div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t.statusReceived}</span>
                  <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                    <Inbox className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-sky-600 dark:text-sky-400">{stats.received}</span>
                  <span className="text-[11px] text-slate-400 block font-medium">{t.stage1}</span>
                </div>
              </div>

              {/* Repairing */}
              <div className="glow-card bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500"></div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t.statusRepairing}</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Cog className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-amber-500 dark:text-amber-400">{stats.repairing}</span>
                  <span className="text-[11px] text-slate-400 block font-medium">{t.stage2}</span>
                </div>
              </div>

              {/* Ready */}
              <div className="glow-card bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t.statusReady}</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-emerald-500 dark:text-emerald-400">{stats.ready}</span>
                  <span className="text-[11px] text-slate-400 block font-medium">{t.stage3}</span>
                </div>
              </div>

              {/* Delivered */}
              <div className="glow-card bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-indigo-500"></div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t.statusDelivered}</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <PackageCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-purple-500 dark:text-purple-400">{stats.delivered}</span>
                  <span className="text-[11px] text-slate-400 block font-medium">{t.stage4}</span>
                </div>
              </div>

              {/* Revenue */}
              <div className="glow-card bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t.kpiRevenue}</span>
                  <div className="w-8 h-8 rounded-xl bg-green-50 dark:bg-green-950/60 text-green-600 dark:text-green-400 flex items-center justify-center">
                    <Banknote className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">${stats.revenue.toFixed(0)}</span>
                  <span className="text-[11px] text-rose-500 dark:text-rose-400 font-bold block">Due: ${stats.pending.toFixed(0)}</span>
                </div>
              </div>

            </div>

            {/* Charts & Urgent Ready List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="bg-white dark:bg-[#111827] p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
                  <Wrench className="w-4 h-4 text-indigo-500" />
                  <span>{t.chartStatusTitle}</span>
                </h3>
                <div className="relative h-60 flex items-center justify-center">
                  <Doughnut data={statusChartData} options={{ responsive: true, maintainAspectRatio: false, cutout: '70%' }} />
                </div>
              </div>

              <div className="bg-white dark:bg-[#111827] p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
                  <Laptop className="w-4 h-4 text-violet-500" />
                  <span>{t.chartBrandsTitle}</span>
                </h3>
                <div className="relative h-60 flex items-center justify-center">
                  <Bar data={brandsChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                </div>
              </div>

              <div className="bg-white dark:bg-[#111827] p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <BellRing className="w-4 h-4 text-amber-500" />
                      <span>{t.readyForDelivery}</span>
                    </h3>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                      {stats.ready}
                    </span>
                  </div>
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {tickets.filter(tk => tk.status === 'Ready').length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center italic">{lang === 'so' ? 'Hadda ma jiro qalab diyaar ah' : 'No devices ready for pickup'}</p>
                    ) : (
                      tickets.filter(tk => tk.status === 'Ready').map(tk => (
                        <div key={tk.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between gap-2 transition hover:bg-slate-100/80 dark:hover:bg-slate-800">
                          <div className="truncate">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block truncate">{tk.customer.name}</span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">{tk.device.brandModel}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button 
                              onClick={() => sendWhatsApp(tk)} 
                              className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-95 text-white flex items-center gap-1 shadow-sm shadow-emerald-500/20 transition"
                              title="Farriin WhatsApp u dir macmiilka"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>{lang === 'so' ? 'WhatsApp' : 'WA'}</span>
                            </button>
                            <button onClick={() => advanceStatus(tk.id)} className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center gap-1 shadow-sm">
                              <span>{lang === 'so' ? 'Dhiib' : 'Deliver'}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>

                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
                  <button onClick={() => { setActiveTab('tickets'); setStatusFilter('Ready'); }} className="w-full py-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 hover:from-emerald-100 hover:to-teal-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition">
                    <Send className="w-3.5 h-3.5" />
                    <span>{t.notifyCustomers}</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Recent Repairs Table Preview */}
            <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <span>{t.recentRepairs}</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.recentRepairsSub}</p>
                </div>
                <button onClick={() => setActiveTab('tickets')} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-bold">
                  <span>{t.viewAllTickets}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50/70 dark:bg-slate-800/50 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4 font-bold">Ticket</th>
                      <th className="py-3.5 px-4 font-bold">{t.thCustomer}</th>
                      <th className="py-3.5 px-4 font-bold">{t.thDevice}</th>
                      <th className="py-3.5 px-4 font-bold">{t.thStatus}</th>
                      <th className="py-3.5 px-4 font-bold">{t.thCost}</th>
                      <th className="py-3.5 px-4 text-right font-bold">{t.thActions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {tickets.slice(0, 5).map(tk => (
                      <tr key={tk.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                          <button onClick={() => { setActiveInvoice(tk); setIsInvoiceModalOpen(true); }} className="hover:underline flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-indigo-500" />
                            {tk.id}
                          </button>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-800 dark:text-slate-100 block text-xs">{tk.customer.name}</span>
                          <span className="text-[11px] text-slate-400">{tk.customer.phone}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block text-xs">{tk.device.brandModel}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(tk.status)}`}>
                            {getStatusLabel(tk.status)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-black text-xs">${tk.pricing.total}</span>
                          {tk.pricing.balance > 0 && (
                            <span className="text-[10px] text-rose-500 font-bold block">Due: ${tk.pricing.balance}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => { setActiveInvoice(tk); setIsInvoiceModalOpen(true); }} className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition">
                              <Receipt className="w-4 h-4" />
                            </button>
                            <button onClick={() => sendWhatsApp(tk)} className="p-2 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 transition">
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: REPAIR TICKETS */}
        {activeTab === 'tickets' && (
          <div className="space-y-6">
            
            {/* Filter Toolbar */}
            <div className="bg-white dark:bg-[#111827] p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input 
                    type="text" 
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    placeholder={lang === 'so' ? "Raadi tikidh, macmiil, taleefan, qalab..." : "Search by ticket #, customer, phone, device..."}
                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold"
                >
                  <option value="ALL">{t.allStatuses}</option>
                  <option value="Received">📥 Received (La helay)</option>
                  <option value="Repairing">⚙️ Repairing (Dayactir)</option>
                  <option value="Ready">✅ Ready (Diyaar)</option>
                  <option value="Delivered">🚀 Delivered (La qaatay)</option>
                </select>

                <select 
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold"
                >
                  <option value="ALL">{t.allPayments}</option>
                  <option value="Paid">🟢 Fully Paid</option>
                  <option value="Partial">🟡 Partial Payment</option>
                  <option value="Unpaid">🔴 Unpaid</option>
                </select>

                <select 
                  value={technicianFilter}
                  onChange={(e) => setTechnicianFilter(e.target.value)}
                  className="px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold"
                >
                  <option value="ALL">👨‍🔧 Dhammaan Farsamada</option>
                  {techniciansList.map(tech => (
                    <option key={tech} value={tech}>👨‍🔧 {tech}</option>
                  ))}
                </select>


                {(globalSearch || statusFilter !== 'ALL' || paymentFilter !== 'ALL' || technicianFilter !== 'ALL') && (
                  <button 
                    onClick={() => { setGlobalSearch(''); setStatusFilter('ALL'); setPaymentFilter('ALL'); setTechnicianFilter('ALL'); }}
                    className="p-2.5 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Clear Filters"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

              </div>

              {/* View Switcher & Action */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                  <button 
                    onClick={() => setTicketView('table')}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition ${
                      ticketView === 'table' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>{t.viewList}</span>
                  </button>
                  <button 
                    onClick={() => setTicketView('kanban')}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition ${
                      ticketView === 'kanban' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Kanban className="w-3.5 h-3.5" />
                    <span>{t.viewPipeline}</span>
                  </button>
                </div>

                <button 
                  onClick={() => openNewTicketModal()}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-sm font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.newTicket}</span>
                </button>
              </div>

            </div>

            {/* VIEW 1: TABLE */}
            {ticketView === 'table' && (
              <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/70 dark:bg-slate-800/50 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-3.5 px-4 font-bold">Ticket</th>
                        <th className="py-3.5 px-4 font-bold">{t.thCustomer}</th>
                        <th className="py-3.5 px-4 font-bold">{t.thDevice}</th>
                        <th className="py-3.5 px-4 font-bold">{t.thIssue}</th>
                        <th className="py-3.5 px-4 font-bold">{t.thStatus}</th>
                        <th className="py-3.5 px-4 font-bold">{t.thFinancials}</th>
                        <th className="py-3.5 px-4 text-right font-bold">{t.thActions}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {filteredTickets.map(tk => (
                        <tr key={tk.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                            <button onClick={() => { setActiveInvoice(tk); setIsInvoiceModalOpen(true); }} className="hover:underline flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-indigo-500" />
                              {tk.id}
                            </button>
                            <span className="text-[10px] text-slate-400 block font-sans">{new Date(tk.createdAt).toLocaleDateString()}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-800 dark:text-slate-100 block">{tk.customer.name}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {tk.customer.phone}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block">{tk.device.brandModel}</span>
                            <span className="text-xs text-slate-400">SN: {tk.device.serial || 'N/A'}</span>
                          </td>
                          <td className="py-3.5 px-4 max-w-xs">
                            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2" title={tk.issue}>
                              {tk.issue}
                            </p>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(tk.status)}`}>
                                {getStatusLabel(tk.status)}
                              </span>
                              {tk.status !== 'Delivered' && (
                                <button onClick={() => advanceStatus(tk.id)} title="Advance status" className="p-1 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition">
                                  <ArrowRightCircle className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <div className="font-black text-xs">${tk.pricing.total.toFixed(2)}</div>
                              {tk.pricing.balance === 0 ? (
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">Paid</span>
                              ) : (
                                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md">Due: ${tk.pricing.balance}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => { setActiveInvoice(tk); setIsInvoiceModalOpen(true); }} className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition">
                                <Receipt className="w-4 h-4" />
                              </button>
                              <button onClick={() => sendWhatsApp(tk)} className="p-2 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 transition">
                                <MessageSquare className="w-4 h-4" />
                              </button>
                              <button onClick={() => openEditTicketModal(tk)} className="p-2 rounded-xl text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition">
                                <Edit3 className="w-4 h-4" />
                              </button>
                              {auth?.user?.role === 'admin' && (
                                <button onClick={() => deleteTicket(tk.id)} className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition" title="Tirtir (Admin Only)">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredTickets.length === 0 && (
                  <div className="p-12 text-center text-slate-400">
                    <Inbox className="w-12 h-12 mx-auto mb-3 stroke-1 text-slate-300" />
                    <p className="font-semibold text-slate-600 dark:text-slate-300">{t.noTicketsFound}</p>
                    <p className="text-xs text-slate-400 mt-1">{t.tryAdjustingSearch}</p>
                  </div>
                )}
              </div>
            )}

            {/* VIEW 2: KANBAN PIPELINE */}
            {ticketView === 'kanban' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statusFlow.map(st => {
                  const items = filteredTickets.filter(tk => tk.status === st);
                  return (
                    <div key={st} className="bg-slate-100/70 dark:bg-[#111827] rounded-3xl p-4 flex flex-col border border-slate-200/80 dark:border-slate-800 shadow-sm">
                      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-200/80 dark:border-slate-800">
                        <h4 className="font-black text-sm text-slate-800 dark:text-slate-200">{getStatusLabel(st)}</h4>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm">
                          {items.length}
                        </span>
                      </div>
                      <div className="space-y-3 flex-1 min-h-[300px]">
                        {items.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400 italic">No tickets</div>
                        ) : (
                          items.map(tk => (
                            <div key={tk.id} className="glow-card bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{tk.id}</span>
                                <span className="text-xs font-black text-slate-700 dark:text-slate-200">${tk.pricing.total}</span>
                              </div>
                              <div>
                                <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{tk.customer.name}</h5>
                                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                                  <Laptop className="w-3 h-3 text-slate-400" />
                                  {tk.device.brandModel}
                                </p>
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                                {tk.issue}
                              </p>
                              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60">
                                <div className="flex items-center gap-1">
                                  <button onClick={() => { setActiveInvoice(tk); setIsInvoiceModalOpen(true); }} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700">
                                    <FileText className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => sendWhatsApp(tk)} className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-700">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => openEditTicketModal(tk)} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-700">
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                {tk.status !== 'Delivered' ? (
                                  <button onClick={() => advanceStatus(tk.id)} className="px-2.5 py-1 text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-300 rounded-xl flex items-center gap-1 transition">
                                    <span>Advance</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">✓ Delivered</span>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* TAB 3: CUSTOMER RECORDS */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-800 dark:text-slate-100">{t.customerDirectory}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.customerDirectorySub}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input 
                    type="text" 
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder={lang === 'so' ? "Raadi macmiilka magac ama taleefan..." : "Search customer by name or phone..."}
                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button 
                  onClick={() => openNewTicketModal()}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-sm font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 whitespace-nowrap"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{t.addCustomerRepair}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customerList.map(c => (
                <div key={c.phone} className="glow-card bg-white dark:bg-[#111827] p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-md shadow-indigo-500/20">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{c.name}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {c.phone}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          const clean = formatWhatsAppPhone(c.phone);
                          if (!clean) {
                            showToast(lang === 'so' ? 'Lambarku ma saxana' : 'Invalid number', 'error');
                            return;
                          }
                          const msg = lang === 'so' 
                            ? `Asc *${c.name}*, waxaan kaala soo xiriiraynaa *${settings.shopName}*. Nala soo xiriir haddii aad u baahan tahay fahfaahin ama warbixin.`
                            : `Hello *${c.name}*, contacting you from *${settings.shopName}*. Let us know if you need any info.`;
                          window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
                        }}
                        className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 transition"
                        title="WhatsApp u dir macmiilka"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4 p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-center">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">{lang === 'so' ? 'Qalab' : 'Repairs'}</span>
                        <span className="font-black text-slate-800 dark:text-slate-200 text-sm">{c.tickets.length}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">{lang === 'so' ? 'Bixiyay' : 'Spent'}</span>
                        <span className="font-black text-emerald-500 dark:text-emerald-400 text-sm">${c.totalSpent.toFixed(0)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">{lang === 'so' ? 'Deyn' : 'Balance'}</span>
                        <span className="font-black text-rose-500 dark:text-rose-400 text-sm">${c.balanceDue.toFixed(0)}</span>
                      </div>
                    </div>

                    <div className="mt-3.5 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">{lang === 'so' ? 'Qalabkii uu keenay:' : 'Recent Devices:'}</span>
                      {c.tickets.slice(0, 2).map(tk => (
                        <div key={tk.id} className="text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                          <span className="truncate">{tk.device.brandModel}</span>
                          <span className="font-mono text-[10px] text-indigo-500 font-bold">{tk.id}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <button 
                      onClick={() => { setActiveTab('tickets'); setGlobalSearch(c.phone); }}
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition"
                    >
                      {lang === 'so' ? 'Eeg Tikidhada' : 'View History'}
                    </button>
                    <button 
                      onClick={() => openNewTicketModal({ name: c.name, phone: c.phone })}
                      className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{lang === 'so' ? 'Dayactir Cusub' : 'New Repair'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {customerList.length === 0 && (
              <div className="p-12 text-center text-slate-400 bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800">
                <Users className="w-12 h-12 mx-auto mb-3 stroke-1 text-slate-300" />
                <p className="font-semibold text-slate-600 dark:text-slate-300">{t.noCustomersFound}</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: FINANCES */}
        {activeTab === 'finances' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-800 dark:text-slate-100">{t.financesTitle}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.financesSub}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glow-card bg-white dark:bg-[#111827] p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                <span className="text-xs font-bold text-slate-500">{t.totalInvoiced}</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">${(stats.revenue + stats.pending).toFixed(2)}</h3>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Gross</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{t.laborAndParts}</p>
              </div>

              <div className="glow-card bg-white dark:bg-[#111827] p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
                <span className="text-xs font-bold text-slate-500">{t.totalCollected}</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <h3 className="text-2xl font-black text-emerald-500 dark:text-emerald-400">${stats.revenue.toFixed(2)}</h3>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">Collected</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{t.cashBankEVC}</p>
              </div>

              <div className="glow-card bg-white dark:bg-[#111827] p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-pink-500"></div>
                <span className="text-xs font-bold text-slate-500">{t.pendingBalance}</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <h3 className="text-2xl font-black text-rose-500 dark:text-rose-400">${stats.pending.toFixed(2)}</h3>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">Remaining</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{t.awaitingCollection}</p>
              </div>

              <div className="glow-card bg-white dark:bg-[#111827] p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-500"></div>
                <span className="text-xs font-bold text-slate-500">{t.partsCost}</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <h3 className="text-2xl font-black text-violet-500 dark:text-violet-400">${stats.partsCost.toFixed(2)}</h3>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300">Parts</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{t.screensSSDsRAM}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-500" />
                  <span>{t.financialLedger}</span>
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50/70 dark:bg-slate-800/50 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4 font-bold">Ticket</th>
                      <th className="py-3.5 px-4 font-bold">{t.thCustomer}</th>
                      <th className="py-3.5 px-4 font-bold">{t.thLabor}</th>
                      <th className="py-3.5 px-4 font-bold">{t.thParts}</th>
                      <th className="py-3.5 px-4 font-bold">{t.thTotal}</th>
                      <th className="py-3.5 px-4 font-bold">{t.thPaid}</th>
                      <th className="py-3.5 px-4 font-bold">{t.thBalance}</th>
                      <th className="py-3.5 px-4 font-bold">{t.thPaymentMethod}</th>
                      <th className="py-3.5 px-4 text-right font-bold">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {tickets.map(tk => (
                      <tr key={tk.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">{tk.id}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-800 dark:text-slate-100 text-xs block">{tk.customer.name}</span>
                          <span className="text-[11px] text-slate-400">{tk.device.brandModel}</span>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-semibold">${tk.pricing.labor}</td>
                        <td className="py-3.5 px-4 text-xs font-semibold">${tk.pricing.parts}</td>
                        <td className="py-3.5 px-4 text-xs font-black">${tk.pricing.total}</td>
                        <td className="py-3.5 px-4 text-xs font-black text-emerald-500">${tk.pricing.paid}</td>
                        <td className="py-3.5 px-4 text-xs font-black text-rose-500">${tk.pricing.balance}</td>
                        <td className="py-3.5 px-4">
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-bold">{tk.pricing.method}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button onClick={() => { setActiveInvoice(tk); setIsInvoiceModalOpen(true); }} className="px-3 py-1 text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 rounded-xl hover:bg-indigo-100 transition">
                            Invoice
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: SHOP SETTINGS */}
        {activeTab === 'shopInfo' && (
          <div className="max-w-3xl mx-auto bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Store className="w-5 h-5 text-indigo-500" />
                <span>{t.shopSettingsTitle}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.shopSettingsSub}</p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
              }).catch(err => console.error("Settings sync error:", err));
              showToast(lang === 'so' ? 'Xogta xarunta waa la keydiyay' : 'Settings saved successfully!', 'success');
            }} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.labelShopName}</label>
                  <input 
                    type="text" 
                    value={settings.shopName}
                    onChange={(e) => setSettings({ ...settings, shopName: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.labelShopPhone}</label>
                  <input 
                    type="text" 
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.labelShopEmail}</label>
                  <input 
                    type="email" 
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.labelShopCity}</label>
                  <input 
                    type="text" 
                    value={settings.location}
                    onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.labelWarrantyTerms}</label>
                  <textarea 
                    rows={3} 
                    value={settings.warranty}
                    onChange={(e) => setSettings({ ...settings, warranty: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Technicians Section */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-3 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-500" />
                  <span>{lang === 'so' ? 'Farsamoyaqaanada Xarunta (Technicians)' : 'Shop Technicians'}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {techniciansList.map(tech => (
                    <div key={tech} className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-slate-800/60 border border-indigo-100 dark:border-slate-700 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-indigo-500/20">
                        {tech[0]}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-100 block text-xs">{tech}</span>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                          {tickets.filter(tk => (tk.technician || 'Sakaria') === tech).length} {lang === 'so' ? 'Shaqo' : 'Repairs'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  <span>{t.saveSettings}</span>
                </button>
              </div>

            </form>
          </div>
        )}

        {/* ===================== USERS MANAGEMENT TAB (Admin Only) ===================== */}
        {activeTab === 'users' && auth?.user?.role === 'admin' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">👥 {lang === 'so' ? 'Maamulka Isticmaalayaasha' : 'User Management'}</h2>
              <button onClick={() => { setEditingUser(null); setUserForm({ username: '', password: '', full_name: '', role: 'technician' }); setShowUserModal(true); }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition">
                <PlusCircle className="w-4 h-4" />
                {lang === 'so' ? 'User Cusub' : 'New User'}
              </button>
            </div>

            <div className="grid gap-3">
              {users.map(u => (
                <div key={u.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-lg">{u.full_name || u.username}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">@{u.username}</div>
                    <span className={`inline-block mt-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : u.role === 'technician' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                      {u.role === 'admin' ? '🔑 ADMIN' : u.role === 'technician' ? '🔧 TECHNICIAN' : '📋 RECEPTIONIST'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingUser(u); setUserForm({ username: u.username, password: '', full_name: u.full_name, role: u.role }); setShowUserModal(true); }}
                      className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 transition" title="Edit">
                      ✏️
                    </button>
                    {u.username !== 'admin' && (
                      <button onClick={() => handleDeleteUser(u.id)}
                        className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 transition" title="Delete">
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {users.length === 0 && <div className="text-center text-slate-400 py-8">{lang === 'so' ? 'Waxba ma jiraan...' : 'No users found...'}</div>}
            </div>

            {/* User Create/Edit Modal */}
            {showUserModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-bold mb-4">{editingUser ? '✏️ User Wax Ka Beddel' : '➕ User Cusub Samee'}</h3>
                  <form onSubmit={handleSaveUser} className="space-y-4">
                    {!editingUser && (
                      <div>
                        <label className="block text-sm font-medium mb-1">{lang === 'so' ? 'Magaca (Username)' : 'Username'}</label>
                        <input type="text" value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})}
                          className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-blue-500" required />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium mb-1">{lang === 'so' ? 'Magaca Buuxa' : 'Full Name'}</label>
                      <input type="text" value={userForm.full_name} onChange={e => setUserForm({...userForm, full_name: e.target.value})}
                        className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">{editingUser ? (lang === 'so' ? 'Password Cusub (Iska Dhaaf Haddaadan Beddelin)' : 'New Password (leave blank to keep)') : 'Password'}</label>
                      <input type="password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})}
                        className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-blue-500" {...(!editingUser ? {required: true} : {})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">{lang === 'so' ? 'Doorka (Role)' : 'Role'}</label>
                      <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})}
                        className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="admin">🔑 Admin</option>
                        <option value="technician">🔧 Technician (Farsamayaqaan)</option>
                        <option value="receptionist">📋 Receptionist</option>
                      </select>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition">
                        {editingUser ? '💾 Keydi' : '➕ Samee'}
                      </button>
                      <button type="button" onClick={() => { setShowUserModal(false); setEditingUser(null); }}
                        className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 font-bold py-2.5 rounded-lg transition">
                        ❌ {lang === 'so' ? 'Jooji' : 'Cancel'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* MODAL 1: TICKET CREATE / EDIT */}
      {isTicketModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#111827] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">
            
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                    {editingTicket ? (lang === 'so' ? `Wax Ka Bedel: ${editingTicket.id}` : `Edit Ticket: ${editingTicket.id}`) : t.newTicket}
                  </h3>
                </div>
              </div>
              <button onClick={() => setIsTicketModalOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTicket} className="p-6 space-y-6 overflow-y-auto flex-1 text-sm">
              
              {/* Customer */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-3">1. Customer Information (Macmiilka)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5">Customer Full Name *</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.custName}
                      onChange={(e) => setFormData({ ...formData, custName: e.target.value })}
                      placeholder="e.g. Guled Farah Hassan"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5">Phone Number *</label>
                    <input 
                      type="tel" 
                      required 
                      value={formData.custPhone}
                      onChange={(e) => setFormData({ ...formData, custPhone: e.target.value })}
                      placeholder="e.g. 061 512 3456"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Device */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-3">2. Device Specifications</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5">Device Type</label>
                    <select 
                      value={formData.deviceType}
                      onChange={(e) => setFormData({ ...formData, deviceType: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold"
                    >
                      <option value="Laptop">Laptop / Buugyaraha</option>
                      <option value="Desktop PC">Desktop PC</option>
                      <option value="MacBook">MacBook / iMac</option>
                      <option value="All-in-One">All-in-One PC</option>
                      <option value="Monitor/Screen">Monitor / Screen</option>
                      <option value="Printer">Printer / Scanner</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5">Brand & Model *</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.brandModel}
                      onChange={(e) => setFormData({ ...formData, brandModel: e.target.value })}
                      placeholder="e.g. HP EliteBook 840 G6"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5">Serial / Service Tag</label>
                    <input 
                      type="text" 
                      value={formData.serial}
                      onChange={(e) => setFormData({ ...formData, serial: e.target.value })}
                      placeholder="e.g. 5CD9283XYZ"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block text-xs font-bold mb-1.5">Accessories Received</label>
                    <input 
                      type="text" 
                      value={formData.accessories}
                      onChange={(e) => setFormData({ ...formData, accessories: e.target.value })}
                      placeholder="e.g. Charger, Laptop Bag"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5">Password / PIN</label>
                    <input 
                      type="text" 
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="e.g. 1234 or None"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl"
                    />
                  </div>
                </div>
              </div>

              {/* Issue */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-3">3. Problem & Diagnostic</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold mb-1.5">Reported Issue *</label>
                    <textarea 
                      required 
                      rows={2}
                      value={formData.issue}
                      onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                      placeholder="Describe the defect or client complaints..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5">Technician Notes</label>
                    <textarea 
                      rows={2}
                      value={formData.techNotes}
                      onChange={(e) => setFormData({ ...formData, techNotes: e.target.value })}
                      placeholder="Diagnostic findings, solutions applied..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-3">4. Status Workflow</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5">Current Status</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold"
                    >
                      <option value="Received">📥 Received (La Helay)</option>
                      <option value="Repairing">⚙️ Repairing (Dayactir)</option>
                      <option value="Ready">✅ Ready (Diyaar)</option>
                      <option value="Delivered">🚀 Delivered (La Wareejiyay)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5">{lang === 'so' ? 'Farsamoyaqaanka (Technician)' : 'Technician'}</label>
                    <select 
                      value={formData.technician}
                      onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-800 dark:text-slate-100"
                    >
                      {techniciansList.map(tech => (
                        <option key={tech} value={tech}>👨‍🔧 {tech}</option>
                      ))}
                      {formData.technician && !techniciansList.includes(formData.technician) && (
                        <option value={formData.technician}>👨‍🔧 {formData.technician}</option>
                      )}
                    </select>
                  </div>

                </div>
              </div>

              {/* Pricing & Payments */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-3">5. Qiimaha iyo Lacagta (Pricing & Invoice)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5">Labor Cost ($)</label>
                    <input 
                      type="number" 
                      step="0.5" 
                      value={formData.labor}
                      onChange={(e) => setFormData({ ...formData, labor: e.target.value })}
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5">Parts Cost ($)</label>
                    <input 
                      type="number" 
                      step="0.5" 
                      value={formData.parts}
                      onChange={(e) => setFormData({ ...formData, parts: e.target.value })}
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5">Discount ($)</label>
                    <input 
                      type="number" 
                      step="0.5" 
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                  <div>
                    <label className="block text-xs font-bold mb-1.5">Total Cost ($)</label>
                    <input 
                      type="text" 
                      readOnly 
                      value={`$${formTotal.toFixed(2)}`}
                      className="w-full px-3.5 py-2 bg-slate-200 dark:bg-slate-600/50 border border-slate-300 dark:border-slate-600 rounded-xl font-black text-indigo-600 dark:text-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5">Paid Amount ($)</label>
                    <input 
                      type="number" 
                      step="0.5" 
                      value={formData.paid}
                      onChange={(e) => setFormData({ ...formData, paid: e.target.value })}
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl font-bold text-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5">Balance Due ($)</label>
                    <input 
                      type="text" 
                      readOnly 
                      value={`$${formBalance.toFixed(2)}`}
                      className="w-full px-3.5 py-2 bg-slate-200 dark:bg-slate-600/50 border border-slate-300 dark:border-slate-600 rounded-xl font-black text-rose-500"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-xs font-bold mb-1.5">Payment Method</label>
                  <select 
                    value={formData.method}
                    onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl font-bold"
                  >
                    <option value="Cash">Cash (Lacag Caddaan ah)</option>
                    <option value="Zaad Service">Zaad Service (Telesom)</option>
                    <option value="EVC Plus">EVC Plus (Hormuud)</option>
                    <option value="E-Dahab">E-Dahab (Somtel)</option>
                    <option value="Bank Transfer">Bank Transfer / Kaar</option>
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setIsTicketModalOpen(false)} className="px-5 py-2.5 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl">
                  {t.btnCancel}
                </button>
                <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{t.btnSaveTicket}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: INVOICE & PDF RECEIPT */}
      {isInvoiceModalOpen && activeInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#111827] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-3xl w-full max-h-[96vh] flex flex-col overflow-hidden animate-scale-up">
            
            <div className="px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                <span className="font-bold text-sm text-slate-800 dark:text-slate-100">{t.invoicePreview}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => sendWhatsApp(activeInvoice)} className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
                <button onClick={() => window.print()} className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm">
                  <Printer className="w-3.5 h-3.5" />
                  <span>{t.print}</span>
                </button>
                <button onClick={() => setIsInvoiceModalOpen(false)} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-white text-slate-900">
              <div id="invoicePrintArea" className="max-w-2xl mx-auto p-4 sm:p-6 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-900">
                
                <div className="flex justify-between items-start border-b border-slate-200 pb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black tracking-tight text-indigo-700">🔧 Sakaria Repair</span>
                      <span className="text-amber-500 text-lg">⭐</span>
                    </div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">{settings.shopName}</p>
                    <p className="text-xs text-slate-500 mt-1">Tel / WhatsApp: {settings.phone}</p>
                    <p className="text-xs text-slate-500">{settings.location}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-slate-100 text-slate-700 inline-block mb-1">
                      REPAIR INVOICE
                    </span>
                    <h2 className="text-xl font-black text-slate-800">{activeInvoice.id}</h2>
                    <p className="text-xs text-slate-500 mt-1">Date: {new Date(activeInvoice.createdAt).toLocaleDateString()}</p>
                    <div className="mt-2">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getStatusBadgeClass(activeInvoice.status)}`}>
                        {getStatusLabel(activeInvoice.status)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 my-5 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">BILLED TO (MACMIILKA)</span>
                    <p className="font-bold text-sm text-slate-800">{activeInvoice.customer.name}</p>
                    <p className="text-slate-600 mt-0.5">{activeInvoice.customer.phone}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">DEVICE SPECIFICATIONS</span>
                    <p className="font-bold text-slate-800">{activeInvoice.device.brandModel}</p>
                    <p className="text-slate-600 mt-0.5">SN: {activeInvoice.device.serial || 'N/A'}</p>
                    <p className="text-slate-500 text-[11px]">Acc: {activeInvoice.device.accessories || 'None'}</p>
                  </div>
                </div>

                <div className="mb-5 text-xs bg-indigo-50/60 p-3.5 rounded-xl border border-indigo-100 space-y-1">
                  <p><strong className="text-indigo-950">Reported Issue:</strong> <span className="text-slate-700">{activeInvoice.issue}</span></p>
                  <p><strong className="text-indigo-950">Technician Action:</strong> <span className="text-slate-700">{activeInvoice.techNotes || 'Diagnostics completed.'}</span></p>
                </div>

                <table className="w-full text-xs text-left mb-5">
                  <thead>
                    <tr className="border-b-2 border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="py-2.5">Description</th>
                      <th className="py-2.5 text-right">Amount ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-3 font-medium text-slate-700">Labor Fee (Shaqada Farsamada)</td>
                      <td className="py-3 text-right font-black text-slate-800">${Number(activeInvoice.pricing.labor).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-medium text-slate-700">Spare Parts (Qalabka la bedelay)</td>
                      <td className="py-3 text-right font-black text-slate-800">${Number(activeInvoice.pricing.parts).toFixed(2)}</td>
                    </tr>
                    {activeInvoice.pricing.discount > 0 && (
                      <tr className="text-emerald-700">
                        <td className="py-2 font-medium">Discount (Qiimo dhimis)</td>
                        <td className="py-2 text-right font-bold">-${Number(activeInvoice.pricing.discount).toFixed(2)}</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="border-t-2 border-slate-200">
                    <tr>
                      <th className="pt-3.5 text-slate-600 text-xs">Total Cost (Wadarta):</th>
                      <th className="pt-3.5 text-right text-sm font-black text-slate-900">${Number(activeInvoice.pricing.total).toFixed(2)}</th>
                    </tr>
                    <tr>
                      <th className="py-1 text-slate-600 text-xs">Amount Paid (La Bixiyay):</th>
                      <th className="py-1 text-right text-xs font-bold text-emerald-600">${Number(activeInvoice.pricing.paid).toFixed(2)}</th>
                    </tr>
                    <tr className="border-t border-slate-200">
                      <th className="pt-2 text-slate-800 text-xs uppercase font-black">Remaining Balance (Hadhay):</th>
                      <th className="pt-2 text-right text-base font-black text-rose-600">${Number(activeInvoice.pricing.balance).toFixed(2)}</th>
                    </tr>
                  </tfoot>
                </table>

                <div className="mt-6 pt-4 border-t border-slate-200 text-[11px] text-slate-500 space-y-4">
                  <div>
                    <p className="font-bold text-slate-700">Terms & Warranty (Dammaanad):</p>
                    <p className="text-slate-500 mt-0.5">{settings.warranty}</p>
                  </div>
                  <div className="flex justify-between items-end pt-6">
                    <div className="text-center w-36">
                      <div className="border-b border-slate-300 pb-1 mb-1"></div>
                      <span className="text-[10px] uppercase text-slate-400">Customer Signature</span>
                    </div>
                    <div className="text-center w-36">
                      <p className="text-xs font-bold text-indigo-700 pb-1">{activeInvoice.technician || 'Sakaria'}</p>
                      <div className="border-b border-slate-300 mb-1"></div>
                      <span className="text-[10px] uppercase text-slate-400">Technician Signature</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* TOAST CONTAINER — above bottom nav on mobile */}
      <div className="fixed bottom-24 sm:bottom-5 right-4 sm:right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-[calc(100vw-2rem)]">
        {toasts.map(toast => (
          <div key={toast.id} className="px-4 py-3 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 pointer-events-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white animate-scale-up">
            <Check className="w-4 h-4" />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* MOBILE BOTTOM NAVIGATION — hidden on desktop */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-900/20">
        <div className="flex items-center justify-around px-2 py-2 relative">

          {/* Dashboard */}
          <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all ${activeTab === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-500'}`}>
            <LayoutDashboard className={`w-5 h-5 ${activeTab === 'dashboard' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] font-bold">{lang === 'so' ? 'Xogta' : 'Dashboard'}</span>
          </button>

          {/* Tickets */}
          <button onClick={() => setActiveTab('tickets')} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all ${activeTab === 'tickets' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-500'}`}>
            <div className="relative">
              <Wrench className={`w-5 h-5 ${activeTab === 'tickets' ? 'stroke-[2.5]' : ''}`} />
              {tickets.length > 0 && <span className="absolute -top-1.5 -right-2 bg-indigo-600 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">{tickets.length > 99 ? '99+' : tickets.length}</span>}
            </div>
            <span className="text-[10px] font-bold">{lang === 'so' ? 'Shaqo' : 'Tickets'}</span>
          </button>

          {/* Center FAB — New Ticket */}
          <button
            onClick={() => openNewTicketModal()}
            className="flex flex-col items-center -mt-5"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-500/40 border-4 border-white dark:border-[#0f172a] active:scale-95 transition">
              <PlusCircle className="w-7 h-7 text-white stroke-[2]" />
            </div>
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">{lang === 'so' ? 'Cusub' : 'New'}</span>
          </button>

          {/* Customers */}
          <button onClick={() => setActiveTab('customers')} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all ${activeTab === 'customers' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-500'}`}>
            <Users className={`w-5 h-5 ${activeTab === 'customers' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] font-bold">{lang === 'so' ? 'Macmiil' : 'Customers'}</span>
          </button>

          {/* Finances */}
          <button onClick={() => setActiveTab('finances')} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all ${activeTab === 'finances' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-500'}`}>
            <DollarSign className={`w-5 h-5 ${activeTab === 'finances' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] font-bold">{lang === 'so' ? 'Lacag' : 'Finance'}</span>
          </button>

          {/* Users - Admin Only */}
          {auth?.user?.role === 'admin' && (
            <button onClick={() => setActiveTab('users')} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all ${activeTab === 'users' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-500'}`}>
              <Users className={`w-5 h-5 ${activeTab === 'users' ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px] font-bold">Users</span>
            </button>
          )}

        </div>
      </nav>

    </div>
  );
}
