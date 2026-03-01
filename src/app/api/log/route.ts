// This server-side API route receives log messages from the client and prints them to the terminal.

import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { level, message, context } = await request.json();

        // Log to the server's terminal based on the provided level
        switch (level) {
            case 'warn':
                console.warn(`[CLIENT_WARN] ${message}`, context || '');
                break;
            case 'error':
                console.error(`[CLIENT_ERROR] ${message}`, context || '');
                break;
            case 'log':
            default:
                console.log(`[CLIENT_LOG] ${message}`, context || '');
                break;
        }

        return NextResponse.json({ status: 'ok' }, { status: 200 });
    } catch (error) {
        console.error('[SERVER_LOG_API_ERROR] Failed to process client log:', error);
        return NextResponse.json({ status: 'error', message: 'Failed to process log' }, { status: 500 });
    }
}
