"use client";

import { useState, useEffect } from "react";

export default function CatDogClassifier() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<{ label: string; confidence: string; allScores: Record<string, number> } | null>(null);
  const [loading, setLoading] = useState(false);

  const setImage = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  };

  // Handle file selection and preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  // Handle paste from clipboard
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const item = Array.from(e.clipboardData?.items ?? []).find(
        (i) => i.type.startsWith("image/")
      );
      if (item) {
        const pasted = item.getAsFile();
        if (pasted) setImage(pasted);
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Replace with your FastAPI URL (usually http://localhost:8000/predict)
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult({ label: data.result, confidence: data.confidence, allScores: data.all_scores ?? {} });
    } catch (error) {
      console.error("Error classifying image:", error);
      alert("Failed to connect to the backend server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-800">Cat vs Dog AI</h1>
        <p className="text-center text-gray-500">Upload or paste a photo and the AI will decide!</p>

        {/* Upload Area */}
        <div className="flex flex-col items-center border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 transition-colors cursor-pointer relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          {preview ? (
            <img src={preview} alt="Preview" className="h-48 w-48 object-cover rounded-lg shadow-md" />
          ) : (
            <div className="text-gray-400 flex flex-col items-center gap-1">
              <span className="text-4xl">📷</span>
              <p>Click to select an image</p>
              <p className="text-xs">or paste one with Ctrl+V</p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700 shadow-lg active:scale-95"
          }`}
        >
          {loading ? "AI is thinking..." : "Classify Image"}
        </button>

        {/* Results Display */}
        {result && (
          <div className="mt-6 space-y-3">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
              <h2 className="text-xl font-bold text-blue-800">It's {result.label}!</h2>
              <p className="text-blue-600">Confidence: {result.confidence}</p>
            </div>
            {Object.keys(result.allScores).length > 1 && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Other possibilities</h3>
                <ul className="space-y-1">
                  {Object.entries(result.allScores)
                    .filter(([name]) => name !== result.label)
                    .sort(([, a], [, b]) => b - a)
                    .map(([name, score]) => (
                      <li key={name} className="flex items-center gap-2">
                        <span className="text-sm text-gray-700 w-28 shrink-0">{name}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-400 h-2 rounded-full"
                            style={{ width: `${(score * 100).toFixed(1)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-12 text-right">{(score * 100).toFixed(1)}%</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}