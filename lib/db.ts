import mysql, { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { Bill, BillStatus, DashboardStats, User, UserRole } from './types';

// Global MySQL connection pool singleton
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || '127.0.0.1',
      port: parseInt(process.env.MYSQL_PORT || '3306', 10),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'isp_billing',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      dateStrings: true,
    });
  }
  return pool;
}

// Ensure tables exist in MySQL
let tablesInitialized = false;

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
        ticket_id VARCHAR(50) NOT NULL UNIQUE,
        user_id VARCHAR(50) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        description TEXT NOT NULL,
        date DATE NOT NULL,
        status ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
        created_by VARCHAR(100) DEFAULT NULL,
        rejection_reason TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_bills_status (status),
        INDEX idx_bills_user_id (user_id),
        INDEX idx_bills_date (date),
        INDEX idx_bills_ticket_id (ticket_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Ensure system administrator account exists
    await p.query(`
      INSERT INTO users (id, user_id, name, password, role)
      VALUES (1, 'kamrul.cse9@gmail.com', 'Kamrul Hasan', '66667777ssc', 'admin')
      ON DUPLICATE KEY UPDATE 
        name=VALUES(name),
        password=VALUES(password),
        role=VALUES(role);
    `);

    tablesInitialized = true;
  } catch (err) {
    console.warn('MySQL table initialization warning (ensure MySQL is running):', (err as Error).message);
  }
}

// ==================== User Repository ====================

export async function getUsers(): Promise<User[]> {
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
    console.error('MySQL getUsers error:', error);
    return [];
  }
}

export async function getUserById(id: number): Promise<User | null> {
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
    console.error('MySQL getUserById error:', error);
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    await ensureTables();
    const p = getPool();
    const [rows] = await p.query<RowDataPacket[]>(
      'SELECT id, user_id, name, role, DATE_FORMAT(created_at, "%Y-%m-%dT%H:%i:%s.000Z") as created_at FROM users WHERE LOWER(user_id) = LOWER(?) LIMIT 1',
      [email.trim()]
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
    console.error('MySQL getUserByEmail error:', error);
    return null;
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    await ensureTables();
    const p = getPool();
    const cleanEmail = email.trim().toLowerCase();
    const [rows] = await p.query<RowDataPacket[]>(
      'SELECT id, user_id, name, role, DATE_FORMAT(created_at, "%Y-%m-%dT%H:%i:%s.000Z") as created_at FROM users WHERE LOWER(user_id) = ? AND password = ? LIMIT 1',
      [cleanEmail, password]
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
    console.error('MySQL authenticateUser error:', error);
    return null;
  }
}

export async function createUser(userData: {
  user_id: string; // Email
  name: string;
  password: string;
  role: UserRole;
}): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    await ensureTables();
    const cleanEmail = userData.user_id.trim().toLowerCase();
    const name = userData.name.trim();
    const password = userData.password;
    const role = userData.role;

    if (!cleanEmail || !name || !password) {
      return { success: false, error: 'Email, Name, and Password are required.' };
    }

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
    console.error('MySQL createUser error:', error);
    return {
      success: false,
      error: (error as Error).message || 'Failed to create user in MySQL database.',
    };
  }
}

export async function updateUser(
  id: number,
  updates: Partial<Omit<User, 'id'>>
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
    console.error('MySQL updateUser error:', error);
    return {
      success: false,
      error: (error as Error).message || 'Failed to update user in MySQL database.',
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
    console.error('MySQL deleteUser error:', error);
    return {
      success: false,
      error: (error as Error).message || 'Failed to delete user from MySQL database.',
    };
  }
}

// ==================== Bill Repository ====================

export async function getBills(filter?: {
  status?: string;
  search?: string;
  userId?: string;
  role?: UserRole;
  currentUserId?: string;
}): Promise<Bill[]> {
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
        DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%s.000Z') as created_at,
        DATE_FORMAT(updated_at, '%Y-%m-%dT%H:%i:%s.000Z') as updated_at
      FROM bills
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (filter?.role === 'accounts') {
      sql += ' AND status = ?';
      params.push('Approved');
    } else if (filter?.status && filter.status !== 'ALL') {
      sql += ' AND UPPER(status) = UPPER(?)';
      params.push(filter.status);
    }

    if (filter?.search) {
      const q = `%${filter.search.trim()}%`;
      sql += ' AND (ticket_id LIKE ? OR user_id LIKE ? OR description LIKE ?)';
      params.push(q, q, q);
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
      created_at: String(r.created_at || ''),
      updated_at: String(r.updated_at || ''),
    }));
  } catch (error) {
    console.error('MySQL getBills error:', error);
    return [];
  }
}

export async function getBillByTicketId(ticketId: string): Promise<Bill | null> {
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
        DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%s.000Z') as created_at,
        DATE_FORMAT(updated_at, '%Y-%m-%dT%H:%i:%s.000Z') as updated_at
      FROM bills
      WHERE LOWER(ticket_id) = LOWER(?)
      LIMIT 1`,
      [ticketId.trim()]
    );

    if (!rows || rows.length === 0) return null;
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
      created_at: String(r.created_at || ''),
      updated_at: String(r.updated_at || ''),
    };
  } catch (error) {
    console.error('MySQL getBillByTicketId error:', error);
    return null;
  }
}

export async function createBill(data: {
  ticket_id: string;
  user_id: string;
  amount: number | string;
  description: string;
  date: string;
  created_by?: string;
}): Promise<{ success: boolean; bill?: Bill; error?: string }> {
  try {
    await ensureTables();
    const ticket_id = (data.ticket_id || '').trim();
    const user_id = (data.user_id || '').trim();
    const description = (data.description || '').trim();
    const date = (data.date || '').trim();
    const numericAmount = Number(data.amount);

    if (!ticket_id) {
      return { success: false, error: 'Ticket ID is required.' };
    }
    if (!user_id) {
      return { success: false, error: 'User ID is required.' };
    }
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return { success: false, error: 'Amount must be a positive number.' };
    }
    if (!description) {
      return { success: false, error: 'Description is required.' };
    }
    if (!date) {
      return { success: false, error: 'Date is required.' };
    }

    const p = getPool();
    const [existing] = await p.query<RowDataPacket[]>(
      'SELECT id FROM bills WHERE LOWER(ticket_id) = LOWER(?) LIMIT 1',
      [ticket_id]
    );
    if (existing && existing.length > 0) {
      return { success: false, error: `Ticket ID "${ticket_id}" already exists.` };
    }

    const roundedAmount = Math.round(numericAmount * 100) / 100;
    const created_by = data.created_by || 'Support';

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
    console.error('MySQL createBill error:', error);
    return {
      success: false,
      error: (error as Error).message || 'Failed to create bill in MySQL database.',
    };
  }
}

export async function updateBillStatus(
  ticketId: string,
  status: BillStatus,
  options?: { reason?: string; approverName?: string }
): Promise<{ success: boolean; bill?: Bill; error?: string }> {
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

    const reason = status === 'Rejected' && options?.reason ? options.reason.trim() : null;

    if (reason) {
      await p.query(
        'UPDATE bills SET status = ?, rejection_reason = ?, updated_at = NOW() WHERE LOWER(ticket_id) = LOWER(?)',
        [status, reason, ticketId.trim()]
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
    console.error('MySQL updateBillStatus error:', error);
    return {
      success: false,
      error: (error as Error).message || 'Failed to update bill in MySQL database.',
    };
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    await ensureTables();
    const p = getPool();
    const [rows] = await p.query<RowDataPacket[]>(`
      SELECT
        COUNT(*) as totalBills,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pendingBills,
        SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approvedBills,
        SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejectedBills,
        COALESCE(SUM(amount), 0) as totalVolumeTk,
        COALESCE(SUM(CASE WHEN status = 'Pending' THEN amount ELSE 0 END), 0) as pendingVolumeTk,
        COALESCE(SUM(CASE WHEN status = 'Approved' THEN amount ELSE 0 END), 0) as approvedVolumeTk,
        COALESCE(SUM(CASE WHEN status = 'Rejected' THEN amount ELSE 0 END), 0) as rejectedVolumeTk
      FROM bills
    `);

    if (!rows || rows.length === 0) {
      return {
        totalBills: 0,
        pendingBills: 0,
        approvedBills: 0,
        rejectedBills: 0,
        totalVolumeTk: 0,
        pendingVolumeTk: 0,
        approvedVolumeTk: 0,
        rejectedVolumeTk: 0,
      };
    }

    const r = rows[0];
    return {
      totalBills: Number(r.totalBills) || 0,
      pendingBills: Number(r.pendingBills) || 0,
      approvedBills: Number(r.approvedBills) || 0,
      rejectedBills: Number(r.rejectedBills) || 0,
      totalVolumeTk: Number(r.totalVolumeTk) || 0,
      pendingVolumeTk: Number(r.pendingVolumeTk) || 0,
      approvedVolumeTk: Number(r.approvedVolumeTk) || 0,
      rejectedVolumeTk: Number(r.rejectedVolumeTk) || 0,
    };
  } catch (error) {
    console.error('MySQL getDashboardStats error:', error);
    return {
      totalBills: 0,
      pendingBills: 0,
      approvedBills: 0,
      rejectedBills: 0,
      totalVolumeTk: 0,
      pendingVolumeTk: 0,
      approvedVolumeTk: 0,
      rejectedVolumeTk: 0,
    };
  }
}
