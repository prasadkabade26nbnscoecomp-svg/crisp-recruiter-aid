import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { InterviewSession } from './interviewSlice';

export interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  resumeFileName?: string;
  resumeContent?: string;
  createdAt: number;
}

export interface CompletedInterview extends InterviewSession {
  status: 'completed';
  totalScore: number;
  summary: string;
  endTime: number;
}

interface CandidateState {
  currentCandidate: CandidateProfile | null;
  allCandidates: CandidateProfile[];
  completedInterviews: CompletedInterview[];
}

const initialState: CandidateState = {
  currentCandidate: null,
  allCandidates: [],
  completedInterviews: [],
};

const candidateSlice = createSlice({
  name: 'candidates',
  initialState,
  reducers: {
    setCurrentCandidate: (state, action: PayloadAction<CandidateProfile>) => {
      state.currentCandidate = action.payload;
      
      // Add to all candidates if not already present
      const existingIndex = state.allCandidates.findIndex(c => c.id === action.payload.id);
      if (existingIndex === -1) {
        state.allCandidates.push(action.payload);
      } else {
        state.allCandidates[existingIndex] = action.payload;
      }
    },
    updateCandidateProfile: (state, action: PayloadAction<Partial<CandidateProfile> & { id: string }>) => {
      if (state.currentCandidate && state.currentCandidate.id === action.payload.id) {
        state.currentCandidate = { ...state.currentCandidate, ...action.payload };
      }
      
      const existingIndex = state.allCandidates.findIndex(c => c.id === action.payload.id);
      if (existingIndex !== -1) {
        state.allCandidates[existingIndex] = { ...state.allCandidates[existingIndex], ...action.payload };
      }
    },
    addCompletedInterview: (state, action: PayloadAction<CompletedInterview>) => {
      state.completedInterviews.push(action.payload);
    },
    clearCurrentCandidate: (state) => {
      state.currentCandidate = null;
    },
  },
});

export const {
  setCurrentCandidate,
  updateCandidateProfile,
  addCompletedInterview,
  clearCurrentCandidate,
} = candidateSlice.actions;

export default candidateSlice.reducer;