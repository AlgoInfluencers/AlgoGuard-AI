"use client";
import React, { useState, useRef, useEffect } from 'react';
import Papa from 'papaparse';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [targetCol, setTargetCol] = useState('Loan_Status');
  const [sensitiveCol, setSensitiveCol] = useState('Gender');
  const [geminiKey, setGeminiKey] = useState('');
  const [language, setLanguage] = useState('English');
  
  const [isLoading, setIsLoading] = useState(false);
  const [metricsImg, setMetricsImg] = useState<string | null>(null);
  const [networkImg, setNetworkImg] = useState<string | null>(null);
  const [terminalOutput, setTerminalOutput] = useState('Awaiting pipeline execution...');
  
  const [statusMsg, setStatusMsg] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [displayedReport, setDisplayedReport] = useState<string>('');

  // Data Preview State
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Typing animation effect for the AI Report
  useEffect(() => {
    if (!aiReport) {
      setDisplayedReport('');
      return;
    }
    
    let i = 0;
    setDisplayedReport('');
    const timer = setInterval(() => {
      setDisplayedReport(aiReport.substring(0, i));
      i++;
      if (i > aiReport.length) clearInterval(timer);
    }, 20);
    
    return () => clearInterval(timer);
  }, [aiReport]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Parse first 5 rows for Data Preview
      Papa.parse(selectedFile, {
        header: true,
        preview: 5,
        skipEmptyLines: true,
        complete: function(results) {
          if (results.meta.fields) {
            setPreviewHeaders(results.meta.fields);
            setPreviewData(results.data);
          }
        }
      });
    } else {
      setFile(null);
      setPreviewHeaders([]);
      setPreviewData([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusType('info');
    setStatusMsg('Initializing Pipeline...');
    setAiReport(null);

    // Simulate Progress Steps for better UX
    const steps = [
      "Uploading dataset to engine...",
      "Preprocessing and handling missing values...",
      "Computing Baseline Bias Metrics...",
      "Applying Mitigation Strategies...",
      "Generating Structural Similarity Network...",
      "Consulting Gemini AI Ethics API...",
      "Finalizing report..."
    ];
    let stepIndex = 0;
    const progressTimer = setInterval(() => {
      if (stepIndex < steps.length) {
        setStatusMsg(steps[stepIndex]);
        stepIndex++;
      }
    }, 2500);

    const formData = new FormData();
    formData.append('Target', targetCol);
    formData.append('Gender', sensitiveCol);
    formData.append('language', language);
    if (geminiKey) formData.append('gemini_api_key', geminiKey);
    if (file) formData.append('file', file);

    try {
      const response = await fetch('https://gdg-solution-challenge-rybg.onrender.com/api/analyze', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressTimer);
      const data = await response.json();

      if (data.status === 'success') {
        setTerminalOutput(data.stdout || "Execution finished with no output.");
        setMetricsImg(data.metrics_image || null);
        setNetworkImg(data.structural_image || null);
        
        if (data.ai_report) {
          setAiReport(data.ai_report);
        } else if (geminiKey) {
          setAiReport("⚠️ API Key provided but no report was generated.");
        }

        setStatusType('success');
        setStatusMsg('✅ Analysis Complete');
      } else {
        setTerminalOutput(data.stderr + "\n" + data.stdout);
        setStatusType('error');
        setStatusMsg('❌ Pipeline Execution Failed');
      }
    } catch (err) {
      clearInterval(progressTimer);
      console.error(err);
      setStatusType('error');
      setStatusMsg('❌ Server Connection Error. Is FastAPI running?');
      setTerminalOutput(String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const downloadReport = () => {
    if (!aiReport) return;
    const blob = new Blob([`AlgoGuard AI - Ethics Report\n\nTarget Variable: ${targetCol}\nSensitive Attribute: ${sensitiveCol}\n\n${aiReport}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AlgoGuard_AI_Ethics_Report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col min-h-screen relative z-10 w-full bg-[#f8f9fa]">
      {/* App Bar (Google Style) */}
      <header className="px-6 lg:px-12 py-4 flex items-center justify-between border-b border-[#dadce0] bg-white sticky top-0 z-50 shadow-sm" style={{ animation: 'fadeInDown 0.5s ease' }}>
        <div className="flex items-center gap-3">
          <div className="flex flex-wrap w-6 h-6 gap-[2px] rounded-sm overflow-hidden">
             <div className="w-[10px] h-[10px] bg-[#ea4335]"></div>
             <div className="w-[10px] h-[10px] bg-[#4285f4]"></div>
             <div className="w-[10px] h-[10px] bg-[#fbbc04]"></div>
             <div className="w-[10px] h-[10px] bg-[#34a853]"></div>
          </div>
          <h1 className="text-2xl font-medium text-[#202124] google-sans tracking-tight">
            AlgoGuard AI
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-6">
            <span className="text-sm font-medium text-[#5f6368] px-3 py-1 bg-[#f1f3f4] rounded-full">GDG Solution Challenge</span>
            <a href="https://github.com/google/generative-ai-python" target="_blank" rel="noreferrer" className="text-sm font-medium text-[#1a73e8] hover:underline">Powered by Gemini ✨</a>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row flex-1 p-6 lg:p-12 gap-12 max-w-[1600px] mx-auto w-full">
        
        {/* Sidebar Configuration */}
        <div className="w-full lg:w-[460px] flex flex-col gap-8" style={{ animation: 'fadeInLeft 0.5s ease' }}>
          
          <div className="material-card p-10 flex flex-col gap-8 border-none shadow-md">
            <div>
              <h2 className="text-2xl font-medium text-[#202124] google-sans mb-2">Pipeline Configuration</h2>
              <p className="text-[#5f6368] leading-relaxed">Configure parameters and upload your dataset.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-7">
              <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-[#5f6368] uppercase tracking-wider">Dataset (CSV)</label>
                <div 
                  className="border-2 border-dashed border-[#dadce0] rounded-xl p-10 text-center cursor-pointer transition-colors hover:bg-[#f1f3f4] hover:border-[#1a73e8]"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    <span className="text-4xl text-[#1a73e8] mb-2 drop-shadow-sm">📄</span>
                    <span className="text-[15px] font-medium text-[#202124]">
                      {file ? file.name : 'Click to browse or drop data.csv'}
                    </span>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange} 
                    accept=".csv" 
                    className="hidden" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="targetCol" className="text-sm font-bold text-[#5f6368] uppercase tracking-wider">Target Variable</label>
                <input 
                  type="text" 
                  id="targetCol" 
                  value={targetCol}
                  onChange={(e) => setTargetCol(e.target.value)}
                  required 
                  className="material-input"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="sensitiveCol" className="text-sm font-bold text-[#5f6368] uppercase tracking-wider">Sensitive Attribute</label>
                <input 
                  type="text" 
                  id="sensitiveCol" 
                  value={sensitiveCol}
                  onChange={(e) => setSensitiveCol(e.target.value)}
                  required 
                  className="material-input"
                />
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <label htmlFor="geminiKey" className="text-sm font-bold text-[#a142f4] uppercase tracking-wider flex items-center gap-2">
                  <span>✨</span> Gemini API Key (Optional)
                </label>
                <input 
                  type="password" 
                  id="geminiKey" 
                  placeholder="Paste AI Studio Key here"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="material-input focus:!bg-[#fce8e6] focus:!border-b-[#a142f4]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="language" className="text-sm font-bold text-[#a142f4] uppercase tracking-wider flex items-center gap-2">
                  <span>🌐</span> Report Language
                </label>
                <select 
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="material-input focus:!bg-[#fce8e6] focus:!border-b-[#a142f4] cursor-pointer"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi (हिंदी)</option>
                  <option value="Bengali">Bengali (বাংলা)</option>
                  <option value="Tamil">Tamil (தமிழ்)</option>
                  <option value="Telugu">Telugu (తెలుగు)</option>
                </select>
              </div>

              <div className="pt-2">
                <button type="submit" disabled={isLoading} className="btn-primary w-full py-4 text-lg">
                  {isLoading ? <div className="spinner"></div> : <span>Run Fairness Analysis</span>}
                </button>
              </div>

              {statusMsg && (
                <div 
                  className="text-center text-sm font-medium animate-[fadeIn_0.3s_ease] bg-[#f1f3f4] py-2 rounded-lg" 
                  style={{ color: statusType === 'success' ? '#188038' : statusType === 'error' ? '#d93025' : '#1a73e8' }}
                >
                  {statusMsg}
                </div>
              )}
            </form>
          </div>
          
        </div>

        {/* Main Content Areas */}
        <div className="flex-1 flex flex-col gap-6" style={{ animation: 'fadeInRight 0.5s ease' }}>
          
          {/* Data Preview Panel */}
          {previewData.length > 0 && !metricsImg && (
            <div className="material-card p-6 border-t-4 border-t-[#1a73e8]">
              <h3 className="font-medium text-lg mb-3 flex items-center gap-2 text-[#202124] google-sans">
                 <span className="text-[#1a73e8]">📋</span> Dataset Preview (First 5 Rows)
              </h3>
              <div className="overflow-x-auto border border-[#dadce0] rounded-lg">
                <table className="min-w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[#f1f3f4] border-b border-[#dadce0]">
                    <tr>
                      {previewHeaders.slice(0, 15).map((header, idx) => (
                        <th key={idx} className="px-4 py-3 font-semibold text-[#5f6368]">{header}</th>
                      ))}
                      {previewHeaders.length > 15 && <th className="px-4 py-3 font-semibold text-[#5f6368]">...</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#dadce0]">
                    {previewData.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-[#f8f9fa]">
                        {previewHeaders.slice(0, 15).map((header, colIndex) => (
                          <td key={colIndex} className="px-4 py-3 text-[#3c4043] truncate max-w-[150px]">{row[header]}</td>
                        ))}
                        {previewHeaders.length > 15 && <td className="px-4 py-3 text-[#3c4043]">...</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* AI Ethics Report Panel */}
          {aiReport && (
            <div className="material-card material-card-hover p-6 border-l-4 border-l-[#a142f4] bg-[#fdfafb] relative">
              <h3 className="font-medium text-lg mb-3 flex items-center gap-2 gemini-gradient-text google-sans">
                ✨ AI Ethics & Bias Summary
              </h3>
              <div className="text-[#3c4043] leading-relaxed text-[15px] mb-4">
                {displayedReport}
                <span className="animate-pulse font-bold ml-[2px] text-[#a142f4]">|</span>
              </div>
              <div className="flex justify-end">
                 <button onClick={downloadReport} className="text-sm font-medium text-[#a142f4] hover:bg-[#fce8e6] px-4 py-2 rounded-lg transition-colors border border-[#fce8e6]">
                    📥 Download Report
                 </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Metrics Graph */}
            <div className="material-card material-card-hover p-6 flex flex-col min-h-[380px]">
              <h3 className="font-medium text-lg mb-4 text-[#202124] google-sans flex items-center gap-2">
                 <span className="text-[#1a73e8]">📊</span> Performance & Fairness Tradeoff
              </h3>
              <div className="flex-1 flex items-center justify-center text-[#5f6368] bg-[#f8f9fa] rounded-lg border border-[#dadce0] overflow-hidden">
                {metricsImg ? (
                  <img src={`data:image/png;base64,${metricsImg}`} alt="Metrics" className="w-full h-full object-contain p-2 animate-[fadeIn_0.5s_ease]" />
                ) : (
                  <div className="text-sm text-center">Upload data and run analysis<br/>to generate metrics...</div>
                )}
              </div>
            </div>

            {/* Network Graph */}
            <div className="material-card material-card-hover p-6 flex flex-col min-h-[380px]">
              <h3 className="font-medium text-lg mb-4 text-[#202124] google-sans flex items-center gap-2">
                 <span className="text-[#34a853]">🕸️</span> Structural Bias Network
              </h3>
              <div className="flex-1 flex items-center justify-center text-[#5f6368] bg-[#f8f9fa] rounded-lg border border-[#dadce0] overflow-hidden">
                {networkImg ? (
                  <img src={`data:image/png;base64,${networkImg}`} alt="Network" className="w-full h-full object-contain p-2 animate-[fadeIn_0.5s_ease]" />
                ) : (
                  <div className="text-sm text-center">Upload data and run analysis<br/>to generate similarity graph...</div>
                )}
              </div>
            </div>
          </div>

          {/* Terminal Box */}
          <div className="material-card p-6 flex flex-col">
            <h3 className="font-medium text-lg mb-4 text-[#202124] google-sans flex items-center gap-2">
              <span className="text-[#ea4335]">💻</span> Terminal Output
            </h3>
            <div className="terminal-light p-5 text-[13px] overflow-y-auto max-h-[250px] whitespace-pre-wrap leading-relaxed">
              {terminalOutput}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
