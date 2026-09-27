import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Database Directory & File Path
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'repairs_db.json');

// Initial Seed Data
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

// Ensure database file exists
function getDatabase() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialDb = {
      settings: DEFAULT_SETTINGS,
      tickets: DEFAULT_TICKETS,
      lastUpdated: new Date().toISOString()
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error("Database read error, restoring default:", err);
    return { settings: DEFAULT_SETTINGS, tickets: DEFAULT_TICKETS };
  }
}

function saveDatabase(data) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  data.lastUpdated = new Date().toISOString();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// --- REST API ENDPOINTS ---

// 1. GET ALL DATA
app.get('/api/data', (req, res) => {
  const db = getDatabase();
  res.json({
    success: true,
    tickets: db.tickets || [],
    settings: db.settings || DEFAULT_SETTINGS,
    dbPath: DB_FILE
  });
});

// 2. CREATE OR UPDATE TICKET
app.post('/api/tickets', (req, res) => {
  const db = getDatabase();
  const ticket = req.body;

  if (!ticket || !ticket.customer || !ticket.customer.name) {
    return res.status(400).json({ success: false, message: "Invalid ticket data" });
  }

  const existingIdx = db.tickets.findIndex(t => t.id === ticket.id);
  if (existingIdx !== -1) {
    // Update existing
    db.tickets[existingIdx] = {
      ...db.tickets[existingIdx],
      ...ticket,
      updatedAt: new Date().toISOString()
    };
  } else {
    // Add new ticket at beginning
    if (!ticket.id) {
      const maxNum = db.tickets.reduce((max, t) => {
        const num = parseInt(t.id.replace('SRM-', '')) || 1000;
        return num > max ? num : max;
      }, 1000);
      ticket.id = `SRM-${maxNum + 1}`;
    }
    ticket.createdAt = ticket.createdAt || new Date().toISOString();
    ticket.updatedAt = new Date().toISOString();
    db.tickets.unshift(ticket);
  }

  saveDatabase(db);
  res.json({ success: true, ticket, tickets: db.tickets });
});

// 3. DELETE TICKET
app.delete('/api/tickets/:id', (req, res) => {
  const db = getDatabase();
  const { id } = req.params;

  db.tickets = db.tickets.filter(t => t.id !== id);
  saveDatabase(db);
  res.json({ success: true, message: "Ticket deleted", tickets: db.tickets });
});

// 4. UPDATE SETTINGS
app.post('/api/settings', (req, res) => {
  const db = getDatabase();
  db.settings = { ...db.settings, ...req.body };
  saveDatabase(db);
  res.json({ success: true, settings: db.settings });
});

// 5. RESET TO DEFAULTS
app.post('/api/reset', (req, res) => {
  const resetDb = {
    settings: DEFAULT_SETTINGS,
    tickets: DEFAULT_TICKETS,
    lastUpdated: new Date().toISOString()
  };
  saveDatabase(resetDb);
  res.json({ success: true, ...resetDb });
});

app.listen(PORT, () => {
  console.log(`🚀 Sakaria Repair Manager Backend Database running on http://localhost:${PORT}`);
  console.log(`💾 Database file: ${DB_FILE}`);
});
