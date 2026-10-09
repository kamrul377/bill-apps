// import mysql, { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
// import fs from 'fs';
// import path from 'path';
// import { Bill, BillStatus, DashboardStats, User, UserRole } from './types';

// // Single MySQL Connection Pool for Aiven Cloud / Local
// const MYSQL_CONFIG = {
//   host: process.env.MYSQL_HOST,
//   user: process.env.MYSQL_USER,
//   password: process.env.MYSQL_PASSWORD,
//   database: process.env.MYSQL_DATABASE,
//   port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306,
//   waitForConnections: true,
//   connectionLimit: 10,
//   charset: 'utf8mb4',
//   queueLimit: 0,
//   enableKeepAlive: true,
//   keepAliveInitialDelay: 0,
//   maxIdle: 10,
//   idleTimeout: 30000,
//   connectTimeout: 30000,
//   ssl: process.env.MYSQL_HOST?.includes('aivencloud.com')
//     ? { rejectUnauthorized: false }
//     : undefined,
// };

// let pool: Pool | null = null;
// let isMySQLConnected: boolean | null = null;
// let lastCheckTime = 0;
// let tablesInitialized = false;

// export function getPool(): Pool {
//   if (!pool) {
//     pool = mysql.createPool(MYSQL_CONFIG);
//   }
//   return pool;
// }

// export const dbPool = getPool();

// const DATA_DIR = path.join(process.cwd(), 'data');
// const STORAGE_FILE = path.join(DATA_DIR, 'isp_storage.json');

// interface LocalStorageSchema {
//   users: Array<User & { password?: string }>;
//   bills: Bill[];
// }

// function getDefaultStorage(): LocalStorageSchema {
//   return {
//     users: [
//       // {
//       //   id: 1,
//       //   user_id: 'kamrul.cse9@gmail.com',
//       //   name: 'Kamrul Islam',
//       //   password: '66667777ssc',
//       //   role: 'admin',
//       //   created_at: new Date().toISOString(),
//       // },
//     ],
//     bills: [],
//   };
// }

// function readLocalStorage(): LocalStorageSchema {
//   try {
//     if (!fs.existsSync(DATA_DIR)) {
//       fs.mkdirSync(DATA_DIR, { recursive: true });
//     }
//     if (!fs.existsSync(STORAGE_FILE)) {
//       const initial = getDefaultStorage();
//       fs.writeFileSync(STORAGE_FILE, JSON.stringify(initial, null, 2), 'utf-8');
//       return initial;
//     }
//     const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
//     const parsed = JSON.parse(raw);
//     if (!parsed.users || !Array.isArray(parsed.users)) {
//       parsed.users = getDefaultStorage().users;
//     }
//     const hasAdmin = parsed.users.some(
//       (u: User) => u.user_id.toLowerCase() === 'kamrul.cse9@gmail.com'
//     );
//     if (!hasAdmin) {
//       parsed.users.unshift(getDefaultStorage().users[0]);
//     }
//     if (!parsed.bills || !Array.isArray(parsed.bills)) {
//       parsed.bills = [];
//     }
//     return parsed;
//   } catch (err) {
//     console.warn('Could not read fallback storage, using memory default:', (err as Error).message);
//     return getDefaultStorage();
//   }
// }

// function writeLocalStorage(data: LocalStorageSchema): void {
//   try {
//     if (!fs.existsSync(DATA_DIR)) {
//       fs.mkdirSync(DATA_DIR, { recursive: true });
//     }
//     fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf-8');
//   } catch (err) {
//     console.warn('Could not write fallback storage:', (err as Error).message);
//   }
// }

// export async function testMySQLConnection(): Promise<boolean> {
//   const now = Date.now();
//   if (isMySQLConnected === true && now - lastCheckTime < 15000) {
//     return true;
//   }
//   lastCheckTime = now;

//   try {
//     const p = getPool();
//     const conn = await p.getConnection();
//     await conn.ping();
//     conn.release();

//     if (isMySQLConnected !== true) {
//       console.log(`[Database] Connected to MySQL successfully at ${MYSQL_CONFIG.host}:${MYSQL_CONFIG.port}`);
//     }
//     isMySQLConnected = true;
//     return true;
//   } catch (err) {
//     console.warn(`[Database] MySQL Connection warning: ${(err as Error).message}`);
//     isMySQLConnected = false;
//     return false;
//   }
// }

// export async function ensureTables(): Promise<void> {
//   if (tablesInitialized) return;
//   const isUp = await testMySQLConnection();
//   if (!isUp) return;

//   try {
//     const p = getPool();
//     await p.query(`
//       CREATE TABLE IF NOT EXISTS users (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         user_id VARCHAR(100) NOT NULL UNIQUE COMMENT 'Staff Email address',
//         name VARCHAR(100) NOT NULL,
//         password VARCHAR(255) NOT NULL,
//         role ENUM('admin', 'support', 'manager', 'accounts') NOT NULL DEFAULT 'support',
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         INDEX idx_users_role (role)
//       ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
//     `);

//     await p.query(`
//       CREATE TABLE IF NOT EXISTS bills (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         ticket_id VARCHAR(50) NOT NULL,
//         user_id VARCHAR(100) NOT NULL,
//         amount DECIMAL(10, 2) NOT NULL,
//         description TEXT NOT NULL,
//         date DATE NOT NULL,
//         status ENUM('Pending', 'Approved', 'Rejected', 'Paid') NOT NULL DEFAULT 'Pending',
//         created_by VARCHAR(100) DEFAULT NULL,
//         rejection_reason TEXT DEFAULT NULL,
//         paid_by VARCHAR(100) DEFAULT NULL,
//         paid_at TIMESTAMP NULL DEFAULT NULL,
//         payment_method VARCHAR(50) DEFAULT 'Cash',
//         payment_note TEXT DEFAULT NULL,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//         INDEX idx_bills_status (status),
//         INDEX idx_bills_user_id (user_id),
//         INDEX idx_bills_date (date),
//         INDEX idx_bills_ticket_id (ticket_id),
//         INDEX idx_bills_created_by (created_by)
//       ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
//     `);

//     try { await p.query(`ALTER TABLE bills DROP INDEX ticket_id`); } catch { }
//     try { await p.query(`ALTER TABLE bills DROP INDEX ticket_id_UNIQUE`); } catch { }

//     try {
//       await p.query(`
//         ALTER TABLE bills 
//         MODIFY COLUMN status ENUM('Pending', 'Approved', 'Rejected', 'Paid') NOT NULL DEFAULT 'Pending'
//       `);
//       await p.query(`ALTER TABLE bills ADD COLUMN paid_by VARCHAR(100) DEFAULT NULL`);
//     } catch { }
//     try { await p.query(`ALTER TABLE bills ADD COLUMN paid_at TIMESTAMP NULL DEFAULT NULL`); } catch { }
//     try { await p.query(`ALTER TABLE bills ADD COLUMN payment_method VARCHAR(50) DEFAULT 'Cash'`); } catch { }
//     try { await p.query(`ALTER TABLE bills ADD COLUMN payment_note TEXT DEFAULT NULL`); } catch { }

//     await p.query(`
//       INSERT INTO users (id, user_id, name, password, role)
//       VALUES (1, 'kamrul.cse9@gmail.com', 'Kamrul Islam', '66667777ssc', 'admin')
//       ON DUPLICATE KEY UPDATE 
//         name=VALUES(name),
//         password=VALUES(password),
//         role=VALUES(role);
//     `);

//     tablesInitialized = true;
//   } catch (err) {
//     console.warn('MySQL table initialization warning:', (err as Error).message);
//   }
// }

// // Helper to format ISO date safely
// function safeIsoDate(val: any): string {
//   if (!val) return new Date().toISOString();
//   const d = new Date(val);
//   return !isNaN(d.getTime()) ? d.toISOString() : new Date().toISOString();
// }

// // ==================== User Repository ====================

// export async function getUsers(): Promise<User[]> {
//   try {
//     await ensureTables();
//     const p = getPool();
//     const [rows] = await p.query<RowDataPacket[]>(
//       'SELECT id, user_id, name, role, created_at FROM users ORDER BY id DESC'
//     );

//     return rows.map((r) => ({
//       id: Number(r.id),
//       user_id: String(r.user_id),
//       name: String(r.name),
//       role: String(r.role).toLowerCase() as UserRole,
//       created_at: safeIsoDate(r.created_at),
//     }));
//   } catch (error) {
//     console.warn('MySQL getUsers failed, using fallback:', (error as Error).message);
//     const store = readLocalStorage();
//     return store.users.map(({ id, user_id, name, role, created_at }) => ({
//       id,
//       user_id,
//       name,
//       role: role as UserRole,
//       created_at,
//     }));
//   }
// }

// export async function getUserById(id: number): Promise<User | null> {
//   try {
//     await ensureTables();
//     const p = getPool();
//     const [rows] = await p.query<RowDataPacket[]>(
//       'SELECT id, user_id, name, role, created_at FROM users WHERE id = ? LIMIT 1',
//       [id]
//     );
//     if (!rows || rows.length === 0) return null;
//     const r = rows[0];
//     return {
//       id: Number(r.id),
//       user_id: String(r.user_id),
//       name: String(r.name),
//       role: String(r.role).toLowerCase() as UserRole,
//       created_at: safeIsoDate(r.created_at),
//     };
//   } catch (error) {
//     const store = readLocalStorage();
//     const found = store.users.find((u) => u.id === id);
//     if (!found) return null;
//     return {
//       id: found.id,
//       user_id: found.user_id,
//       name: found.name,
//       role: found.role as UserRole,
//       created_at: found.created_at,
//     };
//   }
// }

// export async function getUserByEmail(email: string): Promise<User | null> {
//   const cleanEmail = email.trim().toLowerCase();
//   try {
//     await ensureTables();
//     const p = getPool();
//     const [rows] = await p.query<RowDataPacket[]>(
//       'SELECT id, user_id, name, role, created_at FROM users WHERE LOWER(user_id) = ? LIMIT 1',
//       [cleanEmail]
//     );
//     if (!rows || rows.length === 0) return null;
//     const r = rows[0];
//     return {
//       id: Number(r.id),
//       user_id: String(r.user_id),
//       name: String(r.name),
//       role: String(r.role).toLowerCase() as UserRole,
//       created_at: safeIsoDate(r.created_at),
//     };
//   } catch (error) {
//     const store = readLocalStorage();
//     const found = store.users.find((u) => u.user_id.toLowerCase() === cleanEmail);
//     if (!found) return null;
//     return {
//       id: found.id,
//       user_id: found.user_id,
//       name: found.name,
//       role: found.role as UserRole,
//       created_at: found.created_at,
//     };
//   }
// }

// export async function authenticateUser(email: string, password: string): Promise<User | null> {
//   const cleanEmail = email.trim().toLowerCase();
//   const cleanPass = password.trim();

//   try {
//     await ensureTables();
//     const p = getPool();
//     const [rows] = await p.query<RowDataPacket[]>(
//       'SELECT id, user_id, name, role, created_at FROM users WHERE LOWER(user_id) = ? AND password = ? LIMIT 1',
//       [cleanEmail, cleanPass]
//     );
//     if (rows && rows.length > 0) {
//       const r = rows[0];
//       return {
//         id: Number(r.id),
//         user_id: String(r.user_id),
//         name: String(r.name),
//         role: String(r.role).toLowerCase() as UserRole,
//         created_at: safeIsoDate(r.created_at),
//       };
//     }
//     return null;
//   } catch (error) {
//     console.warn('MySQL authenticateUser failed, checking fallback:', (error as Error).message);
//     const store = readLocalStorage();
//     const found = store.users.find(
//       (u) => u.user_id.toLowerCase() === cleanEmail && u.password === cleanPass
//     );
//     if (!found) return null;
//     return {
//       id: found.id,
//       user_id: found.user_id,
//       name: found.name,
//       role: found.role as UserRole,
//       created_at: found.created_at,
//     };
//   }
// }

// export async function createUser(userData: {
//   user_id: string;
//   name: string;
//   password: string;
//   role: UserRole;
// }): Promise<{ success: boolean; user?: User; error?: string }> {
//   const cleanEmail = userData.user_id.trim().toLowerCase();
//   const name = userData.name.trim();
//   const password = userData.password.trim();
//   const role = userData.role.toLowerCase().trim() as UserRole;

//   if (!cleanEmail || !name || !password) {
//     return { success: false, error: 'Email, Name, and Password are required.' };
//   }

//   try {
//     await ensureTables();
//     const p = getPool();

//     const [existing] = await p.query<RowDataPacket[]>(
//       'SELECT id FROM users WHERE LOWER(user_id) = ? LIMIT 1',
//       [cleanEmail]
//     );
//     if (existing && existing.length > 0) {
//       return { success: false, error: `Account with email "${cleanEmail}" already exists.` };
//     }

//     const [res] = await p.query<ResultSetHeader>(
//       'INSERT INTO users (user_id, name, password, role, created_at) VALUES (?, ?, ?, ?, NOW())',
//       [cleanEmail, name, password, role]
//     );

//     const newUser: User = {
//       id: res.insertId,
//       user_id: cleanEmail,
//       name,
//       role,
//       created_at: new Date().toISOString(),
//     };

//     // Keep Local storage synced in background
//     try {
//       const store = readLocalStorage();
//       if (!store.users.some((u) => u.user_id.toLowerCase() === cleanEmail)) {
//         store.users.push({ ...newUser, password });
//         writeLocalStorage(store);
//       }
//     } catch { }

//     return { success: true, user: newUser };
//   } catch (error) {
//     console.warn('MySQL createUser failed, using fallback:', (error as Error).message);
//     const store = readLocalStorage();
//     const exists = store.users.some((u) => u.user_id.toLowerCase() === cleanEmail);
//     if (exists) {
//       return { success: false, error: `Account with email "${cleanEmail}" already exists.` };
//     }

//     const nextId = store.users.length > 0 ? Math.max(...store.users.map((u) => u.id)) + 1 : 1;
//     const newUser = {
//       id: nextId,
//       user_id: cleanEmail,
//       name,
//       password,
//       role,
//       created_at: new Date().toISOString(),
//     };

//     store.users.push(newUser);
//     writeLocalStorage(store);

//     return {
//       success: true,
//       user: {
//         id: newUser.id,
//         user_id: newUser.user_id,
//         name: newUser.name,
//         role: newUser.role as UserRole,
//         created_at: newUser.created_at,
//       },
//     };
//   }
// }

// export async function updateUser(
//   id: number,
//   updates: Partial<Omit<User, 'id'>> & { password?: string }
// ): Promise<{ success: boolean; user?: User; error?: string }> {
//   try {
//     await ensureTables();
//     const p = getPool();
//     const [existing] = await p.query<RowDataPacket[]>(
//       'SELECT id, user_id, name, role, created_at FROM users WHERE id = ? LIMIT 1',
//       [id]
//     );
//     if (!existing || existing.length === 0) {
//       return { success: false, error: 'User not found.' };
//     }

//     const currentUser = existing[0];
//     const newEmail = updates.user_id ? updates.user_id.trim().toLowerCase() : currentUser.user_id;
//     const newName = updates.name ? updates.name.trim() : currentUser.name;
//     const newRole = updates.role ? (updates.role.toLowerCase().trim() as UserRole) : currentUser.role;

//     if (updates.password) {
//       await p.query(
//         'UPDATE users SET user_id = ?, name = ?, role = ?, password = ? WHERE id = ?',
//         [newEmail, newName, newRole, updates.password.trim(), id]
//       );
//     } else {
//       await p.query(
//         'UPDATE users SET user_id = ?, name = ?, role = ? WHERE id = ?',
//         [newEmail, newName, newRole, id]
//       );
//     }

//     return {
//       success: true,
//       user: {
//         id,
//         user_id: newEmail,
//         name: newName,
//         role: newRole as UserRole,
//         created_at: safeIsoDate(currentUser.created_at),
//       },
//     };
//   } catch (error) {
//     const store = readLocalStorage();
//     const idx = store.users.findIndex((u) => u.id === id);
//     if (idx === -1) return { success: false, error: 'User not found.' };

//     if (updates.user_id) store.users[idx].user_id = updates.user_id.trim().toLowerCase();
//     if (updates.name) store.users[idx].name = updates.name.trim();
//     if (updates.role) store.users[idx].role = updates.role as UserRole;
//     if (updates.password) store.users[idx].password = updates.password.trim();

//     writeLocalStorage(store);
//     const u = store.users[idx];
//     return {
//       success: true,
//       user: {
//         id: u.id,
//         user_id: u.user_id,
//         name: u.name,
//         role: u.role as UserRole,
//         created_at: u.created_at,
//       },
//     };
//   }
// }

// export async function deleteUser(id: number): Promise<{ success: boolean; error?: string }> {
//   try {
//     await ensureTables();
//     const p = getPool();
//     const [rows] = await p.query<RowDataPacket[]>(
//       'SELECT user_id FROM users WHERE id = ? LIMIT 1',
//       [id]
//     );
//     if (!rows || rows.length === 0) {
//       return { success: false, error: 'User not found.' };
//     }

//     if (String(rows[0].user_id).toLowerCase() === 'kamrul.cse9@gmail.com') {
//       return { success: false, error: 'Cannot delete the primary system administrator.' };
//     }

//     await p.query('DELETE FROM users WHERE id = ?', [id]);
//     return { success: true };
//   } catch (error) {
//     const store = readLocalStorage();
//     const target = store.users.find((u) => u.id === id);
//     if (!target) return { success: false, error: 'User not found.' };
//     if (target.user_id.toLowerCase() === 'kamrul.cse9@gmail.com') {
//       return { success: false, error: 'Cannot delete the primary system administrator.' };
//     }

//     store.users = store.users.filter((u) => u.id !== id);
//     writeLocalStorage(store);
//     return { success: true };
//   }
// }


// // for categroy............

// export interface Category {
//   id: number;
//   name: string;
// }
// // 1. Ensure Table and 'Others' Category exists
// export async function ensureCategoriesTable(): Promise<void> {
//   const p = getPool();

//   await p.query(`
//     CREATE TABLE IF NOT EXISTS bill_categories (
//       id INT AUTO_INCREMENT PRIMARY KEY,
//       name VARCHAR(100) NOT NULL UNIQUE
//     ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
//   `);

//   // খালি থাকলে 'Others' ক্যাটাগরি অবশ্যই ইনসার্ট করবে
//   const [rows] = await p.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM bill_categories');
//   if (rows[0].count === 0) {
//     await p.query('INSERT IGNORE INTO bill_categories (name) VALUES (?)', ['Others']);
//   }
// }

// // 2. Get All Categories
// export async function getCategories(): Promise<Category[]> {
//   try {
//     await ensureTables();
//     await ensureCategoriesTable();

//     const p = getPool();
//     const [rows] = await p.query<RowDataPacket[]>(
//       'SELECT id, name FROM bill_categories ORDER BY id ASC'
//     );

//     return rows.map((r) => ({
//       id: Number(r.id),
//       name: String(r.name),
//     }));
//   } catch (error) {
//     console.warn('MySQL getCategories failed:', (error as Error).message);
//     return [{ id: 1, name: "Others" }];
//   }
// }

// // 3. Add New Category from UI
// export async function createCategory(name: string): Promise<Category> {
//   await ensureTables();
//   await ensureCategoriesTable();

//   const p = getPool();
//   const trimmedName = name.trim();

//   // 'Others' বা Duplicate Check
//   const [existing] = await p.query<RowDataPacket[]>(
//     'SELECT id, name FROM bill_categories WHERE LOWER(name) = LOWER(?)',
//     [trimmedName]
//   );

//   if (existing.length > 0) {
//     return { id: Number(existing[0].id), name: String(existing[0].name) };
//   }

//   const [result] = await p.query<ResultSetHeader>(
//     'INSERT INTO bill_categories (name) VALUES (?)',
//     [trimmedName]
//   );

//   return {
//     id: result.insertId,
//     name: trimmedName,
//   };
// }

// // Update Category
// export async function updateCategory(id: number, name: string): Promise<void> {
//   await ensureTables();
//   const p = getPool();
//   await p.query('UPDATE bill_categories SET name = ? WHERE id = ?', [
//     name.trim(),
//     id,
//   ]);
// }

// // Delete Category
// export async function deleteCategory(id: number): Promise<void> {
//   await ensureTables();
//   const p = getPool();

//   // Bills টেবিল থেকে এই ক্যাটাগরির রেফারেন্স ফাকা করা
//   await p.query('UPDATE bills SET category_id = NULL WHERE category_id = ?', [
//     id,
//   ]);

//   // bill_categories টেবিল থেকে ক্যাটাগরি ডিলিট করা
//   await p.query('DELETE FROM bill_categories WHERE id = ?', [id]);
// }

// // ==================== Bill Repository ====================

// export interface BillFilterOptions {
//   status?: string;
//   search?: string;
//   userId?: string;
//   role?: UserRole;
//   currentUserId?: string;
//   currentUserName?: string;
// }



// export async function getBills(filter?: BillFilterOptions): Promise<Bill[]> {
//   try {
//     await ensureTables();
//     await ensureCategoriesTable(); // Categories table ensure

//     const p = getPool();

//     let sql = `
//       SELECT
//         b.id,
//         b.ticket_id,
//         b.user_id,
//         b.category_id,
//         c.name AS category_name,
//         b.amount,
//         b.description,
//         DATE_FORMAT(b.date, '%Y-%m-%d') as date,
//         b.status,
//         b.created_by,
//         b.rejection_reason,
//         b.paid_by,
//         b.paid_at,
//         b.payment_method,
//         b.payment_note,
//         b.created_at,
//         b.updated_at
//       FROM bills b
//       LEFT JOIN bill_categories c ON b.category_id = c.id
//       WHERE 1=1
//     `;
//     const params: (string | number)[] = [];

//     if (filter?.role === 'support') {
//       if (!filter.currentUserId) return [];
//       sql += ' AND (LOWER(b.created_by) LIKE LOWER(?) OR LOWER(b.created_by) LIKE LOWER(?))';
//       const uid = `%${filter.currentUserId.trim()}%`;
//       const uname = `%${filter.currentUserName ? filter.currentUserName.trim() : filter.currentUserId.trim()}%`;
//       params.push(uid, uname);
//     }

//     if (filter?.status && filter.status !== 'ALL') {
//       sql += ' AND UPPER(b.status) = UPPER(?)';
//       params.push(filter.status);
//     }

//     if (filter?.search) {
//       const q = `%${filter.search.trim()}%`;
//       sql += ' AND (b.ticket_id LIKE ? OR b.user_id LIKE ? OR b.description LIKE ? OR b.created_by LIKE ?)';
//       params.push(q, q, q, q);
//     }

//     sql += ' ORDER BY b.date DESC, b.id DESC';

//     const [rows] = await p.query<RowDataPacket[]>(sql, params);

//     return rows.map((r) => ({
//       id: Number(r.id),
//       ticket_id: String(r.ticket_id),
//       user_id: String(r.user_id),
//       category_id: r.category_id ? Number(r.category_id) : undefined,
//       category_name: r.category_name ? String(r.category_name) : 'General',
//       amount: Number(r.amount),
//       description: String(r.description),
//       date: String(r.date),
//       status: r.status as BillStatus,
//       created_by: r.created_by ? String(r.created_by) : undefined,
//       rejection_reason: r.rejection_reason ? String(r.rejection_reason) : undefined,
//       paid_by: r.paid_by ? String(r.paid_by) : undefined,
//       paid_at: safeIsoDate(r.paid_at),
//       payment_method: r.payment_method ? String(r.payment_method) : undefined,
//       payment_note: r.payment_note ? String(r.payment_note) : undefined,
//       created_at: safeIsoDate(r.created_at),
//       updated_at: safeIsoDate(r.updated_at),
//     }));
//   } catch (error) {
//     const store = readLocalStorage();
//     let list = [...store.bills];

//     if (filter?.role === 'support') {
//       if (!filter.currentUserId) return [];
//       const uid = filter.currentUserId.trim().toLowerCase();
//       const uname = (filter.currentUserName || '').trim().toLowerCase();
//       list = list.filter((b) => {
//         if (!b.created_by) return false;
//         const cb = b.created_by.toLowerCase();
//         return cb.includes(uid) || (uname && cb.includes(uname));
//       });
//     }

//     if (filter?.status && filter.status !== 'ALL') {
//       list = list.filter((b) => b.status.toUpperCase() === filter.status!.toUpperCase());
//     }

//     if (filter?.search) {
//       const q = filter.search.toLowerCase();
//       list = list.filter(
//         (b) =>
//           b.ticket_id.toLowerCase().includes(q) ||
//           b.user_id.toLowerCase().includes(q) ||
//           b.description.toLowerCase().includes(q) ||
//           (b.created_by && b.created_by.toLowerCase().includes(q))
//       );
//     }

//     list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
//     return list;
//   }
// }


// export async function createBill(data: {
//   ticket_id: string;
//   user_id: string;
//   amount: number | string;
//   category_id?: number | string; // <--- Category ID add kora hoilo
//   description: string;
//   date: string;
//   created_by?: string;
// }): Promise<{ success: boolean; bill?: Bill; error?: string }> {
//   const ticket_id = (data.ticket_id || '').trim();
//   const user_id = (data.user_id || '').trim();
//   const description = (data.description || '').trim();
//   const date = (data.date || '').trim();
//   const numericAmount = Number(data.amount);

//   // Category ID parsing (Default 1)
//   const category_id = data.category_id ? Number(data.category_id) : 1;

//   // Validate Ticket ID
//   if (!ticket_id) {
//     return {
//       success: false,
//       error: 'Ticket ID is required.',
//     };
//   }

//   if (!/^\d{6}$/.test(ticket_id)) {
//     return {
//       success: false,
//       error: 'Ticket ID must be exactly a 6-digit number (e.g. 454433).',
//     };
//   }

//   // Validate User ID
//   if (!user_id) {
//     return {
//       success: false,
//       error: 'User ID is required.',
//     };
//   }

//   if (!/^\d{6}$/.test(user_id)) {
//     return {
//       success: false,
//       error: 'User / Subscriber ID must be exactly a 6-digit number (e.g. 454433).',
//     };
//   }

//   // Validate Amount
//   if (isNaN(numericAmount) || numericAmount <= 0) {
//     return {
//       success: false,
//       error: 'Amount must be a positive number in TK.',
//     };
//   }

//   // Validate Description
//   if (!description) {
//     return {
//       success: false,
//       error: 'Description is required.',
//     };
//   }

//   // Validate Date
//   if (!date) {
//     return {
//       success: false,
//       error: 'Date is required.',
//     };
//   }

//   const roundedAmount = Math.round(numericAmount * 100) / 100;
//   const created_by = data.created_by || 'Support';

//   try {
//     await ensureTables();

//     const p = getPool();

//     // SQL INSERT Query-te category_id add kora hoilo
//     const [res] = await p.query<ResultSetHeader>(
//       `INSERT INTO bills (
//         ticket_id,
//         user_id,
//         amount,
//         category_id,
//         description,
//         date,
//         status,
//         created_by,
//         created_at,
//         updated_at
//       )
//       VALUES (
//         ?,
//         ?,
//         ?,
//         ?,
//         ?,
//         ?,
//         'Pending',
//         ?,
//         NOW(),
//         NOW()
//       )`,
//       [
//         ticket_id,
//         user_id,
//         roundedAmount,
//         category_id, // <--- Category ID Value Pass Kora Hoilo
//         description,
//         date,
//         created_by,
//       ]
//     );

//     const nowIso = new Date().toISOString();

//     return {
//       success: true,
//       bill: {
//         id: res.insertId,
//         ticket_id,
//         user_id,
//         amount: roundedAmount,
//         category_id, // <--- Bill Object-eo Category ID
//         description,
//         date,
//         status: 'Pending',
//         created_by,
//         created_at: nowIso,
//         updated_at: nowIso,
//       },
//     };
//   } catch (error) {
//     console.error('Create bill MySQL error:', error);

//     try {
//       const store = readLocalStorage();

//       const nextId =
//         store.bills.length > 0
//           ? Math.max(...store.bills.map((b) => Number(b.id))) + 1
//           : 1;

//       const nowIso = new Date().toISOString();

//       const newBill: Bill = {
//         id: nextId,
//         ticket_id,
//         user_id,
//         amount: roundedAmount,
//         category_id, // <--- Fallback Storage-eo Category ID
//         description,
//         date,
//         status: 'Pending',
//         created_by,
//         created_at: nowIso,
//         updated_at: nowIso,
//       };

//       store.bills.push(newBill);
//       writeLocalStorage(store);

//       return {
//         success: true,
//         bill: newBill,
//       };
//     } catch (fallbackError) {
//       console.error('Create bill local storage error:', fallbackError);

//       return {
//         success: false,
//         error: 'Failed to create bill.',
//       };
//     }
//   }
// }



// export async function getBillById(id: number): Promise<Bill | null> {
//   try {
//     await ensureTables();
//     const p = getPool();

//     const [rows] = await p.query<RowDataPacket[]>(
//       `SELECT
//         id,
//         ticket_id,
//         user_id,
//         amount,
//         description,
//         DATE_FORMAT(date, '%Y-%m-%d') as date,
//         status,
//         created_by,
//         rejection_reason,
//         paid_by,
//         paid_at,
//         payment_method,
//         payment_note,
//         created_at,
//         updated_at
//       FROM bills
//       WHERE id = ?
//       LIMIT 1`,
//       [id]
//     );

//     if (rows && rows.length > 0) {
//       const r = rows[0];

//       return {
//         id: Number(r.id),
//         ticket_id: String(r.ticket_id),
//         user_id: String(r.user_id),
//         amount: Number(r.amount),
//         description: String(r.description),
//         date: String(r.date),
//         status: r.status as BillStatus,
//         created_by: r.created_by ? String(r.created_by) : undefined,
//         rejection_reason: r.rejection_reason
//           ? String(r.rejection_reason)
//           : undefined,
//         paid_by: r.paid_by ? String(r.paid_by) : undefined,
//         paid_at: safeIsoDate(r.paid_at),
//         payment_method: r.payment_method
//           ? String(r.payment_method)
//           : undefined,
//         payment_note: r.payment_note
//           ? String(r.payment_note)
//           : undefined,
//         created_at: safeIsoDate(r.created_at),
//         updated_at: safeIsoDate(r.updated_at),
//       };
//     }

//     return null;
//   } catch (error) {
//     console.error('getBillById error:', error);

//     const store = readLocalStorage();

//     return (
//       store.bills.find((b) => Number(b.id) === id) || null
//     );
//   }
// }

// export async function updateBillStatusById(
//   id: number,
//   status: BillStatus,
//   options?: {
//     reason?: string;
//     approverName?: string;
//     paidBy?: string;
//     paymentMethod?: string;
//     paymentNote?: string;
//   }
// ): Promise<{ success: boolean; bill?: Bill; error?: string }> {
//   try {
//     await ensureTables();
//     const p = getPool();

//     // First make sure this exact bill exists
//     const [rows] = await p.query<RowDataPacket[]>(
//       'SELECT id FROM bills WHERE id = ? LIMIT 1',
//       [id]
//     );

//     if (!rows || rows.length === 0) {
//       return {
//         success: false,
//         error: `Bill with ID "${id}" not found.`,
//       };
//     }

//     if (status === 'Paid') {
//       const paidBy =
//         options?.paidBy ||
//         options?.approverName ||
//         'Accounts Staff';

//       const method =
//         options?.paymentMethod || 'Cash';

//       const note =
//         options?.paymentNote || null;

//       await p.query(
//         `UPDATE bills
//          SET
//            status = 'Paid',
//            paid_by = ?,
//            paid_at = NOW(),
//            payment_method = ?,
//            payment_note = ?,
//            updated_at = NOW()
//          WHERE id = ?`,
//         [paidBy, method, note, id]
//       );
//     } else if (status === 'Rejected' && options?.reason) {
//       await p.query(
//         `UPDATE bills
//          SET
//            status = ?,
//            rejection_reason = ?,
//            updated_at = NOW()
//          WHERE id = ?`,
//         [status, options.reason.trim(), id]
//       );
//     } else {
//       await p.query(
//         `UPDATE bills
//          SET
//            status = ?,
//            updated_at = NOW()
//          WHERE id = ?`,
//         [status, id]
//       );
//     }

//     const updatedBill = await getBillById(id);

//     return {
//       success: true,
//       bill: updatedBill || undefined,
//     };
//   } catch (error) {
//     console.error('updateBillStatusById error:', error);

//     // Local storage fallback
//     const store = readLocalStorage();

//     const idx = store.bills.findIndex(
//       (b) => Number(b.id) === id
//     );

//     if (idx === -1) {
//       return {
//         success: false,
//         error: `Bill with ID "${id}" not found.`,
//       };
//     }

//     store.bills[idx].status = status;
//     store.bills[idx].updated_at =
//       new Date().toISOString();

//     if (status === 'Paid') {
//       store.bills[idx].paid_by =
//         options?.paidBy ||
//         options?.approverName ||
//         'Accounts Staff';

//       store.bills[idx].paid_at =
//         new Date().toISOString();

//       store.bills[idx].payment_method =
//         options?.paymentMethod || 'Cash';

//       if (options?.paymentNote) {
//         store.bills[idx].payment_note =
//           options.paymentNote.trim();
//       }
//     } else if (
//       status === 'Rejected' &&
//       options?.reason
//     ) {
//       store.bills[idx].rejection_reason =
//         options.reason.trim();
//     }

//     writeLocalStorage(store);

//     return {
//       success: true,
//       bill: store.bills[idx],
//     };
//   }
// }

// // Fast Bulk Update in lib/db.ts
// export async function updateBillsStatus({ billIds, status, actionBy }: { billIds: number[]; status: string; actionBy?: string }) {
//   if (!billIds.length) return;

//   // Single SQL query instead of loop
//   const query = `
//     UPDATE bills 
//     SET status = ?, 
//         updated_at = NOW()
//         ${status === 'Paid' ? ', paid_by = ?, paid_at = NOW()' : ''}
//     WHERE id IN (?)
//   `;

//   const params = status === 'Paid'
//     ? [status, actionBy || null, billIds]
//     : [status, billIds];

//   const [result] = await pool.query(query, params);
//   return result;
// }


// // =====updating get bill by ticket to by id=============



// export async function getDashboardStats(filter?: {
//   role?: UserRole;
//   currentUserId?: string;
//   currentUserName?: string;
// }): Promise<DashboardStats> {
//   try {
//     await ensureTables();
//     const p = getPool();

//     if (filter?.role === 'support' && !filter?.currentUserId) {
//       return {
//         totalBills: 0, pendingBills: 0, approvedBills: 0, rejectedBills: 0, paidBills: 0,
//         totalVolumeTk: 0, pendingVolumeTk: 0, approvedVolumeTk: 0, rejectedVolumeTk: 0, paidVolumeTk: 0,
//       };
//     }

//     let sql = `
//       SELECT
//         COUNT(*) as totalBills,
//         SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pendingBills,
//         SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approvedBills,
//         SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejectedBills,
//         SUM(CASE WHEN status = 'Paid' THEN 1 ELSE 0 END) as paidBills,
//         COALESCE(SUM(amount), 0) as totalVolumeTk,
//         COALESCE(SUM(CASE WHEN status = 'Pending' THEN amount ELSE 0 END), 0) as pendingVolumeTk,
//         COALESCE(SUM(CASE WHEN status = 'Approved' THEN amount ELSE 0 END), 0) as approvedVolumeTk,
//         COALESCE(SUM(CASE WHEN status = 'Rejected' THEN amount ELSE 0 END), 0) as rejectedVolumeTk,
//         COALESCE(SUM(CASE WHEN status = 'Paid' THEN amount ELSE 0 END), 0) as paidVolumeTk
//       FROM bills
//       WHERE 1=1
//     `;
//     const params: (string | number)[] = [];

//     if (filter?.role === 'support' && filter?.currentUserId) {
//       sql += ' AND (LOWER(created_by) LIKE LOWER(?) OR LOWER(created_by) LIKE LOWER(?))';
//       const uid = `%${filter.currentUserId.trim()}%`;
//       const uname = `%${filter.currentUserName ? filter.currentUserName.trim() : filter.currentUserId.trim()}%`;
//       params.push(uid, uname);
//     }

//     const [rows] = await p.query<RowDataPacket[]>(sql, params);

//     if (rows && rows.length > 0) {
//       const r = rows[0];
//       return {
//         totalBills: Number(r.totalBills) || 0,
//         pendingBills: Number(r.pendingBills) || 0,
//         approvedBills: Number(r.approvedBills) || 0,
//         rejectedBills: Number(r.rejectedBills) || 0,
//         paidBills: Number(r.paidBills) || 0,
//         totalVolumeTk: Number(r.totalVolumeTk) || 0,
//         pendingVolumeTk: Number(r.pendingVolumeTk) || 0,
//         approvedVolumeTk: Number(r.approvedVolumeTk) || 0,
//         rejectedVolumeTk: Number(r.rejectedVolumeTk) || 0,
//         paidVolumeTk: Number(r.paidVolumeTk) || 0,
//       };
//     }
//   } catch (error) {
//     console.warn('MySQL getDashboardStats failed, fallback:', (error as Error).message);
//   }

//   const store = readLocalStorage();
//   let bills = store.bills;

//   if (filter?.role === 'support') {
//     if (!filter.currentUserId) {
//       return {
//         totalBills: 0, pendingBills: 0, approvedBills: 0, rejectedBills: 0, paidBills: 0,
//         totalVolumeTk: 0, pendingVolumeTk: 0, approvedVolumeTk: 0, rejectedVolumeTk: 0, paidVolumeTk: 0,
//       };
//     }
//     const uid = filter.currentUserId.trim().toLowerCase();
//     const uname = (filter.currentUserName || '').trim().toLowerCase();
//     bills = bills.filter((b) => {
//       if (!b.created_by) return false;
//       const cb = b.created_by.toLowerCase();
//       return cb.includes(uid) || (uname && cb.includes(uname));
//     });
//   }

//   let totalVolumeTk = 0, pendingVolumeTk = 0, approvedVolumeTk = 0, rejectedVolumeTk = 0, paidVolumeTk = 0;
//   let pendingBills = 0, approvedBills = 0, rejectedBills = 0, paidBills = 0;

//   for (const b of bills) {
//     const amt = Number(b.amount) || 0;
//     totalVolumeTk += amt;
//     if (b.status === 'Paid') { paidBills++; paidVolumeTk += amt; }
//     else if (b.status === 'Approved') { approvedBills++; approvedVolumeTk += amt; }
//     else if (b.status === 'Rejected') { rejectedBills++; rejectedVolumeTk += amt; }
//     else { pendingBills++; pendingVolumeTk += amt; }
//   }

//   return {
//     totalBills: bills.length,
//     pendingBills, approvedBills, rejectedBills, paidBills,
//     totalVolumeTk: Math.round(totalVolumeTk * 100) / 100,
//     pendingVolumeTk: Math.round(pendingVolumeTk * 100) / 100,
//     approvedVolumeTk: Math.round(approvedVolumeTk * 100) / 100,
//     rejectedVolumeTk: Math.round(rejectedVolumeTk * 100) / 100,
//     paidVolumeTk: Math.round(paidVolumeTk * 100) / 100,
//   };
// }





// ======================2nd===================


import mysql, { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { Bill, BillStatus, DashboardStats, User, UserRole } from './types';

// Single MySQL Connection Pool for Aiven Cloud / Local
const MYSQL_CONFIG = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306,
  waitForConnections: true,
  connectionLimit: 20, // Increased for concurrent processing
  charset: 'utf8mb4',
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  maxIdle: 20,
  idleTimeout: 60000,
  connectTimeout: 10000,
  ssl: process.env.MYSQL_HOST?.includes('aivencloud.com')
    ? { rejectUnauthorized: false }
    : undefined,
};

let pool: Pool | null = null;
let tablesInitialized = false;

export function getPool(): Pool {
  if (!pool) {
    pool = mysql.createPool(MYSQL_CONFIG);
  }
  return pool;
}

export const dbPool = getPool();

const DATA_DIR = path.join(process.cwd(), 'data');
const STORAGE_FILE = path.join(DATA_DIR, 'isp_storage.json');

interface LocalStorageSchema {
  users: Array<User & { password?: string }>;
  bills: Bill[];
}

function getDefaultStorage(): LocalStorageSchema {
  return {
    users: [],
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
    if (!parsed.bills || !Array.isArray(parsed.bills)) {
      parsed.bills = [];
    }
    return parsed;
  } catch (err) {
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

// Optimized table initialization check
export async function ensureTables(): Promise<void> {
  if (tablesInitialized) return;

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

    tablesInitialized = true;
  } catch (err) {
    console.warn('MySQL table initialization warning:', (err as Error).message);
  }
}

function safeIsoDate(val: any): string {
  if (!val) return new Date().toISOString();
  const d = new Date(val);
  return !isNaN(d.getTime()) ? d.toISOString() : new Date().toISOString();
}

// ==================== User Repository ====================

export async function getUsers(): Promise<User[]> {
  try {
    await ensureTables();
    const p = getPool();
    const [rows] = await p.query<RowDataPacket[]>(
      'SELECT id, user_id, name, role, created_at FROM users ORDER BY id DESC'
    );

    return rows.map((r) => ({
      id: Number(r.id),
      user_id: String(r.user_id),
      name: String(r.name),
      role: String(r.role).toLowerCase() as UserRole,
      created_at: safeIsoDate(r.created_at),
    }));
  } catch (error) {
    const store = readLocalStorage();
    return store.users.map(({ id, user_id, name, role, created_at }) => ({
      id,
      user_id,
      name,
      role: role as UserRole,
      created_at,
    }));
  }
}

export async function getUserById(id: number): Promise<User | null> {
  try {
    await ensureTables();
    const p = getPool();
    const [rows] = await p.query<RowDataPacket[]>(
      'SELECT id, user_id, name, role, created_at FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    if (!rows || rows.length === 0) return null;
    const r = rows[0];
    return {
      id: Number(r.id),
      user_id: String(r.user_id),
      name: String(r.name),
      role: String(r.role).toLowerCase() as UserRole,
      created_at: safeIsoDate(r.created_at),
    };
  } catch (error) {
    const store = readLocalStorage();
    const found = store.users.find((u) => u.id === id);
    if (!found) return null;
    return {
      id: found.id,
      user_id: found.user_id,
      name: found.name,
      role: found.role as UserRole,
      created_at: found.created_at,
    };
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const cleanEmail = email.trim().toLowerCase();
  try {
    await ensureTables();
    const p = getPool();
    const [rows] = await p.query<RowDataPacket[]>(
      'SELECT id, user_id, name, role, created_at FROM users WHERE LOWER(user_id) = ? LIMIT 1',
      [cleanEmail]
    );
    if (!rows || rows.length === 0) return null;
    const r = rows[0];
    return {
      id: Number(r.id),
      user_id: String(r.user_id),
      name: String(r.name),
      role: String(r.role).toLowerCase() as UserRole,
      created_at: safeIsoDate(r.created_at),
    };
  } catch (error) {
    const store = readLocalStorage();
    const found = store.users.find((u) => u.user_id.toLowerCase() === cleanEmail);
    if (!found) return null;
    return {
      id: found.id,
      user_id: found.user_id,
      name: found.name,
      role: found.role as UserRole,
      created_at: found.created_at,
    };
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = password.trim();

  try {
    await ensureTables();
    const p = getPool();
    const [rows] = await p.query<RowDataPacket[]>(
      'SELECT id, user_id, name, role, created_at FROM users WHERE LOWER(user_id) = ? AND password = ? LIMIT 1',
      [cleanEmail, cleanPass]
    );
    if (rows && rows.length > 0) {
      const r = rows[0];
      return {
        id: Number(r.id),
        user_id: String(r.user_id),
        name: String(r.name),
        role: String(r.role).toLowerCase() as UserRole,
        created_at: safeIsoDate(r.created_at),
      };
    }
    return null;
  } catch (error) {
    const store = readLocalStorage();
    const found = store.users.find(
      (u) => u.user_id.toLowerCase() === cleanEmail && u.password === cleanPass
    );
    if (!found) return null;
    return {
      id: found.id,
      user_id: found.user_id,
      name: found.name,
      role: found.role as UserRole,
      created_at: found.created_at,
    };
  }
}

export async function createUser(userData: {
  user_id: string;
  name: string;
  password: string;
  role: UserRole;
}): Promise<{ success: boolean; user?: User; error?: string }> {
  const cleanEmail = userData.user_id.trim().toLowerCase();
  const name = userData.name.trim();
  const password = userData.password.trim();
  const role = userData.role.toLowerCase().trim() as UserRole;

  if (!cleanEmail || !name || !password) {
    return { success: false, error: 'Email, Name, and Password are required.' };
  }

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

    const newUser: User = {
      id: res.insertId,
      user_id: cleanEmail,
      name,
      role,
      created_at: new Date().toISOString(),
    };

    return { success: true, user: newUser };
  } catch (error) {
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
        role: newUser.role as UserRole,
        created_at: newUser.created_at,
      },
    };
  }
}

export async function updateUser(
  id: number,
  updates: Partial<Omit<User, 'id'>> & { password?: string }
): Promise<{ success: boolean; user?: User; error?: string }> {
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
    const newEmail = updates.user_id ? updates.user_id.trim().toLowerCase() : currentUser.user_id;
    const newName = updates.name ? updates.name.trim() : currentUser.name;
    const newRole = updates.role ? (updates.role.toLowerCase().trim() as UserRole) : currentUser.role;

    if (updates.password) {
      await p.query(
        'UPDATE users SET user_id = ?, name = ?, role = ?, password = ? WHERE id = ?',
        [newEmail, newName, newRole, updates.password.trim(), id]
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
        role: newRole as UserRole,
        created_at: safeIsoDate(currentUser.created_at),
      },
    };
  } catch (error) {
    const store = readLocalStorage();
    const idx = store.users.findIndex((u) => u.id === id);
    if (idx === -1) return { success: false, error: 'User not found.' };

    if (updates.user_id) store.users[idx].user_id = updates.user_id.trim().toLowerCase();
    if (updates.name) store.users[idx].name = updates.name.trim();
    if (updates.role) store.users[idx].role = updates.role as UserRole;
    if (updates.password) store.users[idx].password = updates.password.trim();

    writeLocalStorage(store);
    const u = store.users[idx];
    return {
      success: true,
      user: {
        id: u.id,
        user_id: u.user_id,
        name: u.name,
        role: u.role as UserRole,
        created_at: u.created_at,
      },
    };
  }
}

export async function deleteUser(id: number): Promise<{ success: boolean; error?: string }> {
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
    const store = readLocalStorage();
    const target = store.users.find((u) => u.id === id);
    if (!target) return { success: false, error: 'User not found.' };
    if (target.user_id.toLowerCase() === 'kamrul.cse9@gmail.com') {
      return { success: false, error: 'Cannot delete the primary system administrator.' };
    }

    store.users = store.users.filter((u) => u.id !== id);
    writeLocalStorage(store);
    return { success: true };
  }
}

// Category Repository
export interface Category {
  id: number;
  name: string;
}

export async function ensureCategoriesTable(): Promise<void> {
  const p = getPool();
  await p.query(`
    CREATE TABLE IF NOT EXISTS bill_categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  const [rows] = await p.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM bill_categories');
  if (rows[0].count === 0) {
    await p.query('INSERT IGNORE INTO bill_categories (name) VALUES (?)', ['Others']);
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    await ensureTables();
    await ensureCategoriesTable();
    const p = getPool();
    const [rows] = await p.query<RowDataPacket[]>('SELECT id, name FROM bill_categories ORDER BY id ASC');
    return rows.map((r) => ({ id: Number(r.id), name: String(r.name) }));
  } catch (error) {
    return [{ id: 1, name: "Others" }];
  }
}

export async function createCategory(name: string): Promise<Category> {
  await ensureTables();
  await ensureCategoriesTable();
  const p = getPool();
  const trimmedName = name.trim();

  const [existing] = await p.query<RowDataPacket[]>(
    'SELECT id, name FROM bill_categories WHERE LOWER(name) = LOWER(?)',
    [trimmedName]
  );

  if (existing.length > 0) {
    return { id: Number(existing[0].id), name: String(existing[0].name) };
  }

  const [result] = await p.query<ResultSetHeader>(
    'INSERT INTO bill_categories (name) VALUES (?)',
    [trimmedName]
  );

  return { id: result.insertId, name: trimmedName };
}

export async function updateCategory(id: number, name: string): Promise<void> {
  await ensureTables();
  const p = getPool();
  await p.query('UPDATE bill_categories SET name = ? WHERE id = ?', [name.trim(), id]);
}

export async function deleteCategory(id: number): Promise<void> {
  await ensureTables();
  const p = getPool();
  await p.query('UPDATE bills SET category_id = NULL WHERE category_id = ?', [id]);
  await p.query('DELETE FROM bill_categories WHERE id = ?', [id]);
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
  try {
    await ensureTables();
    const p = getPool();

    let sql = `
      SELECT
        b.id,
        b.ticket_id,
        b.user_id,
        b.category_id,
        c.name AS category_name,
        b.amount,
        b.description,
        DATE_FORMAT(b.date, '%Y-%m-%d') as date,
        b.status,
        b.created_by,
        b.rejection_reason,
        b.paid_by,
        b.paid_at,
        b.payment_method,
        b.payment_note,
        b.created_at,
        b.updated_at
      FROM bills b
      LEFT JOIN bill_categories c ON b.category_id = c.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (filter?.role === 'support') {
      if (!filter.currentUserId) return [];
      sql += ' AND (LOWER(b.created_by) LIKE LOWER(?) OR LOWER(b.created_by) LIKE LOWER(?))';
      const uid = `%${filter.currentUserId.trim()}%`;
      const uname = `%${filter.currentUserName ? filter.currentUserName.trim() : filter.currentUserId.trim()}%`;
      params.push(uid, uname);
    }

    if (filter?.status && filter.status !== 'ALL') {
      sql += ' AND UPPER(b.status) = UPPER(?)';
      params.push(filter.status);
    }

    if (filter?.search) {
      const q = `%${filter.search.trim()}%`;
      sql += ' AND (b.ticket_id LIKE ? OR b.user_id LIKE ? OR b.description LIKE ? OR b.created_by LIKE ?)';
      params.push(q, q, q, q);
    }

    sql += ' ORDER BY b.date DESC, b.id DESC';

    const [rows] = await p.query<RowDataPacket[]>(sql, params);

    return rows.map((r) => ({
      id: Number(r.id),
      ticket_id: String(r.ticket_id),
      user_id: String(r.user_id),
      category_id: r.category_id ? Number(r.category_id) : undefined,
      category_name: r.category_name ? String(r.category_name) : 'General',
      amount: Number(r.amount),
      description: String(r.description),
      date: String(r.date),
      status: r.status as BillStatus,
      created_by: r.created_by ? String(r.created_by) : undefined,
      rejection_reason: r.rejection_reason ? String(r.rejection_reason) : undefined,
      paid_by: r.paid_by ? String(r.paid_by) : undefined,
      paid_at: safeIsoDate(r.paid_at),
      payment_method: r.payment_method ? String(r.payment_method) : undefined,
      payment_note: r.payment_note ? String(r.payment_note) : undefined,
      created_at: safeIsoDate(r.created_at),
      updated_at: safeIsoDate(r.updated_at),
    }));
  } catch (error) {
    const store = readLocalStorage();
    let list = [...store.bills];

    if (filter?.role === 'support') {
      if (!filter.currentUserId) return [];
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
}

export async function createBill(data: {
  ticket_id: string;
  user_id: string;
  amount: number | string;
  category_id?: number | string;
  description: string;
  date: string;
  created_by?: string;
}): Promise<{ success: boolean; bill?: Bill; error?: string }> {
  const ticket_id = (data.ticket_id || '').trim();
  const user_id = (data.user_id || '').trim();
  const description = (data.description || '').trim();
  const date = (data.date || '').trim();
  const numericAmount = Number(data.amount);
  const category_id = data.category_id ? Number(data.category_id) : 1;

  if (!ticket_id || !/^\d{6}$/.test(ticket_id)) {
    return { success: false, error: 'Ticket ID must be exactly 6 digits.' };
  }
  if (!user_id || !/^\d{6}$/.test(user_id)) {
    return { success: false, error: 'User ID must be exactly 6 digits.' };
  }
  if (isNaN(numericAmount) || numericAmount <= 0) {
    return { success: false, error: 'Amount must be positive TK.' };
  }
  if (!description || !date) {
    return { success: false, error: 'Description and Date are required.' };
  }

  const roundedAmount = Math.round(numericAmount * 100) / 100;
  const created_by = data.created_by || 'Support';

  try {
    await ensureTables();
    const p = getPool();
    const [res] = await p.query<ResultSetHeader>(
      `INSERT INTO bills (ticket_id, user_id, amount, category_id, description, date, status, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'Pending', ?, NOW(), NOW())`,
      [ticket_id, user_id, roundedAmount, category_id, description, date, created_by]
    );

    const nowIso = new Date().toISOString();
    return {
      success: true,
      bill: {
        id: res.insertId,
        ticket_id,
        user_id,
        amount: roundedAmount,
        category_id,
        description,
        date,
        status: 'Pending',
        created_by,
        created_at: nowIso,
        updated_at: nowIso,
      },
    };
  } catch (error) {
    const store = readLocalStorage();
    const nextId = store.bills.length > 0 ? Math.max(...store.bills.map((b) => Number(b.id))) + 1 : 1;
    const nowIso = new Date().toISOString();
    const newBill: Bill = {
      id: nextId,
      ticket_id,
      user_id,
      amount: roundedAmount,
      category_id,
      description,
      date,
      status: 'Pending',
      created_by,
      created_at: nowIso,
      updated_at: nowIso,
    };

    store.bills.push(newBill);
    writeLocalStorage(store);

    return { success: true, bill: newBill };
  }
}

export async function getBillById(id: number): Promise<Bill | null> {
  try {
    await ensureTables();
    const p = getPool();
    const [rows] = await p.query<RowDataPacket[]>(
      `SELECT id, ticket_id, user_id, amount, description, DATE_FORMAT(date, '%Y-%m-%d') as date,
              status, created_by, rejection_reason, paid_by, paid_at, payment_method, payment_note, created_at, updated_at
       FROM bills WHERE id = ? LIMIT 1`,
      [id]
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
        paid_at: safeIsoDate(r.paid_at),
        payment_method: r.payment_method ? String(r.payment_method) : undefined,
        payment_note: r.payment_note ? String(r.payment_note) : undefined,
        created_at: safeIsoDate(r.created_at),
        updated_at: safeIsoDate(r.updated_at),
      };
    }
    return null;
  } catch (error) {
    const store = readLocalStorage();
    return store.bills.find((b) => Number(b.id) === id) || null;
  }
}

// ==================== FAST BATCH UPDATE FUNCTION ====================
export async function updateBillsBatch(
  ids: number[],
  status: BillStatus,
  options?: {
    reason?: string;
    paidBy?: string;
    paymentMethod?: string;
    paymentNote?: string;
  }
): Promise<{ success: boolean; updatedCount: number; error?: string }> {
  if (!ids || ids.length === 0) return { success: true, updatedCount: 0 };

  try {
    await ensureTables();
    const p = getPool();

    let sql = 'UPDATE bills SET status = ?, updated_at = NOW()';
    const params: any[] = [status];

    if (status === 'Paid') {
      sql += ', paid_by = ?, paid_at = NOW(), payment_method = ?, payment_note = ?';
      params.push(
        options?.paidBy || 'Accounts Staff',
        options?.paymentMethod || 'Cash',
        options?.paymentNote || null
      );
    } else if (status === 'Rejected' && options?.reason) {
      sql += ', rejection_reason = ?';
      params.push(options.reason.trim());
    }

    sql += ' WHERE id IN (?)';
    params.push(ids);

    const [res] = await p.query<ResultSetHeader>(sql, params);

    return {
      success: true,
      updatedCount: res.affectedRows,
    };
  } catch (error) {
    console.error('updateBillsBatch error:', error);

    // Local storage fallback batch update
    const store = readLocalStorage();
    let updatedCount = 0;
    const nowIso = new Date().toISOString();

    store.bills = store.bills.map((b) => {
      if (ids.includes(Number(b.id))) {
        updatedCount++;
        const updated = { ...b, status, updated_at: nowIso };
        if (status === 'Paid') {
          updated.paid_by = options?.paidBy || 'Accounts Staff';
          updated.paid_at = nowIso;
          updated.payment_method = options?.paymentMethod || 'Cash';
          if (options?.paymentNote) updated.payment_note = options.paymentNote.trim();
        } else if (status === 'Rejected' && options?.reason) {
          updated.rejection_reason = options.reason.trim();
        }
        return updated;
      }
      return b;
    });

    writeLocalStorage(store);
    return { success: true, updatedCount };
  }
}

export async function updateBillStatusById(
  id: number,
  status: BillStatus,
  options?: {
    reason?: string;
    approverName?: string;
    paidBy?: string;
    paymentMethod?: string;
    paymentNote?: string;
  }
): Promise<{ success: boolean; bill?: Bill; error?: string }> {
  const result = await updateBillsBatch([id], status, {
    reason: options?.reason,
    paidBy: options?.paidBy || options?.approverName,
    paymentMethod: options?.paymentMethod,
    paymentNote: options?.paymentNote,
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  const updatedBill = await getBillById(id);
  return { success: true, bill: updatedBill || undefined };
}

export async function getDashboardStats(filter?: {
  role?: UserRole;
  currentUserId?: string;
  currentUserName?: string;
}): Promise<DashboardStats> {
  try {
    await ensureTables();
    const p = getPool();

    if (filter?.role === 'support' && !filter?.currentUserId) {
      return {
        totalBills: 0, pendingBills: 0, approvedBills: 0, rejectedBills: 0, paidBills: 0,
        totalVolumeTk: 0, pendingVolumeTk: 0, approvedVolumeTk: 0, rejectedVolumeTk: 0, paidVolumeTk: 0,
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
    console.warn('MySQL getDashboardStats failed, fallback:', (error as Error).message);
  }

  const store = readLocalStorage();
  let bills = store.bills;

  if (filter?.role === 'support') {
    if (!filter.currentUserId) {
      return {
        totalBills: 0, pendingBills: 0, approvedBills: 0, rejectedBills: 0, paidBills: 0,
        totalVolumeTk: 0, pendingVolumeTk: 0, approvedVolumeTk: 0, rejectedVolumeTk: 0, paidVolumeTk: 0,
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

  let totalVolumeTk = 0, pendingVolumeTk = 0, approvedVolumeTk = 0, rejectedVolumeTk = 0, paidVolumeTk = 0;
  let pendingBills = 0, approvedBills = 0, rejectedBills = 0, paidBills = 0;

  for (const b of bills) {
    const amt = Number(b.amount) || 0;
    totalVolumeTk += amt;
    if (b.status === 'Paid') { paidBills++; paidVolumeTk += amt; }
    else if (b.status === 'Approved') { approvedBills++; approvedVolumeTk += amt; }
    else if (b.status === 'Rejected') { rejectedBills++; rejectedVolumeTk += amt; }
    else { pendingBills++; pendingVolumeTk += amt; }
  }

  return {
    totalBills: bills.length,
    pendingBills, approvedBills, rejectedBills, paidBills,
    totalVolumeTk: Math.round(totalVolumeTk * 100) / 100,
    pendingVolumeTk: Math.round(pendingVolumeTk * 100) / 100,
    approvedVolumeTk: Math.round(approvedVolumeTk * 100) / 100,
    rejectedVolumeTk: Math.round(rejectedVolumeTk * 100) / 100,
    paidVolumeTk: Math.round(paidVolumeTk * 100) / 100,
  };
}