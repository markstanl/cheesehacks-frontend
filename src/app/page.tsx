"use client";

import {useRouter} from "next/navigation";
import {Button} from "@/components/Button";

export default function LoginPage() {
    const router = useRouter();

    const handleGoogleLogin = () => {
        console.log("Attempting Google SSO login...");
        router.push("/quiz");
    };

    return (
        <div
            className="bg-cream text-ink flex max-h-full flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 h-full">
            <div className="w-full max-w-lg space-y-8 text-center">
                <div>
                    <h2 className="mt-6 text-center text-8xl font-extrabold">
                        Align
                    </h2>
                    <p className="mt-2 text-center text-lg">
                        Answer absurd ethical dilemmas, and we'll tell you about yourself.
                        Help LLMs understand human values, and we'll help you understand yourself.
                    </p>
                </div>
                <div>
                    <Button
                        onClick={handleGoogleLogin}
                        className="w-full"
                        variant="primary"
                    >
                        Sign in with Google
                    </Button>
                </div>
            </div>
        </div>
    );
}
