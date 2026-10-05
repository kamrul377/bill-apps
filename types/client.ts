export interface POC {
    id: string;
    name: string;
    phone: string;
    designation?: string;
}

export interface ClientInfo {
    id: string;
    clientId: string;
    clientName: string;
    clientPhone?: string; // <--- Client Phone Number Added
    primaryIp: string;
    primaryOnu: string;
    secondaryIp: string;
    secondaryOnu: string;
    location: string;
    pocId?: number | string | null;
    pocName?: string | null;
    status: 'Connected' | 'Disconnected';
    description: string;
    createdAt: string;
}