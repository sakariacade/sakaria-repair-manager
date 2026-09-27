export const DEFAULT_SETTINGS = {
  shopName: "Sakaria Repair Center",
  phone: "+252 61 5000000",
  email: "sakaria.repair@gmail.com",
  location: "Maka Al Mukarama St, Mogadishu",
  warranty: "Dammaanad 30 maalmood ah qalabka la bedelay iyo shaqada la qabtay. Qalabka qoyaanka ama jabka cusub gala dammaanad kuma jirto."
};

export const DEFAULT_TICKETS = [
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
    techNotes: "Battery replaced with OEM Dell battery. Fan cleaned and thermal paste reapplied.",
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
      brandModel: "Apple MacBook Air M2",
      serial: "C02F9382Q6N",
      accessories: "MagSafe Cable",
      password: "None"
    },
    issue: "Kafee ku daatay, badhanka shididda iyo furayaasha keyboard-ka qaar ayaa dhegaya",
    techNotes: "Ultrasonic cleaning completed for motherboard; keyboard membrane flush in progress.",
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
      brandModel: "Lenovo ThinkPad T14",
      serial: "PF392810X",
      accessories: "Lenovo 65W Charger",
      password: "9988"
    },
    issue: "Aad buu u gaabiyaa (Very slow), wuxuu wataa Hard Drive duug ah",
    techNotes: "Upgraded 1TB HDD to 512GB NVMe M.2 SSD. Fresh Windows 11 Pro installed.",
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
