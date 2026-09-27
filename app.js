/**
 * 🔧 Sakaria Repair Manager ⭐
 * Computer & Laptop Repair Management System
 * Version 2.5
 */

(function () {
  'use strict';

  // --- LOCALIZATION / LUQADAHA (SOMALI & ENGLISH) ---
  const i18n = {
    so: {
      subtitle: "Nidaamka Maamulka Dayactirka Kombiyuutarada & Laptop-yada",
      newTicket: "Tikidh Cusub",
      navDashboard: "Tirokoob & Warbixin",
      navTickets: "Tikidhada Dayactirka",
      navCustomers: "Macaamiisha",
      navFinances: "Qiimaha & Lacagaha",
      navShopInfo: "Xogta Xarunta",
      dashboardGreeting: "Soo Dhawoow Sakaria Repair Manager!",
      dashboardSub: "Maamul dayactirka kombiyuutarada, macaamiisha, tikidhada, lacagaha iyo qaansheegadka hal meel.",
      viewAllTickets: "Eeg Dhammaan Tikidhada",
      createTicket: "Abuur Tikidh",
      kpiTotal: "Wadarta Guud",
      allTime: "Ilaa hadda",
      statusReceived: "La Helay",
      stage1: "1. Qabasho cusub",
      statusRepairing: "Dayactir Socda",
      stage2: "2. Ciladbixin socota",
      statusReady: "Diyaar Ah",
      stage3: "3. Diyaar u ah qaadasho",
      statusDelivered: "La Wareejiyay",
      stage4: "4. Macmiilku qaatay",
      kpiRevenue: "Dakhliga La Qabtay",
      chartStatusTitle: "Xaaladaha Tikidhada (Pipeline)",
      chartBrandsTitle: "Noocyada Qalabka (Brands)",
      repairedDevices: "Qalabka la keenay",
      readyForDelivery: "Diyaar u ah Qaadashada",
      notifyCustomers: "U dir Macaamiisha Farriin WhatsApp",
      recentRepairs: "Dayactirkii Ugu Dambeeyay",
      recentRepairsSub: "Qalabkii ugu dambeeyay ee xarunta la keenay",
      thCustomer: "Macmiilka",
      thDevice: "Qalabka & Nooca",
      thIssue: "Ciladda",
      thStatus: "Xaaladda",
      thCost: "Wadarta / Hadhay",
      thFinancials: "Qiimaha & Xisaabta",
      thActions: "Ficillada",
      thLabor: "Shaqada ($)",
      thParts: "Qalabka ($)",
      thTotal: "Wadarta ($)",
      thPaid: "La Bixiyay ($)",
      thBalance: "Hadhay ($)",
      thPaymentMethod: "Habka Lacagta",
      allStatuses: "Dhammaan Xaaladaha",
      allPayments: "Dhammaan Lacag-bixinta",
      viewList: "Liis (Table)",
      viewPipeline: "Tubta (Pipeline)",
      noTicketsFound: "Tikidho lama helin",
      tryAdjustingSearch: "Isku day inaad bedesho shaandhada ama raadinta",
      customerDirectory: "Diiwaanka Macaamiisha",
      customerDirectorySub: "Raadi macmiil kasta, eeg taariikhda qalabka loo dayactiray iyo xisaabta lacagaha",
      addCustomerRepair: "Dayactir Cusub",
      noCustomersFound: "Macmiil lama helin",
      financesTitle: "Qiimaha iyo Lacagta",
      financesSub: "Kormeerka dakhliga, lacagaha la qabtay, deynta dhiman, iyo hababka bixinta",
      totalInvoiced: "Wadarta Qaansheegadka Guud",
      laborAndParts: "Shaqada farsamada iyo qalabka la bedelay",
      totalCollected: "Lacagta La Qabtay (Dakhli)",
      cashBankEVC: "Zaad, EVC Plus, E-Dahab, Caddaan",
      pendingBalance: "Deynta Macaamiisha Laga Rabo",
      awaitingCollection: "Lacagta dhiman ee la sugayo",
      partsCost: "Kharashka Qalabka (Parts)",
      screensSSDsRAM: "Shaashado, SSD-yo, Batariyada, iwm.",
      financialLedger: "Diiwaanka Xisaabaadka & Qaansheegadka",
      allRepairs: "Dhammaan Dayactirka",
      shopSettingsTitle: "Xogta Xarunta & Qaansheegadka",
      shopSettingsSub: "Xogta xaruntaada oo toos uga muuqanaysa qaansheegadka (PDF Invoice) iyo fariimaha WhatsApp-ka",
      labelShopName: "Magaca Xarunta",
      labelShopPhone: "Taleefanka / WhatsApp",
      labelShopEmail: "Email-ka Xarunta",
      labelShopCity: "Magaalada / Goobta",
      labelWarrantyTerms: "Shuruudaha Dammaanadda (Warranty)",
      saveSettings: "Keydi Xogta",
      secCustomer: "1. Xogta Macmiilka",
      labelCustName: "Magaca Macmiilka *",
      labelCustPhone: "Taleefanka Macmiilka *",
      secDevice: "2. Faahfaahinta Qalabka",
      labelDevType: "Nooca Qalabka",
      labelBrandModel: "Shirkadda & Nooca (Brand & Model) *",
      labelSerialNo: "Serial Number / Service Tag",
      labelAccessories: "Qalabka La Socda (Accessories)",
      labelPasswordPin: "Password / PIN-ka Qalabka (Haddii loo baahdo)",
      secIssue: "3. Ciladda & Baaritaanka",
      labelReportedIssue: "Ciladda Macmiilku Sheegay *",
      labelTechnicianNotes: "Ciladbaarista Farsamoyaqaanka",
      secStatus: "4. Xaaladda & Farsamoyaqaanka",
      labelStatus: "Xaaladda Hadda",
      labelTechnician: "Farsamoyaqaanka gacanta ku haya",
      secPricing: "5. Qiimaha iyo Lacagta",
      labelLaborCost: "Qiimaha Shaqada ($ Labor)",
      labelPartsCost: "Qiimaha Qalabka ($ Parts)",
      labelDiscount: "Qiimo dhimis ($ Discount)",
      labelTotalCost: "Wadarta Guud ($ Total)",
      labelAmountPaid: "Lacagta La Bixiyay ($ Paid)",
      labelBalanceDue: "Lacagta Hadhay ($ Balance)",
      labelPaymentMethod: "Habka Lacag-bixinta",
      btnCancel: "Ka Noqo",
      btnSaveTicket: "Keydi Tikidhka",
      invoicePreview: "Qaansheegadka PDF & Rasiidka",
      print: "Daabac (Print)",
      downloadPdf: "Soo Dejiso PDF",
      invDate: "Taariikhda:",
      billedTo: "MACMIILKA (BILLED TO)",
      deviceInfo: "FAAHFAAHINTA QALABKA",
      invReportedIssue: "Ciladda:",
      invTechnicianNotes: "Dayactirka la sameeyay:",
      invLaborFee: "Shaqada Farsamada (Labor Fee)",
      invPartsCost: "Qalabka La Bedelay (Spare Parts)",
      invDiscount: "Qiimo Dhimis (Discount)",
      invTotalCost: "Wadarta Guud (Total):",
      invAmountPaid: "La Bixiyay (Paid):",
      invBalanceDue: "Hadhay / Deyn (Balance):",
      warrantyTitle: "Dammaanadda:",
      custSignature: "Saxeexa Macmiilka",
      techSignature: "Saxeexa Farsamoyaqaanka",
      exportBackup: "Ka Kobi Xogta (JSON)",
      importBackup: "Soo Celi Xogta (Restore)",
      resetSample: "Dib u Cusbooneysii Tusaalaha"
    },
    en: {
      subtitle: "Computer & Laptop Repair Management System",
      newTicket: "New Ticket",
      navDashboard: "Dashboard & Stats",
      navTickets: "Repair Tickets",
      navCustomers: "Customers",
      navFinances: "Finances & Revenue",
      navShopInfo: "Shop Settings",
      dashboardGreeting: "Welcome to Sakaria Repair Manager!",
      dashboardSub: "Manage computer & laptop repairs, customer records, tickets, pricing, and invoices in one place.",
      viewAllTickets: "View All Tickets",
      createTicket: "Create Ticket",
      kpiTotal: "Total Repairs",
      allTime: "All time",
      statusReceived: "Received",
      stage1: "1. Device checked in",
      statusRepairing: "Repairing",
      stage2: "2. Under diagnostics/repair",
      statusReady: "Ready",
      stage3: "3. Ready for pickup",
      statusDelivered: "Delivered",
      stage4: "4. Picked up by client",
      kpiRevenue: "Total Revenue Collected",
      chartStatusTitle: "Repair Pipeline Breakdown",
      chartBrandsTitle: "Device Brands",
      repairedDevices: "Repaired devices",
      readyForDelivery: "Ready for Delivery",
      notifyCustomers: "Notify on WhatsApp",
      recentRepairs: "Recent Repair Jobs",
      recentRepairsSub: "Latest devices received in shop",
      thCustomer: "Customer",
      thDevice: "Device & Model",
      thIssue: "Issue",
      thStatus: "Status",
      thCost: "Total / Due",
      thFinancials: "Cost & Payment",
      thActions: "Actions",
      thLabor: "Labor ($)",
      thParts: "Parts ($)",
      thTotal: "Total ($)",
      thPaid: "Paid ($)",
      thBalance: "Balance ($)",
      thPaymentMethod: "Payment Method",
      allStatuses: "All Statuses",
      allPayments: "All Payment Statuses",
      viewList: "Table",
      viewPipeline: "Pipeline",
      noTicketsFound: "No tickets found",
      tryAdjustingSearch: "Try adjusting your search or filters",
      customerDirectory: "Customer Directory",
      customerDirectorySub: "Search customers, track devices repaired, lifetime billing, and balances",
      addCustomerRepair: "New Repair",
      noCustomersFound: "No customers found",
      financesTitle: "Pricing & Financial Overview",
      financesSub: "Monitor revenue, collected payments, outstanding debts, and payment gateways",
      totalInvoiced: "Total Invoiced Amount",
      laborAndParts: "Labor services & replacement hardware",
      totalCollected: "Total Collected Revenue",
      cashBankEVC: "Cash, Zaad, EVC Plus, E-Dahab",
      pendingBalance: "Pending Customer Balance",
      awaitingCollection: "Awaiting customer payment",
      partsCost: "Spare Parts Expense",
      screensSSDsRAM: "Screens, SSDs, Batteries, RAM, etc.",
      financialLedger: "Financial Ledger & Invoices",
      allRepairs: "All Repairs",
      shopSettingsTitle: "Shop & Invoice Information",
      shopSettingsSub: "Shop details automatically shown on PDF invoices and WhatsApp notifications",
      labelShopName: "Shop Name",
      labelShopPhone: "Phone / WhatsApp",
      labelShopEmail: "Email Address",
      labelShopCity: "Location / City",
      labelWarrantyTerms: "Repair Warranty Terms",
      saveSettings: "Save Settings",
      secCustomer: "1. Customer Information",
      labelCustName: "Customer Full Name *",
      labelCustPhone: "Phone Number *",
      secDevice: "2. Device Specifications",
      labelDevType: "Device Type",
      labelBrandModel: "Brand & Model *",
      labelSerialNo: "Serial Number / Service Tag",
      labelAccessories: "Accessories Received",
      labelPasswordPin: "Device Password / PIN (if needed)",
      secIssue: "3. Problem & Diagnostic",
      labelReportedIssue: "Reported Problem *",
      labelTechnicianNotes: "Technician Diagnostic Notes",
      secStatus: "4. Workflow Status & Technician",
      labelStatus: "Current Status",
      labelTechnician: "Assigned Technician",
      secPricing: "5. Pricing & Invoice",
      labelLaborCost: "Labor Cost ($)",
      labelPartsCost: "Spare Parts Cost ($)",
      labelDiscount: "Discount ($)",
      labelTotalCost: "Total Cost ($)",
      labelAmountPaid: "Paid Amount ($)",
      labelBalanceDue: "Remaining Balance ($)",
      labelPaymentMethod: "Payment Method",
      btnCancel: "Cancel",
      btnSaveTicket: "Save Ticket",
      invoicePreview: "PDF Invoice & Receipt",
      print: "Print",
      downloadPdf: "Download PDF",
      invDate: "Date:",
      billedTo: "BILLED TO",
      deviceInfo: "DEVICE SPECIFICATIONS",
      invReportedIssue: "Reported Issue:",
      invTechnicianNotes: "Technician Action:",
      invLaborFee: "Diagnostic & Repair Labor",
      invPartsCost: "Replacement Hardware / Spare Parts",
      invDiscount: "Discount",
      invTotalCost: "Total Cost:",
      invAmountPaid: "Amount Paid:",
      invBalanceDue: "Remaining Balance:",
      warrantyTitle: "Terms & Warranty:",
      custSignature: "Customer Signature",
      techSignature: "Technician Signature",
      exportBackup: "Backup Data (JSON)",
      importBackup: "Restore Backup",
      resetSample: "Reset Sample Data"
    }
  };

  // --- DEFAULT SEED DATA ---
  const DEFAULT_SETTINGS = {
    shopName: "Sakaria Repair Center",
    phone: "+252 61 5000000",
    email: "sakaria.repair@gmail.com",
    location: "Maka Al Mukarama St, Mogadishu",
    warranty: "Dammaanad 30 maalmood ah qalabka la bedelay iyo shaqada la qabtay. Qalabka qoyaanka ama jabka cusub gala dammaanad kuma jirto."
  };

  const DEFAULT_TICKETS = [
    {
      id: "SRM-1001",
      customer: {
        name: "Guled Farah Hassan",
        phone: "+252 61 5123456",
        email: "guled.farah@example.com"
      },
      device: {
        type: "Laptop",
        brandModel: "HP EliteBook 840 G6",
        serial: "5CD9283XYZ",
        accessories: "Original 65W Charger, Laptop Bag",
        password: "None"
      },
      issue: "Shaashadda ayaa dildilaacday oo ma shidmayso (Broken screen, no display)",
      techNotes: "Replaced display panel with OEM FHD IPS screen. Tested resolution, brightness and webcam.",
      status: "Ready",
      technician: "Sakaria",
      pricing: {
        labor: 20,
        parts: 45,
        discount: 0,
        total: 65,
        paid: 65,
        balance: 0,
        method: "Zaad Service"
      },
      createdAt: "2026-09-24T09:30:00.000Z",
      updatedAt: "2026-09-26T14:15:00.000Z"
    },
    {
      id: "SRM-1002",
      customer: {
        name: "Sahra Mohamed Warsame",
        phone: "+252 61 6234567",
        email: "sahra.mohamed@example.com"
      },
      device: {
        type: "Laptop",
        brandModel: "Dell XPS 13 9300",
        serial: "8HG729K01",
        accessories: "Type-C Charger",
        password: "1234"
      },
      issue: "Batari bararay oo aan koronto haysaneyn (Battery swelling, not charging)",
      techNotes: "Battery ordered and arriving. Internal fan cleaned, old battery safely removed.",
      status: "Repairing",
      technician: "Sakaria",
      pricing: {
        labor: 15,
        parts: 38,
        discount: 0,
        total: 53,
        paid: 20,
        balance: 33,
        method: "EVC Plus"
      },
      createdAt: "2026-09-25T11:00:00.000Z",
      updatedAt: "2026-09-26T16:30:00.000Z"
    },
    {
      id: "SRM-1003",
      customer: {
        name: "Abdirahman Ali Barre",
        phone: "+252 61 7345678",
        email: "abdirahman.ali@example.com"
      },
      device: {
        type: "MacBook",
        brandModel: "Apple MacBook Air M2 (2022)",
        serial: "C02F9382Q6N",
        accessories: "MagSafe Cable",
        password: "None"
      },
      issue: "Kafee ku daatay, badhanka shididda iyo furayaasha keyboard-ka qaar ayaa ku dhegaya",
      techNotes: "Ultrasonic cleaning needed for motherboard; keyboard membrane inspection in progress.",
      status: "Received",
      technician: "Sakaria",
      pricing: {
        labor: 35,
        parts: 0,
        discount: 0,
        total: 35,
        paid: 0,
        balance: 35,
        method: "Cash"
      },
      createdAt: "2026-09-26T08:15:00.000Z",
      updatedAt: "2026-09-26T08:15:00.000Z"
    },
    {
      id: "SRM-1004",
      customer: {
        name: "Asha Yusuf Odowa",
        phone: "+252 61 8456789",
        email: "asha.yusuf@example.com"
      },
      device: {
        type: "Laptop",
        brandModel: "Lenovo ThinkPad T14 Gen 2",
        serial: "PF392810X",
        accessories: "Lenovo 65W Charger",
        password: "9988"
      },
      issue: "Aad buu u gaabiyaa (Very slow), wuxuu wataa Hard Drive duug ah",
      techNotes: "Upgraded 1TB HDD to 512GB NVMe M.2 SSD. Cloned customer files and fresh installed Windows 11 Pro.",
      status: "Delivered",
      technician: "Sakaria",
      pricing: {
        labor: 15,
        parts: 30,
        discount: 5,
        total: 40,
        paid: 40,
        balance: 0,
        method: "E-Dahab"
      },
      createdAt: "2026-09-20T10:00:00.000Z",
      updatedAt: "2026-09-23T12:00:00.000Z"
    },
    {
      id: "SRM-1005",
      customer: {
        name: "Hassan Nur Jama",
        phone: "+252 61 9567890",
        email: "hassan.nur@example.com"
      },
      device: {
        type: "Laptop",
        brandModel: "Asus TUF Gaming F15",
        serial: "M8N0CX04921",
        accessories: "Heavy 200W Charger, Mouse",
        password: "gamer"
      },
      issue: "Kuleyl badan (Overheating) iyo marawaxada oo qeylisa, ciyaaraha wuu ka damayaa",
      techNotes: "Dual fan cleaning, Arctic MX-4 thermal paste replacement, copper heat pipe flushed.",
      status: "Repairing",
      technician: "Sakaria",
      pricing: {
        labor: 25,
        parts: 10,
        discount: 0,
        total: 35,
        paid: 35,
        balance: 0,
        method: "Cash"
      },
      createdAt: "2026-09-25T14:45:00.000Z",
      updatedAt: "2026-09-26T17:00:00.000Z"
    },
    {
      id: "SRM-1006",
      customer: {
        name: "Ubah Ahmed Shire",
        phone: "+252 61 2109876",
        email: "ubah.shire@example.com"
      },
      device: {
        type: "Laptop",
        brandModel: "Acer Aspire 5 A515",
        serial: "NXA85EK002",
        accessories: "Adapter",
        password: "None"
      },
      issue: "Galka dambe iyo laab-laabaha (Hinges) ayaa jabay marka la furayo",
      techNotes: "Fabricating brass hinge mount anchors with industrial epoxy adhesive.",
      status: "Received",
      technician: "Sakaria",
      pricing: {
        labor: 20,
        parts: 15,
        discount: 0,
        total: 35,
        paid: 10,
        balance: 25,
        method: "Zaad Service"
      },
      createdAt: "2026-09-26T13:20:00.000Z",
      updatedAt: "2026-09-26T13:20:00.000Z"
    }
  ];

  // --- STATE STORAGE ---
  const STORAGE_KEY_TICKETS = 'sakaria_repairs_tickets_v2';
  const STORAGE_KEY_SETTINGS = 'sakaria_repairs_settings_v2';
  const STORAGE_KEY_LANG = 'sakaria_repairs_lang_v2';
  const STORAGE_KEY_THEME = 'sakaria_repairs_theme_v2';

  class RepairManagerApp {
    constructor() {
      this.currentLang = localStorage.getItem(STORAGE_KEY_LANG) || 'so';
      this.tickets = this.loadTickets();
      this.settings = this.loadSettings();
      this.currentTab = 'dashboard';
      this.currentTicketView = 'table'; // 'table' | 'kanban'
      this.activeInvoiceTicket = null;

      // Charts references
      this.statusChart = null;
      this.brandsChart = null;

      this.init();
    }

    // --- INITIALIZATION ---
    init() {
      this.initTheme();
      this.initDomListeners();
      this.applyLanguage(this.currentLang);
      this.renderAll();
      this.updateLiveDate();

      // Keyboard shortcut: Press '/' to focus global search
      window.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
          e.preventDefault();
          const s = document.getElementById('globalSearchInput');
          if (s) s.focus();
        }
      });
    }

    loadTickets() {
      try {
        const data = localStorage.getItem(STORAGE_KEY_TICKETS);
        return data ? JSON.parse(data) : DEFAULT_TICKETS;
      } catch (err) {
        console.error("Failed to load tickets:", err);
        return DEFAULT_TICKETS;
      }
    }

    saveTickets() {
      localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(this.tickets));
    }

    loadSettings() {
      try {
        const data = localStorage.getItem(STORAGE_KEY_SETTINGS);
        return data ? JSON.parse(data) : DEFAULT_SETTINGS;
      } catch (err) {
        return DEFAULT_SETTINGS;
      }
    }

    saveSettings(newSettings) {
      this.settings = { ...this.settings, ...newSettings };
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(this.settings));
      this.showToast(this.currentLang === 'so' ? 'Xogta xarunta waa la keydiyay!' : 'Shop settings saved successfully!', 'success');
    }

    // --- THEME MANAGEMENT ---
    initTheme() {
      const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
      const isDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      this.updateThemeIcon(isDark);
    }

    toggleTheme() {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem(STORAGE_KEY_THEME, isDark ? 'dark' : 'light');
      this.updateThemeIcon(isDark);
      this.renderCharts();
    }

    updateThemeIcon(isDark) {
      const icon = document.getElementById('themeIcon');
      if (icon) {
        icon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
        lucide.createIcons();
      }
    }

    // --- LANGUAGE SWITCHING ---
    toggleLanguage() {
      this.currentLang = this.currentLang === 'so' ? 'en' : 'so';
      localStorage.setItem(STORAGE_KEY_LANG, this.currentLang);
      this.applyLanguage(this.currentLang);
      this.renderAll();
    }

    applyLanguage(lang) {
      const dict = i18n[lang] || i18n.so;
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
          el.textContent = dict[key];
        }
      });

      // Update flag & label
      const flag = document.getElementById('langFlag');
      const label = document.getElementById('langLabel');
      if (flag && label) {
        flag.textContent = lang === 'so' ? '🇸🇴' : '🇬🇧';
        label.textContent = lang === 'so' ? 'SO' : 'EN';
      }

      // Update placeholders
      const gSearch = document.getElementById('globalSearchInput');
      if (gSearch) {
        gSearch.placeholder = lang === 'so' 
          ? "Raadi macmiilka, taleefanka, tikidhka (SRM-...), qalabka..." 
          : "Search customer, phone, ticket ID (SRM-...), device...";
      }

      const tSearch = document.getElementById('ticketSearchInput');
      if (tSearch) {
        tSearch.placeholder = lang === 'so'
          ? "Raadi tikidh, macmiil, taleefan, ama qalab..."
          : "Search by ticket #, customer, phone, device...";
      }

      const cSearch = document.getElementById('customerSearchInput');
      if (cSearch) {
        cSearch.placeholder = lang === 'so'
          ? "Raadi macmiilka magaciisa ama taleefanka..."
          : "Search customer by name or phone...";
      }

      this.populateSettingsForm();
    }

    updateLiveDate() {
      const dateEl = document.getElementById('currentLiveDate');
      if (dateEl) {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
        dateEl.textContent = now.toLocaleDateString(this.currentLang === 'so' ? 'so-SO' : 'en-US', options);
      }
    }

    // --- TAB SWITCHING ---
    switchTab(tabId) {
      this.currentTab = tabId;
      document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
      const activeContent = document.getElementById(`tab-${tabId}`);
      if (activeContent) activeContent.classList.remove('hidden');

      document.querySelectorAll('.nav-tab').forEach(btn => {
        if (btn.getAttribute('data-tab') === tabId) {
          btn.classList.add('active-tab', 'text-white');
          btn.classList.remove('text-slate-600', 'dark:text-slate-400');
        } else {
          btn.classList.remove('active-tab', 'text-white');
          btn.classList.add('text-slate-600', 'dark:text-slate-400');
        }
      });

      if (tabId === 'dashboard') {
        this.renderCharts();
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // --- DOM LISTENERS ---
    initDomListeners() {
      // Topbar buttons
      document.getElementById('themeToggleBtn')?.addEventListener('click', () => this.toggleTheme());
      document.getElementById('langToggleBtn')?.addEventListener('click', () => this.toggleLanguage());
      document.getElementById('btnOpenNewTicket')?.addEventListener('click', () => this.openNewTicketModal());

      // Settings dropdown menu
      const dataBtn = document.getElementById('dataMenuBtn');
      const dataDrop = document.getElementById('dataDropdown');
      dataBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        dataDrop?.classList.toggle('hidden');
      });
      document.addEventListener('click', () => dataDrop?.classList.add('hidden'));

      document.getElementById('btnExportData')?.addEventListener('click', () => this.exportBackup());
      document.getElementById('importFileInput')?.addEventListener('change', (e) => this.importBackup(e));
      document.getElementById('btnResetData')?.addEventListener('click', () => this.resetSampleData());

      // Navigation tabs
      document.querySelectorAll('.nav-tab').forEach(btn => {
        btn.addEventListener('click', () => {
          const tab = btn.getAttribute('data-tab');
          this.switchTab(tab);
        });
      });

      // Global search
      document.getElementById('globalSearchInput')?.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (val.length > 0 && this.currentTab !== 'tickets') {
          this.switchTab('tickets');
        }
        const tSearch = document.getElementById('ticketSearchInput');
        if (tSearch) {
          tSearch.value = val;
          this.renderTickets();
        }
      });

      // Ticket search & filters
      document.getElementById('ticketSearchInput')?.addEventListener('input', () => this.renderTickets());
      document.getElementById('statusFilterSelect')?.addEventListener('change', () => this.renderTickets());
      document.getElementById('paymentFilterSelect')?.addEventListener('change', () => this.renderTickets());
      document.getElementById('btnClearFilters')?.addEventListener('click', () => {
        document.getElementById('ticketSearchInput').value = '';
        document.getElementById('statusFilterSelect').value = 'ALL';
        document.getElementById('paymentFilterSelect').value = 'ALL';
        document.getElementById('globalSearchInput').value = '';
        this.renderTickets();
      });

      // Customer search
      document.getElementById('customerSearchInput')?.addEventListener('input', () => this.renderCustomers());

      // View toggle (Table / Kanban)
      document.getElementById('btnViewTable')?.addEventListener('click', () => this.setTicketView('table'));
      document.getElementById('btnViewKanban')?.addEventListener('click', () => this.setTicketView('kanban'));

      // New/Edit Ticket Modal Events
      document.getElementById('btnCloseTicketModal')?.addEventListener('click', () => this.closeTicketModal());
      document.getElementById('btnCancelTicket')?.addEventListener('click', () => this.closeTicketModal());
      document.getElementById('ticketForm')?.addEventListener('submit', (e) => this.handleSaveTicket(e));

      // Dynamic calculation for pricing in modal
      const calcFields = ['costLabor', 'costParts', 'costDiscount', 'costPaid'];
      calcFields.forEach(id => {
        document.getElementById(id)?.addEventListener('input', () => this.recalculateModalFinancials());
      });

      // Invoice Modal Events
      document.getElementById('btnCloseInvoiceModal')?.addEventListener('click', () => this.closeInvoiceModal());
      document.getElementById('btnInvoicePrint')?.addEventListener('click', () => window.print());
      document.getElementById('btnInvoiceDownloadPDF')?.addEventListener('click', () => this.downloadInvoicePDF());
      document.getElementById('btnInvoiceWhatsApp')?.addEventListener('click', () => this.sendInvoiceWhatsApp());

      // Shop settings form
      document.getElementById('shopSettingsForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveSettings({
          shopName: document.getElementById('settingShopName').value.trim(),
          phone: document.getElementById('settingShopPhone').value.trim(),
          email: document.getElementById('settingShopEmail').value.trim(),
          location: document.getElementById('settingShopLocation').value.trim(),
          warranty: document.getElementById('settingWarranty').value.trim()
        });
      });
    }

    // --- RECALCULATE MODAL PRICING ---
    recalculateModalFinancials() {
      const labor = parseFloat(document.getElementById('costLabor').value) || 0;
      const parts = parseFloat(document.getElementById('costParts').value) || 0;
      const discount = parseFloat(document.getElementById('costDiscount').value) || 0;
      const paid = parseFloat(document.getElementById('costPaid').value) || 0;

      const total = Math.max(0, labor + parts - discount);
      const balance = Math.max(0, total - paid);

      document.getElementById('costTotal').value = total.toFixed(2);
      document.getElementById('costBalance').value = balance.toFixed(2);
    }

    // --- TICKET VIEW MODE (TABLE / KANBAN) ---
    setTicketView(viewMode) {
      this.currentTicketView = viewMode;
      const tableBtn = document.getElementById('btnViewTable');
      const kanbanBtn = document.getElementById('btnViewKanban');
      const tableView = document.getElementById('ticketsTableView');
      const kanbanView = document.getElementById('ticketsKanbanView');

      if (viewMode === 'table') {
        tableView.classList.remove('hidden');
        kanbanView.classList.add('hidden');
        tableBtn.className = "px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400 flex items-center gap-1.5";
        kanbanBtn.className = "px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 flex items-center gap-1.5";
      } else {
        tableView.classList.add('hidden');
        kanbanView.classList.remove('hidden');
        kanbanBtn.className = "px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400 flex items-center gap-1.5";
        tableBtn.className = "px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 flex items-center gap-1.5";
      }

      this.renderTickets();
    }

    // --- RENDER ALL SECTIONS ---
    renderAll() {
      this.renderDashboardKPIs();
      this.renderRecentTickets();
      this.renderTickets();
      this.renderCustomers();
      this.renderFinances();
      this.renderCharts();
      this.populateSettingsForm();
      lucide.createIcons();
    }

    // --- DASHBOARD KPI & METRICS ---
    renderDashboardKPIs() {
      const total = this.tickets.length;
      const received = this.tickets.filter(t => t.status === 'Received').length;
      const repairing = this.tickets.filter(t => t.status === 'Repairing').length;
      const ready = this.tickets.filter(t => t.status === 'Ready').length;
      const delivered = this.tickets.filter(t => t.status === 'Delivered').length;

      let collectedRevenue = 0;
      let pendingBalance = 0;

      this.tickets.forEach(t => {
        collectedRevenue += Number(t.pricing.paid) || 0;
        pendingBalance += Number(t.pricing.balance) || 0;
      });

      // Update counters
      document.getElementById('kpiTotalTickets').textContent = total;
      document.getElementById('kpiReceived').textContent = received;
      document.getElementById('kpiRepairing').textContent = repairing;
      document.getElementById('kpiReady').textContent = ready;
      document.getElementById('kpiDelivered').textContent = delivered;
      document.getElementById('kpiRevenue').textContent = `$${collectedRevenue.toFixed(2)}`;
      document.getElementById('kpiPending').textContent = `Due: $${pendingBalance.toFixed(2)}`;

      // Badges
      const bTickets = document.getElementById('badgeTicketCount');
      if (bTickets) bTickets.textContent = total;

      const readyCountEl = document.getElementById('readyPickupCount');
      if (readyCountEl) readyCountEl.textContent = ready;

      // Render Ready for Delivery Quick List
      const readyListEl = document.getElementById('readyForDeliveryList');
      if (readyListEl) {
        const readyTickets = this.tickets.filter(t => t.status === 'Ready');
        if (readyTickets.length === 0) {
          readyListEl.innerHTML = `<p class="text-xs text-slate-400 py-3 text-center italic">${this.currentLang === 'so' ? 'Hadda ma jiro qalab diyaar ah' : 'No devices waiting for delivery'}</p>`;
        } else {
          readyListEl.innerHTML = readyTickets.map(t => `
            <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-2">
              <div class="truncate">
                <span class="text-xs font-bold text-slate-800 dark:text-slate-100 block truncate">${t.customer.name}</span>
                <span class="text-[11px] text-slate-500 dark:text-slate-400 truncate block">${t.device.brandModel}</span>
              </div>
              <div class="flex items-center gap-1.5 shrink-0">
                <button onclick="window.app.quickWhatsApp('${t.id}')" title="Send WhatsApp Message" class="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 transition">
                  <i data-lucide="message-square" class="w-3.5 h-3.5"></i>
                </button>
                <button onclick="window.app.advanceStatus('${t.id}')" title="${this.currentLang === 'so' ? 'U wareeji La Wareejiyay' : 'Mark as Delivered'}" class="px-2 py-1 text-[11px] font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition flex items-center gap-1">
                  <span>${this.currentLang === 'so' ? 'Dhiib' : 'Deliver'}</span>
                  <i data-lucide="arrow-right" class="w-3 h-3"></i>
                </button>
              </div>
            </div>
          `).join('');
        }
      }
    }

    // --- RECENT TICKETS IN DASHBOARD ---
    renderRecentTickets() {
      const tbody = document.getElementById('recentTicketsTableBody');
      if (!tbody) return;

      const recent = [...this.tickets].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
      tbody.innerHTML = recent.map(t => this.renderTicketTableRow(t)).join('');
    }

    // --- FILTER TICKETS HELPER ---
    getFilteredTickets() {
      const query = (document.getElementById('ticketSearchInput')?.value || '').toLowerCase().trim();
      const statusFilter = document.getElementById('statusFilterSelect')?.value || 'ALL';
      const paymentFilter = document.getElementById('paymentFilterSelect')?.value || 'ALL';

      return this.tickets.filter(t => {
        // Text search across ID, customer name, phone, device model, serial, issue
        const matchesQuery = !query || 
          t.id.toLowerCase().includes(query) ||
          t.customer.name.toLowerCase().includes(query) ||
          t.customer.phone.toLowerCase().includes(query) ||
          t.device.brandModel.toLowerCase().includes(query) ||
          (t.device.serial && t.device.serial.toLowerCase().includes(query)) ||
          t.issue.toLowerCase().includes(query);

        // Status match
        const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;

        // Payment match
        let paymentStatus = 'Unpaid';
        if (t.pricing.balance === 0 && t.pricing.total > 0) paymentStatus = 'Paid';
        else if (t.pricing.paid > 0 && t.pricing.balance > 0) paymentStatus = 'Partial';
        else if (t.pricing.paid === 0 && t.pricing.total === 0) paymentStatus = 'Paid';

        const matchesPayment = paymentFilter === 'ALL' || paymentStatus === paymentFilter;

        return matchesQuery && matchesStatus && matchesPayment;
      });
    }

    // --- RENDER TICKETS TAB ---
    renderTickets() {
      const filtered = this.getFilteredTickets();
      const noTicketsMsg = document.getElementById('noTicketsMessage');

      if (filtered.length === 0) {
        noTicketsMsg?.classList.remove('hidden');
      } else {
        noTicketsMsg?.classList.add('hidden');
      }

      if (this.currentTicketView === 'table') {
        const tbody = document.getElementById('ticketsTableBody');
        if (tbody) {
          tbody.innerHTML = filtered.map(t => this.renderTicketTableRow(t)).join('');
        }
      } else {
        this.renderKanbanColumns(filtered);
      }

      lucide.createIcons();
    }

    renderTicketTableRow(t) {
      const statusClass = `status-badge-${t.status}`;
      const statusLabel = this.getStatusLabel(t.status);

      let payBadge = '';
      if (t.pricing.balance === 0) {
        payBadge = `<span class="payment-badge payment-badge-Paid">Paid ($${t.pricing.total})</span>`;
      } else if (t.pricing.paid > 0) {
        payBadge = `<span class="payment-badge payment-badge-Partial">Part: $${t.pricing.paid} / Due: $${t.pricing.balance}</span>`;
      } else {
        payBadge = `<span class="payment-badge payment-badge-Unpaid">Unpaid: $${t.pricing.balance}</span>`;
      }

      return `
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition">
          <td class="py-3 px-4 font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
            <button onclick="window.app.openInvoice('${t.id}')" class="hover:underline flex items-center gap-1">
              <i data-lucide="file-text" class="w-3.5 h-3.5"></i>
              ${t.id}
            </button>
            <span class="text-[10px] text-slate-400 block font-sans">${new Date(t.createdAt).toLocaleDateString()}</span>
          </td>
          <td class="py-3 px-4">
            <span class="font-bold text-slate-800 dark:text-slate-100 block">${t.customer.name}</span>
            <span class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <i data-lucide="phone" class="w-3 h-3 text-slate-400"></i>
              ${t.customer.phone}
            </span>
          </td>
          <td class="py-3 px-4">
            <span class="font-semibold text-slate-800 dark:text-slate-200 block">${t.device.brandModel}</span>
            <span class="text-xs text-slate-400">SN: ${t.device.serial || 'N/A'}</span>
          </td>
          <td class="py-3 px-4 max-w-xs">
            <p class="text-xs text-slate-600 dark:text-slate-300 line-clamp-2" title="${t.issue}">
              ${t.issue}
            </p>
          </td>
          <td class="py-3 px-4">
            <div class="flex items-center gap-1.5">
              <span class="status-badge ${statusClass}">
                ${statusLabel}
              </span>
              ${t.status !== 'Delivered' ? `
                <button onclick="window.app.advanceStatus('${t.id}')" title="${this.currentLang === 'so' ? 'Gudbi xaaladda xigta' : 'Advance to next stage'}" class="p-1 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 transition">
                  <i data-lucide="arrow-right-circle" class="w-4 h-4"></i>
                </button>
              ` : ''}
            </div>
          </td>
          <td class="py-3 px-4">
            <div class="space-y-1">
              <div class="font-bold text-slate-800 dark:text-slate-100 text-xs">$${t.pricing.total.toFixed(2)}</div>
              ${payBadge}
            </div>
          </td>
          <td class="py-3 px-4 text-right">
            <div class="flex items-center justify-end gap-1">
              <button onclick="window.app.openInvoice('${t.id}')" title="Invoice & Print" class="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 transition">
                <i data-lucide="receipt" class="w-4 h-4"></i>
              </button>
              <button onclick="window.app.quickWhatsApp('${t.id}')" title="Send WhatsApp" class="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-700 transition">
                <i data-lucide="message-square" class="w-4 h-4"></i>
              </button>
              <button onclick="window.app.openEditTicketModal('${t.id}')" title="Edit Ticket" class="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-700 transition">
                <i data-lucide="edit-3" class="w-4 h-4"></i>
              </button>
              <button onclick="window.app.deleteTicket('${t.id}')" title="Delete Ticket" class="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-700 transition">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }

    // --- KANBAN COLUMNS RENDER ---
    renderKanbanColumns(filtered) {
      const statuses = ['Received', 'Repairing', 'Ready', 'Delivered'];

      statuses.forEach(st => {
        const colEl = document.getElementById(`kanbanCol-${st}`);
        const countEl = document.getElementById(`kanbanCount-${st}`);
        if (!colEl) return;

        const items = filtered.filter(t => t.status === st);
        if (countEl) countEl.textContent = items.length;

        if (items.length === 0) {
          colEl.innerHTML = `<div class="p-6 text-center text-xs text-slate-400 italic">${this.currentLang === 'so' ? 'Waxba kuma jiraan' : 'No items'}</div>`;
        } else {
          colEl.innerHTML = items.map(t => `
            <div class="kanban-card bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-2.5">
              <div class="flex items-center justify-between">
                <span class="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">${t.id}</span>
                <span class="text-[11px] font-bold text-slate-700 dark:text-slate-200">$${t.pricing.total}</span>
              </div>
              <div>
                <h5 class="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">${t.customer.name}</h5>
                <p class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                  <i data-lucide="laptop" class="w-3 h-3 text-slate-400"></i>
                  ${t.device.brandModel}
                </p>
              </div>
              <p class="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 bg-slate-50 dark:bg-slate-700/40 p-2 rounded-lg">
                ${t.issue}
              </p>
              <div class="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <div class="flex items-center gap-1">
                  <button onclick="window.app.openInvoice('${t.id}')" title="Invoice" class="p-1 rounded text-slate-400 hover:text-blue-600 transition">
                    <i data-lucide="file-text" class="w-3.5 h-3.5"></i>
                  </button>
                  <button onclick="window.app.quickWhatsApp('${t.id}')" title="WhatsApp" class="p-1 rounded text-slate-400 hover:text-emerald-600 transition">
                    <i data-lucide="message-square" class="w-3.5 h-3.5"></i>
                  </button>
                  <button onclick="window.app.openEditTicketModal('${t.id}')" title="Edit" class="p-1 rounded text-slate-400 hover:text-amber-600 transition">
                    <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
                ${t.status !== 'Delivered' ? `
                  <button onclick="window.app.advanceStatus('${t.id}')" class="px-2 py-1 text-[11px] font-bold bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 text-blue-600 dark:text-blue-300 rounded-lg flex items-center gap-1 transition">
                    <span>${this.getNextStatusLabel(t.status)}</span>
                    <i data-lucide="arrow-right" class="w-3 h-3"></i>
                  </button>
                ` : `
                  <span class="text-[10px] text-purple-600 dark:text-purple-400 font-bold">✓ Delivered</span>
                `}
              </div>
            </div>
          `).join('');
        }
      });
    }

    getStatusLabel(status) {
      if (this.currentLang === 'so') {
        switch (status) {
          case 'Received': return '📥 La Helay';
          case 'Repairing': return '⚙️ Dayactir Socda';
          case 'Ready': return '✅ Diyaar Ah';
          case 'Delivered': return '🚀 La Wareejiyay';
          default: return status;
        }
      } else {
        switch (status) {
          case 'Received': return '📥 Received';
          case 'Repairing': return '⚙️ Repairing';
          case 'Ready': return '✅ Ready';
          case 'Delivered': return '🚀 Delivered';
          default: return status;
        }
      }
    }

    getNextStatusLabel(status) {
      if (status === 'Received') return this.currentLang === 'so' ? 'Dayactir' : 'Repair';
      if (status === 'Repairing') return this.currentLang === 'so' ? 'Diyaar' : 'Ready';
      if (status === 'Ready') return this.currentLang === 'so' ? 'Dhiib' : 'Deliver';
      return '';
    }

    // --- STATUS WORKFLOW ENGINE (Received -> Repairing -> Ready -> Delivered) ---
    advanceStatus(ticketId) {
      const ticket = this.tickets.find(t => t.id === ticketId);
      if (!ticket) return;

      const order = ['Received', 'Repairing', 'Ready', 'Delivered'];
      const currentIndex = order.indexOf(ticket.status);
      if (currentIndex < order.length - 1) {
        ticket.status = order[currentIndex + 1];
        ticket.updatedAt = new Date().toISOString();
        this.saveTickets();
        this.renderAll();

        const msg = this.currentLang === 'so'
          ? `Xaaladda tikidhka ${ticket.id} waxaa loo wareejiyay: ${this.getStatusLabel(ticket.status)}`
          : `Ticket ${ticket.id} status moved to: ${ticket.status}`;
        this.showToast(msg, 'success');
      }
    }

    // --- CUSTOMER RECORDS TAB ---
    renderCustomers() {
      const grid = document.getElementById('customersGrid');
      const noCustMsg = document.getElementById('noCustomersMessage');
      const bCust = document.getElementById('badgeCustomerCount');
      if (!grid) return;

      const query = (document.getElementById('customerSearchInput')?.value || '').toLowerCase().trim();

      // Aggregate customers from tickets
      const customerMap = {};
      this.tickets.forEach(t => {
        const phoneKey = t.customer.phone.trim();
        if (!customerMap[phoneKey]) {
          customerMap[phoneKey] = {
            name: t.customer.name,
            phone: t.customer.phone,
            email: t.customer.email || '',
            tickets: [],
            totalSpent: 0,
            balanceDue: 0
          };
        }
        customerMap[phoneKey].tickets.push(t);
        customerMap[phoneKey].totalSpent += Number(t.pricing.paid) || 0;
        customerMap[phoneKey].balanceDue += Number(t.pricing.balance) || 0;
      });

      const customerList = Object.values(customerMap);
      if (bCust) bCust.textContent = customerList.length;

      const filtered = customerList.filter(c => {
        return !query || c.name.toLowerCase().includes(query) || c.phone.toLowerCase().includes(query);
      });

      if (filtered.length === 0) {
        noCustMsg?.classList.remove('hidden');
        grid.innerHTML = '';
        return;
      } else {
        noCustMsg?.classList.add('hidden');
      }

      grid.innerHTML = filtered.map(c => `
        <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 font-bold flex items-center justify-center text-sm">
                  ${c.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 class="font-bold text-slate-800 dark:text-slate-100 text-sm">${c.name}</h4>
                  <p class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                    <i data-lucide="phone" class="w-3 h-3 text-slate-400"></i>
                    ${c.phone}
                  </p>
                </div>
              </div>
              <button onclick="window.app.openCustomerWhatsApp('${c.phone}', '${c.name}')" title="WhatsApp Customer" class="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 transition">
                <i data-lucide="message-square" class="w-4 h-4"></i>
              </button>
            </div>

            <div class="grid grid-cols-3 gap-2 mt-4 p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl text-center">
              <div>
                <span class="text-[10px] uppercase font-bold text-slate-400 block">${this.currentLang === 'so' ? 'Qalabka' : 'Repairs'}</span>
                <span class="font-bold text-slate-800 dark:text-slate-200 text-sm">${c.tickets.length}</span>
              </div>
              <div>
                <span class="text-[10px] uppercase font-bold text-slate-400 block">${this.currentLang === 'so' ? 'Bixiyay' : 'Spent'}</span>
                <span class="font-bold text-emerald-600 dark:text-emerald-400 text-sm">$${c.totalSpent.toFixed(0)}</span>
              </div>
              <div>
                <span class="text-[10px] uppercase font-bold text-slate-400 block">${this.currentLang === 'so' ? 'Deyn' : 'Balance'}</span>
                <span class="font-bold text-rose-600 dark:text-rose-400 text-sm">$${c.balanceDue.toFixed(0)}</span>
              </div>
            </div>

            <!-- Customer devices mini list -->
            <div class="mt-3 space-y-1">
              <span class="text-[10px] uppercase font-semibold text-slate-400">${this.currentLang === 'so' ? 'Qalabkii uu keenay:' : 'Recent Devices:'}</span>
              ${c.tickets.slice(0, 2).map(t => `
                <div class="text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                  <span class="truncate">${t.device.brandModel}</span>
                  <span class="font-mono text-[10px] text-blue-500 font-bold">${t.id}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-2">
            <button onclick="window.app.filterTicketsByCustomer('${c.phone}')" class="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition">
              ${this.currentLang === 'so' ? 'Eeg Tikidhada' : 'View History'}
            </button>
            <button onclick="window.app.openNewTicketForCustomer('${c.name}', '${c.phone}')" class="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1">
              <i data-lucide="plus" class="w-3 h-3"></i>
              ${this.currentLang === 'so' ? 'Dayactir Cusub' : 'New Repair'}
            </button>
          </div>
        </div>
      `).join('');

      lucide.createIcons();
    }

    filterTicketsByCustomer(phone) {
      this.switchTab('tickets');
      const search = document.getElementById('ticketSearchInput');
      if (search) {
        search.value = phone;
        this.renderTickets();
      }
    }

    filterTicketsByStatus(status) {
      this.switchTab('tickets');
      const statusSelect = document.getElementById('statusFilterSelect');
      if (statusSelect) {
        statusSelect.value = status;
        this.renderTickets();
      }
    }

    openNewTicketForCustomer(name, phone) {
      this.openNewTicketModal();
      document.getElementById('custName').value = name;
      document.getElementById('custPhone').value = phone;
    }

    // --- FINANCES & REVENUE TAB ---
    renderFinances() {
      let invoiced = 0;
      let collected = 0;
      let pending = 0;
      let parts = 0;

      this.tickets.forEach(t => {
        invoiced += Number(t.pricing.total) || 0;
        collected += Number(t.pricing.paid) || 0;
        pending += Number(t.pricing.balance) || 0;
        parts += Number(t.pricing.parts) || 0;
      });

      document.getElementById('financeTotalInvoiced').textContent = `$${invoiced.toFixed(2)}`;
      document.getElementById('financeTotalCollected').textContent = `$${collected.toFixed(2)}`;
      document.getElementById('financeTotalPending').textContent = `$${pending.toFixed(2)}`;
      document.getElementById('financePartsCost').textContent = `$${parts.toFixed(2)}`;

      const tbody = document.getElementById('financeTableBody');
      if (tbody) {
        tbody.innerHTML = this.tickets.map(t => `
          <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition">
            <td class="py-3 px-4 font-mono font-bold text-xs text-blue-600 dark:text-blue-400">${t.id}</td>
            <td class="py-3 px-4">
              <span class="font-bold text-slate-800 dark:text-slate-100 text-xs block">${t.customer.name}</span>
              <span class="text-[11px] text-slate-400">${t.device.brandModel}</span>
            </td>
            <td class="py-3 px-4 text-xs font-semibold">$${Number(t.pricing.labor).toFixed(2)}</td>
            <td class="py-3 px-4 text-xs font-semibold">$${Number(t.pricing.parts).toFixed(2)}</td>
            <td class="py-3 px-4 text-xs font-bold text-slate-900 dark:text-white">$${Number(t.pricing.total).toFixed(2)}</td>
            <td class="py-3 px-4 text-xs font-bold text-emerald-600 dark:text-emerald-400">$${Number(t.pricing.paid).toFixed(2)}</td>
            <td class="py-3 px-4 text-xs font-bold text-rose-600 dark:text-rose-400">$${Number(t.pricing.balance).toFixed(2)}</td>
            <td class="py-3 px-4">
              <span class="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 font-medium">
                ${t.pricing.method || 'Cash'}
              </span>
            </td>
            <td class="py-3 px-4 text-right">
              <button onclick="window.app.openInvoice('${t.id}')" class="px-2.5 py-1 text-xs font-semibold bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-100 transition">
                ${this.currentLang === 'so' ? 'Qaansheegad' : 'Invoice'}
              </button>
            </td>
          </tr>
        `).join('');
      }
    }

    // --- CHARTS (CHART.JS) ---
    renderCharts() {
      if (typeof Chart === 'undefined') return;

      const isDark = document.documentElement.classList.contains('dark');
      const textColor = isDark ? '#cbd5e1' : '#475569';

      // 1. Status Chart
      const statusCounts = {
        Received: this.tickets.filter(t => t.status === 'Received').length,
        Repairing: this.tickets.filter(t => t.status === 'Repairing').length,
        Ready: this.tickets.filter(t => t.status === 'Ready').length,
        Delivered: this.tickets.filter(t => t.status === 'Delivered').length,
      };

      const ctxStatus = document.getElementById('chartStatus')?.getContext('2d');
      if (ctxStatus) {
        if (this.statusChart) this.statusChart.destroy();
        this.statusChart = new Chart(ctxStatus, {
          type: 'doughnut',
          data: {
            labels: [
              this.currentLang === 'so' ? 'La Helay' : 'Received',
              this.currentLang === 'so' ? 'Dayactir' : 'Repairing',
              this.currentLang === 'so' ? 'Diyaar' : 'Ready',
              this.currentLang === 'so' ? 'La Wareejiyay' : 'Delivered'
            ],
            datasets: [{
              data: [
                statusCounts.Received,
                statusCounts.Repairing,
                statusCounts.Ready,
                statusCounts.Delivered
              ],
              backgroundColor: ['#38bdf8', '#fbbf24', '#34d399', '#c084fc'],
              borderWidth: 2,
              borderColor: isDark ? '#1e293b' : '#ffffff'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: { color: textColor, font: { size: 11, weight: '600' } }
              }
            },
            cutout: '68%'
          }
        });
      }

      // 2. Brands Chart
      const brandMap = {};
      this.tickets.forEach(t => {
        const brand = t.device.brandModel.split(' ')[0] || 'Other';
        brandMap[brand] = (brandMap[brand] || 0) + 1;
      });

      const topBrands = Object.entries(brandMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      const ctxBrands = document.getElementById('chartBrands')?.getContext('2d');
      if (ctxBrands) {
        if (this.brandsChart) this.brandsChart.destroy();
        this.brandsChart = new Chart(ctxBrands, {
          type: 'bar',
          data: {
            labels: topBrands.map(b => b[0]),
            datasets: [{
              label: this.currentLang === 'so' ? 'Tirada' : 'Count',
              data: topBrands.map(b => b[1]),
              backgroundColor: '#6366f1',
              borderRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { stepSize: 1, color: textColor },
                grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }
              },
              x: {
                ticks: { color: textColor },
                grid: { display: false }
              }
            }
          }
        });
      }
    }

    // --- NEW / EDIT TICKET MODAL ---
    openNewTicketModal() {
      document.getElementById('ticketModalTitle').textContent = this.currentLang === 'so' ? 'Tikidh Cusub oo Dayactir ah' : 'New Repair Ticket';
      document.getElementById('ticketModalSubtitle').textContent = this.currentLang === 'so' ? 'Diiwaangeli qalab cusub oo dayactir u baahan' : 'Check in a new device for repair';
      document.getElementById('btnSaveTicketText').textContent = this.currentLang === 'so' ? 'Keydi Tikidhka' : 'Save Ticket';
      
      // Reset form
      document.getElementById('ticketForm').reset();
      document.getElementById('ticketIdHidden').value = '';
      document.getElementById('costLabor').value = '20';
      document.getElementById('costParts').value = '0';
      document.getElementById('costDiscount').value = '0';
      document.getElementById('costPaid').value = '0';
      document.getElementById('techName').value = 'Sakaria';
      this.recalculateModalFinancials();

      document.getElementById('ticketModal').classList.remove('hidden');
    }

    openEditTicketModal(ticketId) {
      const t = this.tickets.find(item => item.id === ticketId);
      if (!t) return;

      document.getElementById('ticketModalTitle').textContent = this.currentLang === 'so' ? `Wax Ka Bedel Tikidhka: ${t.id}` : `Edit Ticket: ${t.id}`;
      document.getElementById('ticketModalSubtitle').textContent = t.customer.name;
      document.getElementById('btnSaveTicketText').textContent = this.currentLang === 'so' ? 'Cusbooneysii' : 'Update Ticket';

      document.getElementById('ticketIdHidden').value = t.id;
      document.getElementById('custName').value = t.customer.name;
      document.getElementById('custPhone').value = t.customer.phone;
      document.getElementById('deviceType').value = t.device.type || 'Laptop';
      document.getElementById('deviceBrandModel').value = t.device.brandModel;
      document.getElementById('deviceSerial').value = t.device.serial || '';
      document.getElementById('deviceAccessories').value = t.device.accessories || '';
      document.getElementById('devicePassword').value = t.device.password || '';
      document.getElementById('reportedIssue').value = t.issue;
      document.getElementById('techNotes').value = t.techNotes || '';
      document.getElementById('ticketStatus').value = t.status;
      document.getElementById('techName').value = t.technician || 'Sakaria';

      document.getElementById('costLabor').value = t.pricing.labor;
      document.getElementById('costParts').value = t.pricing.parts;
      document.getElementById('costDiscount').value = t.pricing.discount || 0;
      document.getElementById('costPaid').value = t.pricing.paid;
      document.getElementById('paymentMethod').value = t.pricing.method || 'Cash';

      this.recalculateModalFinancials();
      document.getElementById('ticketModal').classList.remove('hidden');
    }

    closeTicketModal() {
      document.getElementById('ticketModal').classList.add('hidden');
    }

    handleSaveTicket(e) {
      e.preventDefault();
      const existingId = document.getElementById('ticketIdHidden').value;

      const labor = parseFloat(document.getElementById('costLabor').value) || 0;
      const parts = parseFloat(document.getElementById('costParts').value) || 0;
      const discount = parseFloat(document.getElementById('costDiscount').value) || 0;
      const paid = parseFloat(document.getElementById('costPaid').value) || 0;
      const total = Math.max(0, labor + parts - discount);
      const balance = Math.max(0, total - paid);

      if (existingId) {
        // Edit existing
        const index = this.tickets.findIndex(t => t.id === existingId);
        if (index !== -1) {
          this.tickets[index] = {
            ...this.tickets[index],
            customer: {
              ...this.tickets[index].customer,
              name: document.getElementById('custName').value.trim(),
              phone: document.getElementById('custPhone').value.trim()
            },
            device: {
              type: document.getElementById('deviceType').value,
              brandModel: document.getElementById('deviceBrandModel').value.trim(),
              serial: document.getElementById('deviceSerial').value.trim(),
              accessories: document.getElementById('deviceAccessories').value.trim(),
              password: document.getElementById('devicePassword').value.trim()
            },
            issue: document.getElementById('reportedIssue').value.trim(),
            techNotes: document.getElementById('techNotes').value.trim(),
            status: document.getElementById('ticketStatus').value,
            technician: document.getElementById('techName').value.trim(),
            pricing: {
              labor,
              parts,
              discount,
              total,
              paid,
              balance,
              method: document.getElementById('paymentMethod').value
            },
            updatedAt: new Date().toISOString()
          };
          this.showToast(this.currentLang === 'so' ? `Tikidhka ${existingId} waa la cusbooneysiiyay` : `Ticket ${existingId} updated`, 'success');
        }
      } else {
        // Create new ticket with auto-increment ID
        const maxNum = this.tickets.reduce((max, t) => {
          const num = parseInt(t.id.replace('SRM-', '')) || 1000;
          return num > max ? num : max;
        }, 1000);
        const newId = `SRM-${maxNum + 1}`;

        const newTicket = {
          id: newId,
          customer: {
            name: document.getElementById('custName').value.trim(),
            phone: document.getElementById('custPhone').value.trim(),
            email: ''
          },
          device: {
            type: document.getElementById('deviceType').value,
            brandModel: document.getElementById('deviceBrandModel').value.trim(),
            serial: document.getElementById('deviceSerial').value.trim(),
            accessories: document.getElementById('deviceAccessories').value.trim(),
            password: document.getElementById('devicePassword').value.trim()
          },
          issue: document.getElementById('reportedIssue').value.trim(),
          techNotes: document.getElementById('techNotes').value.trim(),
          status: document.getElementById('ticketStatus').value,
          technician: document.getElementById('techName').value.trim(),
          pricing: {
            labor,
            parts,
            discount,
            total,
            paid,
            balance,
            method: document.getElementById('paymentMethod').value
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        this.tickets.unshift(newTicket);
        this.showToast(this.currentLang === 'so' ? `Tikidh cusub waa la abuuray: ${newId}` : `New ticket created: ${newId}`, 'success');
      }

      this.saveTickets();
      this.closeTicketModal();
      this.renderAll();
    }

    deleteTicket(ticketId) {
      const confirmMsg = this.currentLang === 'so'
        ? `Ma hubtaa inaad tirto tikidhka ${ticketId}?`
        : `Are you sure you want to delete ticket ${ticketId}?`;

      if (confirm(confirmMsg)) {
        this.tickets = this.tickets.filter(t => t.id !== ticketId);
        this.saveTickets();
        this.renderAll();
        this.showToast(this.currentLang === 'so' ? `Tikidhka waa la tirtiray` : `Ticket deleted`, 'info');
      }
    }

    // --- INVOICE & PDF ENGINE ---
    openInvoice(ticketId) {
      const ticket = this.tickets.find(t => t.id === ticketId);
      if (!ticket) return;

      this.activeInvoiceTicket = ticket;

      // Populate shop settings on invoice
      document.getElementById('invShopName').textContent = this.settings.shopName;
      document.getElementById('invShopPhone').textContent = `Tel: ${this.settings.phone}`;
      document.getElementById('invShopLocation').textContent = this.settings.location;
      document.getElementById('invWarrantyTerms').textContent = this.settings.warranty;

      // Populate Ticket fields
      document.getElementById('invTicketId').textContent = ticket.id;
      document.getElementById('invDate').textContent = new Date(ticket.createdAt).toLocaleDateString();
      
      const badge = document.getElementById('invStatusBadge');
      badge.textContent = this.getStatusLabel(ticket.status);
      badge.className = `status-badge status-badge-${ticket.status}`;

      // Customer & Device
      document.getElementById('invCustomerName').textContent = ticket.customer.name;
      document.getElementById('invCustomerPhone').textContent = ticket.customer.phone;
      document.getElementById('invDeviceModel').textContent = ticket.device.brandModel;
      document.getElementById('invDeviceSerial').textContent = ticket.device.serial || 'N/A';
      document.getElementById('invDeviceAccessories').textContent = ticket.device.accessories || 'None';

      // Issue & notes
      document.getElementById('invReportedIssue').textContent = ticket.issue;
      document.getElementById('invTechNotes').textContent = ticket.techNotes || 'Diagnostic and repairs completed per standard.';

      // Financials
      document.getElementById('invLaborCost').textContent = `$${Number(ticket.pricing.labor).toFixed(2)}`;
      document.getElementById('invPartsCost').textContent = `$${Number(ticket.pricing.parts).toFixed(2)}`;
      
      const discountRow = document.getElementById('invDiscountRow');
      if (ticket.pricing.discount > 0) {
        discountRow.classList.remove('hidden');
        document.getElementById('invDiscountCost').textContent = `-$${Number(ticket.pricing.discount).toFixed(2)}`;
      } else {
        discountRow.classList.add('hidden');
      }

      document.getElementById('invTotal').textContent = `$${Number(ticket.pricing.total).toFixed(2)}`;
      document.getElementById('invPaid').textContent = `$${Number(ticket.pricing.paid).toFixed(2)}`;
      document.getElementById('invBalance').textContent = `$${Number(ticket.pricing.balance).toFixed(2)}`;

      document.getElementById('invTechName').textContent = ticket.technician || 'Sakaria';

      document.getElementById('invoiceModal').classList.remove('hidden');
    }

    closeInvoiceModal() {
      document.getElementById('invoiceModal').classList.add('hidden');
      this.activeInvoiceTicket = null;
    }

    downloadInvoicePDF() {
      if (!this.activeInvoiceTicket) return;
      const element = document.getElementById('invoicePrintArea');
      const filename = `Invoice_${this.activeInvoiceTicket.id}_${this.activeInvoiceTicket.customer.name.replace(/\s+/g, '_')}.pdf`;

      if (typeof html2pdf !== 'undefined') {
        const opt = {
          margin: 10,
          filename: filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        this.showToast(this.currentLang === 'so' ? 'PDF-ka waa la diyaarinayaa...' : 'Generating PDF...', 'info');
        html2pdf().set(opt).from(element).save().then(() => {
          this.showToast(this.currentLang === 'so' ? 'PDF waa la soo dejiyay!' : 'PDF downloaded successfully!', 'success');
        });
      } else {
        window.print();
      }
    }

    sendInvoiceWhatsApp() {
      if (!this.activeInvoiceTicket) return;
      this.sendWhatsAppNotification(this.activeInvoiceTicket);
    }

    quickWhatsApp(ticketId) {
      const ticket = this.tickets.find(t => t.id === ticketId);
      if (ticket) {
        this.sendWhatsAppNotification(ticket);
      }
    }

    openCustomerWhatsApp(phone, name) {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const greeting = this.currentLang === 'so'
        ? `Asc ${name}, waxaan kaa soo wacaynaa ${this.settings.shopName}. Sideen kuu caawin karnaa maanta?`
        : `Hello ${name}, this is ${this.settings.shopName}. How can we assist you today?`;
      const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(greeting)}`;
      window.open(url, '_blank');
    }

    sendWhatsAppNotification(ticket) {
      const cleanPhone = ticket.customer.phone.replace(/[^0-9]/g, '');
      const statusText = this.getStatusLabel(ticket.status);
      
      let message = '';
      if (this.currentLang === 'so') {
        message = `Asc ${ticket.customer.name}!\n\n` +
          `Waxaan kaala soo xiriiraynaa *${this.settings.shopName}*.\n` +
          `Tikidhka: *${ticket.id}*\n` +
          `Qalabka: *${ticket.device.brandModel}*\n` +
          `Xaaladda Hadda: *${statusText}*\n\n` +
          `📊 *Xisaabta:* \n` +
          `• Wadarta Guud: $${ticket.pricing.total}\n` +
          `• La Bixiyay: $${ticket.pricing.paid}\n` +
          `• Hadhay: $${ticket.pricing.balance}\n\n` +
          `Mahadsanid! Wixii faahfaahin ah nagala soo xiriir: ${this.settings.phone}`;
      } else {
        message = `Hello ${ticket.customer.name}!\n\n` +
          `Update from *${this.settings.shopName}*:\n` +
          `Ticket: *${ticket.id}*\n` +
          `Device: *${ticket.device.brandModel}*\n` +
          `Current Status: *${statusText}*\n\n` +
          `📊 *Billing Details:* \n` +
          `• Total Cost: $${ticket.pricing.total}\n` +
          `• Amount Paid: $${ticket.pricing.paid}\n` +
          `• Balance Due: $${ticket.pricing.balance}\n\n` +
          `Thank you for choosing us! Contact: ${this.settings.phone}`;
      }

      const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    }

    // --- POPULATE SETTINGS FORM ---
    populateSettingsForm() {
      const sName = document.getElementById('settingShopName');
      const sPhone = document.getElementById('settingShopPhone');
      const sEmail = document.getElementById('settingShopEmail');
      const sLoc = document.getElementById('settingShopLocation');
      const sWar = document.getElementById('settingWarranty');

      if (sName) sName.value = this.settings.shopName;
      if (sPhone) sPhone.value = this.settings.phone;
      if (sEmail) sEmail.value = this.settings.email;
      if (sLoc) sLoc.value = this.settings.location;
      if (sWar) sWar.value = this.settings.warranty;
    }

    // --- BACKUP & RESTORE DATA ---
    exportBackup() {
      const payload = {
        exportedAt: new Date().toISOString(),
        version: "2.5",
        settings: this.settings,
        tickets: this.tickets
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Sakaria_Repair_Manager_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      this.showToast(this.currentLang === 'so' ? 'Xogta oo dhan waa la soo dejiyay!' : 'Backup file downloaded!', 'success');
    }

    importBackup(event) {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.tickets && Array.isArray(data.tickets)) {
            this.tickets = data.tickets;
            this.saveTickets();
            if (data.settings) {
              this.settings = data.settings;
              localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(this.settings));
            }
            this.renderAll();
            this.showToast(this.currentLang === 'so' ? 'Xogtii hore waa la soo celiyay!' : 'Data restored successfully!', 'success');
          } else {
            alert(this.currentLang === 'so' ? 'Faylka sax ma aha!' : 'Invalid backup format!');
          }
        } catch (err) {
          alert('Error parsing JSON backup file.');
        }
      };
      reader.readAsText(file);
      event.target.value = '';
    }

    resetSampleData() {
      const confirmMsg = this.currentLang === 'so' 
        ? "Ma hubtaa inaad dib ugu celiso xogta tusaalaha ah? Xogtii aad hadda qortay way lumi kartaa."
        : "Reset all tickets to the initial demo data?";
      if (confirm(confirmMsg)) {
        this.tickets = [...DEFAULT_TICKETS];
        this.settings = { ...DEFAULT_SETTINGS };
        this.saveTickets();
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(this.settings));
        this.renderAll();
        this.showToast(this.currentLang === 'so' ? 'Xogtii tusaalaha dib ayaa loo soo celiyay!' : 'Reset to sample data successfully!', 'info');
      }
    }

    // --- TOAST NOTIFICATIONS ---
    showToast(message, type = 'info') {
      const container = document.getElementById('toastContainer');
      if (!container) return;

      const toast = document.createElement('div');
      const colors = {
        success: 'bg-emerald-600 text-white',
        info: 'bg-blue-600 text-white',
        error: 'bg-rose-600 text-white',
        warning: 'bg-amber-600 text-white'
      };

      toast.className = `px-4 py-3 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 transition-all transform duration-300 pointer-events-auto ${colors[type] || colors.info}`;
      toast.innerHTML = `
        <i data-lucide="${type === 'success' ? 'check-circle' : 'info'}" class="w-4 h-4 shrink-0"></i>
        <span>${message}</span>
      `;

      container.appendChild(toast);
      lucide.createIcons();

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }
  }

  // Instantiate application and bind globally
  window.addEventListener('DOMContentLoaded', () => {
    window.app = new RepairManagerApp();
  });

})();
