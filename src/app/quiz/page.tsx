"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { Button } from "@/components/Button";
import { logToServer } from "@/utils/logger"; // Import the logger utility

// DND-Kit imports
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Answer {
    id: number;
    text: string;
}

interface Question {
    id: number; // Changed to integer ID as per plan
    question_type: number;
    question: { number: number; text: string };
    answers: Answer[];
    prior_response: { selected_ids?: number[]; text?: string; ranked_ids?: number[]; } | null; // Added ranked_ids to prior_response
}

// QuizSubmission interface is removed as answers are submitted per question

export default function QuizPage() {
    const router = useRouter();
    const { data: session, status } = useSession();

    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
    const [freeTextResponse, setFreeTextResponse] = useState<string>(""); // New state for free text input
    // Updated quizResponses state to hold more flexible response_data, including ranking (array of IDs)
    const [quizResponses, setQuizResponses] = useState<{ questionId: number; response_data: { selected_ids?: number[]; text?: string; ranked_ids?: number[]; } }[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [allQuestions, setAllQuestions] = useState<Question[]>([]); // New state to cache all questions
    const [loadingQuiz, setLoadingQuiz] = useState(true); // New loading state for the quiz itself

    // State for DND-Kit items (answers for ranking questions)
    // Stores objects { id: answer.id, text: answer.text }
    const [rankingItems, setRankingItems] = useState<{ id: number; text: string }[]>([]);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
        } else if (status === "authenticated" && allQuestions.length === 0 && loadingQuiz) {
            // Only load all questions once on authentication
            loadAllQuizQuestions();
        }
    }, [status, router, allQuestions.length, loadingQuiz]); // Dependencies: re-run if session or questions change

    // Effect to set the current question from cache when index changes
    useEffect(() => {
        if (allQuestions.length > 0 && currentQuestionIndex < allQuestions.length) {
            const questionFromCache = allQuestions[currentQuestionIndex];
            setCurrentQuestion(questionFromCache);

            // Attempt to load prior response from quizResponses (local storage)
            const storedResponse = quizResponses.find(r => r.questionId === questionFromCache.id)?.response_data;

            // Prioritize local response, then backend's prior_response
            if (questionFromCache.question_type === 3) { // Free text
                setFreeTextResponse(storedResponse?.text || questionFromCache.prior_response?.text || "");
                setSelectedAnswers([]); // Clear selected answers for other types
                setRankingItems([]); // Clear ranking items
            } else if (questionFromCache.question_type === 4) { // Ranking
                // Initialize ranking items based on prior response or default order
                const initialRankedIds = storedResponse?.ranked_ids || questionFromCache.prior_response?.ranked_ids;
                const availableAnswers = questionFromCache.answers;

                if (initialRankedIds && initialRankedIds.length === availableAnswers.length) {
                    // Reconstruct items in the saved ranked order
                    setRankingItems(initialRankedIds.map(id => availableAnswers.find(ans => ans.id === id)!));
                } else {
                    // Default order if no prior response or invalid response
                    setRankingItems([...availableAnswers]);
                }
                setSelectedAnswers([]); // Ranking is handled by rankingItems order, not selectedAnswers
                setFreeTextResponse(""); // Clear text response
            }
            else { // All other types (single, multi, scale, yes/no)
                setSelectedAnswers(storedResponse?.selected_ids || questionFromCache.prior_response?.selected_ids || []);
                setFreeTextResponse(""); // Clear text response for non-text types
                setRankingItems([]); // Clear ranking items
            }
        } else if (allQuestions.length > 0 && currentQuestionIndex >= allQuestions.length) {
            // If we've gone past the last question
            alert("You have answered all questions. Please submit your quiz.");
            setCurrentQuestion(null);
            setLoadingQuiz(false); // Indicate quiz is complete/loaded
        }
    }, [currentQuestionIndex, allQuestions, quizResponses]); // Update currentQuestion when index or cached questions change

    const loadAllQuizQuestions = async () => {
        if (!session?.user?.id) {
            logToServer('error', "User not authenticated for fetching questions.");
            setLoadingQuiz(false);
            return;
        }

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
        if (!backendUrl) {
            logToServer('error', "NEXT_PUBLIC_BACKEND_API_URL is not defined.");
            setLoadingQuiz(false);
            return;
        }

        setLoadingQuiz(true);
        const fetchedQuestions: Question[] = [];
        let questionId = 1;
        let hasMoreQuestions = true;
        const userIdWithSuffix = `${session.user.id}google`;

        while (hasMoreQuestions) {
            try {
                const url = `${backendUrl}/quiz/getQuestion?question_id=${questionId}`;
                const fetchOptions = {
                    headers: { "X-User-Id": userIdWithSuffix },
                };
                logToServer('log', `Attempting to fetch question: ${url} with options:`, fetchOptions);

                const res = await fetch(url, fetchOptions);

                if (res.status === 404) {
                    hasMoreQuestions = false; // No more questions
                    logToServer('log', `Finished fetching questions. Total fetched: ${fetchedQuestions.length}`);
                } else if (!res.ok) {
                    const errorBody = await res.text();
                    throw new Error(`Failed to fetch question ${questionId}: ${res.status} ${res.statusText}. Body: ${errorBody}`);
                } else {
                    const data: Question = await res.json();
                    fetchedQuestions.push(data);
                    questionId++;
                }
            } catch (error: any) {
                logToServer('error', `Error loading quiz questions (question_id=${questionId}):`, error);
                alert(`Could not load all quiz questions. Please check console for details. (Error: ${error.message})`);
                hasMoreQuestions = false; // Stop trying to fetch if an error occurs
            }
        }
        setAllQuestions(fetchedQuestions);
        setLoadingQuiz(false);
    };

    // Refactored handleAnswerSelection to prepare for per-question submission
    const handleAnswerSelection = (answerId: number) => {
        if (!currentQuestion) {
            logToServer('warn', "handleAnswerSelection: No current question to select for.");
            return;
        }

        logToServer('log', `handleAnswerSelection: Attempting to select answer ${answerId} for Question ID: ${currentQuestion.id}, Type: ${currentQuestion.question_type}`);

        switch (currentQuestion.question_type) {
            case 0: // Single-select
            case 2: // Scale (treated as single-select for now with button UI)
            case 5: // Yes/No (treated as single-select for now with button UI)
                setSelectedAnswers([answerId]);
                logToServer('log', `handleAnswerSelection: Single-select/Scale/YesNo, selected: [${answerId}]`);
                setFreeTextResponse(""); // Clear text response if switching to a button-select type
                break;
            case 1: // Multi-select
                setSelectedAnswers((prev) => {
                    const newSelection = prev.includes(answerId)
                        ? prev.filter((id) => id !== answerId)
                        : [...prev, answerId].sort((a,b) => a-b); // Ensure consistent order
                    logToServer('log', `handleAnswerSelection: Multi-select, new selection: [${newSelection.join(', ')}]`);
                    return newSelection;
                });
                setFreeTextResponse(""); // Clear text response if switching to a button-select type
                break;
            case 3: // Free text: Selection is handled by textarea's onChange, not button clicks
                logToServer('warn', `handleAnswerSelection: Question type 3 (Free text) requires text input, not button selection.`);
                setSelectedAnswers([]); // Clear selected answers for text type
                setFreeTextResponse(""); // Clear text response
                break;
            case 4: // Ranking: Selection is handled by drag-and-drop, not button clicks
                logToServer('warn', `handleAnswerSelection: Question type 4 (Ranking) requires drag-and-drop, not button selection.`);
                setSelectedAnswers([]); // Clear selected answers
                setFreeTextResponse(""); // Clear text response
                break;
            case 6: // Other: Requires specific UI/logic
            default:
                logToServer('warn', `handleAnswerSelection: Question type ${currentQuestion.question_type} is not handled by this selection method.`);
                setSelectedAnswers([]); // Clear selected answers for unhandled types
                setFreeTextResponse(""); // Clear text response for unhandled types
                break;
        }
    };

    const handleFreeTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFreeTextResponse(e.target.value);
    };

    // DND-Kit sensors
    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // Handle drag end for ranking questions
    const handleDragEnd = useCallback(({ active, over }: DragEndEvent) => {
        if (!active || !over || active.id === over.id) {
            return;
        }
        
        setRankingItems((items) => {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);
            
            if (oldIndex === -1 || newIndex === -1) {
                return items; // Should not happen
            }

            const newOrderedItems = arrayMove(items, oldIndex, newIndex);
            logToServer('log', `Ranking updated. New order:`, newOrderedItems.map(item => item.id));
            return newOrderedItems;
        });
    }, []);

    // Helper function for array reordering (from dnd-kit example)
    const arrayMove = (array: any[], oldIndex: number, newIndex: number) => {
        const newArray = array.slice();
        newArray.splice(newIndex, 0, newArray.splice(oldIndex, 1)[0]);
        return newArray;
    };


    const handleNextQuestion = async () => {
        if (!currentQuestion) {
            alert("No current question to proceed from.");
            return;
        }
        
        // Store the current question's response locally based on its type
        const response_data: { selected_ids?: number[]; text?: string; ranked_ids?: number[]; } = {}; // Updated response_data type
        if (currentQuestion.question_type === 3) { // Free text
            response_data.text = freeTextResponse;
            if (!freeTextResponse.trim()) { // Check for empty text response
                alert("Please enter a response before proceeding.");
                return;
            }
        } else if (currentQuestion.question_type === 4) { // Ranking
            response_data.ranked_ids = rankingItems.map(item => item.id);
            if (response_data.ranked_ids.length === 0 || response_data.ranked_ids.length !== currentQuestion.answers.length) {
                alert("Please rank all options before proceeding.");
                return;
            }
        }
        else { // Button-based select (0, 1, 2, 5)
            response_data.selected_ids = selectedAnswers;
            if (selectedAnswers.length === 0) { // Check for empty selection
                alert("Please select an answer before proceeding.");
                return;
            }
        }

        setQuizResponses((prev) => {
            const updatedResponses = [...prev];
            const newResponse = { questionId: currentQuestion.id, response_data };
            const existingIndex = updatedResponses.findIndex(r => r.questionId === newResponse.questionId);
            if (existingIndex > -1) {
                updatedResponses[existingIndex] = newResponse;
            } else {
                updatedResponses.push(newResponse);
            }
            logToServer('log', `Saved response for question ${currentQuestion.id}:`, newResponse);
            return updatedResponses;
        });

        // Advance to the next question from the cached list
        const nextQuestionIndex = currentQuestionIndex + 1;
        if (nextQuestionIndex < allQuestions.length) {
            setCurrentQuestionIndex(nextQuestionIndex);
            // The useEffect will handle setting currentQuestion and selectedAnswers
        } else {
            // All questions have been answered
            alert("You have answered all questions. Please submit your quiz.");
            setCurrentQuestion(null);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            // First, save the current response before moving back
            if (currentQuestion) {
                const response_data: { selected_ids?: number[]; text?: string; ranked_ids?: number[]; } = {}; // Updated response_data type
                if (currentQuestion.question_type === 3) { // Free text
                    response_data.text = freeTextResponse;
                    if (!freeTextResponse.trim()) { // Check for empty text response for previous navigation
                        alert("Please enter a response before going back.");
                        return;
                    }
                } else if (currentQuestion.question_type === 4) { // Ranking
                    response_data.ranked_ids = rankingItems.map(item => item.id);
                    if (response_data.ranked_ids.length === 0 || response_data.ranked_ids.length !== currentQuestion.answers.length) {
                        alert("Please rank all options before going back.");
                        return;
                    }
                } else { // Button-based select
                    response_data.selected_ids = selectedAnswers;
                }
                setQuizResponses((prev) => {
                    const updatedResponses = [...prev];
                    const existingIndex = updatedResponses.findIndex(r => r.questionId === currentQuestion.id);
                    if (existingIndex > -1) {
                        updatedResponses[existingIndex] = { questionId: currentQuestion.id, response_data };
                    } else {
                        updatedResponses.push({ questionId: currentQuestion.id, response_data });
                    }
                    return updatedResponses;
                });
            }
            setCurrentQuestionIndex((prev) => prev - 1);
        } else {
            alert("You are on the first question.");
        }
    };

    const handleSubmitQuiz = async () => {
        if (!session?.user?.id) {
            alert("You must be logged in to submit the quiz.");
            return;
        }
        if (quizResponses.length === 0) {
            alert("No questions answered yet!");
            logToServer('warn', "Attempted to submit quiz with no responses.");
            return;
        }
        const userIdWithSuffix = `${session.user.id}google`; // Define userIdWithSuffix here
        
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
        if (!backendUrl) {
            logToServer('error', "NEXT_PUBLIC_BACKEND_API_URL is not defined.");
            return;
        }

        // Ensure the response for the *current* question is saved before final submission
        if (currentQuestion && (currentQuestionIndex === allQuestions.length - 1)) {
            const response_data: { selected_ids?: number[]; text?: string; ranked_ids?: number[]; } = {}; // Updated response_data type
            if (currentQuestion.question_type === 3) {
                response_data.text = freeTextResponse;
                if (!freeTextResponse.trim()) {
                    alert("Please enter a response for the current question before submitting.");
                    return;
                }
            } else if (currentQuestion.question_type === 4) {
                response_data.ranked_ids = rankingItems.map(item => item.id);
                if (response_data.ranked_ids.length === 0 || response_data.ranked_ids.length !== currentQuestion.answers.length) {
                    alert("Please rank all options for the current question before submitting.");
                    return;
                }
            } else {
                response_data.selected_ids = selectedAnswers;
                if (selectedAnswers.length === 0) {
                    alert("Please select an answer for the current question before submitting.");
                    return;
                }
            }
            setQuizResponses((prev) => {
                const updatedResponses = [...prev];
                const existingIndex = updatedResponses.findIndex(r => r.questionId === currentQuestion.id);
                if (existingIndex > -1) {
                    updatedResponses[existingIndex] = { questionId: currentQuestion.id, response_data };
                } else {
                    updatedResponses.push({ questionId: currentQuestion.id, response_data });
                }
                logToServer('log', `Saved final question's response before submission:`, { questionId: currentQuestion.id, response_data });
                return updatedResponses;
            });
        }

        // Log the batch of collected responses before deriving the personality vector
        // Use the updated quizResponses state after potentially saving the last question's answer
        logToServer('log', "Submitting batch of quiz responses:", quizResponses);

        // Generate a mock personality_vector based on the responses (for now, just random)
        // In a real scenario, this would be derived from the quizResponses using a specific algorithm.
        const personalityVector = [
            parseFloat((Math.random() * 2 - 1).toFixed(4)),
            parseFloat((Math.random() * 2 - 1).toFixed(4)),
            parseFloat((Math.random() * 2 - 1).toFixed(4)),
            parseFloat((Math.random() * 2 - 1).toFixed(4)),
        ];

        try {
            const url = `${backendUrl}/quiz/submit`;
            // The plan.txt specifies sending a personality_vector to /quiz/submit
            const requestBody = { personality_vector: personalityVector };

            logToServer('log', `Sending POST request to ${url}`, {
                headers: { "Content-Type": "application/json", "X-User-Id": userIdWithSuffix },
                body: requestBody
            });

            // Submit quiz to the actual backend
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-User-Id": userIdWithSuffix,
                },
                body: JSON.stringify(requestBody), // Send the personality_vector object
            });

            if (!res.ok) {
                throw new Error(`Failed to submit quiz: ${res.status} ${res.statusText}`);
            }

            const result = await res.json();
            logToServer('log', "Quiz submission result:", result);
            alert("Quiz submitted successfully!");
            router.push("/diagnostics");
        } catch (error: any) {
            logToServer('error', "Error submitting quiz:", error);
            alert("Error submitting quiz. Please try again.");
        }
    };

    if (status === "loading" || status === "unauthenticated" || loadingQuiz) {
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
                            {currentQuestion.question_type === 3 ? ( // Free text input
                                <textarea
                                    className="block w-full rounded-md border p-3 text-left text-cream bg-cream-light focus:outline-none focus:ring-2 focus:ring-accent"
                                    rows={5}
                                    placeholder="Type your response here..."
                                    value={freeTextResponse}
                                    onChange={handleFreeTextChange}
                                />
                            ) : currentQuestion.question_type === 4 ? ( // Ranking input
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    {/* Ranking drop zones */}
                                    <div className="space-y-3 mb-4">
                                        {rankingItems.map((item, index) => (
                                            <div key={`spot-${item.id}`} className="flex items-center gap-2">
                                                <div className="w-8 h-12 flex items-center justify-center text-cream text-lg font-bold bg-cream-light rounded-md border border-secondary">
                                                    {index + 1}.
                                                </div>
                                                <SortableItem key={item.id} id={item.id} text={item.text} />
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-sm text-secondary-grey text-center italic">Drag items to reorder them.</p>
                                </DndContext>
                            ) : ( // Button-based selections
                                currentQuestion.answers.map((answer) => (
                                    <button
                                        key={answer.id}
                                        onClick={() => handleAnswerSelection(answer.id)}
                                        className={`block w-full rounded-md border p-3 text-left transition-colors cursor-pointer
                                        ${
                                            selectedAnswers.includes(answer.id)
                                                ? "border-primary bg-primary text-cream"
                                                : "text-ink border-secondary bg-cream-light hover:bg-cream-dark dark:text-cream dark:bg-ink-light dark:hover:bg-ink"
                                        }`}
                                    >
                                        {answer.text}
                                    </button>
                                ))
                            )}
                        </div>
                        <div className="flex justify-between mt-6">
                            <Button
                                onClick={handlePreviousQuestion}
                                variant="secondary" // Changed from "ghost" to "secondary"
                                disabled={currentQuestionIndex === 0}
                            >
                                Previous
                            </Button>

                            {/* Conditionally render Next or Submit based on remaining questions */}
                            {currentQuestionIndex < allQuestions.length -1 ? (
                                <Button
                                    onClick={handleNextQuestion}
                                    variant="secondary"
                                >
                                    Next Question
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmitQuiz}
                                    variant="secondary"
                                    className="ml-auto"
                                >
                                    Submit Quiz
                                </Button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center">
                        <p className="text-lg text-foreground mb-4">
                            You have completed all questions!
                        </p>
                        {allQuestions.length > 0 && quizResponses.length > 0 && ( // Only show submit if questions were loaded and responses exist
                            <Button
                                onClick={handleSubmitQuiz}
                                variant="secondary"
                                className="mt-6"
                            >
                                Submit Final Quiz
                            </Button>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

// Sortable Item Component for DND-Kit
function SortableItem(props: { id: number; text: string }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: props.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 0, // Bring dragging item to front
        opacity: isDragging ? 0.8 : 1,
    };

    return (
        <button
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="flex-grow bg-cream text-dark-ink p-3 rounded-md border border-primary text-left cursor-grab active:cursor-grabbing shadow-sm"
        >
            {props.text}
        </button>
    );
}
