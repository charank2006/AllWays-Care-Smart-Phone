
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { SymptomAnalysis, AppointmentPrep, ForumDiscussion, WearableData, WearableInsight, HealthPlan, LifestyleData, PredictiveAnalysis, HolisticInsight, GenomicMarkerExplanation, MedicalResource, MedicineInfo, Doctor, HealthRecordAnalysis, ParsedVoiceCommand, View, AshaWorker, MedicalCamp, HealthSchemeInfo, HealthTipsResponse } from '../types';

/**
 * Helper to get a fresh Gemini instance with the current API Key.
 * Uses a safe check for process.env to avoid ReferenceErrors on some localhost setups.
 */
const getAi = () => {
    const env = (typeof process !== 'undefined') ? process.env : (window as any).process?.env;
    const apiKey = env?.API_KEY;
    if (!apiKey) {
        console.warn("Gemini API Key is missing from process.env.API_KEY. AI features will fail.");
    }
    return new GoogleGenAI({ apiKey: apiKey || '' });
};

const modelPro = "gemini-3-pro-preview";
const modelFlash = "gemini-3-flash-preview";
const modelMaps = "gemini-2.5-flash"; 

function extractJson(text: string | undefined): any {
    if (!text) return null;
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    try {
        return JSON.parse(cleaned);
    } catch (error) {
        const start = cleaned.indexOf('{');
        const end = cleaned.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
            try {
                return JSON.parse(cleaned.substring(start, end + 1));
            } catch (e) {
                console.error("JSON extraction failed:", cleaned);
            }
        }
        return null;
    }
}

const validViews: View[] = [
    'dashboard', 'ai-assistant', 'telemedicine', 'forum', 'wearables', 
    'price-comparison', 'mental-health', 'health-plan', 'predictive-analytics', 
    'genomic-analysis', 'ai-insights', 'favorites', 'cart', 
    'resource-finder', 'symptom-checker', 'appointment-prep', 'health-records', 
    'asha-connect', 'medical-camps', 'medicine-identifier', 'vitals', 'inclusive-bridge'
];

export const analyzeSymptoms = async (symptoms: string, language: string): Promise<SymptomAnalysis> => {
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({ 
        model: modelPro, 
        contents: `Analyze symptoms: "${symptoms}". Respond in ${language}.`, 
        config: { 
            systemInstruction: `You are a clinical diagnostic assistant. 
            Keep 'severity' enum values exactly as: 'Low', 'Medium', 'High', or 'Critical'. 
            Keep 'urgency' enum values exactly as: 'Immediate', 'Soon', or 'General'.
            Translate names and descriptions into ${language}. 
            Output ONLY valid JSON.`,
            responseMimeType: "application/json", 
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    potentialConditions: { 
                        type: Type.ARRAY, 
                        items: { 
                            type: Type.OBJECT, 
                            properties: { 
                                name: { type: Type.STRING }, 
                                description: { type: Type.STRING }, 
                                severity: { type: Type.STRING, enum: ['Low', 'Medium', 'High', 'Critical'] } 
                            }, 
                            required: ["name", "description", "severity"] 
                        } 
                    },
                    recommendations: { 
                        type: Type.ARRAY, 
                        items: { 
                            type: Type.OBJECT, 
                            properties: { 
                                action: { type: Type.STRING }, 
                                urgency: { type: Type.STRING, enum: ['Immediate', 'Soon', 'General'] } 
                            }, 
                            required: ["action", "urgency"] 
                        } 
                    },
                    importantNote: { type: Type.STRING },
                    suggestedSpecialty: { type: Type.STRING }
                },
                required: ["potentialConditions", "recommendations", "importantNote", "suggestedSpecialty"]
            }
        } 
    });
    
    const result = extractJson(response.text);
    if (!result) throw new Error("AI returned invalid data format.");
    return result;
  } catch (error) { 
    console.error("AI Analysis Error:", error);
    throw new Error("Unable to analyze symptoms. Please check your internet connection."); 
  }
};

/**
 * Uses Gemini 2.5 Flash for Google Maps Grounding.
 * Prohibited from using responseMimeType when tools are active.
 */
export const findMedicalResources = async (query: string, language: string, latitude?: number, longitude?: number): Promise<MedicalResource[]> => {
    const ai = getAi();
    try {
        const response = await ai.models.generateContent({ 
            model: modelMaps, 
            contents: `Find medical facilities for: "${query}". Respond in ${language}.`, 
            config: { 
                tools: [{ googleMaps: {} }],
                toolConfig: { 
                    retrievalConfig: { 
                        latLng: (latitude !== undefined && longitude !== undefined) ? { latitude, longitude } : undefined 
                    } 
                }
            } 
        });

        // Extract grounding metadata chunks as strictly required by instructions
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        
        const resources: MedicalResource[] = chunks
            .filter((c: any) => c.maps)
            .map((c: any, index: number) => {
                const mapData = c.maps;
                return {
                    id: `map-${index}`,
                    name: mapData.title || "Medical Facility",
                    address: mapData.address || "Address in Maps link",
                    type: 'Clinic', // Defaulting type
                    phone: "Check Maps listing",
                    distance: latitude ? "Nearby" : "Location unknown",
                    communityVerified: true,
                    mapsUri: mapData.uri
                };
            });

        // If no grounding chunks, the AI might have just described things in text
        if (resources.length === 0 && response.text) {
            console.log("No specific grounding chunks found, AI text only.");
        }

        return resources;
    } catch (error) { 
        console.error("Maps Grounding Error:", error);
        return [];
    }
};

export const parseVoiceCommand = async (transcript: string, language: string): Promise<ParsedVoiceCommand & { autonomousAction: string }> => {
    const prompt = `Intent: "${transcript}". Lang: ${language}.`;
    try {
        const response = await getAi().models.generateContent({ 
            model: modelFlash, 
            contents: prompt, 
            config: { 
                systemInstruction: `Map input to intents. Views: ${validViews.join(', ')}.`,
                responseMimeType: "application/json", 
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        intent: { type: Type.STRING, enum: ['CHECK_SYMPTOMS', 'FIND_RESOURCE', 'NAVIGATE', 'ADD_TO_CART', 'IDENTIFY_MEDICINE', 'CONFIRM', 'UNKNOWN'] },
                        entities: { type: Type.OBJECT, properties: { symptom: { type: Type.STRING }, resource: { type: Type.STRING }, medicine: { type: Type.STRING }, view: { type: Type.STRING } } },
                        autonomousAction: { type: Type.STRING }
                    },
                    required: ["intent", "entities", "autonomousAction"]
                }
            } 
        });
        return extractJson(response.text) || { intent: 'UNKNOWN', entities: {}, autonomousAction: "I'm not sure how to help with that." };
    } catch (error) {
        return { intent: 'UNKNOWN', entities: {}, autonomousAction: "Connection lost." };
    }
};

export const identifyMedicineFromImage = async (base64Image: string, language: string): Promise<any> => {
    try {
        const response = await getAi().models.generateContent({ 
            model: modelFlash,
            contents: { parts: [{ text: `Identify medicine in ${language}.` }, { inlineData: { mimeType: 'image/jpeg', data: base64Image } }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        detected: { type: Type.BOOLEAN },
                        name: { type: Type.STRING },
                        details: { type: Type.STRING },
                        usage: { type: Type.STRING },
                        safety: { type: Type.STRING },
                        timing: { type: Type.STRING }
                    },
                    required: ["detected", "name", "details", "usage", "safety", "timing"]
                }
            }
        });
        return extractJson(response.text) || { detected: false };
    } catch (error) { 
        throw new Error("Pill ID failed."); 
    }
};

export const createHealthChatSession = (language: string): Chat => {
    return getAi().chats.create({ 
        model: modelFlash, 
        config: { systemInstruction: `Assistant for AllWays Care. Language: ${language}.` } 
    });
};

export const rephraseMessage = async (text: string, language: string): Promise<string> => {
    try {
        const response = await getAi().models.generateContent({ 
            model: modelFlash, 
            contents: `Rephrase for clinical clarity: "${text}". Language: ${language}.` 
        });
        return response.text || text;
    } catch (error) { return text; }
};

export const getEmergencyAdvice = async (topic: string, language: string): Promise<string> => {
    const response = await getAi().models.generateContent({ 
        model: modelFlash, 
        contents: `First-aid for ${topic} in ${language}.` 
    });
    return response.text || "Seek medical help.";
};

export const generateForumDiscussion = async (topic: string, language: string): Promise<ForumDiscussion> => {
    const response = await getAi().models.generateContent({ 
        model: modelFlash, 
        contents: `Simulate forum: ${topic} in ${language}.`, 
        config: { 
            responseMimeType: "application/json", 
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    topic: { type: Type.STRING },
                    posts: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { author: { type: Type.STRING }, body: { type: Type.STRING }, isOP: { type: Type.BOOLEAN } }, required: ["author", "body"] } }
                }
            }
        } 
    });
    return extractJson(response.text) || { topic, posts: [] };
};

export const analyzeWearableData = async (data: WearableData, language: string): Promise<WearableInsight> => {
    const response = await getAi().models.generateContent({ 
        model: modelFlash, 
        contents: `Analyze steps: ${data.steps}, sleep: ${data.sleepHours} in ${language}.`, 
        config: { 
            responseMimeType: "application/json", 
            responseSchema: {
                type: Type.OBJECT,
                properties: { headline: { type: Type.STRING }, detail: { type: Type.STRING }, suggestion: { type: Type.STRING } },
                required: ["headline", "detail", "suggestion"]
            }
        } 
    });
    return extractJson(response.text) || { headline: "Status", detail: "Active", suggestion: "Keep it up!" };
};

export const analyzeHealthRecord = async (recordText: string, language: string, image?: {data: string, mimeType: string}): Promise<HealthRecordAnalysis> => {
    let contents: any = image ? { parts: [{ text: `Analyze report in ${language}.` }, { inlineData: { mimeType: image.mimeType, data: image.data } }] } : { parts: [{ text: `Analyze report: ${recordText} in ${language}.` }] };
    const response = await getAi().models.generateContent({ 
        model: modelPro, 
        contents, 
        config: { 
            responseMimeType: "application/json", 
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    explanation: { type: Type.STRING },
                    prescribedMedications: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, dosage: { type: Type.STRING }, frequency: { type: Type.STRING }, purpose: { type: Type.STRING } }, required: ["name", "dosage", "frequency"] } }
                },
                required: ["explanation", "prescribedMedications"]
            }
        } 
    });
    return extractJson(response.text) || { explanation: "No record found.", prescribedMedications: [] };
};

export const getAppointmentPrep = async (concern: string, language: string): Promise<AppointmentPrep> => {
    const response = await getAi().models.generateContent({ 
        model: modelFlash, 
        contents: `Prep guide for ${concern} in ${language}.`, 
        config: { 
            responseMimeType: "application/json", 
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    specialist: { type: Type.OBJECT, properties: { type: { type: Type.STRING }, reason: { type: Type.STRING } }, required: ["type", "reason"] },
                    questions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    symptomTips: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["specialist", "questions", "symptomTips"]
            }
        } 
    });
    return extractJson(response.text);
};

export const getMedicineInfo = async (medicine: string, language: string): Promise<MedicineInfo> => {
    const response = await getAi().models.generateContent({ 
        model: modelFlash, 
        contents: `Info for ${medicine} in ${language}.`, 
        config: { 
            responseMimeType: "application/json", 
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    price: { type: Type.NUMBER },
                    requiresPrescription: { type: Type.BOOLEAN }
                },
                required: ["name", "description", "price", "requiresPrescription"]
            }
        } 
    });
    return extractJson(response.text);
};

export const getMentalHealthSupport = async (promptText: string, language: string): Promise<string> => {
    const response = await getAi().models.generateContent({ model: modelPro, contents: `Support for "${promptText}" in ${language}.` });
    return response.text || "I'm listening.";
};

export const getPersonalizedPlan = async (goal: string, preferences: string, language: string): Promise<HealthPlan> => {
    const response = await getAi().models.generateContent({ 
        model: modelFlash, 
        contents: `Plan for ${goal} in ${language}.`, 
        config: { 
            responseMimeType: "application/json", 
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    goal: { type: Type.STRING },
                    diet: { type: Type.OBJECT, properties: { summary: { type: Type.STRING }, mealSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["summary", "mealSuggestions"] },
                    exercise: { type: Type.OBJECT, properties: { summary: { type: Type.STRING }, weeklyRoutine: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["summary", "weeklyRoutine"] },
                    wellbeing: { type: Type.OBJECT, properties: { summary: { type: Type.STRING }, practices: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["summary", "practices"] }
                },
                required: ["goal", "diet", "exercise", "wellbeing"]
            }
        } 
    });
    return extractJson(response.text);
};

export const getPredictiveAnalysis = async (data: LifestyleData, language: string): Promise<PredictiveAnalysis> => {
    const response = await getAi().models.generateContent({ 
        model: modelPro, 
        contents: `Analysis: Age ${data.age} in ${language}.`, 
        config: { 
            responseMimeType: "application/json", 
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    summary: { type: Type.STRING },
                    potentialRisks: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { risk: { type: Type.STRING }, explanation: { type: Type.STRING }, preventionTips: { type: Type.ARRAY, items: { type: Type.STRING } }, riskLevel: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] } }, required: ["risk", "explanation", "preventionTips", "riskLevel"] } }
                }
            }
        } 
    });
    return extractJson(response.text);
};

export const explainGenomicData = async (data: string, language: string): Promise<GenomicMarkerExplanation> => {
    const response = await getAi().models.generateContent({ 
        model: modelPro, 
        contents: `Genomics: ${data} in ${language}.`, 
        config: { 
            responseMimeType: "application/json", 
            responseSchema: {
                type: Type.OBJECT,
                properties: { marker: { type: Type.STRING }, gene: { type: Type.STRING }, summary: { type: Type.STRING }, reference_info: { type: Type.STRING } },
                required: ["marker", "gene", "summary", "reference_info"]
            }
        } 
    });
    return extractJson(response.text);
};

export const getHolisticInsights = async (journalEntry: string, language: string): Promise<HolisticInsight> => {
    const response = await getAi().models.generateContent({ 
        model: modelFlash, 
        contents: `Insights: ${journalEntry} in ${language}.`, 
        config: { 
            responseMimeType: "application/json", 
            responseSchema: {
                type: Type.OBJECT,
                properties: { keyThemes: { type: Type.ARRAY, items: { type: Type.STRING } }, potentialConnections: { type: Type.ARRAY, items: { type: Type.STRING } }, gentleSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } } },
                required: ["keyThemes", "potentialConnections", "gentleSuggestions"]
            }
        } 
    });
    return extractJson(response.text);
};

export const getAvailableDoctors = async (specialty: string, resourceName: string, date: string, language: string): Promise<Doctor[]> => {
    const response = await getAi().models.generateContent({ 
        model: modelFlash, 
        contents: `Doctors: ${specialty} at ${resourceName} in ${language}.`, 
        config: { 
            responseMimeType: "application/json", 
            responseSchema: {
                type: Type.OBJECT,
                properties: { doctors: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, name: { type: Type.STRING }, availableSlots: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["id", "name", "availableSlots"] } } }
            }
        } 
    });
    return extractJson(response.text)?.doctors || [];
};

export const findAshaWorkers = async (area: string, language: string): Promise<AshaWorker[]> => {
    const response = await getAi().models.generateContent({ 
        model: modelFlash, 
        contents: `ASHA: ${area} in ${language}.`, 
        config: { 
            responseMimeType: "application/json", 
            responseSchema: {
                type: Type.OBJECT,
                properties: { workers: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, name: { type: Type.STRING }, area: { type: Type.STRING }, phone: { type: Type.STRING }, availability: { type: Type.STRING } }, required: ["id", "name", "area", "phone", "availability"] } } }
            }
        } 
    });
    return extractJson(response.text)?.workers || [];
};

export const getMedicalCamps = async (area: string, language: string): Promise<MedicalCamp[]> => {
    const response = await getAi().models.generateContent({ 
        model: modelFlash, 
        contents: `Camps: ${area} in ${language}.`, 
        config: { 
            responseMimeType: "application/json", 
            responseSchema: {
                type: Type.OBJECT,
                properties: { camps: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, name: { type: Type.STRING }, date: { type: Type.STRING }, location: { type: Type.STRING }, services: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["id", "name", "date", "location", "services"] } } }
            }
        } 
    });
    return extractJson(response.text)?.camps || [];
};

export const getHealthSchemeInfo = async (userProfile: { age: string }, schemeName: string, language: string): Promise<HealthSchemeInfo> => {
    const response = await getAi().models.generateContent({ 
        model: modelFlash, 
        contents: `Benefits: ${schemeName} in ${language}.`, 
        config: { 
            responseMimeType: "application/json", 
            responseSchema: {
                type: Type.OBJECT,
                properties: { schemeName: { type: Type.STRING }, benefits: { type: Type.ARRAY, items: { type: Type.STRING } }, eligibility: { type: Type.ARRAY, items: { type: Type.STRING } }, applicationSteps: { type: Type.ARRAY, items: { type: Type.STRING } } },
                required: ["schemeName", "benefits", "eligibility", "applicationSteps"]
            }
        } 
    });
    return extractJson(response.text);
};

export const getHealthTips = async (language: string): Promise<HealthTipsResponse> => {
    try {
        const response = await getAi().models.generateContent({
            model: modelFlash,
            contents: `5 Tips in ${language}.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: { tips: { type: Type.ARRAY, items: { type: Type.STRING } } },
                    required: ["tips"]
                }
            }
        });
        return extractJson(response.text) || { tips: ["Stay hydrated."] };
    } catch (e) {
        return { tips: ["Consult a professional."] };
    }
};
