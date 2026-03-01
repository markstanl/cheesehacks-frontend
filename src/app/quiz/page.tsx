"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { Button } from "@/components/Button";

interface Answer {
    id: number;
    text: string;
}

interface Question {
    id: number; // Changed to integer ID as per plan
    question_type: number;
    question: { number: number; text: string };
    answers: Answer[];
    prior_response: { selected_ids?: number[]; text?: string; } | null; // Added prior_response
}

// QuizSubmission interface is removed as answers are submitted per question

export default function QuizPage() {
    const router = useRouter();
    const { data: session, status } = useSession();

    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
    // quizResponses state is removed as per per-question submission
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Renamed from questionCount
    const [maxQuestionsLoaded, setMaxQuestionsLoaded] = useState(false); // New state variable
    const [totalQuestions, setTotalQuestions] = useState<number | null>(null); // To store total questions from backend

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
        } else if (status === "authenticated" && !currentQuestion && !maxQuestionsLoaded) {
            fetchNewQuestion(currentQuestionIndex);
        }
    }, [status, router, currentQuestion, currentQuestionIndex, maxQuestionsLoaded]);

    const fetchNewQuestion = async (questionIndex: number) => {
        if (!session?.user?.id) {
            console.error("User not authenticated for fetching questions.");
            return;
        }

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
        if (!backendUrl) {
            console.error("NEXT_PUBLIC_BACKEND_API_URL is not defined.");
            return;
        }

        // If totalQuestions is known and current index exceeds it, stop fetching
        if (totalQuestions !== null && questionIndex >= totalQuestions) {
            setMaxQuestionsLoaded(true);
            setCurrentQuestion(null); // No more questions
            return;
        }

        try {
            const url = `${backendUrl}/quiz/getQuestion?index=${questionIndex}`;
            console.log(`Sending GET request to ${url}`);
            console.log("Headers:", {
                "X-User-Id": session.user.id,
            });

            // Fetch question from the actual backend
            const res = await fetch(url, {
                headers: {
                    "X-User-Id": session.user.id,
                },
            });

            if (res.status === 404) { // No more questions
                setMaxQuestionsLoaded(true);
                setCurrentQuestion(null);
                return;
            }

            if (!res.ok) {
                throw new Error("Failed to fetch question");
            }

            const data: Question = await res.json();
            setCurrentQuestion(data);
            setSelectedAnswers(data.prior_response?.selected_ids || []); // Pre-select if prior response exists
            // Assuming the backend might send a header for total questions, or we hardcode for now
            // For now, let's assume if we get a 404, there are no more questions.
            // A more robust solution would involve the backend telling us the total count.
        } catch (error) {
            console.error("Error fetching question:", error);
            alert("Could not load question. Please try again later.");
        }
    };

    // Refactored handleAnswerSelection to prepare for per-question submission
    const handleAnswerSelection = (answerId: number) => {
        if (!currentQuestion) return;

        // For single-select (type 0), only one answer can be selected.
        // For multi-select (type 1), toggle selection.
        if (currentQuestion.question_type === 0) {
            setSelectedAnswers([answerId]);
        } else if (currentQuestion.question_type === 1) {
            setSelectedAnswers((prev) =>
                prev.includes(answerId)
                    ? prev.filter((id) => id !== answerId)
                    : [...prev, answerId].sort((a,b) => a-b) // Ensure consistent order for multi-select
            );
        }
    };

    const handleNextQuestion = async () => {
        if (!currentQuestion || selectedAnswers.length === 0) {
            alert("Please select an answer before proceeding.");
            return;
        }
        if (!session?.user?.id) {
            console.error("User not authenticated for submitting responses.");
            return;
        }

        // Prepare response_data based on question type
        const response_data: { selected_ids?: number[]; text?: string; /* other types if needed */ } = {};
        if (currentQuestion.question_type === 0 || currentQuestion.question_type === 1) {
            response_data.selected_ids = selectedAnswers;
        }
        // Add logic for other question types (e.g., text, scale) if necessary

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
        if (!backendUrl) {
            console.error("NEXT_PUBLIC_BACKEND_API_URL is not defined.");
            return;
        }

        try {
            const url = `${backendUrl}/quiz/sendResponse`;
            const requestBody = {
                question_id: currentQuestion.id,
                response_data: response_data,
            };
            console.log(`Sending POST request to ${url}`);
            console.log("Headers:", {
                "Content-Type": "application/json",
                "X-User-Id": session.user.id,
            });
            console.log("Body:", requestBody);

            // Send response to the actual backend
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-User-Id": session.user.id, // Always send X-User-Id
                },
                body: JSON.stringify(requestBody),
            });

            if (!res.ok) {
                throw new Error("Failed to submit answer for question");
            }

            console.log(`Answer for question ${currentQuestion.id} submitted successfully.`);

            // Proceed to the next question if available
            // If totalQuestions is known, use it, otherwise rely on 404 from fetchNewQuestion
            if (totalQuestions !== null && currentQuestionIndex < totalQuestions - 1) {
                setCurrentQuestionIndex((prev) => prev + 1); // Increment index, useEffect will fetch new question
            } else if (totalQuestions === null) { // If total questions unknown, try to fetch next, will get 404 if no more
                setCurrentQuestionIndex((prev) => prev + 1);
            } else { // All questions answered
                alert("You have answered all questions. Please submit your quiz.");
                setMaxQuestionsLoaded(true);
                setCurrentQuestion(null); // No more questions to fetch
            }
        } catch (error) {
            console.error("Error submitting answer:", error);
            alert("Error submitting answer. Please try again.");
        }
    };

    const handleSubmitQuiz = async () => {
        if (!session?.user?.id) {
            alert("You must be logged in to submit the quiz.");
            return;
        }
        
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
        if (!backendUrl) {
            console.error("NEXT_PUBLIC_BACKEND_API_URL is not defined.");
            return;
        }

        // Generate a mock personality_vector as per plan.txt
        const personalityVector = [
            parseFloat((Math.random() * 2 - 1).toFixed(4)),
            parseFloat((Math.random() * 2 - 1).toFixed(4)),
            parseFloat((Math.random() * 2 - 1).toFixed(4)),
            parseFloat((Math.random() * 2 - 1).toFixed(4)),
        ];

        try {
            const url = `${backendUrl}/quiz/submit`;
            const requestBody = { personality_vector: personalityVector };
            console.log(`Sending POST request to ${url}`);
            console.log("Headers:", {
                "Content-Type": "application/json",
                "X-User-Id": session.user.id,
            });
            console.log("Body:", requestBody);

            // Submit quiz to the actual backend
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-User-Id": session.user.id, // Always send X-User-Id
                },
                body: JSON.stringify(requestBody),
            });

            if (!res.ok) {
                throw new Error("Failed to submit quiz");
            }

            const result = await res.json();
            console.log("Quiz submission result:", result);
            alert("Quiz submitted successfully!");
            router.push("/diagnostics");
        } catch (error) {
            console.error("Error submitting quiz:", error);
            alert("Error submitting quiz. Please try again.");
        }
    };

    if (status === "loading" || status === "unauthenticated") {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <p className="">Loading session...</p>
            </div>
        );
    }

    // Only show "Loading quiz..." if we haven't loaded max questions and don't have a current question
    if (!currentQuestion && !maxQuestionsLoaded) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <p className="">Loading quiz...</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <main className="w-full max-w-2xl rounded-lg bg-dark-ink text-cream p-8 shadow-md ">
                <h1 className="mb-6 text-center text-3xl font-bold text-cream">
                    Quiz
                </h1>

                {currentQuestion ? (
                    <div className="space-y-6">
                        <p className="text-lg text-cream">
                            Question {currentQuestion.question.number}:{" "}
                            {currentQuestion.question.text}
                        </p>
                        <div className="space-y-3">
                            {currentQuestion.answers.map((answer) => (
                                <button
                                    key={answer.id}
                                    onClick={() => handleAnswerSelection(answer.id)}
                                    className={`block w-full rounded-md border p-3 text-left transition-colors cursor-pointer
                    ${
                                        selectedAnswers.includes(answer.id)
                                            ? "border-primary bg-primary text-cream" // Updated class names
                                            : "text-ink border-secondary bg-cream-light hover:bg-cream-dark dark:text-cream dark:bg-ink-light dark:hover:bg-ink" // Updated class names
                                    }`}
                                >
                                    {answer.text}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-between">
                            {/* Check if there are more questions or if we haven't determined total count yet */}
                            {(!maxQuestionsLoaded && (totalQuestions === null || currentQuestionIndex < totalQuestions -1)) ? (
                                <Button
                                    onClick={handleNextQuestion}
                                    variant="secondary"
                                >
                                    Next Question
                                </Button>
                            ) : (
                                <span className="text-secondary-grey">
                                    All questions answered.
                                </span>
                            )}
                            <Button
                                onClick={handleSubmitQuiz}
                                variant="secondary"
                                className="ml-auto"
                            >
                                Submit Quiz
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center">
                        <p className="text-lg text-foreground">
                            You have completed all questions!
                        </p>
                        <Button
                            onClick={handleSubmitQuiz}
                            variant="secondary"
                            className="mt-6"
                        >
                            Submit Final Quiz
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}
