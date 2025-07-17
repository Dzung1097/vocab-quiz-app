import React, { useState } from 'react';

interface ApiKeySetupProps {
  onKeySubmit: (key: string) => void;
}

const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onKeySubmit }) => {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError('Vui lòng nhập API Key của bạn.');
      return;
    }
    onKeySubmit(apiKey.trim());
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50">
      <form onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Chào mừng bạn!</h2>
        <p className="text-slate-600 mb-6">Để sử dụng tính năng AI, vui lòng nhập Gemini API Key của bạn.</p>
        
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        
        <div className="mb-4">
          <label htmlFor="apiKey" className="font-semibold text-slate-700 mb-2 block">Gemini API Key</label>
          <input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              if (error) setError('');
            }}
            placeholder="Dán API Key của bạn vào đây"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          />
        </div>

        <div className="text-xs text-slate-500 mb-6">
            <p>API Key của bạn chỉ được lưu trong phiên làm việc này và không được chia sẻ đi đâu.</p>
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:underline">Lấy API Key của bạn ở đây.</a>
        </div>
        
        <button type="submit" className="w-full px-6 py-3 rounded-lg bg-pink-600 text-white font-bold hover:bg-pink-700 transition-colors">
          Lưu và Bắt đầu
        </button>
      </form>
    </div>
  );
};

export default ApiKeySetup;
