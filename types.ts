
import React from 'react';

export type View = 'dashboard' | 'ai-assistant' | 
                   'telemedicine' | 'forum' | 'wearables' | 'price-comparison' | 
                   'mental-health' | 'health-plan' | 'predictive-analytics' | 
                   'genomic-analysis' | 'ai-insights' | 'favorites' | 'cart' | 
                   'resource-finder' | 'symptom-checker' |
                   'appointment-prep' | 'health-records' | 'emergency-mode' | 'medication-reminders' |
                   'profile' | 'asha-connect' | 'medical-camps' | 'family-hub' | 'health-schemes' |
                   'quick-communicate' | 'vitals' | 'medicine-identifier' | 'inclusive-bridge';

export type UserPersona = 'none' | 'blind' | 'deaf' | 'speech-impaired';

export type ConversationTask = 'none' | 'booking_flow' | 'confirm_navigation' | 'symptom_checking';

export interface AccessibilitySettings {
    persona: UserPersona;
    screenReaderMode: boolean;
    visualCuesMode: boolean;
    largeTextMode: boolean;
}

export interface ParsedVoiceCommand {
  intent: 'CHECK_SYMPTOMS' | 'FIND_RESOURCE' | 'NAVIGATE' | 'ADD_TO_CART' | 'COMPOUND_SYMPTOM_AND_RESOURCE' | 'IDENTIFY_MEDICINE' | 'CONFIRM' | 'UNKNOWN';
  entities: {
    symptom?: string;
    resource?: string;
    medicine?: string;
    view?: View;
    selection?: string;
  };
}

export interface PotentialCondition {
  name: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface Recommendation {
  action: string;
  urgency: 'Immediate' | 'Soon' | 'General';
}

export interface SymptomAnalysis {
  potentialConditions: PotentialCondition[];
  recommendations: Recommendation[];
  importantNote: string;
  suggestedSpecialty: string;
}

export interface HealthTipsResponse {
    tips: string[];
}

export interface AppointmentPrep {
    specialist: {
        type: string;
        reason: string;
    };
    questions: string[];
    symptomTips: string[];
}

export interface ForumPost {
    author: string;
    body: string;
    isOP?: boolean;
}

export interface ForumDiscussion {
    topic: string;
    posts: ForumPost[];
}

export interface WearableData {
    steps: number | string;
    sleepHours: number | string;
    restingHeartRate: number | string;
}

export interface WearableInsight {
    headline: string;
    detail: string;
    suggestion: string;
}

export interface HealthPlan {
    goal: string;
    diet: {
        summary: string;
        mealSuggestions: string[];
    };
    exercise: {
        summary: string;
        weeklyRoutine: string[];
    };
    wellbeing: {
        summary: string;
        practices: string[];
    };
}

export interface LifestyleData {
    age: number | string;
    lifestyleFactors: string[];
    familyHistory: string;
}

export interface HealthRisk {
    risk: string;
    explanation: string;
    preventionTips: string[];
    riskLevel: 'High' | 'Medium' | 'Low';
}
export interface PredictiveAnalysis {
    summary: string;
    potentialRisks: HealthRisk[];
}

export interface HolisticInsight {
    keyThemes: string[];
    potentialConnections: string[];
    gentleSuggestions: string[];
}

export interface GenomicMarkerExplanation {
    marker: string;
    gene: string;
    summary: string;
    reference_info: string;
}

export interface MedicalResource {
  id: string;
  name: string;
  address: string;
  type: 'Hospital' | 'Clinic' | 'Pharmacy';
  phone: string;
  distance: string;
  communityVerified: boolean;
  mapsUri?: string; // Grounding URL
}

export interface MedicineInfo {
    name: string;
    description: string;
    price: number;
    requiresPrescription: boolean;
}

export interface CartItem {
    medicine: MedicineInfo;
    quantity: number;
    forMemberId: string;
    forMemberName: string;
}

export interface EmergencyContact {
    id: string;
    name: string;
    relationship: string;
    phone: string;
}

export interface Doctor {
  id: string;
  name: string;
  availableSlots: string[];
}

export interface BookedAppointment {
    id: string;
    resource: MedicalResource;
    doctor: Doctor;
    specialty: string;
    date: string;
    time: string;
    forMemberId: string;
    forMemberName: string;
}

export interface PrescribedMedication {
    name: string;
    dosage: string;
    frequency: string;
    purpose: string;
}
  
export interface HealthRecordAnalysis {
    explanation: string;
    prescribedMedications: PrescribedMedication[];
}

export interface AppNotification {
    id: string;
    message: string;
    type: 'reminder' | 'alert' | 'medication';
    timestamp: number;
    read: boolean;
}

export interface MedicationReminderInfo {
    id: string;
    patientName: string;
    medicineName: string;
    dosage: string;
    time: string; // "HH:mm" format
    phone?: string;
}

export type JourneyStep = 
  | 'start'
  | 'symptom_input'
  | 'symptom_analysis'
  | 'resource_finder'
  | 'appointment_booking'
  | 'booking_confirmation'
  | 'prep_input'
  | 'appointment_prep'
  | 'record_upload'
  | 'record_analysis';

export interface AshaWorker {
    id: string;
    name: string;
    area: string;
    phone: string;
    availability: string;
}

export interface MedicalCamp {
    id: string;
    name: string;
    date: string;
    location: string;
    services: string[];
}

export interface FamilyMember {
    id: string;
    name: string;
    relationship: string;
    age: string;
    avatar: string; // emoji or identifier
}

export interface HealthSchemeInfo {
    schemeName: string;
    benefits: string[];
    eligibility: string[];
    applicationSteps: string[];
}

export interface VitalReading {
    type: 'BP' | 'Sugar' | 'HeartRate';
    value: string;
    timestamp: number;
    status: 'Normal' | 'High' | 'Low';
}
