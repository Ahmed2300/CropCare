import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings as SettingsIcon, MapPin, Languages } from 'lucide-react';

interface SettingsProps {
  onLocationToggle: (enabled: boolean) => void;
}

const Settings: React.FC<SettingsProps> = ({ onLocationToggle }) => {
  const { t, i18n } = useTranslation();
  const [locationEnabled, setLocationEnabled] = useState(false);

  const handleLocationToggle = async () => {
    const newState = !locationEnabled;
    setLocationEnabled(newState);
    
    if (newState) {
      try {
        await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        onLocationToggle(true);
      } catch (error) {
        console.error('Location access denied:', error);
        setLocationEnabled(false);
        onLocationToggle(false);
      }
    } else {
      onLocationToggle(false);
    }
  };

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(event.target.value);
    document.documentElement.dir = event.target.value === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
        <SettingsIcon className="w-6 h-6 mr-2" />
        {t('app.settings')}
      </h2>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MapPin className="w-6 h-6 text-gray-600" />
            <div>
              <h3 className="font-medium text-gray-800">{t('app.location')}</h3>
              <p className="text-sm text-gray-500">{t('app.locationHint')}</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={locationEnabled}
              onChange={handleLocationToggle}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Languages className="w-6 h-6 text-gray-600" />
            <div>
              <h3 className="font-medium text-gray-800">{t('app.language')}</h3>
            </div>
          </div>
          <select
            className="bg-white border border-gray-300 rounded-md px-3 py-2"
            value={i18n.language}
            onChange={handleLanguageChange}
          >
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-500">{t('app.about')}</h3>
        <p className="mt-2 flex justify-between text-sm text-gray-500">
          <span>{t('app.version')}</span>
          <span>0.1</span>
        </p>
        <p className="mt-4 text-center text-sm text-gray-500">
          © 2025 CropCare All rights reserved
        </p>
      </div>
    </div>
  );
};

export default Settings;