// src/mockDb.ts - Centralized mock data for friend features

export interface MockUserProfile {
    id: string; // user ID, e.g., "12345google"
    provider_sub: string;
    provider: string;
    email: string;
    display_name: string;
    friend_code: string; // A unique code for adding friends
    friends: string[]; // List of friend user IDs
    profile_image_url?: string | null;
    about_me?: string | null;
}

// Initial mock user data
export const mockProfiles: { [userId: string]: MockUserProfile } = {
    // Example user ID from previous logs ("neel.andhole@gmail.com")
    "105443135207257452527google": {
        id: "105443135207257452527google",
        provider_sub: "105443135207257452527",
        provider: "google",
        email: "neel.andhole@gmail.com",
        display_name: "Neel",
        friend_code: "NLO789",
        friends: ["praneetIdGoogle", "merlinIdGoogle", "markIdGoogle", "neelPalIdGoogle"], // Added Mark and Neel's Pal
        profile_image_url: null,
        about_me: "The frontend developer.",
    },
    "praneetIdGoogle": {
        id: "praneetIdGoogle",
        provider_sub: "praneetId",
        provider: "google",
        email: "praneet@example.com",
        display_name: "Praneet",
        friend_code: "PNE123",
        friends: ["105443135207257452527google"],
        profile_image_url: null,
        about_me: "My friend Praneet.",
    },
    "merlinIdGoogle": {
        id: "merlinIdGoogle",
        provider_sub: "merlinId",
        provider: "google",
        email: "merlin@example.com",
        display_name: "Merlin",
        friend_code: "MRN456",
        friends: ["105443135207257452527google", "markIdGoogle"],
        profile_image_url: null,
        about_me: "A wise friend.",
    },
    "markIdGoogle": {
        id: "markIdGoogle",
        provider_sub: "markId",
        provider: "google",
        email: "mark@example.com",
        display_name: "Mark",
        friend_code: "MRK789",
        friends: ["merlinIdGoogle", "105443135207257452527google"], // Added Neel to Mark's friends
        profile_image_url: null,
        about_me: "Just Mark.",
    },
    "neelPalIdGoogle": { // New user entry for the fourth friend
        id: "neelPalIdGoogle",
        provider_sub: "neelPalSub",
        provider: "google",
        email: "neel.pal@example.com",
        display_name: "Neel's Pal",
        friend_code: "NPL101",
        friends: ["105443135207257452527google"], // Added Neel to Neel's Pal's friends
        profile_image_url: null,
        about_me: "Another friend named Neel (or a close variant) to complete the set.",
    }
};

// Map friend codes to user IDs for quick lookup
export const friendCodeToUserId: { [friendCode: string]: string } = {};
for (const userId in mockProfiles) {
    friendCodeToUserId[mockProfiles[userId].friend_code] = userId;
}

// Function to simulate generating a unique friend code (if not already set)
export function ensureFriendCode(userId: string): string {
    if (!mockProfiles[userId].friend_code) {
        let code;
        do {
            code = Math.random().toString(36).substring(2, 8).toUpperCase();
        } while (friendCodeToUserId[code]);
        mockProfiles[userId].friend_code = code;
        friendCodeToUserId[code] = userId;
    }
    return mockProfiles[userId].friend_code;
}
