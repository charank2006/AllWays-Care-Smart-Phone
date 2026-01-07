
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import type { ConversationTask, View } from '../types';

interface VoiceControlState {
  symptomInput: string;
  setSymptomInput: (input: string) => void;
  medicineInput: string;
  setMedicineInput: (input: string) => void;
  resourceInput: string;
  setResourceInput: (input: string) => void;
  
  submitTrigger: number;
  triggerSubmit: () => void;
  
  isListening: boolean;
  setIsListening: (isListening: boolean) => void;

  // New state for inline dictation
  isDictating: boolean;
  setIsDictating: (isDictating: boolean) => void;
  
  toastMessage: string;
  setToastMessage: (message: string) => void;

  processingCommand: string | null;
  setProcessingCommand: (command: string | null) => void;

  // Conversational Logic
  activeTask: ConversationTask;
  setActiveTask: (task: ConversationTask) => void;
  taskData: any;
  setTaskData: (data: any) => void;
  updateTaskData: (data: any) => void;
  
  awaitingResponse: 'none' | 'yes_no' | 'selection' | 'symptoms';
  setAwaitingResponse: (mode: 'none' | 'yes_no' | 'selection' | 'symptoms') => void;
  
  pendingNavigation: View | null;
  setPendingNavigation: (view: View | null) => void;
}

const VoiceControlContext = createContext<VoiceControlState | undefined>(undefined);

export const VoiceControlProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [symptomInput, setSymptomInput] = useState('');
  const [medicineInput, setMedicineInput] = useState('');
  const [resourceInput, setResourceInput] = useState('');
  const [submitTrigger, setSubmitTrigger] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [processingCommand, setProcessingCommand] = useState<string | null>(null);

  const [activeTask, setActiveTask] = useState<ConversationTask>('none');
  const [taskData, setTaskData] = useState<any>(null);
  const [awaitingResponse, setAwaitingResponse] = useState<'none' | 'yes_no' | 'selection' | 'symptoms'>('none');
  const [pendingNavigation, setPendingNavigation] = useState<View | null>(null);

  const triggerSubmit = useCallback(() => setSubmitTrigger(val => val + 1), []);
  const updateTaskData = useCallback((data: any) => setTaskData((prev: any) => ({...prev, ...data})), []);

  const value = {
    symptomInput, setSymptomInput,
    medicineInput, setMedicineInput,
    resourceInput, setResourceInput,
    submitTrigger, triggerSubmit,
    isListening, setIsListening,
    isDictating, setIsDictating,
    toastMessage, setToastMessage,
    processingCommand, setProcessingCommand,
    activeTask, setActiveTask,
    taskData, setTaskData, updateTaskData,
    awaitingResponse, setAwaitingResponse,
    pendingNavigation, setPendingNavigation
  };

  return (
    <VoiceControlContext.Provider value={value}>
      {children}
    </VoiceControlContext.Provider>
  );
};

export const useVoiceControl = (): VoiceControlState => {
  const context = useContext(VoiceControlContext);
  if (context === undefined) {
    throw new Error('useVoiceControl must be used within a VoiceControlProvider');
  }
  return context;
};
