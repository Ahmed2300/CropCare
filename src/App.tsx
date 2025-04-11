import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, History as HistoryIcon, Settings as SettingsIcon, User } from 'lucide-react';
import ImageUpload from './components/ImageUpload';
import ResultsDisplay from './components/ResultsDisplay';
import Settings from './components/Settings';
import History from './components/History';
import SplashScreen from './components/SplashScreen';
import DeveloperInfo from './components/DeveloperInfo';
import { analyzeImage } from './lib/gemini';
import './i18n';

interface Location {
  latitude: number;
  longitude: number;
}

interface ScanResult {
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
    disease_description: string;
  };
}

function App() {
  const { t } = useTranslation();
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'scan' | 'history' | 'settings' | 'developer'>('scan');
  const [location, setLocation] = useState<Location | null>(null);
  const [showSplash, setShowSplash] = useState(true);

  const handleLocationToggle = async (enabled: boolean) => {
    if (enabled) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      } catch (error) {
        console.error('Location access denied:', error);
        setLocation(null);
      }
    } else {
      setLocation(null);
    }
  };

  const saveToHistory = (imageBase64: string, results: ScanResult['results']) => {
    const historyItem: ScanResult = {
      id: crypto.randomUUID(),
      date: new Date().toLocaleString(),
      imageUrl: imageBase64,
      cropName: results.crop_name,
      diseaseDetected: results.disease_detected,
      diseaseName: results.disease_name,
      confidencePercentage: results.confidence_percentage,
      results
    };

    const savedHistory = localStorage.getItem('cropcare_history');
    const history = savedHistory ? JSON.parse(savedHistory) : [];
    history.unshift(historyItem);
    localStorage.setItem('cropcare_history', JSON.stringify(history.slice(0, 50))); // Keep last 50 items
  };

  const handleImageAnalysis = async (imageData: string | File) => {
    setAnalyzing(true);
    setError(null);
    
    let base64Image = '';
    if (imageData instanceof File) {
      base64Image = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(imageData);
      });
    } else {
      base64Image = imageData;
    }
    
    setCurrentImage(base64Image);

    try {
      const analysisResults = await analyzeImage(base64Image, t('language'), location || undefined);
      setResults(analysisResults);
      saveToHistory(base64Image, analysisResults);
    } catch (error) {
      console.error('Error analyzing image:', error);
      setError(t('error.analysis'));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setCurrentImage(null);
    setError(null);
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    // Use new background, add padding-bottom for nav bar space
    <div className="min-h-screen bg-light-bg pb-24"> 
      {/* Add more vertical padding to main */}
      <main className="container mx-auto px-4 py-8 md:py-12"> 
        {/* Keep max-width constraint */}
        <div className="max-w-3xl mx-auto"> 
          {currentView === 'scan' && (
            <>
              {!analyzing && !results && (
                // Apply new theme styles to the card
                <div className="bg-white rounded-xl shadow-md p-6"> 
                  <ImageUpload onImageSelected={handleImageAnalysis} />
                  {error && (
                    // Keep error color distinct
                    <p className="mt-4 text-red-600 text-center font-medium">{error}</p> 
                  )}
                </div>
              )}

              {analyzing && (
                 // Use light-bg for overlay consistency
                <div className="fixed inset-0 bg-light-bg flex flex-col items-center justify-center z-50 p-4">
                  <div className="w-full max-w-md">
                    {currentImage && (
                      // Use standard rounding and shadow
                      <div className="relative rounded-xl overflow-hidden shadow-lg mb-6"> 
                        <img 
                          src={currentImage} 
                          alt="Analyzing" 
                          // Maintain aspect ratio, maybe not square? Let's try aspect-video or aspect-[3/4]
                          className="w-full aspect-[3/4] object-cover" 
                        />
                        {/* Slightly darker overlay */}
                        <div className="absolute inset-0 bg-black/30" /> 
                        <div className="absolute inset-0 flex items-center justify-center p-4">
                           {/* Use white background for the progress indicator box */}
                          <div className="w-full max-w-[80%] bg-white rounded-lg p-4 shadow-md"> 
                             {/* Use primary color for progress bar */}
                            <div className="w-full bg-primary/20 rounded-full h-2 overflow-hidden"> 
                              <div className="h-full bg-primary animate-[scan_2s_ease-in-out_infinite]" /> 
                            </div>
                             {/* Use base text color */}
                            <p className="text-center mt-3 text-base-text font-medium"> 
                              {t('app.analyzing')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {results && !analyzing && currentImage && (
                <ResultsDisplay 
                  results={results}
                  imageUrl={currentImage}
                  onReset={handleReset}
                />
              )}
            </>
          )}

          {currentView === 'history' && <History />}
          {currentView === 'settings' && <Settings onLocationToggle={handleLocationToggle} />}
          {currentView === 'developer' && <DeveloperInfo />}

          {/* Navigation - Add top shadow, adjust padding */}
          <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] py-3 px-4"> 
            <div className="max-w-3xl mx-auto flex justify-around items-center">
              {/* Apply new theme colors and hover effect */}
              <button
                onClick={() => setCurrentView('scan')}
                className={`flex flex-col items-center transition-colors duration-200 ${currentView === 'scan' ? 'text-primary' : 'text-subtle-text hover:text-primary'}`}
              >
                <Camera className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{t('app.scan')}</span>
              </button>
              <button
                onClick={() => setCurrentView('history')}
                className={`flex flex-col items-center transition-colors duration-200 ${currentView === 'history' ? 'text-primary' : 'text-subtle-text hover:text-primary'}`}
              >
                <HistoryIcon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{t('history.title')}</span>
              </button>
              <button
                onClick={() => setCurrentView('settings')}
                className={`flex flex-col items-center transition-colors duration-200 ${currentView === 'settings' ? 'text-primary' : 'text-subtle-text hover:text-primary'}`}
              >
                <SettingsIcon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{t('app.settings')}</span>
              </button>
              <button
                onClick={() => setCurrentView('developer')}
                className={`flex flex-col items-center transition-colors duration-200 ${currentView === 'developer' ? 'text-primary' : 'text-subtle-text hover:text-primary'}`}
              >
                <User className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{t('app.developer')}</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
