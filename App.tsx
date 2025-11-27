import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError("الرجاء اختيار ملف صورة صالح (JPG, PNG).");
      return;
    }
    
    setFile(selectedFile);
    setError("");
    setResult("");
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const solveExercise = async () => {
    if (!file) return;

    setLoading(true);
    setError("");
    setResult("");

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Convert file to base64 string without header
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // Split to get just the base64 part, avoiding "data:image/xyz;base64,"
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
      });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: file.type,
                data: base64Data
              }
            },
            {
              text: `أنت معلم ذكي ومتميز.
              المهمة: قم بحل التمارين الموجودة في الصورة المرفقة.
              الخطوات:
              1. تعرف على محتوى السؤال بدقة.
              2. قم بحل السؤال خطوة بخطوة.
              3. اشرح الحل بطريقة سهلة ومبسطة باللغة العربية.
              4. إذا كان هناك معادلات رياضية، اكتبها بوضوح.
              5. قم بتنسيق الإجابة بشكل جميل ومنظم (نقاط، عناوين).`
            }
          ]
        },
        config: {
           // We set a moderate temperature for creativity in explanation but precision in logic
           temperature: 0.4,
        }
      });

      setResult(response.text || "عذراً، لم أتمكن من استخراج حل من هذه الصورة. يرجى المحاولة بصورة أوضح.");
    } catch (err: any) {
      console.error(err);
      setError("حدث خطأ في الاتصال بالخدمة. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-8 text-center">
          <div className="flex justify-center mb-4">
             <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
             </div>
          </div>
          <h1 className="text-3xl font-extrabold mb-2">المعلم الذكي</h1>
          <p className="text-indigo-100 text-lg opacity-90">مساعدك الشخصي لحل الواجبات المدرسية والتمارين</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 -mt-6">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            
            {/* Upload Area */}
            <div className="p-8">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 text-sm">1</span>
                    رفع صورة التمرين
                </h2>

                {!imagePreview ? (
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="group border-3 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/50 rounded-2xl p-10 transition-all duration-300 cursor-pointer text-center"
                    >
                        <div className="w-20 h-20 bg-indigo-50 text-indigo-400 rounded-full mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                             </svg>
                        </div>
                        <p className="text-lg font-medium text-slate-700 mb-1">اضغط هنا لاختيار صورة</p>
                        <p className="text-slate-400 text-sm">أو قم بسحب الصورة وإفلاتها هنا</p>
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleFileChange}
                        />
                    </div>
                ) : (
                    <div className="relative group">
                        <div className="rounded-xl overflow-hidden bg-slate-100 border border-slate-200 max-h-[500px] flex items-center justify-center">
                            <img src={imagePreview} alt="Exercise" className="max-w-full max-h-[500px] object-contain" />
                        </div>
                        <button 
                            onClick={() => {
                                setFile(null);
                                setImagePreview(null);
                                setResult("");
                                setError("");
                            }}
                            className="absolute top-4 left-4 bg-white text-red-500 hover:bg-red-50 p-2 rounded-full shadow-lg border border-red-100 transition-all hover:scale-110"
                            title="حذف الصورة"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {/* Action Area */}
            {file && !loading && !result && (
                <div className="px-8 pb-8 border-t border-slate-100 pt-6 bg-slate-50/50">
                    <button 
                        onClick={solveExercise}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-indigo-200 transition-all hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3 text-lg"
                    >
                        <span>حل التمرين الآن</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="px-8 py-12 flex flex-col items-center justify-center border-t border-slate-100 bg-slate-50/50">
                    <div className="relative w-20 h-20 mb-6">
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-200 rounded-full opacity-50"></div>
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">جاري تحليل السؤال...</h3>
                    <p className="text-slate-500">يقوم المعلم الذكي بقراءة الصورة وحل المسألة</p>
                </div>
            )}

            {/* Results */}
            {result && (
                <div className="border-t-4 border-indigo-500 bg-indigo-50/30">
                     <div className="p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-indigo-900 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </span>
                                الإجابة والحل
                            </h2>
                            <button 
                                onClick={() => navigator.clipboard.writeText(result)}
                                className="text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                نسخ
                            </button>
                        </div>
                        
                        <div className="prose prose-lg prose-indigo max-w-none text-slate-800 bg-white p-6 rounded-xl border border-indigo-100 shadow-sm">
                            <div className="whitespace-pre-wrap font-medium leading-loose" style={{ direction: 'rtl' }}>
                                {result}
                            </div>
                        </div>

                         <div className="mt-8 text-center">
                            <button 
                                onClick={() => {
                                    setFile(null);
                                    setImagePreview(null);
                                    setResult("");
                                }}
                                className="text-slate-500 hover:text-indigo-600 font-medium transition-colors flex items-center justify-center gap-2 mx-auto"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                حل تمرين آخر
                            </button>
                        </div>
                     </div>
                </div>
            )}
            
             {/* Error */}
             {error && (
                <div className="bg-red-50 border-t border-red-100 p-6 text-center">
                    <p className="text-red-600 font-medium flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </p>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}