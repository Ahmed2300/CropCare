import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);

interface Location {
  latitude: number;
  longitude: number;
}

interface AnalysisResult {
  crop_name: string;
  disease_detected: boolean;
  disease_name: string;
  confidence_percentage: number;
  danger_level: number;
  symptoms: string[];
  treatments: string[];
  prevention_tips: string[];
  disease_description: string;
}



export async function analyzeImage(imageData: string, language: string = 'en', location?: Location): Promise<AnalysisResult> {

  try {
    let base64Image: string;
    
    if (imageData.startsWith('data:image')) {
      base64Image = imageData.split(',')[1];
    } else {
      base64Image = imageData;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let locationInfo = '';
    if (location) {
      locationInfo = `Consider that this plant is located at latitude ${location.latitude} and longitude ${location.longitude} when analyzing potential diseases and treatments.`;
    }

    const prompt = `Analyze this plant image and provide a detailed assessment in ${language === 'ar' ? 'Arabic' : 'English'} language. ${locationInfo}

    Return the analysis in the following JSON format ONLY:
    {
      "crop_name": "string",
      "disease_detected": boolean,
      "disease_name": "string",
      "confidence_percentage": number,
      "danger_level": number,
      "symptoms": ["string"],
      "treatments": ["string"],
      "prevention_tips": ["string"],
      "disease_description": "string"
    }
    
    If no disease is detected, set disease_detected to false, disease_name to "None", danger_level to 0, and provide general care tips.
    The danger_level should be a number between 0 and 100 indicating the severity of the disease.
    All text fields should be in ${language === 'ar' ? 'Arabic' : 'English'}.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error in analyzeImage:', error);
    throw error;
  }
}