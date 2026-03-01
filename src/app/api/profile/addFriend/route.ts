import { NextResponse } from "next/server";
import { mockProfiles, friendCodeToUserId } from "@/mockDb";

export async function POST(request: Request) {
    const currentUserId = request.headers.get("X-User-Id");
    const { friend_code } = await request.json(); // Assuming friend_id in plan.txt is friend_code for this mock

    if (!currentUserId) {
        return NextResponse.json({ message: "X-User-Id header missing" }, { status: 401 });
    }
    if (!friend_code) {
        return NextResponse.json({ message: "friend_code missing in request body" }, { status: 400 });
    }

    const friendUserId = friendCodeToUserId[friend_code];

    if (!friendUserId || !mockProfiles[friendUserId]) {
        return NextResponse.json({ message: "Friend code not found or user does not exist" }, { status: 404 });
    }

    if (currentUserId === friendUserId) {
        return NextResponse.json({ message: "Cannot add yourself as a friend" }, { status: 400 });
    }

    const currentUserProfile = mockProfiles[currentUserId];
    const friendProfile = mockProfiles[friendUserId];

    if (!currentUserProfile) {
         // This case should ideally not happen if X-User-Id is valid for a logged-in user.
         // For robust mocking, we might create a profile here too.
        return NextResponse.json({ message: "Current user profile not found" }, { status: 404 });
    }

    // Add friend (bidirectional)
    if (!currentUserProfile.friends.includes(friendUserId)) {
        currentUserProfile.friends.push(friendUserId);
    }
    if (!friendProfile.friends.includes(currentUserId)) {
        friendProfile.friends.push(currentUserId);
    }

    console.log(`User ${currentUserId} added friend ${friendUserId} (code: ${friend_code})`);
    return NextResponse.json({ message: "Friend added successfully!", friend_id: friendUserId }, { status: 200 });
}
