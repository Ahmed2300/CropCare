import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';

interface ResultsProps {
  results: {
    crop_name: string;
    disease_detected: boolean;
    disease_name: string;
    confidence_percentage: number;
    danger_level: number;
    symptoms: string[];
    treatments: string[];
    prevention_tips: string[];
    disease_description: string;
  };
  imageUrl: string;
  onReset: () => void;
}

const ResultsDisplay: React.FC<ResultsProps> = ({ results, imageUrl, onReset }) => {
  const { t } = useTranslation();
  const currentDate = new Date().toLocaleString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });

  return (
    // Use standard rounding and shadow, adjust bottom margin
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8"> 
      {/* Header Image Section - Keep relative height */}
      <div className="relative h-64"> 
        <img 
          src={imageUrl} 
          alt={results.crop_name}
          className="w-full h-full object-cover"
        />
         {/* Slightly stronger gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/70" />
        <div className="absolute bottom-0 left-0 p-6 text-white">
           {/* Use heading font, slightly smaller size */}
          <h1 className="text-3xl font-heading font-bold mb-1">{results.crop_name}</h1> 
           {/* Lighter text for date */}
          <p className="text-sm text-gray-200">{currentDate}</p> 
        </div>
        <div className="absolute top-4 right-4"> 
           {/* Use primary color for healthy */}
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${ 
            results.disease_detected 
              ? 'bg-red-500 text-white' 
              : 'bg-primary text-white' 
          }`}>
            {results.disease_detected ? t('results.diseased') : t('results.healthy')}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <div className="mb-8">
           {/* Use heading font, secondary color */}
          <h2 className="text-2xl font-heading font-semibold text-secondary mb-4"> 
            {results.disease_detected ? t('results.diseaseDetected') : t('results.analysisResults')}
          </h2>
           {/* Use heading font, base text color */}
          <h3 className="text-xl font-heading font-medium text-base-text mb-2"> 
            {results.disease_detected ? results.disease_name : t('results.noneDetected')}
          </h3>
           {/* Use subtle text color */}
          <p className="text-subtle-text mb-6 leading-relaxed">{results.disease_description}</p> 

          {/* Confidence and Danger Level Bars */}
          <div className="space-y-5"> 
            <div>
              <div className="flex justify-between mb-1">
                 {/* Use base text color */}
                <span className="text-sm font-medium text-base-text">{t('results.confidence')}</span> 
                 {/* Use base text color */}
                <span className="text-sm font-medium text-base-text">{results.confidence_percentage}%</span> 
              </div>
               {/* Use lighter background for bar */}
              <div className="h-2 bg-gray-100 rounded-full"> 
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${results.confidence_percentage}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                 {/* Use base text color */}
                <span className="text-sm font-medium text-base-text">{t('results.dangerLevel')}</span> 
                 {/* Use base text color */}
                <span className="text-sm font-medium text-base-text">{results.danger_level}%</span> 
              </div>
               {/* Use lighter background for bar */}
              <div className="h-2 bg-gray-100 rounded-full"> 
                <div
                  className={`h-2 rounded-full ${ 
                    results.disease_detected ? 'bg-red-500' : 'bg-gray-300' 
                  }`}
                  style={{ width: `${results.danger_level}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {results.disease_detected && (
          <>
            {/* Symptoms Section */}
            <div className="mb-6">
               {/* Use heading font, base text color */}
              <h4 className="text-lg font-heading font-medium text-base-text mb-3">{t('results.symptoms')}</h4> 
              <ul className="space-y-2">
                {results.symptoms.map((symptom, index) => (                   
                <li key={`symptom-${index}`} className="flex items-start text-subtle-text">
                   {/* Use subtle text color */}
                  <li key={`symptom-${index}`} className="flex items-start text-subtle-text">
                    {/* Use accent color for bullet */}                   
                   
                    <span className="w-1.5 h-1.5 bg-accent rounded-full mr-3 mt-1 flex-shrink-0"></span>
                    {symptom}
                  </li>
                </li>))}
              </ul>
            </div>

            {/* Treatments Section */}
            <div className="mb-6">
               {/* Use heading font, base text color */}
              <h4 className="text-lg font-heading font-medium text-base-text mb-3">{t('results.treatments')}</h4> 
              <ul className="space-y-2">
                {results.treatments.map((treatment, index) => (                   
                <li key={`treatment-${index}`} className="flex items-start text-subtle-text">
                   {/* Use subtle text color */}
                  <li key={`treatment-${index}`} className="flex items-start text-subtle-text">
                    {/* Use primary color for bullet */}
                   
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mr-3 mt-1 flex-shrink-0"></span>
                    {treatment}
                  </li>
                </li>))}
              </ul>
            </div>
          </>
        )}

        {/* Prevention Tips Section */}
        <div className="mb-6">
           {/* Use heading font, base text color */}
          <h4 className="text-lg font-heading font-medium text-base-text mb-3">{t('results.preventionTips')}</h4> 
          <ul className="space-y-2">
            {results.prevention_tips.map((tip, index) => (                   
              <li key={`prevention-${index}`} className="flex items-start text-subtle-text">
               {/* Use subtle text color */}
              <li key={`prevention-${index}`} className="flex items-start text-subtle-text">
                 {/* Use secondary color for bullet */}
                
                <span className="w-1.5 h-1.5 bg-secondary rounded-full mr-3 mt-1 flex-shrink-0"></span> 
                {tip}
              </li>
            </li>))}
          </ul>
        </div>

        {/* Back Button - Use theme colors, consistent style */}
        <button
          onClick={onReset}
          className="mt-6 inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2 -ml-1" /> 
          {t('results.analyzeAnother')}
        </button>
      </div>
    </div>
  );
};

export default ResultsDisplay;
