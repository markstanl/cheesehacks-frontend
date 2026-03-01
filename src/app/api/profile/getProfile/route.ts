import { NextResponse } from "next/server";
import { mockProfiles } from "@/mockDb";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
        return NextResponse.json({ message: "user_id query parameter missing" }, { status: 400 });
    }

    const userProfile = mockProfiles[userId];

    if (!userProfile) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // In a real scenario, you'd filter for public fields. For mock, return the profile.
    return NextResponse.json({ ...userProfile });
}
