
import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Function to call the backend /profile/register endpoint
async function registerUserWithBackend(userId: string, email: string) {
    try {
        // Call the actual backend API for user registration
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
        if (!backendUrl) {
            console.error("NEXT_PUBLIC_BACKEND_API_URL is not defined.");
            return;
        }
        const requestBody = {
            provider_sub: userId.replace(/google$/, ''), // Extract original provider_sub
            provider: "google", // Assuming Google is the provider
            email: email,
        };
        console.log(`Sending POST request to ${backendUrl}/profile/register`);
        console.log("Headers:", {
            "Content-Type": "application/json",
            "X-User-Id": userId,
        });
        console.log("Body:", requestBody);

        const response = await fetch(`${backendUrl}/profile/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-User-Id": userId, // Always send X-User-Id for authenticated routes
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            console.error("Failed to register user with backend:", response.statusText);
        } else {
            console.log("User registered/updated with backend successfully!");
        }
    } catch (error) {
        console.error("Error registering user with backend:", error);
    }
}

export const authOptions: NextAuthConfig = {
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                },
            },
        }),
    ],
    callbacks: {
        async jwt({ token, profile }) {
            if (profile?.sub) {
                token.id = profile.sub;
                // Assuming profile contains email for registration
                if (profile.email) {
                    const userId = `${profile.sub}google`; // Construct user ID as per backend plan
                    await registerUserWithBackend(userId, profile.email);
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token.id && session.user) {
                session.user.id = token.id as string; // Ensure session.user.id is string
            }
            return session;
        },
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/",
    },
};

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut
} = NextAuth(authOptions);
