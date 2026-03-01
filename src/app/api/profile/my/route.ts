import { NextResponse } from "next/server";
import { mockProfiles, ensureFriendCode } from "@/mockDb";

export async function GET(request: Request) {
    const userId = request.headers.get("X-User-Id");

    if (!userId) {
        return NextResponse.json({ message: "X-User-Id header missing" }, { status: 401 });
    }

    let userProfile = mockProfiles[userId];

    if (!userProfile) {
        // If user not in mockProfiles, create a basic entry for them
        userProfile = {
            id: userId,
            provider_sub: userId.replace(/google$/, ''),
            provider: "google",
            email: `${userId.split('google')[0]}@example.com`,
            display_name: "Guest User",
            friend_code: "", // Will be ensured below
            friends: [],
            profile_image_url: null,
            about_me: "A new user.",
        };
        mockProfiles[userId] = userProfile;
    }

    // Ensure the user has a friend code
    userProfile.friend_code = ensureFriendCode(userId);

    // Return a copy to prevent direct mutation outside the API handler
    return NextResponse.json({ ...userProfile });
}
