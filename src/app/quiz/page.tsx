"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"; // Import useSession

interface Answer {
  id: number;
  text: string;
}

interface Question {
  id: string;
  question_type: number; // 0 for single select, 1 for multi-select
  question: { number: number; text: string };
  answers: Answer[];
}

interface QuizSubmission {
  questionId: string;
  selectedAnswerIds: number[];
}

export default function QuizPage() {
  const router = useRouter();
  const { data: session, status } = useSession(); // Get session status

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizResponses, setQuizResponses] = useState<QuizSubmission[]>([]);
  const [questionCount, setQuestionCount] = useState(0);
  const MAX_QUESTIONS = 3; // Hardcoded for this demo

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/"); // Redirect to login if not authenticated
    } else if (status === "authenticated") {
      fetchNewQuestion();
    }
  }, [status, router]);

  const fetchNewQuestion = async (theme: string = "general") => {
    if (questionCount >= MAX_QUESTIONS) {
      alert("You have completed all questions. Please submit your quiz.");
      return;
    }

    try {
      const res = await fetch(`/api/question?theme=${theme}`);
      if (!res.ok) {
        throw new Error("Failed to fetch question");
      }
      const data: Question = await res.json();
      setCurrentQuestion(data);
      setSelectedAnswers([]); // Reset selected answers for new question
      setQuestionCount((prev) => prev + 1);
    } catch (error) {
      console.error("Error fetching question:", error);
      alert("Could not load question. Please try again later.");
    }
  };

  const handleAnswerSelection = (answerId: number) => {
    if (!currentQuestion) return;

    if (currentQuestion.question_type === 0) {
      // Single select
      setSelectedAnswers([answerId]);
    } else if (currentQuestion.question_type === 1) {
      // Multi-select
      setSelectedAnswers((prev) =>
        prev.includes(answerId)
          ? prev.filter((id) => id !== answerId)
          : [...prev, answerId]
      );
    }
  };

  const handleNextQuestion = () => {
    if (!currentQuestion || selectedAnswers.length === 0) {
      alert("Please select an answer before proceeding.");
      return;
    }

    setQuizResponses((prev) => [
      ...prev,
      { questionId: currentQuestion.id, selectedAnswerIds: selectedAnswers },
    ]);

    if (questionCount < MAX_QUESTIONS) {
      fetchNewQuestion(); // Fetch next question
    } else {
      alert("You have answered all questions. Please submit your quiz.");
      setCurrentQuestion(null); // No more questions to display
    }
  };

  const handleSubmitQuiz = async () => {
    if (quizResponses.length === 0) {
      alert("No questions answered yet!");
      return;
    }

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quizResponses),
      });

      if (!res.ok) {
        throw new Error("Failed to submit quiz");
      }

      const result = await res.json();
      console.log(result);
      alert("Quiz submitted successfully!");
      // Optionally redirect to diagnostics or a results page
      router.push("/diagnostics");
    } catch (error) {
      console.error("Error submitting quiz:", error);
      alert("Error submitting quiz. Please try again.");
    }
  };

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-secondary-grey">Loading quiz...</p>
      </div>
    );
  }

  if (!currentQuestion && questionCount < MAX_QUESTIONS) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-secondary-grey">Loading quiz...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <main className="w-full max-w-2xl rounded-lg bg-white p-8 shadow-md dark:bg-zinc-800">
        <h1 className="mb-6 text-center text-3xl font-bold text-primary-red">
          Quiz
        </h1>

        {currentQuestion ? (
          <div className="space-y-6">
            <p className="text-lg text-foreground">
              Question {currentQuestion.question.number}:{" "}
              {currentQuestion.question.text}
            </p>
            <div className="space-y-3">
              {currentQuestion.answers.map((answer) => (
                <button
                  key={answer.id}
                  onClick={() => handleAnswerSelection(answer.id)}
                  className={`block w-full rounded-md border p-3 text-left transition-colors
                    ${
                      selectedAnswers.includes(answer.id)
                        ? "border-primary-red bg-primary-red text-white"
                        : "border-secondary-grey bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600"
                    }`}
                >
                  {answer.text}
                </button>
              ))}
            </div>
            <div className="flex justify-between">
              {questionCount < MAX_QUESTIONS ? (
                <button
                  onClick={handleNextQuestion}
                  className="rounded-md bg-primary-red px-6 py-2 text-white hover:bg-red-700"
                >
                  Next Question
                </button>
              ) : (
                <span className="text-secondary-grey">
                  All questions answered.
                </span>
              )}
              <button
                onClick={handleSubmitQuiz}
                className="rounded-md bg-green-600 px-6 py-2 text-white hover:bg-green-700"
              >
                Submit Quiz
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-lg text-foreground">
              You have completed all questions!
            </p>
            <button
              onClick={handleSubmitQuiz}
              className="mt-6 rounded-md bg-green-600 px-6 py-2 text-white hover:bg-green-700"
            >
              Submit Final Quiz
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
