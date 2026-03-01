"use client";

import React, { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/Button"; // Assuming you have a Button component
import { logToServer } from "@/utils/logger"; // Import the logger utility

interface FriendProfile {
    id: string;
    display_name: string;
    friend_code: string;
    profile_image_url?: string | null;
    about_me?: string | null;
}

interface UserProfileResponse {
    id: string;
    display_name: string;
    friend_code: string;
    friends: string[]; // List of friend user IDs
    profile_image_url?: string | null;
    about_me?: string | null;
}

const FriendsPage = () => {
    const router = useRouter();
    const { data: session, status } = useSession();

    const [userProfile, setUserProfile] = useState<UserProfileResponse | null>(null);
    const [friendsList, setFriendsList] = useState<FriendProfile[]>([]);
    const [friendCodeInput, setFriendCodeInput] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [addFriendMessage, setAddFriendMessage] = useState<string | null>(null);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL; // Re-using for consistency, but using local mock paths

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
        } else if (status === "authenticated") {
            fetchUserProfileAndFriends();
        }
    }, [status, router]); // Re-run when session status changes

    if (!backendUrl) {
        logToServer('error', "NEXT_PUBLIC_BACKEND_API_URL is not defined in FriendsPage.");
    }

    const fetchUserProfileAndFriends = async () => {
        if (!session?.user?.id) {
            logToServer('error', "User not authenticated for fetching profile.");
            setLoading(false);
            return;
        }
        if (!backendUrl) { // Additional check if backendUrl is not defined
            setError("Backend API URL is not defined. Cannot fetch friends data.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const userIdWithSuffix = `${session.user.id}google`;
            // 1. Fetch current user's profile (including their friend code and friend IDs)
            const urlMyProfile = `/api/profile/my`;
            logToServer('log', `Sending GET request to ${urlMyProfile}`, {
                headers: { "X-User-Id": userIdWithSuffix }
            });
            const userProfileRes = await fetch(urlMyProfile, { // Local mock endpoint
                headers: {
                    "X-User-Id": userIdWithSuffix,
                },
            });

            if (!userProfileRes.ok) {
                throw new Error("Failed to fetch user profile.");
            }
            const userData: UserProfileResponse = await userProfileRes.json();
            setUserProfile(userData);

            // 2. For each friend ID, fetch their public profile
            const fetchedFriends: FriendProfile[] = [];
            for (const friendId of userData.friends) {
                const userIdWithSuffix = `${session.user.id}google`;
                const urlGetProfile = `/api/profile/getProfile?user_id=${friendId}`;
                logToServer('log', `Sending GET request to ${urlGetProfile}`, {
                    headers: { "X-User-Id": userIdWithSuffix }
                });
                const friendProfileRes = await fetch(urlGetProfile, { // Local mock endpoint
                    headers: {
                        "X-User-Id": userIdWithSuffix, // For consistency, though getProfile might be public
                    },
                });

                if (friendProfileRes.ok) {
                    const friendData: FriendProfile = await friendProfileRes.json();
                    fetchedFriends.push(friendData);
                } else {
                    console.warn(`Failed to fetch profile for friend ID: ${friendId}`);
                }
            }
            setFriendsList(fetchedFriends);

        } catch (err: any) {
            logToServer('error', "Error fetching friends data:", err);
            setError(err.message || "Failed to load friends data.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddFriend = async (event: FormEvent) => {
        event.preventDefault();
        if (!session?.user?.id) {
            setAddFriendMessage("You must be logged in to add friends.");
            logToServer('warn', "Attempt to add friend without authentication.");
            return;
        }
        if (!friendCodeInput.trim()) {
            setAddFriendMessage("Please enter a friend code.");
            logToServer('warn', "Attempt to add friend with empty friend code.");
            return;
        }
        if (!backendUrl) {
            setAddFriendMessage("Backend API URL is not defined. Cannot add friend.");
            logToServer('error', "Backend API URL is not defined for addFriend.");
            return;
        }

        setAddFriendMessage(null);

        try {
            const urlAddFriend = `/api/profile/addFriend`;
            const requestBodyAddFriend = { friend_code: friendCodeInput.trim() };
            const userIdWithSuffix = `${session.user.id}google`;
            logToServer('log', `Sending POST request to ${urlAddFriend}`, {
                headers: { "Content-Type": "application/json", "X-User-Id": userIdWithSuffix },
                body: requestBodyAddFriend
            });

            const res = await fetch(urlAddFriend, { // Local mock endpoint
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-User-Id": session.user.id,
                },
                body: JSON.stringify(requestBodyAddFriend),
            });

            const data = await res.json();

            if (res.ok) {
                setAddFriendMessage(`Success: ${data.message}`);
                setFriendCodeInput(""); // Clear input
                fetchUserProfileAndFriends(); // Refresh friend list
            } else {
                setAddFriendMessage(`Error: ${data.message || "Failed to add friend."}`);
                logToServer('error', "Failed to add friend:", data);
            }
        } catch (err: any) {
            logToServer('error', "Error adding friend:", err);
            setAddFriendMessage(`Error: ${err.message || "An unexpected error occurred."}`);
        }
    };

    if (status === "loading" || status === "unauthenticated" || loading) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <p className="text-ink">Loading friends...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <p className="text-primary">Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <main className="w-full max-w-2xl rounded-lg bg-dark-ink text-cream p-8 shadow-md ">
                <h1 className="mb-6 text-center text-3xl font-bold text-cream">
                    Friends
                </h1>

                {/* Your Friend Code Section */}
                <div className="mb-8 text-center">
                    <h2 className="text-xl font-bold text-cream mb-2">Your Friend Code:</h2>
                    <p className="bg-cream text-dark-ink p-3 rounded-md inline-block font-mono text-lg select-all">
                        {userProfile?.friend_code || "Loading..."}
                    </p>
                </div>

                {/* Add Friend Section */}
                <form onSubmit={handleAddFriend} className="mb-8 space-y-4">
                    <label htmlFor="friendCode" className="block text-cream text-lg font-bold mb-2">
                        Add a Friend by Code:
                    </label>
                    <div className="flex gap-4">
                        <input
                            type="text"
                            id="friendCode"
                            className="flex-grow p-3 rounded-md bg-cream text-dark-ink border border-primary focus:outline-none focus:ring-2 focus:ring-accent"
                            placeholder="Enter friend code"
                            value={friendCodeInput}
                            onChange={(e) => setFriendCodeInput(e.target.value)}
                            required
                        />
                        <Button type="submit" variant="secondary" className="whitespace-nowrap">
                            Add Friend
                        </Button>
                    </div>
                    {addFriendMessage && (
                        <p className={`text-center text-sm ${addFriendMessage.startsWith("Error") ? "text-primary" : "text-accent"}`}>
                            {addFriendMessage}
                        </p>
                    )}
                </form>

                {/* Friends List Section */}
                <h2 className="text-xl font-bold text-cream mb-4 text-center">My Friends ({friendsList.length})</h2>
                {friendsList.length === 0 ? (
                    <p className="text-secondary-grey text-center">You don't have any friends yet. Add some!</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {friendsList.map((friend) => (
                            <div key={friend.id} className="bg-cream text-dark-ink p-4 rounded-lg shadow-sm">
                                <h3 className="font-bold text-lg">{friend.display_name}</h3>
                                {friend.about_me && <p className="text-sm italic">{friend.about_me}</p>}
                                <p className="text-xs text-secondary-grey mt-2">ID: {friend.id}</p>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default FriendsPage;
