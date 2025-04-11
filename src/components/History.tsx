import React from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Leaf, AlertTriangle, CheckCircle } from 'lucide-react';
import ResultsDisplay from './ResultsDisplay';

interface HistoryItem {
  id: string;
  date: string;
  imageUrl: string;
  cropName: string;
    diseaseDetected: boolean;
    diseaseName: string;
    confidencePercentage: number;
    results: {
        crop_name: string;
        disease_detected: boolean;
        disease_name: string;
        confidence_percentage: number;
        danger_level: number;
        symptoms: string[];
        treatments: string[];
        prevention_tips: string[];
        disease_description: string
    };
    diseaseName: string;
    confidencePercentage: number;
    
}

const History: React.FC = () => {
  const { t } = useTranslation();
  const [history, setHistory] = React.useState<HistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = React.useState<HistoryItem | null>(null);

  React.useEffect(() => {
    const savedHistory = localStorage.getItem('cropcare_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  if (selectedItem) {
    return (
      <div>
        <ResultsDisplay
          results={selectedItem.results}
          imageUrl={selectedItem.imageUrl}
          onReset={() => setSelectedItem(null)}
        />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">{t('history.noScans')}</h2>
        <p className="text-gray-500">{t('history.startScanning')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
        <Clock className="w-6 h-6 mr-2" />
        {t('history.title')}
      </h2>

      <div className="space-y-4">
        {history.map((item) => (
          <div
            key={item.id}
            className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => setSelectedItem(item)}
          >
            <div className="flex-shrink-0 w-16 h-16 relative">
              <img
                src={item.imageUrl}
                alt={item.cropName}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="flex-grow">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Leaf className="w-4 h-4 mr-2 text-green-600" />
                  {item.cropName}
                </h3>
                {item.diseaseDetected ? (
                  <span className="flex items-center text-red-600">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {t('results.diseased')}
                  </span>
                ) : (
                  <span className="flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {t('results.healthy')}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">{item.date}</p>
              {item.diseaseDetected && (
                <p className="text-sm text-gray-700 mt-1">{item.diseaseName}</p>
              )}
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${
                      item.diseaseDetected ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${item.confidencePercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;