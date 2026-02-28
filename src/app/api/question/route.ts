import { NextResponse } from "next/server";

const mockQuestions = {
  general: [
    {
      id: "q1",
      question_type: 0, // Single select
      question: { number: 1, text: "What is the capital of Wisconsin?" },
      answers: [
        { id: 0, text: "Milwaukee" },
        { id: 1, text: "Madison" },
        { id: 2, text: "Green Bay" },
      ],
    },
    {
      id: "q2",
      question_type: 1, // Multi-select
      question: { number: 2, text: "Which of these are dairy products?" },
      answers: [
        { id: 0, text: "Milk" },
        { id: 1, text: "Cheese" },
        { id: 2, text: "Bread" },
        { id: 3, text: "Yogurt" },
      ],
    },
    {
      id: "q3",
      question_type: 0,
      question: { number: 3, text: "What is the largest state in the US by area?" },
      answers: [
        { id: 0, text: "Texas" },
        { id: 1, text: "California" },
        { id: 2, text: "Alaska" },
      ],
    },
  ],
  science: [
    {
      id: "s1",
      question_type: 0,
      question: { number: 1, text: "What is the chemical symbol for water?" },
      answers: [
        { id: 0, text: "O2" },
        { id: 1, text: "H2O" },
        { id: 2, text: "CO2" },
      ],
    },
  ],
  history: [
    {
      id: "h1",
      question_type: 0,
      question: { number: 1, text: "Who was the first president of the USA?" },
      answers: [
        { id: 0, text: "Abraham Lincoln" },
        { id: 1, text: "George Washington" },
        { id: 2, text: "Thomas Jefferson" },
      ],
    },
  ],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const theme = searchParams.get("theme") || "general";
  const questions = mockQuestions[theme as keyof typeof mockQuestions] || mockQuestions.general;

  // For simplicity, always return the first question in the list for the chosen theme
  // In a real app, you'd want to manage state to serve different questions sequentially
  const question = questions[0]; 

  if (question) {
    return NextResponse.json(question);
  } else {
    return NextResponse.json({ message: "No questions found for this theme." }, { status: 404 });
  }
}
