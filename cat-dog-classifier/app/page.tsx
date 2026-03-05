"use client";

import { useState } from "react";

export default function CatDogClassifier() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<{ label: string; confidence: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle file selection and preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null); // Reset result for new image
    }
  };

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
      setResult({ label: data.result, confidence: data.confidence });
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
        <p className="text-center text-gray-500">Upload a photo and the AI will decide!</p>

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
            <div className="text-gray-400 flex flex-col items-center">
              <span className="text-4xl">📷</span>
              <p>Click to select an image</p>
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
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
            <h2 className="text-xl font-bold text-blue-800">It's a {result.label}!</h2>
            <p className="text-blue-600">Confidence: {result.confidence}</p>
          </div>
        )}
      </div>
    </div>
  );
}