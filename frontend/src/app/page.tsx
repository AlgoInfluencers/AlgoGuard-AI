"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Shield, Upload, FileText, Activity, Network, Terminal, Download, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { jsPDF } from 'jspdf';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [targetCol, setTargetCol] = useState('Loan_Status');
  const [sensitiveCol, setSensitiveCol] = useState('Gender');
  const [geminiKey, setGeminiKey] = useState('');
  const [language, setLanguage] = useState('English');
  
  const [isLoading, setIsLoading] = useState(false);
  const [metricsImg, setMetricsImg] = useState<string | null>(null);
  const [networkImg, setNetworkImg] = useState<string | null>(null);
  const [terminalOutput, setTerminalOutput] = useState('> System initialized. Ready for dataset upload...');
  
  const [statusMsg, setStatusMsg] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [displayedReport, setDisplayedReport] = useState<string>('');

  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<Record<string, string>[]>([]);

  // Typing animation effect for the AI Report
  useEffect(() => {
    if (!aiReport) {
      return;
    }
    
    // Extract a short summary for the UI
    const summary = aiReport.length > 400 ? aiReport.substring(0, 400) + "...\n\n[Download PDF for full analysis]" : aiReport;

    let i = 0;
    // We delay the initial clear slightly to avoid synchronous setState warnings
    setTimeout(() => setDisplayedReport(''), 0);
    const timer = setInterval(() => {
      setDisplayedReport(summary.substring(0, i));
      i++;
      if (i > summary.length) clearInterval(timer);
    }, 15);
    
    return () => clearInterval(timer);
  }, [aiReport]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      
      Papa.parse(selectedFile, {
        header: true,
        preview: 5,
        skipEmptyLines: true,
        complete: function(results) {
          if (results.meta.fields) {
            setPreviewHeaders(results.meta.fields);
            setPreviewData(results.data as Record<string, string>[]);
          }
        }
      });
      setTerminalOutput(prev => prev + `\n> Loaded ${selectedFile.name} successfully.`);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setStatusType('error');
      setStatusMsg('Please upload a dataset first.');
      return;
    }
    
    setIsLoading(true);
    setStatusType('info');
    setStatusMsg('Initializing Pipeline...');
    setAiReport(null);
    setDisplayedReport('');
    setTerminalOutput('> Initiating Fairness Analysis Protocol...\n> Connecting to AlgoGuard core engine...');

    const steps = [
      "> Uploading dataset to engine...",
      "> Preprocessing and handling missing values...",
      "> Computing Baseline Bias Metrics...",
      "> Applying Mitigation Strategies...",
      "> Generating Structural Similarity Network...",
      "> Consulting Gemini AI Ethics API...",
      "> Finalizing report..."
    ];
    let stepIndex = 0;
    const progressTimer = setInterval(() => {
      if (stepIndex < steps.length) {
        setStatusMsg(steps[stepIndex].replace('> ', ''));
        setTerminalOutput(prev => prev + '\n' + steps[stepIndex]);
        stepIndex++;
      }
    }, 2500);

    const formData = new FormData();
    formData.append('Target', targetCol);
    formData.append('Gender', sensitiveCol);
    formData.append('language', language);
    if (geminiKey) formData.append('gemini_api_key', geminiKey);
    formData.append('file', file);

    try {
      const response = await fetch('https://gdg-solution-challenge-rybg.onrender.com/api/analyze', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressTimer);
      const data = await response.json();

      if (data.status === 'success') {
        setTerminalOutput(prev => prev + '\n> Analysis complete. Processing results...\n' + (data.stdout || "Execution finished with no output."));
        setMetricsImg(data.metrics_image || null);
        setNetworkImg(data.structural_image || null);
        
        if (data.ai_report) {
          setAiReport(data.ai_report);
        } else if (geminiKey) {
          setAiReport("⚠️ API Key provided but no report was generated.");
        }

        setStatusType('success');
        setStatusMsg('Analysis Complete');
      } else {
        setTerminalOutput(prev => prev + '\n> Critical Error Encountered:\n' + data.stderr + "\n" + data.stdout);
        setStatusType('error');
        setStatusMsg('Pipeline Execution Failed');
      }
    } catch (err) {
      clearInterval(progressTimer);
      console.error(err);
      setStatusType('error');
      setStatusMsg('Server Connection Error');
      setTerminalOutput(prev => prev + '\n> Error connecting to server API. Ensure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadReport = () => {
    if (!aiReport) return;
    
    const doc = new jsPDF();
    
    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("AlgoGuard AI - Ethics Report", 20, 20);
    
    // Metadata
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Target Variable: ${targetCol}`, 20, 30);
    doc.text(`Sensitive Attribute: ${sensitiveCol}`, 20, 38);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 46);
    
    // Separator line
    doc.setLineWidth(0.5);
    doc.line(20, 50, 190, 50);
    
    // Full Report Content
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(aiReport, 170); // 210mm page width - 40mm margins
    
    // Handle multipage if text is too long
    let y = 60;
    for (let i = 0; i < splitText.length; i++) {
      if (y > 280) { // Page height is 297mm
        doc.addPage();
        y = 20;
      }
      doc.text(splitText[i], 20, y);
      y += 6;
    }
    
    doc.save('AlgoGuard_Ethics_Report.pdf');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="flex flex-col min-h-screen relative z-10 w-full bg-[#030712] text-[#f3f4f6]">
      {/* Navbar */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="px-12 md:px-20 lg:px-32 py-4 flex items-center justify-between border-b border-[rgba(55,65,81,0.5)] bg-[rgba(17,24,39,0.7)] backdrop-blur-md sticky top-0 z-50"
      >
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="AlgoGuard Logo" className="w-10 h-10 object-contain rounded-lg" />
          <h1 className="text-2xl font-bold tech-font tracking-tight text-white">
            Algo<span className="text-cyan-400">Guard</span>
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-6">
            <span className="text-sm font-medium text-purple-400 px-3 py-1 bg-purple-900/30 border border-purple-500/30 rounded-full flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> GDG Solution Challenge
            </span>
            <a href="https://github.com/google/generative-ai-python" target="_blank" rel="noreferrer" className="text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-2">
              Powered by Gemini
            </a>
        </div>
      </motion.header>

      <div className="flex flex-col lg:flex-row flex-1 px-12 py-6 md:px-20 lg:px-32 lg:py-16 gap-8 max-w-[1500px] mx-auto w-full">
        
        {/* Sidebar Configuration */}
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full lg:w-[460px] flex flex-col gap-6"
        >
          <div className="glass-panel p-8 flex flex-col gap-8">
            <div>
              <h2 className="text-2xl font-bold tech-font mb-2 text-white flex items-center gap-2">
                <Terminal className="w-6 h-6 text-cyan-400" /> Pipeline Config
              </h2>
              <p className="text-gray-400 text-sm">Configure parameters and inject dataset.</p>
            </div>
            
            <motion.form 
              onSubmit={handleSubmit} 
              className="flex flex-col gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              
              {/* Dropzone */}
              <motion.div variants={itemVariants} className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Dataset Injection (CSV)</label>
                <div 
                  {...getRootProps()} 
                  className={`dropzone ${isDragActive ? 'active' : ''}`}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center justify-center gap-3">
                    <motion.div
                      animate={{ y: isDragActive ? -5 : 0, scale: isDragActive ? 1.1 : 1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                      className="p-4 rounded-full bg-cyan-900/30 text-cyan-400"
                    >
                      {file ? <FileText className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                    </motion.div>
                    <span className="text-sm font-medium text-gray-300">
                      {file ? <span className="text-cyan-400">{file.name}</span> : 'Drag & drop data.csv here'}
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-col gap-2">
                <label htmlFor="targetCol" className="text-xs font-bold text-gray-400 uppercase tracking-wider">Target Variable</label>
                <input 
                  type="text" 
                  id="targetCol" 
                  value={targetCol}
                  onChange={(e) => setTargetCol(e.target.value)}
                  required 
                  className="tech-input"
                />
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-col gap-2">
                <label htmlFor="sensitiveCol" className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sensitive Attribute</label>
                <input 
                  type="text" 
                  id="sensitiveCol" 
                  value={sensitiveCol}
                  onChange={(e) => setSensitiveCol(e.target.value)}
                  required 
                  className="tech-input"
                />
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-col gap-2 mt-2 pt-6 border-t border-[rgba(55,65,81,0.5)]">
                <label htmlFor="geminiKey" className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Gemini API Key (Optional)
                </label>
                <input 
                  type="password" 
                  id="geminiKey" 
                  placeholder="Paste AI Studio Key here"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="tech-input focus:border-purple-500 focus:shadow-[0_0_0_2px_rgba(139,92,246,0.2)]"
                />
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-col gap-2">
                <label htmlFor="language" className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                  <span>🌐</span> Report Language
                </label>
                <select 
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="tech-input focus:border-purple-500 focus:shadow-[0_0_0_2px_rgba(139,92,246,0.2)] cursor-pointer"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi (हिंदी)</option>
                  <option value="Bengali">Bengali (বাংলা)</option>
                  <option value="Tamil">Tamil (தமிழ்)</option>
                  <option value="Telugu">Telugu (తెలుగు)</option>
                </select>
              </motion.div>

              <motion.div variants={itemVariants} className="pt-4">
                <motion.button 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }} 
                  type="submit" 
                  disabled={isLoading} 
                  className="btn-primary w-full py-3.5"
                >
                  {isLoading ? <div className="spinner"></div> : (
                    <>
                      <Activity className="w-5 h-5" /> Execute Protocol
                    </>
                  )}
                </motion.button>
              </motion.div>

              <AnimatePresence>
                {statusMsg && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex items-center gap-3 text-sm font-medium p-3 rounded-lg border ${
                      statusType === 'success' ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400' : 
                      statusType === 'error' ? 'bg-rose-900/20 border-rose-500/30 text-rose-400' : 
                      'bg-cyan-900/20 border-cyan-500/30 text-cyan-400'
                    }`}
                  >
                    {statusType === 'success' && <CheckCircle2 className="w-5 h-5" />}
                    {statusType === 'error' && <AlertCircle className="w-5 h-5" />}
                    {statusType === 'info' && <Activity className="w-5 h-5 animate-pulse" />}
                    {statusMsg}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.form>
          </div>
        </motion.div>

        {/* Main Content Areas */}
        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex-1 flex flex-col gap-6"
        >
          {/* AI Ethics Report Panel */}
          <AnimatePresence>
            {aiReport && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel p-6 border-l-4 border-l-purple-500 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <h3 className="font-bold text-xl mb-4 flex items-center gap-2 gradient-text-secondary tech-font">
                  <Sparkles className="text-purple-400 w-6 h-6" /> AI Ethics Intelligence Report
                </h3>
                <div className="text-gray-300 leading-relaxed text-[15px] mb-6 relative z-10 mono-font">
                  {displayedReport}
                  <span className="terminal-cursor !bg-purple-400"></span>
                </div>
                <div className="flex justify-end relative z-10">
                   <button onClick={downloadReport} className="text-sm font-medium text-purple-300 hover:text-white bg-purple-900/30 hover:bg-purple-800/50 px-4 py-2 rounded-lg transition-colors border border-purple-500/30 flex items-center gap-2">
                      <Download className="w-4 h-4" /> Export PDF
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Metrics Graph */}
            <div className="glass-panel p-6 flex flex-col min-h-[400px]">
              <h3 className="font-bold text-lg mb-4 text-white tech-font flex items-center gap-2">
                 <Activity className="w-5 h-5 text-cyan-400" /> Fairness Tradeoff Analysis
              </h3>
              <div className="flex-1 flex items-center justify-center bg-[#09090b] rounded-lg border border-[rgba(55,65,81,0.5)] overflow-hidden relative">
                {metricsImg ? (
                  <motion.img 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    src={`data:image/png;base64,${metricsImg}`} 
                    alt="Metrics" 
                    className="w-full h-full object-contain p-2" 
                  />
                ) : (
                  <div className="text-sm text-gray-500 flex flex-col items-center gap-3 mono-font">
                    <Activity className="w-8 h-8 opacity-20" />
                    Awaiting telemetry data...
                  </div>
                )}
                {/* Scanline overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.5)_51%)] bg-[length:100%_4px]"></div>
              </div>
            </div>

            {/* Network Graph */}
            <div className="glass-panel p-6 flex flex-col min-h-[400px]">
              <h3 className="font-bold text-lg mb-4 text-white tech-font flex items-center gap-2">
                 <Network className="w-5 h-5 text-emerald-400" /> Structural Bias Network
              </h3>
              <div className="flex-1 flex items-center justify-center bg-[#09090b] rounded-lg border border-[rgba(55,65,81,0.5)] overflow-hidden relative">
                {networkImg ? (
                  <motion.img 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    src={`data:image/png;base64,${networkImg}`} 
                    alt="Network" 
                    className="w-full h-full object-contain p-2" 
                  />
                ) : (
                  <div className="text-sm text-gray-500 flex flex-col items-center gap-3 mono-font">
                    <Network className="w-8 h-8 opacity-20" />
                    Network offline.
                  </div>
                )}
                <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.5)_51%)] bg-[length:100%_4px]"></div>
              </div>
            </div>
          </div>

          {/* Data Preview Panel */}
          <AnimatePresence>
            {previewData.length > 0 && !metricsImg && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-6 border-t-2 border-t-cyan-500"
              >
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-white tech-font">
                   <FileText className="text-cyan-400 w-5 h-5" /> Dataset Structure Preview
                </h3>
                <div className="overflow-x-auto border border-[rgba(55,65,81,0.5)] rounded-lg bg-[#09090b]">
                  <table className="min-w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-[#111827] border-b border-[rgba(55,65,81,0.5)]">
                      <tr>
                        {previewHeaders.slice(0, 15).map((header, idx) => (
                          <th key={idx} className="px-4 py-3 font-semibold text-cyan-400 mono-font text-xs">{header}</th>
                        ))}
                        {previewHeaders.length > 15 && <th className="px-4 py-3 font-semibold text-cyan-400 mono-font text-xs">...</th>}
                      </tr>
                    </thead>
                    <motion.tbody 
                      className="divide-y divide-[rgba(55,65,81,0.2)]"
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                    >
                      {previewData.map((row, rowIndex) => (
                        <motion.tr variants={itemVariants} key={rowIndex} className="hover:bg-cyan-900/10 transition-colors">
                          {previewHeaders.slice(0, 15).map((header, colIndex) => (
                            <td key={colIndex} className="px-4 py-3 text-gray-300 truncate max-w-[150px]">{row[header]}</td>
                          ))}
                          {previewHeaders.length > 15 && <td className="px-4 py-3 text-gray-300">...</td>}
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Terminal Box */}
          <div className="tech-terminal flex flex-col flex-1 min-h-[250px]">
            <div className="tech-terminal-header">
              <div className="terminal-dot dot-red"></div>
              <div className="terminal-dot dot-yellow"></div>
              <div className="terminal-dot dot-green"></div>
              <span className="ml-2 font-semibold">algoguard_kernel_v1.0</span>
            </div>
            <div className="tech-terminal-body overflow-y-auto max-h-[300px] whitespace-pre-wrap">
              <span className="text-cyan-400">{terminalOutput}</span>
              <span className="terminal-cursor"></span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
