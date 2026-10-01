import { NextResponse } from 'next/server';
import net from 'net';

export async function GET() {
    const host = 'fnf-billpay-kamrul-98.e.aivencloud.com';
    const port = 3306; // Apnar MySQL port (Normally 3306 or Aiven specific port)

    const isConnected = await new Promise<boolean>((resolve) => {
        const socket = new net.Socket();

        // Timeout set kora (3 seconds)
        socket.setTimeout(3000);

        socket.connect(port, host, () => {
            socket.end();
            resolve(true);
        });

        socket.on('error', () => {
            socket.destroy();
            resolve(false);
        });

        socket.on('timeout', () => {
            socket.destroy();
            resolve(false);
        });
    });

    return NextResponse.json({ status: isConnected ? 'active' : 'inactive' });
}