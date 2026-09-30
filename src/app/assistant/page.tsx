'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  MessageSquareText, 
  Send, 
  Sparkles, 
  ExternalLink, 
  Copy, 
  Check, 
  Trash2, 
  ThumbsUp, 
  ThumbsDown, 
  AlertTriangle, 
  ShieldCheck, 
  BookOpen, 
  Filter, 
  ChevronRight,
  RefreshCw,
  Info
} from 'lucide-react';

interface ChatMessageDisplay {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  data?: any;
}

export default function AssistantPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading assistant...</div>}>
      <AssistantContent />
    </Suspense>
  );
}

function AssistantContent() {
  const searchParams = useSearchParams();
  const initialDocId = searchParams.get('docId') || '';

  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessageDisplay[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRegulator, setSelectedRegulator] = useState<string>('ALL');
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');
  const [targetDocId, setTargetDocId] = useState<string>(initialDocId);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeSourcesDrawer, setActiveSourcesDrawer] = useState<any[] | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'up' | 'down'>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const starterQuestions = [
    'What are the mandatory cyber incident reporting timelines under CERT-In directions?',
    'What governance controls must banks establish under the RBI IT Governance Master Direction?',
    'What does the SEBI CSCRF circular mandate regarding Software Bill of Materials (SBOM)?',
    'What are the device-binding and velocity check requirements under NPCI UPI directions?',
    'What are the GST tax slabs for hotel accommodation?', // Intentionally triggers unsupported refusal test!
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend || question).trim();
    if (!q || loading) return;

    const userMsgId = 'usr_' + Date.now();
    const newMessages: ChatMessageDisplay[] = [
      ...messages,
      { id: userMsgId, role: 'user', content: q },
    ];
    setMessages(newMessages);
    setQuestion('');
    setLoading(true);

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          targetDocumentId: targetDocId || undefined,
          regulators: selectedRegulator !== 'ALL' ? [selectedRegulator] : undefined,
          topics: selectedTopic !== 'ALL' ? [selectedTopic] : undefined,
        }),
      });

      if (!res.ok) {
        throw new Error('Chatbot request failed');
      }

      const data = await res.json();
      const assistantMsgId = 'ast_' + Date.now();
      setMessages([
        ...newMessages,
        {
          id: assistantMsgId,
          role: 'assistant',
          content: data.response.directAnswer,
          data: data.response,
        },
      ]);
    } catch (e: any) {
      setMessages([
        ...newMessages,
        {
          id: 'err_' + Date.now(),
          role: 'assistant',
          content: 'An error occurred while retrieving official records: ' + e.message,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyAnswer = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFeedback = (msgId: string, type: 'up' | 'down') => {
    setFeedbackGiven((prev) => ({ ...prev, [msgId]: type }));
  };

  const clearChat = () => {
    setMessages([]);
    setActiveSourcesDrawer(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header & Grounding Assurance */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Grounded Regulatory Assistant
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-bold bg-teal-100 text-teal-900 rounded border border-teal-200">
              RAG Citations
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Strictly grounded in official indexed publications from RBI, SEBI, CERT-In, NPCI, and IRDAI.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={clearChat}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Scope Filtering Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-semibold text-slate-700">Scope Restriction:</span>
          </div>

          {/* Regulator Filter */}
          <select
            value={selectedRegulator}
            onChange={(e) => setSelectedRegulator(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-slate-800 font-medium focus:outline-none"
          >
            <option value="ALL">All Regulators</option>
            <option value="RBI">Reserve Bank of India (RBI)</option>
            <option value="SEBI">SEBI (Securities Market)</option>
            <option value="CERT-In">CERT-In (Cybersecurity)</option>
            <option value="NPCI">NPCI (Payments)</option>
            <option value="IRDAI">IRDAI (Insurance)</option>
          </select>

          {/* Topic Filter */}
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-slate-800 font-medium focus:outline-none"
          >
            <option value="ALL">All Risk Domains</option>
            <option value="Cybersecurity">Cybersecurity</option>
            <option value="Incident Reporting">Incident Reporting</option>
            <option value="Cloud">Cloud Adoption</option>
            <option value="IT Governance">IT Governance</option>
            <option value="Digital Payments">Digital Payments</option>
          </select>

          {targetDocId && (
            <div className="flex items-center space-x-1 bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200 font-medium">
              <span>Restricted to single document</span>
              <button onClick={() => setTargetDocId('')} className="ml-1 text-blue-600 hover:text-blue-900 font-bold">&times;</button>
            </div>
          )}
        </div>

        <div className="text-[11px] text-slate-400 italic">
          Refusal Rule: Answers only from verified indexed official text
        </div>
      </div>

      {/* Main Conversation Window */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 min-h-[460px] flex flex-col justify-between">
        {/* Messages */}
        <div className="space-y-6 flex-1 overflow-y-auto pr-1">
          {messages.length === 0 ? (
            <div className="py-12 text-center space-y-6">
              <div className="w-12 h-12 rounded-xl bg-navy-800 text-teal-300 flex items-center justify-center mx-auto shadow-md">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Conversational Regulatory Research Assistant</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                  Ask compliance, technical risk, or governance questions. Every answer returns a 7-part structured response with explicit citations to official circular sections.
                </p>
              </div>

              {/* Starter Question Pills */}
              <div className="max-w-2xl mx-auto space-y-2 text-left">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
                  Suggested Starter Questions
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {starterQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(q)}
                      className="text-xs text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-blue-800 p-2.5 rounded-lg border border-slate-200 transition-colors text-left flex items-center justify-between"
                    >
                      <span>{q}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-2`}
              >
                <div
                  className={`max-w-3xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-navy-800 text-white shadow-sm'
                      : 'bg-slate-50 border border-slate-200 text-slate-900 w-full'
                  }`}
                >
                  {/* User message */}
                  {msg.role === 'user' && <div>{msg.content}</div>}

                  {/* Assistant 7-part response */}
                  {msg.role === 'assistant' && msg.data && (
                    <div className="space-y-4 text-xs">
                      {/* Warning Banner if superseded or withdrawn */}
                      {msg.data.hasWithdrawnOrSupersededWarning && (
                        <div className="p-3 bg-amber-100 border border-amber-300 text-amber-900 rounded-lg flex items-start space-x-2">
                          <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                          <span className="font-semibold text-xs">{msg.data.hasWithdrawnOrSupersededWarning}</span>
                        </div>
                      )}

                      {/* Section 1: Direct Answer */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                          1. Direct Answer
                        </span>
                        <div className="text-sm font-semibold text-slate-900 leading-snug">
                          {msg.data.directAnswer}
                        </div>
                      </div>

                      {/* Section 2: Who It May Apply To */}
                      {msg.data.applicability && msg.data.applicability.length > 0 && (
                        <div className="space-y-1 pt-2 border-t border-slate-200">
                          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                            2. Who or What It May Apply To
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.data.applicability.map((item: string, i: number) => (
                              <span key={i} className="bg-white text-slate-800 px-2 py-0.5 rounded border border-slate-200 font-medium">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Section 3: Key Requirements */}
                      {msg.data.keyRequirements && msg.data.keyRequirements.length > 0 && (
                        <div className="space-y-1.5 pt-2 border-t border-slate-200">
                          <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider block">
                            3. Key Requirements Found in Documents
                          </span>
                          <ul className="space-y-1.5">
                            {msg.data.keyRequirements.map((req: any, i: number) => (
                              <li key={i} className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                                <span className="font-medium text-slate-900 block">{req.text}</span>
                                <span className="text-[10px] text-blue-700 font-mono block">
                                  Citation: {req.citation}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Section 4: Important Dates */}
                      {msg.data.importantDates && msg.data.importantDates.length > 0 && (
                        <div className="space-y-1 pt-2 border-t border-slate-200">
                          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                            4. Important Dates
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {msg.data.importantDates.map((d: any, i: number) => (
                              <div key={i} className="bg-white p-2 rounded border border-slate-200">
                                <span className="font-bold text-blue-800">{d.date}</span>
                                <span className="text-slate-600 block text-[11px]">{d.description}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Section 5: Suggested Operational Considerations */}
                      {msg.data.operationalConsiderations && msg.data.operationalConsiderations.length > 0 && (
                        <div className="space-y-1 pt-2 border-t border-slate-200">
                          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                            5. Suggested Operational Considerations (Platform Guidance)
                          </span>
                          <ul className="space-y-1 list-disc ml-4 text-slate-600">
                            {msg.data.operationalConsiderations.map((item: string, i: number) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Section 6: Sources & Supporting Passages */}
                      {msg.data.sourcesAndPassages && msg.data.sourcesAndPassages.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-slate-200">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
                              6. Sources & Supporting Official Passages ({msg.data.sourcesAndPassages.length})
                            </span>
                            <button
                              onClick={() => setActiveSourcesDrawer(msg.data.sourcesAndPassages)}
                              className="text-[11px] text-blue-600 hover:underline font-semibold"
                            >
                              Expand All Excerpts
                            </button>
                          </div>

                          <div className="space-y-1.5">
                            {msg.data.sourcesAndPassages.map((s: any, i: number) => (
                              <div key={i} className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-900">{s.regulator} • {s.documentNumber || s.title}</span>
                                  <a href={s.officialSourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 flex items-center space-x-0.5 text-[11px]">
                                    <span>Official Link</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                                <div className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-100">
                                  [{s.section}]: "{s.passageSnippet}"
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Section 7: Verification Status & Limitations */}
                      <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 bg-slate-100 p-2.5 rounded-lg">
                        <span className="font-bold text-slate-700 block mb-0.5">7. Verification Status & Legal Caveat:</span>
                        {msg.data.verificationStatusAndLimitations}
                      </div>

                      {/* Response Action Controls (Copy, Feedback) */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs text-slate-500">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => copyAnswer(msg.data.directAnswer, msg.id)}
                            className="flex items-center space-x-1 hover:text-slate-800 transition-colors"
                          >
                            {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedId === msg.id ? 'Copied' : 'Copy Response'}</span>
                          </button>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-[11px]">Helpful?</span>
                          <button
                            onClick={() => handleFeedback(msg.id, 'up')}
                            className={`p-1 rounded hover:bg-slate-200 ${feedbackGiven[msg.id] === 'up' ? 'text-emerald-600 font-bold' : ''}`}
                            title="Helpful"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleFeedback(msg.id, 'down')}
                            className={`p-1 rounded hover:bg-slate-200 ${feedbackGiven[msg.id] === 'down' ? 'text-red-600 font-bold' : ''}`}
                            title="Not helpful"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fallback for regular text messages */}
                  {msg.role === 'assistant' && !msg.data && (
                    <div className="text-xs">{msg.content}</div>
                  )}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex items-center space-x-2 text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl border border-slate-200 max-w-sm animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              <span>Retrieving indexed official passages and verifying citations...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="pt-4 border-t border-slate-200 mt-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="relative flex items-center"
          >
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about Indian regulatory directions, obligations, or timelines..."
              className="w-full pl-4 pr-14 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="absolute right-2 bg-navy-800 hover:bg-navy-900 disabled:opacity-40 text-white p-2 rounded-lg transition-colors"
              title="Submit Question"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-[11px] text-slate-400 mt-1.5 flex items-center justify-between">
            <span>Grounding principle: General AI knowledge is excluded; answers cite indexed publications only.</span>
            <span>Local v1.0.0</span>
          </div>
        </div>
      </div>

      {/* Sources Drawer Modal */}
      {activeSourcesDrawer && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-blue-700" />
                <h3 className="font-bold text-sm text-slate-900">Official Supporting Passages & Citations</h3>
              </div>
              <button
                onClick={() => setActiveSourcesDrawer(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto text-xs">
              {activeSourcesDrawer.map((src, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">
                      {src.regulator} • {src.documentNumber || src.title}
                    </span>
                    <a
                      href={src.officialSourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
                    >
                      <span>Official Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="font-mono text-xs text-blue-800 font-semibold">
                    Section: {src.section}
                  </div>

                  <blockquote className="p-3 bg-white border-l-4 border-blue-500 rounded text-slate-700 leading-relaxed italic">
                    "{src.passageSnippet}"
                  </blockquote>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setActiveSourcesDrawer(null)}
                className="px-4 py-1.5 bg-navy-800 text-white rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
