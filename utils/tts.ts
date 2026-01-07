
/**
 * Global reference to the current utterance to prevent it from being garbage collected
 * which is a common cause of SpeechSynthesis stopping mid-sentence in some browsers.
 */
let currentUtterance: SpeechSynthesisUtterance | null = null;

/**
 * Uses the browser's SpeechSynthesis API to speak a given text aloud.
 */
export const speak = (text: string, lang: string, onEnd?: () => void): void => {
  if (!('speechSynthesis' in window)) {
    console.warn('Text-to-speech is not supported.');
    return;
  }

  // 1. Force clear and resume the engine
  // Browsers often "pause" speech if it's not used for a while.
  window.speechSynthesis.cancel();
  window.speechSynthesis.resume();

  // 2. Short delay to allow the hardware to initialize
  setTimeout(() => {
    const cleanText = text
      .replace(/[\u1F600-\u1F64F]|[\u2700-\u27BF]|[\u1F300-\u1F5FF]|[\u1F680-\u1F6FF]|[\u2600-\u26FF]/g, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/###/g, "")
      .replace(/\n/g, ". ");

    currentUtterance = new SpeechSynthesisUtterance(cleanText);
    currentUtterance.lang = lang;
    currentUtterance.rate = 1.0;
    currentUtterance.pitch = 1.0;
    currentUtterance.volume = 1.0;
    
    if (onEnd) {
      currentUtterance.onend = () => {
        currentUtterance = null;
        onEnd();
      };
      // Error handling to prevent hanging UI
      currentUtterance.onerror = (e) => {
        console.error("TTS Error:", e);
        currentUtterance = null;
        onEnd();
      };
    }
    
    window.speechSynthesis.speak(currentUtterance);
    
    // Safety check: ensure engine doesn't hang
    const checkInterval = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
            clearInterval(checkInterval);
            return;
        }
    }, 500);

    // Auto-timeout for long utterances to prevent permanent lock
    setTimeout(() => {
        if (window.speechSynthesis.speaking && currentUtterance) {
            window.speechSynthesis.cancel();
            if (onEnd) onEnd();
        }
    }, 45000); 

  }, 50);
};

export const stopSpeaking = (): void => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        currentUtterance = null;
    }
};
