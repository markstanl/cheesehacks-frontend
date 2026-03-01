// This client-side utility sends logs to a server-side API route to be printed in the terminal.

export async function logToServer(level: 'log' | 'warn' | 'error', message: string, context?: any) {
    if (typeof window === 'undefined') {
        // If this somehow runs on the server (e.g., during SSR), just use console.log
        console[level](message, context);
        return;
    }

    let serializedContext = context;
    if (context instanceof Error) {
        // Extract relevant properties from Error objects for better serialization
        serializedContext = {
            name: context.name,
            message: context.message,
            stack: context.stack, // Stack can be large, consider truncating for production
        };
    } else if (context && typeof context === 'object') {
        // Attempt to safely serialize other objects to catch non-JSON-serializable ones
        try {
            JSON.stringify(context);
        } catch (e) {
            serializedContext = String(context); // Fallback for circular or other non-serializable objects
        }
    }


    try {
        await fetch('/api/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ level, message, context: serializedContext }),
        });
    } catch (error) {
        // Fallback to browser console if sending to server fails
        console.error('Failed to send log to server:', error);
        console[level](message, serializedContext); // Use serialized context for fallback too
    }
}
