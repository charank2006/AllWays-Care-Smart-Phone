
import React from 'react';
import type { SymptomAnalysis } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ResultDisplayProps {
  analysis: SymptomAnalysis;
}

const getSeverityClass = (severity: 'Low' | 'Medium' | 'High' | 'Critical') => {
  switch (severity) {
    case 'Low':
      return 'bg-green-100 text-green-800';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'High':
      return 'bg-orange-100 text-orange-800';
    case 'Critical':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
};

const getUrgencyClass = (urgency: 'Immediate' | 'Soon' | 'General') => {
    switch (urgency) {
      case 'Immediate':
        return 'border-red-500';
      case 'Soon':
        return 'border-orange-500';
      case 'General':
        return 'border-cyan-500';
      default:
        return 'border-slate-300';
    }
  };

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ analysis }) => {
  const { t } = useLanguage();
  return (
    <div className="mt-8 bg-white p-6 rounded-xl shadow-md border border-slate-200 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800 border-b border-slate-200 pb-3 mb-4">{t('symptomChecker.resultsTitle')}</h2>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-slate-700 mb-3">{t('symptomChecker.potentialConditions')}</h3>
        <div className="space-y-4">
          {analysis.potentialConditions.map((condition, index) => (
            <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex justify-between items-start">
                <h4 className="text-lg font-semibold text-cyan-800">{condition.name}</h4>
                <span className={`px-2.5 py-0.5 text-sm font-medium rounded-full ${getSeverityClass(condition.severity)}`}>
                  {t('symptomChecker.severity', { severity: condition.severity })}
                </span>
              </div>
              <p className="mt-1 text-slate-600">{condition.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold text-slate-700 mb-3">{t('symptomChecker.recommendations')}</h3>
        <ul className="space-y-3">
          {analysis.recommendations.map((rec, index) => (
            <li key={index} className={`flex items-start p-3 rounded-lg border-l-4 ${getUrgencyClass(rec.urgency)} bg-slate-50`}>
                <span className="font-bold text-slate-600 mr-2">{rec.urgency}:</span>
                <p className="text-slate-700">{rec.action}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
          <h4 className="font-bold text-amber-800">{t('symptomChecker.importantNote')}</h4>
          <p className="text-amber-700">{analysis.importantNote}</p>
      </div>

    </div>
  );
};
