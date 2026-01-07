import React from 'react';
import type { JourneyStep } from '../types';

interface JourneyStepperProps {
    currentStep: JourneyStep;
}

export const JourneyStepper: React.FC<JourneyStepperProps> = ({ currentStep }) => {
    
    // This mapping ensures that any internal journey step correctly highlights the appropriate visual step.
    const stepMapping: Record<JourneyStep, number> = {
        'start': -1,
        'symptom_input': 0,
        'symptom_analysis': 0,
        'resource_finder': 1,
        'appointment_booking': 2,
        'booking_confirmation': 2,
        'prep_input': 3,
        'appointment_prep': 3,
        'record_upload': 4,
        'record_analysis': 4,
    };
    
    const visualSteps = [
        { name: 'Symptoms' },
        { name: 'Find Care' },
        { name: 'Book' },
        { name: 'Prepare' },
        { name: 'Follow-up' },
    ];

    const currentIndex = stepMapping[currentStep] ?? -1;

    return (
        <nav aria-label="Progress">
            <ol role="list" className="flex items-center">
                {visualSteps.map((step, stepIdx) => (
                    <li key={step.name} className={`relative ${stepIdx !== visualSteps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                        {stepIdx < currentIndex ? (
                            <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="h-0.5 w-full bg-cyan-600" />
                                </div>
                                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-cyan-600">
                                    <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </>
                        ) : stepIdx === currentIndex ? (
                            <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="h-0.5 w-full bg-gray-200" />
                                </div>
                                <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-cyan-600 bg-white" aria-current="step">
                                    <span className="h-2.5 w-2.5 rounded-full bg-cyan-600" aria-hidden="true" />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="h-0.5 w-full bg-gray-200" />
                                </div>
                                <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white">
                                    <div className="h-2.5 w-2.5 rounded-full bg-transparent" />
                                </div>
                            </>
                        )}
                        <span className="absolute -bottom-6 text-xs text-center w-max -translate-x-1/2 left-1/2 font-medium text-gray-600">{step.name}</span>
                    </li>
                ))}
            </ol>
        </nav>
    );
};