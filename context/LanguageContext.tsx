
import React, { createContext, useState, useContext, ReactNode, useMemo, useCallback } from 'react';

export const languages = [
  { name: 'English', code: 'en', speechCode: 'en-US' },
  { name: 'हिन्दी', code: 'hi', speechCode: 'hi-IN' },
  { name: 'తెలుగు', code: 'te', speechCode: 'te-IN' },
  { name: 'தமிழ்', code: 'ta', speechCode: 'ta-IN' },
  { name: 'বাংলা', code: 'bn', speechCode: 'bn-IN' },
  { name: 'ಕನ್ನಡ', code: 'kn', speechCode: 'kn-IN' },
  { name: 'മലയാളം', code: 'ml', speechCode: 'ml-IN' },
  { name: 'ਪੰਜਾਬੀ', code: 'pa', speechCode: 'pa-IN' },
  { name: 'ગુજરાતી', code: 'gu', speechCode: 'gu-IN' },
  { name: 'मराठी', code: 'mr', speechCode: 'mr-IN' },
  { name: 'اردو', code: 'ur', speechCode: 'ur-IN' },
];

const translations: Record<string, Record<string, string>> = {
    en: {
        // Sidebar & Navigation
        'sidebar.dashboard': 'Dashboard',
        'sidebar.aiAssistant': 'AI Assistant',
        'sidebar.aiHealthAssistant': 'AI Health Assistant',
        'sidebar.symptomChecker': 'Symptom Checker',
        'sidebar.resourceFinder': 'Resource Finder',
        'sidebar.orderMedicine': 'Order Medicine',
        'sidebar.shoppingCart': 'Shopping Cart',
        'sidebar.myFavorites': 'Favorites',
        'sidebar.vitals': 'Vitals Monitor',
        'sidebar.medicineIdentifier': 'Medicine Identifier',
        'sidebar.medicationReminders': 'Reminders',
        'sidebar.healthRecords': 'Health Records',
        'sidebar.familyHub': 'Family Hub',
        'sidebar.appointmentPrep': 'Appointment Prep',
        'sidebar.ashaConnect': 'ASHA Connect',
        'sidebar.medicalCamps': 'Medical Camps',
        'sidebar.inclusiveBridge': 'Inclusive Bridge',
        'sidebar.personalizedPlan': 'Personalized Plan',
        'sidebar.predictiveAnalytics': 'Predictive Analytics',
        'sidebar.genomicAnalysis': 'Genomic Explainer',
        'sidebar.holisticInsights': 'AI Insights',
        'sidebar.telemedicine': 'Virtual Assistant',
        'sidebar.myProfile': 'My Profile',
        'sidebar.logout': 'Logout',
        'sidebar.communityForum': 'Community Forum',

        // Dashboard
        'dashboard.welcome': 'Welcome to AllWays Care',
        'dashboard.tagline': 'Your universal health companion, powered by Gemini 3.',
        'dashboard.essentialServices': 'Essential Services',
        'dashboard.personalManagement': 'Personal Management',
        'dashboard.aiAssistant.title': 'AI Health Assistant',
        'dashboard.aiAssistant.desc': 'Step-by-step guidance for your symptoms.',
        'dashboard.inclusiveBridge.title': 'Inclusive Bridge',
        'dashboard.inclusiveBridge.desc': 'Sign language and gesture support.',
        'dashboard.identifyPill.title': 'Identify Medicine',
        'dashboard.identifyPill.desc': 'Identify tablets via your camera.',
        'dashboard.orderMedicine.title': 'Order Medicine',
        'dashboard.orderMedicine.desc': 'Compare prices and buy medicine.',
        'dashboard.familyHub.title': 'Family Hub',
        'dashboard.familyHub.desc': 'Manage health profiles for your family.',
        'dashboard.vitals.title': 'Vitals Monitor',
        'dashboard.vitals.desc': 'Track BP, sugar, and heart rate.',
        'dashboard.reminders.title': 'Med Reminders',
        'dashboard.reminders.desc': 'Set alerts for your prescriptions.',
        'dashboard.records.title': 'Health Records',
        'dashboard.records.desc': 'AI analysis of your medical reports.',

        // Symptom Checker
        'symptomChecker.title': 'Symptom Checker',
        'symptomChecker.tagline': 'Describe how you feel for instant AI insights.',
        'symptomChecker.inputLabel': 'How are you feeling?',
        'symptomChecker.inputPlaceholder': 'e.g., I have a sharp pain in my chest...',
        'symptomChecker.buttonCheck': 'Analyze Symptoms',
        'symptomChecker.buttonAnalyzing': 'Analyzing...',
        'symptomChecker.resultsTitle': 'Analysis Results',
        'symptomChecker.potentialConditions': 'Potential Conditions',
        'symptomChecker.recommendations': 'Next Steps',
        'symptomChecker.importantNote': 'Important Note',
        'symptomChecker.loadingText': 'Gemini 3 is analyzing your symptoms...',
        'symptomChecker.errorEnterSymptoms': 'Please enter some symptoms.',
        'symptomChecker.errorAnalysis': 'Analysis failed. Please try again.',
        'symptomChecker.severity': 'Severity: {severity}',
        'symptomChecker.disclaimerTitle': 'Medical Disclaimer',
        'symptomChecker.disclaimerText': 'This is for info only. Not a medical diagnosis.',

        // Resource Finder
        'resourceFinder.tagline': 'Locate nearest hospitals and clinics.',
        'resourceFinder.placeholder': 'Search by name or specialty...',
        'resourceFinder.buttonSearch': 'Search',
        'resourceFinder.buttonSearching': 'Searching...',
        'resourceFinder.buttonNearMe': 'Near Me',
        'resourceFinder.buttonLocating': 'Locating...',
        'resourceFinder.distanceAway': '{distance} away',
        'resourceFinder.loadingText': 'Finding the best resources...',
        'resourceFinder.noResults.title': 'No results found',
        'resourceFinder.noResults.description': 'Try a different search term.',
        'resourceFinder.prompt': 'Find medical resources near you.',
        'resourceFinder.errorFetch': 'Could not fetch resources.',

        // AI Assistant Journey
        'aiAssistant.start.title': 'How can I help you today?',
        'aiAssistant.start.symptoms.title': 'Check Symptoms',
        'aiAssistant.start.symptoms.desc': 'Describe issues for a diagnosis.',
        'aiAssistant.start.record.title': 'Analyze Report',
        'aiAssistant.start.record.desc': 'Upload a medical document.',
        'aiAssistant.start.prep.title': 'Prepare for Visit',
        'aiAssistant.start.prep.desc': 'Get questions for your doctor.',
        'aiAssistant.startOver': 'Start Over',
        'aiAssistant.prep.title': 'Appointment Prep',
        'aiAssistant.prep.placeholder': 'What is the visit for?',
        'aiAssistant.prep.button': 'Prepare Me',

        // Medicine Identifier
        'medicineIdentifier.header.title': 'Medicine Scanner',
        'medicineIdentifier.header.desc': 'Snap a photo of any medicine to identify it.',
        'medicineIdentifier.status.offline': 'Camera Offline',
        'medicineIdentifier.scan.center': 'Center Tablet Here',
        'medicineIdentifier.scan.identifying': 'Identifying...',
        'medicineIdentifier.scan.button': 'Identify Tablet',
        'medicineIdentifier.scan.viewfinder': 'Viewfinder Active',
        'medicineIdentifier.result.usage': 'Main Usage',
        'medicineIdentifier.result.timing': 'Timing & Dosage',
        'medicineIdentifier.result.safety': 'Safety Warning',
        'medicineIdentifier.result.read': 'Read Aloud',
        'medicineIdentifier.result.dismiss': 'Dismiss',
        'medicineIdentifier.voice.ready': 'Voice Ready',
        'medicineIdentifier.voice.desc': 'Say "Identify this medicine"',
        'medicineIdentifier.cameraError': 'Camera access failed. Please ensure permissions are granted.',

        // Medicine Finder (Order)
        'medicineFinder.tagline': 'Find medicines and compare prices.',
        'medicineFinder.inputLabel': 'Medicine Name',
        'medicineFinder.placeholder': 'e.g., Paracetamol or Amoxicillin',
        'medicineFinder.buttonSearching': 'Searching...',
        'medicineFinder.buttonSearch': 'Search Pharmacy',
        'medicineFinder.loadingText': 'Fetching pharmacy data...',
        'medicineFinder.requiresPrescription': 'Requires Prescription',
        'medicineFinder.quantity': 'Quantity',
        'medicineFinder.addToCart': 'Add to Cart',
        'medicineFinder.addedToCart': 'Added to your cart!',
        'medicineFinder.viewCart': 'View Cart',
        'medicineFinder.errorNoInput': 'Please enter a medicine name.',
        'medicineFinder.errorFetch': 'Medicine not found or pharmacy offline.',

        // Health Records
        'healthRecords.title': 'Medical Records',
        'healthRecords.tagline': 'Securely store and analyze your reports.',
        'healthRecords.privacy.title': 'Privacy First',
        'healthRecords.privacy.text': 'Your reports are analyzed locally via AI.',
        'healthRecords.pastePlaceholder': 'Paste doctor notes here...',
        'healthRecords.uploadButton': 'Upload Image',
        'healthRecords.button.analyzing': 'Analyzing...',
        'healthRecords.button.analyze': 'Analyze Record',
        'healthRecords.loading': 'Processing document...',
        'healthRecords.results.title': 'Report Summary',
        'healthRecords.results.explanation': 'AI Explanation',
        'healthRecords.results.prescriptions': 'Prescribed Meds',
        'healthRecords.results.analyzeAnother': 'Analyze Another',

        // Family Hub
        'familyHub.title': 'Family Hub',
        'familyHub.tagline': 'Manage health profiles for your loved ones.',
        'familyHub.myProfile': 'My Profile',
        'familyHub.addMember': 'Add Family Member',
        'familyHub.add.title': 'New Profile',
        'familyHub.add.namePlaceholder': 'Full Name',
        'familyHub.add.relationshipPlaceholder': 'Relationship (e.g. Mother)',
        'familyHub.add.agePlaceholder': 'Age',
        'familyHub.add.chooseAvatar': 'Choose an Avatar',
        'familyHub.add.button': 'Create Profile',
        'familyHub.removeAria': 'Remove {name}',

        // Vitals
        'vitals.title': 'Health Monitor',
        'vitals.tagline': 'Track blood pressure and heart rate.',
        'vitals.status.Normal': 'Normal',
        'vitals.status.High': 'High',
        'vitals.status.Low': 'Low',

        // Rural Tools (ASHA, Camps, Schemes)
        'asha.title': 'ASHA Connect',
        'asha.tagline': 'Connect with your local community health worker.',
        'asha.search.label': 'Enter your District or Village',
        'asha.search.placeholder': 'e.g., Satara or Palghar',
        'asha.search.button': 'Find ASHA Workers',
        'asha.searching': 'Connecting...',
        'asha.myAsha.title': 'Your Connected Worker',
        'asha.availability': 'Available',
        'asha.connect.button': 'Connect Now',
        'asha.connected.button': 'Already Connected',
        'asha.noResults': 'No workers found in this area.',
        'camps.title': 'Medical Camps',
        'camps.tagline': 'Free health checkups in your vicinity.',
        'schemes.title': 'Govt. Health Schemes',
        'schemes.tagline': 'Check eligibility for medical benefits.',

        // Common & Cart
        'cart.total': 'Total Amount',
        'cart.checkoutButton': 'Proceed to Checkout',
        'cart.emptyTitle': 'Your cart is empty',
        'cart.emptyDescription': 'Search for medicines to add them here.',
        'cart.perUnit': 'per unit',
        'favorites.tagline': 'Your saved medical resources.',
        'favorites.emptyTitle': 'No favorites yet',
        'favorites.emptyDescription': 'Star hospitals to save them.',
        'common.loading': 'Loading...',
        'common.back': 'Back',
        'common.next': 'Next',
        'common.error': 'Error occurred.'
    },
    hi: {
        'sidebar.dashboard': 'डैशबोर्ड',
        'sidebar.aiAssistant': 'एआई सहायक',
        'sidebar.aiHealthAssistant': 'एआई स्वास्थ्य सहायक',
        'sidebar.symptomChecker': 'लक्षण परीक्षक',
        'sidebar.resourceFinder': 'संसाधन खोजें',
        'sidebar.orderMedicine': 'दवाई मंगवाएं',
        'sidebar.shoppingCart': 'शॉपिंग कार्ट',
        'sidebar.myFavorites': 'पसंदीदा',
        'sidebar.vitals': 'वाइटल्स मॉनिटर',
        'sidebar.medicineIdentifier': 'दवा पहचानकर्ता',
        'sidebar.medicationReminders': 'रिमाइंडर',
        'sidebar.healthRecords': 'स्वास्थ्य रिकॉर्ड',
        'sidebar.familyHub': 'फैमिली हब',
        'sidebar.appointmentPrep': 'अपॉइंटमेंट तैयारी',
        'sidebar.ashaConnect': 'आशा कनेक्ट',
        'sidebar.medicalCamps': 'मेडिकल कैंप',
        'sidebar.inclusiveBridge': 'इनक्लूसिव ब्रिज',
        'sidebar.personalizedPlan': 'व्यक्तिगत योजना',
        'sidebar.predictiveAnalytics': 'पूर्वानुमानित विश्लेषण',
        'sidebar.genomicAnalysis': 'जीनोमिक व्याख्याता',
        'sidebar.holisticInsights': 'एआई अंतर्दृष्टि',
        'sidebar.telemedicine': 'वर्चुअल सहायक',
        'sidebar.myProfile': 'मेरी प्रोफाइल',
        'sidebar.logout': 'लॉगआउट',
        'sidebar.communityForum': 'सामुदायिक मंच',

        'dashboard.welcome': 'AllWays Care में आपका स्वागत है',
        'dashboard.tagline': 'आपका सार्वभौमिक स्वास्थ्य साथी, जेमिनी 3 द्वारा संचालित।',
        'dashboard.essentialServices': 'आवश्यक सेवाएं',
        'dashboard.personalManagement': 'व्यक्तिगत प्रबंधन',
        'dashboard.aiAssistant.title': 'एआई स्वास्थ्य सहायक',
        'dashboard.aiAssistant.desc': 'आपके लक्षणों के लिए चरण-दर-चरण मार्गदर्शन।',
        'dashboard.vitals.title': 'वाइटल्स मॉनिटर',
        'dashboard.vitals.desc': 'बीपी, शुगर और हृदय गति को ट्रैक करें।',

        'symptomChecker.title': 'लक्षण परीक्षक',
        'symptomChecker.tagline': 'त्वरित एआई अंतर्दृष्टि के लिए बताएं कि आप कैसा महसूस करते हैं।',
        'symptomChecker.inputLabel': 'आप कैसा महसूस कर रहे हैं?',
        'symptomChecker.inputPlaceholder': 'जैसे, मेरे सीने में तेज़ दर्द है...',
        'symptomChecker.buttonCheck': 'लक्षणों का विश्लेषण करें',
        'symptomChecker.buttonAnalyzing': 'विश्लेषण किया जा रहा है...',
        'symptomChecker.resultsTitle': 'विश्लेषण परिणाम',
        'symptomChecker.potentialConditions': 'संभावित स्थितियां',
        'symptomChecker.recommendations': 'अगले कदम',

        'medicineFinder.tagline': 'दवाएं खोजें और कीमतों की तुलना करें।',
        'medicineFinder.placeholder': 'जैसे, पैरासिटामोल या अमोक्सिसिलिन',
        'medicineFinder.buttonSearch': 'फार्मेसी खोजें',
        'medicineFinder.loadingText': 'फार्मेसी डेटा प्राप्त किया जा रहा है...',

        'cart.total': 'कुल राशि',
        'cart.checkoutButton': 'चेकआउट के लिए आगे बढ़ें',
        'cart.emptyTitle': 'आपकी कार्ट खाली है',
        'favorites.loading': 'लोड हो रहा है...',
        'common.loading': 'लोड हो रहा है...',
        'common.back': 'पीछे',
        'common.next': 'आगे',
    },
    te: {
        'sidebar.dashboard': 'డ్యాష్‌బోర్డ్',
        'sidebar.aiAssistant': 'AI అసిస్టెంట్',
        'sidebar.aiHealthAssistant': 'AI హెల్త్ అసిస్టెంట్',
        'sidebar.symptomChecker': 'లక్షణాల తనిఖీ',
        'sidebar.resourceFinder': 'వనరుల శోధన',
        'sidebar.orderMedicine': 'మందులు ఆర్డర్ చేయండి',
        'sidebar.shoppingCart': 'షాపింగ్ కార్ట్',
        'sidebar.myFavorites': 'ఇష్టమైనవి',
        'sidebar.vitals': 'వైటల్స్ మానిటర్',
        'sidebar.medicationReminders': 'రిమైండర్లు',
        'dashboard.welcome': 'AllWays Care కి స్వాగతం',
        'dashboard.tagline': 'మీ సార్వత్రిక ఆరోగ్య సహచరుడు.',
        'common.loading': 'లోడ్ అవుతోంది...',
    },
    ta: {
        'sidebar.dashboard': 'டாஷ்போர்டு',
        'sidebar.aiAssistant': 'AI உதவியாளர்',
        'sidebar.aiHealthAssistant': 'AI சுகாதார உதவியாளர்',
        'sidebar.symptomChecker': 'அறிகுறி சரிபார்ப்பு',
        'sidebar.resourceFinder': 'ஆதாரக் கண்டுபிடிப்பான்',
        'sidebar.orderMedicine': 'மருந்து ஆர்டர் செய்யுங்கள்',
        'sidebar.shoppingCart': 'கூடை',
        'sidebar.myFavorites': 'பிடித்தவை',
        'sidebar.vitals': 'வைட்டல்ஸ் மானிட்டர்',
        'sidebar.medicationReminders': 'நினைவூட்டல்கள்',
        'dashboard.welcome': 'AllWays Care-க்கு வரவேற்கிறோம்',
        'dashboard.tagline': 'உங்கள் உலகளாவிய சுகாதாரத் துணை.',
        'common.loading': 'ஏற்றுகிறது...',
    }
};

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  langCode: string;
  speechCode: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState('English');
  const selectedLanguage = useMemo(() => languages.find(l => l.name === language) || languages[0], [language]);
  const langCode = selectedLanguage.code;
  const speechCode = selectedLanguage.speechCode;

  const t = useCallback((key: string, replacements: Record<string, string | number> = {}): string => {
    const languageTranslations = translations[langCode] || {};
    // Priority: Specific Language -> English Fallback -> Humanized Key
    let translation = languageTranslations[key] || translations.en[key];
    
    if (translation === undefined) {
        const parts = key.split('.');
        const lastPart = parts[parts.length - 1];
        translation = lastPart
            .replace(/([A-Z])/g, ' $1')
            .toLowerCase()
            .replace(/^./, (str) => str.toUpperCase());
    }
    
    Object.keys(replacements).forEach(placeholder => {
        translation = translation.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), String(replacements[placeholder]));
    });
    return translation;
  }, [langCode]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, langCode, speechCode }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
