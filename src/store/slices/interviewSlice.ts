import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Question {
  id: string;
  question: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeLimit: number; // in seconds
  answer?: string;
  score?: number;
  timeSpent?: number;
}

export interface InterviewSession {
  candidateId: string;
  status: 'not_started' | 'in_progress' | 'paused' | 'completed';
  currentQuestionIndex: number;
  questions: Question[];
  startTime?: number;
  endTime?: number;
  totalScore?: number;
  summary?: string;
  timeRemaining?: number;
}

interface InterviewState {
  currentSession: InterviewSession | null;
  isTimerRunning: boolean;
  currentAnswer: string;
  recordingMode: 'text' | 'voice';
  isRecording: boolean;
}

const initialState: InterviewState = {
  currentSession: null,
  isTimerRunning: false,
  currentAnswer: '',
  recordingMode: 'text',
  isRecording: false,
};

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    startInterview: (state, action: PayloadAction<{ candidateId: string; questions: Question[] }>) => {
      state.currentSession = {
        candidateId: action.payload.candidateId,
        status: 'in_progress',
        currentQuestionIndex: 0,
        questions: action.payload.questions,
        startTime: Date.now(),
      };
      state.isTimerRunning = true;
    },
    pauseInterview: (state) => {
      if (state.currentSession) {
        state.currentSession.status = 'paused';
        state.isTimerRunning = false;
      }
    },
    resumeInterview: (state) => {
      if (state.currentSession) {
        state.currentSession.status = 'in_progress';
        state.isTimerRunning = true;
      }
    },
    submitAnswer: (state, action: PayloadAction<{ answer: string; timeSpent: number; score?: number }>) => {
      if (state.currentSession && state.currentSession.questions[state.currentSession.currentQuestionIndex]) {
        const currentQuestion = state.currentSession.questions[state.currentSession.currentQuestionIndex];
        currentQuestion.answer = action.payload.answer;
        currentQuestion.timeSpent = action.payload.timeSpent;
        currentQuestion.score = action.payload.score;
        state.currentAnswer = '';
      }
    },
    nextQuestion: (state) => {
      if (state.currentSession) {
        state.currentSession.currentQuestionIndex += 1;
        if (state.currentSession.currentQuestionIndex >= state.currentSession.questions.length) {
          state.currentSession.status = 'completed';
          state.currentSession.endTime = Date.now();
          state.isTimerRunning = false;
        }
      }
    },
    updateCurrentAnswer: (state, action: PayloadAction<string>) => {
      state.currentAnswer = action.payload;
    },
    setRecordingMode: (state, action: PayloadAction<'text' | 'voice'>) => {
      state.recordingMode = action.payload;
    },
    setIsRecording: (state, action: PayloadAction<boolean>) => {
      state.isRecording = action.payload;
    },
    completeInterview: (state, action: PayloadAction<{ totalScore: number; summary: string }>) => {
      if (state.currentSession) {
        state.currentSession.status = 'completed';
        state.currentSession.endTime = Date.now();
        state.currentSession.totalScore = action.payload.totalScore;
        state.currentSession.summary = action.payload.summary;
        state.isTimerRunning = false;
      }
    },
    clearCurrentSession: (state) => {
      state.currentSession = null;
      state.isTimerRunning = false;
      state.currentAnswer = '';
      state.isRecording = false;
    },
  },
});

export const {
  startInterview,
  pauseInterview,
  resumeInterview,
  submitAnswer,
  nextQuestion,
  updateCurrentAnswer,
  setRecordingMode,
  setIsRecording,
  completeInterview,
  clearCurrentSession,
} = interviewSlice.actions;

export default interviewSlice.reducer;