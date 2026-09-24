import mysql, { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { Bill, BillStatus, DashboardStats, User, UserRole } from './types';

// MySQL connection configuration
const MYSQL_CONFIG = {
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'isp_billing',
  connectTimeout: 2000,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
};

let pool: Pool | null = null;
let isMySQLConnected: boolean | null = null;
let lastCheckTime = 0;
let tablesInitialized = false;

function getPool(): Pool {
  if (!pool) {
    pool = mysql.createPool(MYSQL_CONFIG);
  }
  return pool;
}

// Fallback persistent storage file path (mirrors MySQL tables)
const DATA_DIR = path.join(process.cwd(), 'data');
const STORAGE_FILE = path.join(DATA_DIR, 'isp_storage.json');

interface LocalStorageSchema {
  users: Array<User & { password?: string }>;
  bills: Bill[];
}

function getDefaultStorage(): LocalStorageSchema {
  return {
    users: [
      {
        id: 1,
        user_id: 'kamrul.cse9@gmail.com',
        name: 'Kamrul Islam',
        password: '66667777ssc',
        role: 'admin',
        created_at: new Date().toISOString(),
      },
    ],
    bills: [],
  };
}

function readLocalStorage(): LocalStorageSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORAGE_FILE)) {
      const initial = getDefaultStorage();
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.users || !Array.isArray(parsed.users)) {
      parsed.users = getDefaultStorage().users;
    }
    // Ensure admin user exists in storage
    const hasAdmin = parsed.users.some(
      (u: User) => u.user_id.toLowerCase() === 'kamrul.cse9@gmail.com'
    );
    if (!hasAdmin) {
      parsed.users.unshift(getDefaultStorage().users[0]);
    }
    if (!parsed.bills || !Array.isArray(parsed.bills)) {
      parsed.bills = [];
    }
    return parsed;
  } catch (err) {
    console.warn('Could not read fallback storage, using memory default:', (err as Error).message);
    return getDefaultStorage();
  }
}

function writeLocalStorage(data: LocalStorageSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not write fallback storage:', (err as Error).message);
  }
}

/**
 * Checks if MySQL server is reachable with a short timeout.
 * Caches status for 15 seconds to avoid repeated connection attempts.
 */
export async function testMySQLConnection(): Promise<boolean> {
  const now = Date.now();
  if (isMySQLConnected !== null && now - lastCheckTime < 15000) {
    return isMySQLConnected;
  }
  lastCheckTime = now;

  try {
    const p = getPool();
    const conn = await p.getConnection();
    await conn.ping();
    conn.release();

    if (isMySQLConnected !== true) {
      console.log(`[Database] Connected to MySQL successfully at ${MYSQL_CONFIG.host}:${MYSQL_CONFIG.port}`);
    }
    isMySQLConnected = true;
    return true;
  } catch (err) {
    if (isMySQLConnected !== false) {
      console.log(
        `[Database] MySQL is currently not reachable at ${MYSQL_CONFIG.host}:${MYSQL_CONFIG.port}. Operating in resilient storage mode.`
      );
    }
    isMySQLConnected = false;
    return false;
  }
}

/**
 * Ensures MySQL tables and initial Admin record exist.
 */
export async function ensureTables(): Promise<void> {
  if (tablesInitialized) return;
  const isUp = await testMySQLConnection();
  if (!isUp) return;

  try {
    const p = getPool();
    await p.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL UNIQUE COMMENT 'Staff Email address',
        name VARCHAR(100) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'support', 'manager', 'accounts') NOT NULL DEFAULT 'support',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_users_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await p.query(`
      CREATE TABLE IF NOT EXISTS bills (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_id VARCHAR(50) NOT NULL,
        user_id VARCHAR(100) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        description TEXT NOT NULL,
        date DATE NOT NULL,
        status ENUM('Pending', 'Approved', 'Rejected', 'Paid') NOT NULL DEFAULT 'Pending',
        created_by VARCHAR(100) DEFAULT NULL,
        rejection_reason TEXT DEFAULT NULL,
        paid_by VARCHAR(100) DEFAULT NULL,
        paid_at TIMESTAMP NULL DEFAULT NULL,
        payment_method VARCHAR(50) DEFAULT 'Cash',
        payment_note TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_bills_status (status),
        INDEX idx_bills_user_id (user_id),
        INDEX idx_bills_date (date),
        INDEX idx_bills_ticket_id (ticket_id),
        INDEX idx_bills_created_by (created_by)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Drop UNIQUE constraints on ticket_id if previously created
    try {
      await p.query(`ALTER TABLE bills DROP INDEX ticket_id`);
    } catch {
      // index might not exist
    }
    try {
      await p.query(`ALTER TABLE bills DROP INDEX ticket_id_UNIQUE`);
    } catch {
      // index might not exist
    }

    // Ensure enum and columns exist for existing installations
    try {
      await p.query(`
        ALTER TABLE bills 
        MODIFY COLUMN status ENUM('Pending', 'Approved', 'Rejected', 'Paid') NOT NULL DEFAULT 'Pending'
      `);
      await p.query(`ALTER TABLE bills ADD COLUMN paid_by VARCHAR(100) DEFAULT NULL`);
    } catch {
      // Column may already exist
    }
    try {
      await p.query(`ALTER TABLE bills ADD COLUMN paid_at TIMESTAMP NULL DEFAULT NULL`);
    } catch {
      // Column may already exist
    }
    try {
      await p.query(`ALTER TABLE bills ADD COLUMN payment_method VARCHAR(50) DEFAULT 'Cash'`);
    } catch {
      // Column may already exist
    }
    try {
      await p.query(`ALTER TABLE bills ADD COLUMN payment_note TEXT DEFAULT NULL`);
    } catch {
      // Column may already exist
    }

    // Ensure system administrator account exists
    await p.query(`
      INSERT INTO users (id, user_id, name, password, role)
      VALUES (1, 'kamrul.cse9@gmail.com', 'Kamrul Islam', '66667777ssc', 'admin')
      ON DUPLICATE KEY UPDATE 
        name=VALUES(name),
        password=VALUES(password),
        role=VALUES(role);
    `);

    tablesInitialized = true;
  } catch (err) {
    console.warn('MySQL table initialization warning:', (err as Error).message);
  }
}

// ==================== User Repository ====================

export async function getUsers(): Promise<User[]> {
  const isUp = await testMySQLConnection();
  if (isUp) {
    try {
      await ensureTables();
      const p = getPool();
      const [rows] = await p.query<RowDataPacket[]>(
        'SELECT id, user_id, name, role, DATE_FORMAT(created_at, "%Y-%m-%dT%H:%i:%s.000Z") as created_at FROM users ORDER BY id ASC'
      );
      return rows.map((r) => ({
        id: Number(r.id),
        user_id: String(r.user_id),
        name: String(r.name),
        role: r.role as UserRole,
        created_at: String(r.created_at || ''),
      }));
    } catch (error) {
      console.warn('MySQL getUsers failed, switching to local store:', (error as Error).message);
      isMySQLConnected = false;
    }
  }

  // Resilient fallback
  const store = readLocalStorage();
  return store.users.map(({ id, user_id, name, role, created_at }) => ({
    id,
    user_id,
    name,
    role,
    created_at,
  }));
}

export async function getUserById(id: number): Promise<User | null> {
  const isUp = await testMySQLConnection();
  if (isUp) {
    try {
      await ensureTables();
      const p = getPool();
      const [rows] = await p.query<RowDataPacket[]>(
        'SELECT id, user_id, name, role, DATE_FORMAT(created_at, "%Y-%m-%dT%H:%i:%s.000Z") as created_at FROM users WHERE id = ? LIMIT 1',
        [id]
      );
      if (!rows || rows.length === 0) return null;
      const r = rows[0];
      return {
        id: Number(r.id),
        user_id: String(r.user_id),
        name: String(r.name),
        role: r.role as UserRole,
        created_at: String(r.created_at || ''),
      };
    } catch (error) {
      console.warn('MySQL getUserById failed, switching to local store:', (error as Error).message);
      isMySQLConnected = false;
    }
  }

  // Resilient fallback
  const store = readLocalStorage();
  const found = store.users.find((u) => u.id === id);
  if (!found) return null;
  return {
    id: found.id,
    user_id: found.user_id,
    name: found.name,
    role: found.role,
    created_at: found.created_at,
  };
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const cleanEmail = email.trim().toLowerCase();
  const isUp = await testMySQLConnection();
  if (isUp) {
    try {
      await ensureTables();
      const p = getPool();
      const [rows] = await p.query<RowDataPacket[]>(
        'SELECT id, user_id, name, role, DATE_FORMAT(created_at, "%Y-%m-%dT%H:%i:%s.000Z") as created_at FROM users WHERE LOWER(user_id) = LOWER(?) LIMIT 1',
        [cleanEmail]
      );
      if (!rows || rows.length === 0) return null;
      const r = rows[0];
      return {
        id: Number(r.id),
        user_id: String(r.user_id),
        name: String(r.name),
        role: r.role as UserRole,
        created_at: String(r.created_at || ''),
      };
    } catch (error) {
      console.warn('MySQL getUserByEmail failed, switching to local store:', (error as Error).message);
      isMySQLConnected = false;
    }
  }

  // Resilient fallback
  const store = readLocalStorage();
  const found = store.users.find((u) => u.user_id.toLowerCase() === cleanEmail);
  if (!found) return null;
  return {
    id: found.id,
    user_id: found.user_id,
    name: found.name,
    role: found.role,
    created_at: found.created_at,
  };
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = password.trim();

  const isUp = await testMySQLConnection();
  if (isUp) {
    try {
      await ensureTables();
      const p = getPool();
      const [rows] = await p.query<RowDataPacket[]>(
        'SELECT id, user_id, name, role, DATE_FORMAT(created_at, "%Y-%m-%dT%H:%i:%s.000Z") as created_at FROM users WHERE LOWER(user_id) = ? AND password = ? LIMIT 1',
        [cleanEmail, cleanPass]
      );
      if (rows && rows.length > 0) {
        const r = rows[0];
        return {
          id: Number(r.id),
          user_id: String(r.user_id),
          name: String(r.name),
          role: r.role as UserRole,
          created_at: String(r.created_at || ''),
        };
      }
      return null;
    } catch (error) {
      console.warn('MySQL authenticateUser failed, switching to local store:', (error as Error).message);
      isMySQLConnected = false;
    }
  }

  // Resilient fallback
  const store = readLocalStorage();
  const found = store.users.find(
    (u) => u.user_id.toLowerCase() === cleanEmail && u.password === cleanPass
  );

  if (!found) return null;
  return {
    id: found.id,
    user_id: found.user_id,
    name: found.name,
    role: found.role,
    created_at: found.created_at,
  };
}

export async function createUser(userData: {
  user_id: string; // Email
  name: string;
  password: string;
  role: UserRole;
}): Promise<{ success: boolean; user?: User; error?: string }> {
  const cleanEmail = userData.user_id.trim().toLowerCase();
  const name = userData.name.trim();
  const password = userData.password;
  const role = userData.role;

  if (!cleanEmail || !name || !password) {
    return { success: false, error: 'Email, Name, and Password are required.' };
  }

  const isUp = await testMySQLConnection();
  if (isUp) {
    try {
      await ensureTables();
      const p = getPool();
      const [existing] = await p.query<RowDataPacket[]>(
        'SELECT id FROM users WHERE LOWER(user_id) = ? LIMIT 1',
        [cleanEmail]
      );
      if (existing && existing.length > 0) {
        return { success: false, error: `Account with email "${cleanEmail}" already exists.` };
      }

      const [res] = await p.query<ResultSetHeader>(
        'INSERT INTO users (user_id, name, password, role, created_at) VALUES (?, ?, ?, ?, NOW())',
        [cleanEmail, name, password, role]
      );

      return {
        success: true,
        user: {
          id: res.insertId,
          user_id: cleanEmail,
          name,
          role,
          created_at: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.warn('MySQL createUser error:', (error as Error).message);
      isMySQLConnected = false;
    }
  }

  // Resilient fallback
  const store = readLocalStorage();
  const exists = store.users.some((u) => u.user_id.toLowerCase() === cleanEmail);
  if (exists) {
    return { success: false, error: `Account with email "${cleanEmail}" already exists.` };
  }

  const nextId = store.users.length > 0 ? Math.max(...store.users.map((u) => u.id)) + 1 : 1;
  const newUser = {
    id: nextId,
    user_id: cleanEmail,
    name,
    password,
    role,
    created_at: new Date().toISOString(),
  };

  store.users.push(newUser);
  writeLocalStorage(store);

  return {
    success: true,
    user: {
      id: newUser.id,
      user_id: newUser.user_id,
      name: newUser.name,
      role: newUser.role,
      created_at: newUser.created_at,
    },
  };
}

export async function updateUser(
  id: number,
  updates: Partial<Omit<User, 'id'>>
): Promise<{ success: boolean; user?: User; error?: string }> {
  const isUp = await testMySQLConnection();
  if (isUp) {
    try {
      await ensureTables();
      const p = getPool();
      const [existing] = await p.query<RowDataPacket[]>(
        'SELECT id, user_id, name, role, created_at FROM users WHERE id = ? LIMIT 1',
        [id]
      );
      if (!existing || existing.length === 0) {
        return { success: false, error: 'User not found.' };
      }

      const currentUser = existing[0];
      if (updates.user_id && updates.user_id.toLowerCase() !== currentUser.user_id.toLowerCase()) {
        const [emailCheck] = await p.query<RowDataPacket[]>(
          'SELECT id FROM users WHERE LOWER(user_id) = ? AND id != ? LIMIT 1',
          [updates.user_id.trim().toLowerCase(), id]
        );
        if (emailCheck && emailCheck.length > 0) {
          return { success: false, error: `Email "${updates.user_id}" is already in use.` };
        }
      }

      const newEmail = updates.user_id ? updates.user_id.trim().toLowerCase() : currentUser.user_id;
      const newName = updates.name ? updates.name.trim() : currentUser.name;
      const newRole = updates.role || currentUser.role;

      if (updates.password) {
        await p.query(
          'UPDATE users SET user_id = ?, name = ?, role = ?, password = ? WHERE id = ?',
          [newEmail, newName, newRole, updates.password, id]
        );
      } else {
        await p.query(
          'UPDATE users SET user_id = ?, name = ?, role = ? WHERE id = ?',
          [newEmail, newName, newRole, id]
        );
      }

      return {
        success: true,
        user: {
          id,
          user_id: newEmail,
          name: newName,
          role: newRole,
          created_at: String(currentUser.created_at || ''),
        },
      };
    } catch (error) {
      console.warn('MySQL updateUser failed:', (error as Error).message);
      isMySQLConnected = false;
    }
  }

  // Resilient fallback
  const store = readLocalStorage();
  const idx = store.users.findIndex((u) => u.id === id);
  if (idx === -1) {
    return { success: false, error: 'User not found.' };
  }

  if (updates.user_id && updates.user_id.toLowerCase() !== store.users[idx].user_id.toLowerCase()) {
    const check = store.users.some(
      (u) => u.user_id.toLowerCase() === updates.user_id!.trim().toLowerCase() && u.id !== id
    );
    if (check) {
      return { success: false, error: `Email "${updates.user_id}" is already in use.` };
    }
  }

  if (updates.user_id) store.users[idx].user_id = updates.user_id.trim().toLowerCase();
  if (updates.name) store.users[idx].name = updates.name.trim();
  if (updates.role) store.users[idx].role = updates.role;
  if (updates.password) store.users[idx].password = updates.password;

  writeLocalStorage(store);

  const u = store.users[idx];
  return {
    success: true,
    user: {
      id: u.id,
      user_id: u.user_id,
      name: u.name,
      role: u.role,
      created_at: u.created_at,
    },
  };
}

export async function deleteUser(id: number): Promise<{ success: boolean; error?: string }> {
  const isUp = await testMySQLConnection();
  if (isUp) {
    try {
      await ensureTables();
      const p = getPool();
      const [rows] = await p.query<RowDataPacket[]>(
        'SELECT user_id FROM users WHERE id = ? LIMIT 1',
        [id]
      );
      if (!rows || rows.length === 0) {
        return { success: false, error: 'User not found.' };
      }

      if (String(rows[0].user_id).toLowerCase() === 'kamrul.cse9@gmail.com') {
        return { success: false, error: 'Cannot delete the primary system administrator.' };
      }

      await p.query('DELETE FROM users WHERE id = ?', [id]);
      return { success: true };
    } catch (error) {
      console.warn('MySQL deleteUser failed:', (error as Error).message);
      isMySQLConnected = false;
    }
  }

  // Resilient fallback
  const store = readLocalStorage();
  const target = store.users.find((u) => u.id === id);
  if (!target) {
    return { success: false, error: 'User not found.' };
  }
  if (target.user_id.toLowerCase() === 'kamrul.cse9@gmail.com') {
    return { success: false, error: 'Cannot delete the primary system administrator.' };
  }

  store.users = store.users.filter((u) => u.id !== id);
  writeLocalStorage(store);
  return { success: true };
}

// ==================== Bill Repository ====================

export interface BillFilterOptions {
  status?: string;
  search?: string;
  userId?: string;
  role?: UserRole;
  currentUserId?: string;
  currentUserName?: string;
}

export async function getBills(filter?: BillFilterOptions): Promise<Bill[]> {
  const isUp = await testMySQLConnection();
  if (isUp) {
    try {
      await ensureTables();
      const p = getPool();

      let sql = `
        SELECT
          id,
          ticket_id,
          user_id,
          amount,
          description,
          DATE_FORMAT(date, '%Y-%m-%d') as date,
          status,
          created_by,
          rejection_reason,
          paid_by,
          DATE_FORMAT(paid_at, '%Y-%m-%dT%H:%i:%s.000Z') as paid_at,
          payment_method,
          payment_note,
          DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%s.000Z') as created_at,
          DATE_FORMAT(updated_at, '%Y-%m-%dT%H:%i:%s.000Z') as updated_at
        FROM bills
        WHERE 1=1
      `;
      const params: (string | number)[] = [];

      // Support role can ONLY see their own bills. Cannot see other support or manager bills.
      if (filter?.role === 'support') {
        if (!filter.currentUserId) {
          return [];
        }
        sql += ' AND (LOWER(created_by) LIKE LOWER(?) OR LOWER(created_by) LIKE LOWER(?))';
        const uid = `%${filter.currentUserId.trim()}%`;
        const uname = `%${filter.currentUserName ? filter.currentUserName.trim() : filter.currentUserId.trim()}%`;
        params.push(uid, uname);
      }

      if (filter?.status && filter.status !== 'ALL') {
        sql += ' AND UPPER(status) = UPPER(?)';
        params.push(filter.status);
      }

      // Search by ticket id, user id, description, or support agent name
      if (filter?.search) {
        const q = `%${filter.search.trim()}%`;
        sql += ' AND (ticket_id LIKE ? OR user_id LIKE ? OR description LIKE ? OR created_by LIKE ?)';
        params.push(q, q, q, q);
      }

      sql += ' ORDER BY date DESC, id DESC';

      const [rows] = await p.query<RowDataPacket[]>(sql, params);

      return rows.map((r) => ({
        id: Number(r.id),
        ticket_id: String(r.ticket_id),
        user_id: String(r.user_id),
        amount: Number(r.amount),
        description: String(r.description),
        date: String(r.date),
        status: r.status as BillStatus,
        created_by: r.created_by ? String(r.created_by) : undefined,
        rejection_reason: r.rejection_reason ? String(r.rejection_reason) : undefined,
        paid_by: r.paid_by ? String(r.paid_by) : undefined,
        paid_at: r.paid_at ? String(r.paid_at) : undefined,
        payment_method: r.payment_method ? String(r.payment_method) : undefined,
        payment_note: r.payment_note ? String(r.payment_note) : undefined,
        created_at: String(r.created_at || ''),
        updated_at: String(r.updated_at || ''),
      }));
    } catch (error) {
      console.warn('MySQL getBills failed, switching to local store:', (error as Error).message);
      isMySQLConnected = false;
    }
  }

  // Resilient fallback
  const store = readLocalStorage();
  let list = [...store.bills];

  // Support role can ONLY see their own bills
  if (filter?.role === 'support') {
    if (!filter.currentUserId) {
      return [];
    }
    const uid = filter.currentUserId.trim().toLowerCase();
    const uname = (filter.currentUserName || '').trim().toLowerCase();
    list = list.filter((b) => {
      if (!b.created_by) return false;
      const cb = b.created_by.toLowerCase();
      return cb.includes(uid) || (uname && cb.includes(uname));
    });
  }

  if (filter?.status && filter.status !== 'ALL') {
    list = list.filter((b) => b.status.toUpperCase() === filter.status!.toUpperCase());
  }

  if (filter?.search) {
    const q = filter.search.toLowerCase();
    list = list.filter(
      (b) =>
        b.ticket_id.toLowerCase().includes(q) ||
        b.user_id.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        (b.created_by && b.created_by.toLowerCase().includes(q))
    );
  }

  list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return list;
}

export async function getBillByTicketId(ticketId: string): Promise<Bill | null> {
  const isUp = await testMySQLConnection();
  if (isUp) {
    try {
      await ensureTables();
      const p = getPool();
      const [rows] = await p.query<RowDataPacket[]>(
        `SELECT
          id,
          ticket_id,
          user_id,
          amount,
          description,
          DATE_FORMAT(date, '%Y-%m-%d') as date,
          status,
          created_by,
          rejection_reason,
          paid_by,
          DATE_FORMAT(paid_at, '%Y-%m-%dT%H:%i:%s.000Z') as paid_at,
          payment_method,
          payment_note,
          DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%s.000Z') as created_at,
          DATE_FORMAT(updated_at, '%Y-%m-%dT%H:%i:%s.000Z') as updated_at
        FROM bills
        WHERE LOWER(ticket_id) = LOWER(?)
        LIMIT 1`,
        [ticketId.trim()]
      );

      if (rows && rows.length > 0) {
        const r = rows[0];
        return {
          id: Number(r.id),
          ticket_id: String(r.ticket_id),
          user_id: String(r.user_id),
          amount: Number(r.amount),
          description: String(r.description),
          date: String(r.date),
          status: r.status as BillStatus,
          created_by: r.created_by ? String(r.created_by) : undefined,
          rejection_reason: r.rejection_reason ? String(r.rejection_reason) : undefined,
          paid_by: r.paid_by ? String(r.paid_by) : undefined,
          paid_at: r.paid_at ? String(r.paid_at) : undefined,
          payment_method: r.payment_method ? String(r.payment_method) : undefined,
          payment_note: r.payment_note ? String(r.payment_note) : undefined,
          created_at: String(r.created_at || ''),
          updated_at: String(r.updated_at || ''),
        };
      }
      return null;
    } catch (error) {
      console.warn('MySQL getBillByTicketId failed:', (error as Error).message);
      isMySQLConnected = false;
    }
  }

  // Resilient fallback
  const store = readLocalStorage();
  return (
    store.bills.find((b) => b.ticket_id.toLowerCase() === ticketId.trim().toLowerCase()) || null
  );
}

export async function createBill(data: {
  ticket_id: string;
  user_id: string;
  amount: number | string;
  description: string;
  date: string;
  created_by?: string;
}): Promise<{ success: boolean; bill?: Bill; error?: string }> {
  const ticket_id = (data.ticket_id || '').trim();
  const user_id = (data.user_id || '').trim();
  const description = (data.description || '').trim();
  const date = (data.date || '').trim();
  const numericAmount = Number(data.amount);

  if (!ticket_id) {
    return { success: false, error: 'Ticket ID is required.' };
  }
  if (!/^\d{6}$/.test(ticket_id)) {
    return { success: false, error: 'Ticket ID must be exactly a 6-digit number (e.g. 454433).' };
  }
  if (!user_id) {
    return { success: false, error: 'User ID is required.' };
  }
  if (!/^\d{6}$/.test(user_id)) {
    return { success: false, error: 'User / Subscriber ID must be exactly a 6-digit number (e.g. 454433).' };
  }
  if (isNaN(numericAmount) || numericAmount <= 0) {
    return { success: false, error: 'Amount must be a positive number in TK.' };
  }
  if (!description) {
    return { success: false, error: 'Description is required.' };
  }
  if (!date) {
    return { success: false, error: 'Date is required.' };
  }

  const roundedAmount = Math.round(numericAmount * 100) / 100;
  const created_by = data.created_by || 'Support';

  const isUp = await testMySQLConnection();
  if (isUp) {
    try {
      await ensureTables();
      const p = getPool();
      const [existing] = await p.query<RowDataPacket[]>(
        'SELECT id FROM bills WHERE LOWER(ticket_id) = LOWER(?) LIMIT 1',
        [ticket_id]
      );
      if (existing && existing.length > 0) {
        return { success: false, error: `Ticket ID "${ticket_id}" already exists.` };
      }

      const [res] = await p.query<ResultSetHeader>(
        `INSERT INTO bills (ticket_id, user_id, amount, description, date, status, created_by, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'Pending', ?, NOW(), NOW())`,
        [ticket_id, user_id, roundedAmount, description, date, created_by]
      );

      const nowIso = new Date().toISOString();
      return {
        success: true,
        bill: {
          id: res.insertId,
          ticket_id,
          user_id,
          amount: roundedAmount,
          description,
          date,
          status: 'Pending',
          created_by,
          created_at: nowIso,
          updated_at: nowIso,
        },
      };
    } catch (error) {
      console.warn('MySQL createBill error, saving to local store:', (error as Error).message);
      isMySQLConnected = false;
    }
  }

  // Resilient fallback
  const store = readLocalStorage();
  const exists = store.bills.some(
    (b) => b.ticket_id.toLowerCase() === ticket_id.toLowerCase()
  );
  if (exists) {
    return { success: false, error: `Ticket ID "${ticket_id}" already exists.` };
  }

  const nextId = store.bills.length > 0 ? Math.max(...store.bills.map((b) => b.id)) + 1 : 1;
  const nowIso = new Date().toISOString();

  const newBill: Bill = {
    id: nextId,
    ticket_id,
    user_id,
    amount: roundedAmount,
    description,
    date,
    status: 'Pending',
    created_by,
    created_at: nowIso,
    updated_at: nowIso,
  };

  store.bills.push(newBill);
  writeLocalStorage(store);

  return {
    success: true,
    bill: newBill,
  };
}

export async function updateBillStatus(
  ticketId: string,
  status: BillStatus,
  options?: {
    reason?: string;
    approverName?: string;
    paidBy?: string;
    paymentMethod?: string;
    paymentNote?: string;
  }
): Promise<{ success: boolean; bill?: Bill; error?: string }> {
  const isUp = await testMySQLConnection();
  if (isUp) {
    try {
      await ensureTables();
      const p = getPool();
      const [rows] = await p.query<RowDataPacket[]>(
        'SELECT id FROM bills WHERE LOWER(ticket_id) = LOWER(?) LIMIT 1',
        [ticketId.trim()]
      );
      if (!rows || rows.length === 0) {
        return { success: false, error: `Bill with Ticket ID "${ticketId}" not found.` };
      }

      if (status === 'Paid') {
        const paidBy = options?.paidBy || options?.approverName || 'Accounts Staff';
        const method = options?.paymentMethod || 'Cash';
        const note = options?.paymentNote || null;
        await p.query(
          `UPDATE bills 
           SET status = 'Paid', paid_by = ?, paid_at = NOW(), payment_method = ?, payment_note = ?, updated_at = NOW() 
           WHERE LOWER(ticket_id) = LOWER(?)`,
          [paidBy, method, note, ticketId.trim()]
        );
      } else if (status === 'Rejected' && options?.reason) {
        await p.query(
          'UPDATE bills SET status = ?, rejection_reason = ?, updated_at = NOW() WHERE LOWER(ticket_id) = LOWER(?)',
          [status, options.reason.trim(), ticketId.trim()]
        );
      } else {
        await p.query(
          'UPDATE bills SET status = ?, updated_at = NOW() WHERE LOWER(ticket_id) = LOWER(?)',
          [status, ticketId.trim()]
        );
      }

      const updatedBill = await getBillByTicketId(ticketId);
      return {
        success: true,
        bill: updatedBill || undefined,
      };
    } catch (error) {
      console.warn('MySQL updateBillStatus failed:', (error as Error).message);
      isMySQLConnected = false;
    }
  }

  // Resilient fallback
  const store = readLocalStorage();
  const idx = store.bills.findIndex(
    (b) => b.ticket_id.toLowerCase() === ticketId.trim().toLowerCase()
  );
  if (idx === -1) {
    return { success: false, error: `Bill with Ticket ID "${ticketId}" not found.` };
  }

  store.bills[idx].status = status;
  store.bills[idx].updated_at = new Date().toISOString();
  if (status === 'Paid') {
    store.bills[idx].paid_by = options?.paidBy || options?.approverName || 'Accounts Staff';
    store.bills[idx].paid_at = new Date().toISOString();
    store.bills[idx].payment_method = options?.paymentMethod || 'Cash';
    if (options?.paymentNote) {
      store.bills[idx].payment_note = options.paymentNote.trim();
    }
  } else if (status === 'Rejected' && options?.reason) {
    store.bills[idx].rejection_reason = options.reason.trim();
  }

  writeLocalStorage(store);

  return {
    success: true,
    bill: store.bills[idx],
  };
}

export async function getDashboardStats(filter?: {
  role?: UserRole;
  currentUserId?: string;
  currentUserName?: string;
}): Promise<DashboardStats> {
  const isUp = await testMySQLConnection();
  if (isUp) {
    try {
      await ensureTables();
      const p = getPool();

      // Support role strictly sees only their own totals
      if (filter?.role === 'support' && !filter?.currentUserId) {
        return {
          totalBills: 0,
          pendingBills: 0,
          approvedBills: 0,
          rejectedBills: 0,
          paidBills: 0,
          totalVolumeTk: 0,
          pendingVolumeTk: 0,
          approvedVolumeTk: 0,
          rejectedVolumeTk: 0,
          paidVolumeTk: 0,
        };
      }

      let sql = `
        SELECT
          COUNT(*) as totalBills,
          SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pendingBills,
          SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approvedBills,
          SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejectedBills,
          SUM(CASE WHEN status = 'Paid' THEN 1 ELSE 0 END) as paidBills,
          COALESCE(SUM(amount), 0) as totalVolumeTk,
          COALESCE(SUM(CASE WHEN status = 'Pending' THEN amount ELSE 0 END), 0) as pendingVolumeTk,
          COALESCE(SUM(CASE WHEN status = 'Approved' THEN amount ELSE 0 END), 0) as approvedVolumeTk,
          COALESCE(SUM(CASE WHEN status = 'Rejected' THEN amount ELSE 0 END), 0) as rejectedVolumeTk,
          COALESCE(SUM(CASE WHEN status = 'Paid' THEN amount ELSE 0 END), 0) as paidVolumeTk
        FROM bills
        WHERE 1=1
      `;
      const params: (string | number)[] = [];

      // Support role can only see their own amounts
      if (filter?.role === 'support' && filter?.currentUserId) {
        sql += ' AND (LOWER(created_by) LIKE LOWER(?) OR LOWER(created_by) LIKE LOWER(?))';
        const uid = `%${filter.currentUserId.trim()}%`;
        const uname = `%${filter.currentUserName ? filter.currentUserName.trim() : filter.currentUserId.trim()}%`;
        params.push(uid, uname);
      }

      const [rows] = await p.query<RowDataPacket[]>(sql, params);

      if (rows && rows.length > 0) {
        const r = rows[0];
        return {
          totalBills: Number(r.totalBills) || 0,
          pendingBills: Number(r.pendingBills) || 0,
          approvedBills: Number(r.approvedBills) || 0,
          rejectedBills: Number(r.rejectedBills) || 0,
          paidBills: Number(r.paidBills) || 0,
          totalVolumeTk: Number(r.totalVolumeTk) || 0,
          pendingVolumeTk: Number(r.pendingVolumeTk) || 0,
          approvedVolumeTk: Number(r.approvedVolumeTk) || 0,
          rejectedVolumeTk: Number(r.rejectedVolumeTk) || 0,
          paidVolumeTk: Number(r.paidVolumeTk) || 0,
        };
      }
    } catch (error) {
      console.warn('MySQL getDashboardStats failed, switching to local store:', (error as Error).message);
      isMySQLConnected = false;
    }
  }

  // Resilient fallback calculation
  const store = readLocalStorage();
  let bills = store.bills;

  // Support role can only see their own amounts
  if (filter?.role === 'support') {
    if (!filter.currentUserId) {
      return {
        totalBills: 0,
        pendingBills: 0,
        approvedBills: 0,
        rejectedBills: 0,
        paidBills: 0,
        totalVolumeTk: 0,
        pendingVolumeTk: 0,
        approvedVolumeTk: 0,
        rejectedVolumeTk: 0,
        paidVolumeTk: 0,
      };
    }
    const uid = filter.currentUserId.trim().toLowerCase();
    const uname = (filter.currentUserName || '').trim().toLowerCase();
    bills = bills.filter((b) => {
      if (!b.created_by) return false;
      const cb = b.created_by.toLowerCase();
      return cb.includes(uid) || (uname && cb.includes(uname));
    });
  }

  const totalBills = bills.length;
  let pendingBills = 0;
  let approvedBills = 0;
  let rejectedBills = 0;
  let paidBills = 0;
  let totalVolumeTk = 0;
  let pendingVolumeTk = 0;
  let approvedVolumeTk = 0;
  let rejectedVolumeTk = 0;
  let paidVolumeTk = 0;

  for (const b of bills) {
    const amt = Number(b.amount) || 0;
    totalVolumeTk += amt;
    if (b.status === 'Paid') {
      paidBills++;
      paidVolumeTk += amt;
    } else if (b.status === 'Approved') {
      approvedBills++;
      approvedVolumeTk += amt;
    } else if (b.status === 'Rejected') {
      rejectedBills++;
      rejectedVolumeTk += amt;
    } else {
      pendingBills++;
      pendingVolumeTk += amt;
    }
  }

  return {
    totalBills,
    pendingBills,
    approvedBills,
    rejectedBills,
    paidBills,
    totalVolumeTk: Math.round(totalVolumeTk * 100) / 100,
    pendingVolumeTk: Math.round(pendingVolumeTk * 100) / 100,
    approvedVolumeTk: Math.round(approvedVolumeTk * 100) / 100,
    rejectedVolumeTk: Math.round(rejectedVolumeTk * 100) / 100,
    paidVolumeTk: Math.round(paidVolumeTk * 100) / 100,
  };
}
