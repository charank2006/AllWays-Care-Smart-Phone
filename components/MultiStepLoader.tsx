import React, { useState, useEffect } from 'react';

const CheckCircleIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

const SpinnerIcon: React.FC = () => (
    <div className="w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
);

const CircleIcon: React.FC = () => (
    <div className="w-5 h-5 border-2 border-slate-300 rounded-full"></div>
);


interface MultiStepLoaderProps {
  steps: string[];
  loadingText: string;
  stepDuration?: number;
}

export const MultiStepLoader: React.FC<MultiStepLoaderProps> = ({ steps, loadingText, stepDuration = 1500 }) => {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep(prevStep => {
                if (prevStep < steps.length - 1) {
                    return prevStep + 1;
                }
                // Optional: loop back to the start if it takes too long
                // return 0; 
                return prevStep; // Stay on the last step
            });
        }, stepDuration);

        return () => clearInterval(interval);
    }, [steps.length, stepDuration]);

    return (
        <div className="flex flex-col items-center justify-center my-8 text-center bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-700">{loadingText}</h3>
            <div className="mt-4 w-full max-w-sm space-y-3 text-left">
                {steps.map((step, index) => (
                     <div key={index} className="flex items-center gap-3">
                        <div className="w-5 h-5 flex-shrink-0">
                           {index < currentStep ? <CheckCircleIcon /> : index === currentStep ? <SpinnerIcon /> : <CircleIcon />}
                        </div>
                        <span className={`transition-colors ${index > currentStep ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
                            {step}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};