
import React, { useState, useEffect, useRef } from 'react';
import { RecruitmentCandidate, RecruitmentStage } from '../../types';
import Modal from '../../../../components/common/Modal';
import { FileText, Star, Calendar, MessageSquare, CheckCircle2, XCircle, DollarSign, Send, User, Mail, Phone, Paperclip, Eye, Check, X, AlertCircle, Upload, ZoomIn, ZoomOut, RotateCcw, BrainCircuit, Plus, Sparkles, Archive, UserPlus, Briefcase, Smile, Zap } from 'lucide-react';
import GlassInput from '../../../../components/common/GlassInput';
import GlassPanel from '../../../../components/common/GlassPanel';
import { generateBusinessAdvice } from '../../../ai/services/geminiService';
import { useRecruitmentLogic } from '../../hooks/useRecruitmentLogic';

interface CandidateStageModalProps {
    isOpen: boolean;
    onClose: () => void;
    candidate: RecruitmentCandidate | null;
    onMove: (id: string, stage: RecruitmentStage) => void;
    onUpdateScore: (id: string, score: number) => void;
    onUpdateDoc?: (id: string, docType: string, fileData: string) => void;
    onHire?: (id: string, data: { salary: string, role: string, joinDate: string }) => void;
}

// ... (REQUIRED_DOCS & DEFAULT_QUESTIONS constants)
const REQUIRED_DOCS = [
    { id: 'cv', label: 'Curriculum Vitae (CV)', required: true },
    { id: 'ktp', label: 'KTP / Identitas', required: true },
    { id: 'ijazah', label: 'Ijazah Terakhir', required: true },
];

const DEFAULT_QUESTIONS = [
    { id: 'q1', text: 'Ceritakan tentang diri Anda secara singkat.', answer: '' },
    { id: 'q2', text: 'Apa kelebihan dan kekurangan terbesar Anda?', answer: '' },
];

// Helper: Star Rating Component for Feature 2
const StarRating = ({ value, onChange, label }: { value: number, onChange: (val: number) => void, label: string }) => {
    return (
        <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
            <span className="text-xs font-bold text-gray-300 uppercase w-24">{label}</span>
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => onChange(star)}
                        className={`transition-transform hover:scale-110 ${star <= value ? 'text-yellow-400' : 'text-gray-600'}`}
                    >
                        <Star size={18} fill={star <= value ? "currentColor" : "none"} />
                    </button>
                ))}
            </div>
            <span className="text-sm font-bold text-white w-6 text-right">{value}</span>
        </div>
    );
};


const CandidateStageModal: React.FC<CandidateStageModalProps> = ({ isOpen, onClose, candidate, onMove, onUpdateScore, onUpdateDoc, onHire }) => {
    const { analyzeCandidateCV, updateInterviewScores } = useRecruitmentLogic(); // Import hook functions
    
    // Stage State
    const [note, setNote] = useState('');
    const [interviewDate, setInterviewDate] = useState('');
    const [interviewTime, setInterviewTime] = useState('');
    const [offerAmount, setOfferAmount] = useState('');
    const [scoreInput, setScoreInput] = useState<number>(0);
    
    // Feature 2: Structured Score
    const [structScore, setStructScore] = useState({
        communication: 0, technical: 0, attitude: 0, culture: 0
    });
    
    // Onboarding State
    const [isOnboarding, setIsOnboarding] = useState(false);
    const [finalRole, setFinalRole] = useState('');
    const [finalSalary, setFinalSalary] = useState('');
    const [joinDate, setJoinDate] = useState('');

    // Document & Preview State
    const [docStatus, setDocStatus] = useState<Record<string, 'pending' | 'valid' | 'invalid'>>({});
    const [previewFile, setPreviewFile] = useState<{ type: string; data: string; label: string } | null>(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    
    // Interview State
    const [interviewQnA, setInterviewQnA] = useState(DEFAULT_QUESTIONS);
    const [newQuestion, setNewQuestion] = useState('');
    const [aiAnalysis, setAiAnalysis] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Hidden Input Ref for Upload
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    useEffect(() => {
        if (candidate) {
            setScoreInput(candidate.score || 0);
            // Load existing structured score if any
            if(candidate.interviewScores) {
                setStructScore({
                    communication: candidate.interviewScores.communication,
                    technical: candidate.interviewScores.technical,
                    attitude: candidate.interviewScores.attitude,
                    culture: candidate.interviewScores.culture
                });
            } else {
                setStructScore({ communication: 0, technical: 0, attitude: 0, culture: 0 });
            }

            const initialStatus: any = {};
            REQUIRED_DOCS.forEach(d => initialStatus[d.id] = 'pending');
            setDocStatus(initialStatus);
            setInterviewQnA(DEFAULT_QUESTIONS.map(q => ({...q, answer: ''})));
            setAiAnalysis(candidate.aiAnalysis || '');
            setInterviewDate('');
            setInterviewTime('');
            setIsOnboarding(false);
            setFinalRole(candidate.roleApplied);
            setFinalSalary('');
            setJoinDate(new Date().toISOString().split('T')[0]);
        }
    }, [candidate]);

    if (!candidate) return null;

    // --- ZOOM HANDLERS ---
    const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
    const handleResetZoom = () => setZoomLevel(1);

    // --- DOC HANDLERS ---
    const handleDocAction = (docId: string, status: 'valid' | 'invalid') => {
        setDocStatus(prev => ({ ...prev, [docId]: status }));
    };
    
    const handleViewFile = (docId: string, label: string) => {
        // @ts-ignore
        const fileData = candidate.documents ? candidate.documents[docId] : null;
        if (fileData) {
            setPreviewFile({ type: docId, data: fileData, label });
            setZoomLevel(1); 
        } else {
            alert("File belum tersedia. Silakan upload terlebih dahulu.");
        }
    };
    
    const handleUploadClick = (docId: string) => {
        if (fileInputRefs.current[docId]) {
            fileInputRefs.current[docId]?.click();
        }
    };
    
    const handleFileChange = (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onUpdateDoc) {
             const reader = new FileReader();
             reader.onloadend = () => {
                 onUpdateDoc(candidate.id, docId, reader.result as string);
                 alert("Dokumen berhasil diupload!");
             };
             reader.readAsDataURL(file);
        }
    };

    // --- FEATURE 1: AI SCAN ---
    const handleAiScan = async () => {
        if (candidate.aiMatchScore) return; // Already scanned
        setIsAnalyzing(true);
        await analyzeCandidateCV(candidate.id);
        setIsAnalyzing(false);
    };

    // --- FEATURE 2: SAVE SCORECARD ---
    const handleSaveScorecard = () => {
        updateInterviewScores(candidate.id, { ...structScore, average: 0 });
        alert("Penilaian Interview Tersimpan!");
    };


    // --- REJECTION / ACCEPTANCE LOGIC (WA AUTOMATION) ---
    const handleRejectCandidate = () => {
        const reason = prompt("Alasan penolakan (akan dikirim ke kandidat):", "Kualifikasi belum sesuai dengan kebutuhan saat ini.");
        if (reason) {
            const message = `Halo ${candidate.name}, Terima kasih telah melamar di ${candidate.roleApplied}. Mohon maaf, saat ini kami belum dapat melanjutkan proses Anda karena ${reason}. Kami akan menyimpan data Anda untuk kesempatan mendatang. Terima kasih.`;
            const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
            window.open(waUrl, '_blank');
            onMove(candidate.id, 'Rejected');
        }
    };

    const handleAcceptAdministration = () => {
        const message = `Halo ${candidate.name}, Selamat! Lamaran untuk posisi ${candidate.roleApplied} telah lolos seleksi administrasi. Kami akan segera menghubungi Anda untuk penjadwalan interview.`;
        const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
        onMove(candidate.id, 'Screening');
    };
    
    const handleConfirmHire = () => {
        if(!finalRole || !finalSalary || !joinDate) {
            alert("Harap lengkapi data kepegawaian!");
            return;
        }
        if(onHire) {
            onHire(candidate.id, { role: finalRole, salary: finalSalary, joinDate });
        }
    }

    // --- INTERVIEW LOGIC ---
    const handleAddQuestion = () => {
        if (!newQuestion) return;
        setInterviewQnA([...interviewQnA, { id: `cq-${Date.now()}`, text: newQuestion, answer: '' }]);
        setNewQuestion('');
    };

    const handleAnswerChange = (id: string, val: string) => {
        setInterviewQnA(prev => prev.map(q => q.id === id ? { ...q, answer: val } : q));
    };

    const handleAnalyzeInterview = async () => {
        setIsAnalyzing(true);
        const qaText = interviewQnA.map(q => `Q: ${q.text}\nA: ${q.answer}`).join('\n\n');
        const prompt = `Analisa hasil interview kandidat ${candidate.name} untuk posisi ${candidate.roleApplied}. Transkrip: ${qaText}. Berikan penilaian singkat (poin plus & minus).`;
        try {
            const result = await generateBusinessAdvice(prompt, "HR Recruitment Interview Analysis");
            setAiAnalysis(result);
        } catch (e) {
            setAiAnalysis("Gagal menganalisa. Coba lagi.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const canProceedToScreening = REQUIRED_DOCS.every(doc => !doc.required || docStatus[doc.id] === 'valid');

    const renderStageContent = () => {
        switch (candidate.stage) {
            case 'Applied':
                return (
                    <div className="space-y-4">
                        {/* FEATURE 1: AI AUTO SCREENING */}
                        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 p-4 rounded-xl">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                                    <BrainCircuit size={16} className="text-blue-400"/> AI Resume Matcher
                                </h4>
                                {candidate.aiMatchScore !== undefined && (
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                        candidate.aiMatchScore >= 80 ? 'bg-green-500 text-white' : 
                                        candidate.aiMatchScore >= 60 ? 'bg-yellow-500 text-black' : 'bg-red-500 text-white'
                                    }`}>
                                        {candidate.aiMatchScore}% Match
                                    </span>
                                )}
                            </div>
                            
                            {candidate.aiAnalysis ? (
                                <p className="text-xs text-gray-300 leading-relaxed bg-black/20 p-2 rounded-lg border border-white/5">
                                    "{candidate.aiAnalysis}"
                                </p>
                            ) : (
                                <div className="text-center py-2">
                                    <button 
                                        onClick={handleAiScan} 
                                        disabled={isAnalyzing}
                                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 mx-auto disabled:opacity-50"
                                    >
                                        <Sparkles size={14} /> {isAnalyzing ? 'Menganalisa CV...' : 'Analisa Kecocokan'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* DOCUMENT CHECKLIST */}
                        <div className="bg-black/20 rounded-xl border border-white/5 overflow-hidden">
                            {REQUIRED_DOCS.map((doc) => {
                                // @ts-ignore
                                const hasFile = candidate.documents && candidate.documents[doc.id];
                                return (
                                <div key={doc.id} className="flex items-center justify-between p-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${docStatus[doc.id] === 'valid' ? 'bg-green-500/20 text-green-400' : (docStatus[doc.id] === 'invalid' ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-gray-400')}`}>
                                            <Paperclip size={16} />
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold ${docStatus[doc.id] === 'invalid' ? 'text-red-400 line-through' : 'text-gray-200'}`}>
                                                {doc.label}
                                            </p>
                                            <div className="flex gap-2">
                                                {doc.required && <span className="text-[9px] text-orange-400 bg-orange-500/10 px-1.5 rounded border border-orange-500/20">Wajib</span>}
                                                {hasFile ? (
                                                    <button onClick={() => handleViewFile(doc.id, doc.label)} className="text-[10px] text-blue-400 hover:underline flex items-center gap-1 font-bold">
                                                        <Eye size={10} /> Lihat
                                                    </button>
                                                ) : (
                                                    <>
                                                        <input type="file" className="hidden" ref={el => fileInputRefs.current[doc.id] = el} onChange={(e) => handleFileChange(doc.id, e)} accept=".jpg,.jpeg,.png,.pdf" />
                                                        <button onClick={() => handleUploadClick(doc.id)} className="text-[10px] text-gray-500 hover:text-white hover:underline flex items-center gap-1"><Upload size={10} /> Upload</button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleDocAction(doc.id, 'invalid')} className={`p-2 rounded-lg transition-all ${docStatus[doc.id] === 'invalid' ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-500 hover:bg-red-500/20 hover:text-red-400'}`}><X size={16} /></button>
                                        <button onClick={() => handleDocAction(doc.id, 'valid')} disabled={!hasFile} className={`p-2 rounded-lg transition-all ${docStatus[doc.id] === 'valid' ? 'bg-green-600 text-white' : (hasFile ? 'bg-white/5 text-gray-500 hover:bg-green-500/20 hover:text-green-400' : 'bg-white/5 text-gray-700 cursor-not-allowed')}`}><Check size={16} /></button>
                                    </div>
                                </div>
                                )
                            })}
                        </div>
                        
                        <div className="flex gap-3 pt-2">
                             <button onClick={handleRejectCandidate} className="flex-1 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-bold text-xs hover:bg-red-500/20 transition-all flex items-center justify-center gap-2">
                                <XCircle size={16} /> Tolak
                             </button>
                             <button onClick={handleAcceptAdministration} disabled={!canProceedToScreening} className="flex-[2] py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2">
                                <CheckCircle2 size={16}/> Lolos
                             </button>
                        </div>
                    </div>
                );

            case 'Screening':
                return (
                    <div className="space-y-4">
                        <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl flex items-start gap-3">
                            <Calendar size={24} className="text-orange-400 mt-1" />
                            <div>
                                <h4 className="font-bold text-orange-200 text-sm">Jadwalkan Interview</h4>
                                <p className="text-xs text-gray-400 mt-1">Tentukan waktu untuk mengundang kandidat.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Tanggal</label><input type="date" value={interviewDate} onChange={e => setInterviewDate(e.target.value)} className="w-full bg-black/30 text-white rounded-xl px-3 py-2 text-sm border border-white/10 outline-none focus:border-orange-500"/></div>
                            <div><label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Jam</label><input type="time" value={interviewTime} onChange={e => setInterviewTime(e.target.value)} className="w-full bg-black/30 text-white rounded-xl px-3 py-2 text-sm border border-white/10 outline-none focus:border-orange-500"/></div>
                        </div>
                        <div className="flex gap-3 pt-2">
                             <button onClick={() => onMove(candidate.id, 'TalentPool')} className="flex-1 py-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl font-bold text-xs hover:bg-indigo-500/20 transition-all flex items-center justify-center gap-2"><Archive size={16} /> Talent Pool</button>
                             <button onClick={() => { if(!interviewDate || !interviewTime) return alert("Pilih tanggal & jam!"); window.open(`https://wa.me/?text=${encodeURIComponent(`Halo ${candidate.name}, kami mengundang interview...`)}`, '_blank'); onMove(candidate.id, 'Interview'); }} className="flex-[2] py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"><MessageSquare size={16}/> Undang (WA)</button>
                        </div>
                    </div>
                );

            case 'Interview':
                return (
                    <div className="space-y-6">
                         {/* FEATURE 2: STRUCTURED SCORECARD */}
                         <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl space-y-3">
                             <h4 className="font-bold text-white flex items-center gap-2 text-sm">
                                 <Zap size={16} className="text-yellow-400"/> Penilaian Interview
                             </h4>
                             <StarRating label="Komunikasi" value={structScore.communication} onChange={v => setStructScore({...structScore, communication: v})} />
                             <StarRating label="Skill Teknis" value={structScore.technical} onChange={v => setStructScore({...structScore, technical: v})} />
                             <StarRating label="Attitude" value={structScore.attitude} onChange={v => setStructScore({...structScore, attitude: v})} />
                             <StarRating label="Culture Fit" value={structScore.culture} onChange={v => setStructScore({...structScore, culture: v})} />
                             
                             <div className="pt-2 flex justify-between items-center border-t border-white/10">
                                 <span className="text-xs text-gray-400">Rata-rata: <b>{((structScore.communication + structScore.technical + structScore.attitude + structScore.culture)/4).toFixed(1)}</b></span>
                                 <button onClick={handleSaveScorecard} className="text-[10px] bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg text-white font-bold transition-colors">Simpan Nilai</button>
                             </div>
                         </div>
                         
                         {/* Q&A & AI Analysis (Existing Logic) */}
                         <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                             {interviewQnA.map((q, idx) => (
                                 <div key={q.id} className="p-3 rounded-xl bg-white/5 border border-white/5">
                                     <p className="text-sm font-bold text-gray-200 mb-2">{idx + 1}. {q.text}</p>
                                     <textarea className="w-full bg-black/30 rounded-lg p-2 text-xs text-white border border-white/10 focus:border-blue-500 outline-none resize-none h-16" placeholder="Catat jawaban..." value={q.answer} onChange={(e) => handleAnswerChange(q.id, e.target.value)}/>
                                 </div>
                             ))}
                             <button onClick={handleAnalyzeInterview} disabled={isAnalyzing} className="w-full py-2 bg-purple-600/20 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-bold hover:bg-purple-600 hover:text-white transition-colors flex items-center justify-center gap-2"><BrainCircuit size={14} /> {isAnalyzing ? 'Menganalisa...' : 'Analisa Jawaban'}</button>
                             {aiAnalysis && <div className="text-xs text-gray-300 bg-black/20 p-3 rounded-lg border border-white/5 italic">{aiAnalysis}</div>}
                         </div>

                        <div className="flex gap-3 pt-2">
                             <button onClick={() => onMove(candidate.id, 'TalentPool')} className="flex-1 py-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl font-bold text-xs hover:bg-indigo-500/20 transition-all flex items-center justify-center gap-2"><Archive size={16} /> Pool</button>
                             <button onClick={() => onMove(candidate.id, 'Offering')} className="flex-[2] py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"><CheckCircle2 size={16}/> Lolos ke Offering</button>
                        </div>
                    </div>
                );

            case 'Offering':
                return (
                    <div className="space-y-4">
                        {!isOnboarding ? (
                            <>
                                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl">
                                    <h4 className="font-bold text-green-400 text-sm mb-3 flex items-center gap-2"><DollarSign size={16}/> Negosiasi Gaji</h4>
                                    <GlassInput type="number" placeholder="Nominal Penawaran (Rp)" value={offerAmount} onChange={e => setOfferAmount(e.target.value)} className="text-sm"/>
                                    <p className="text-[10px] text-gray-400 mt-2 italic">*Offer Letter akan dikirim otomatis.</p>
                                </div>
                                <div className="flex gap-3 pt-2">
                                     <button onClick={() => onMove(candidate.id, 'TalentPool')} className="flex-1 py-3 bg-white/5 text-gray-400 hover:text-white rounded-xl font-bold text-xs transition-all">Batal</button>
                                     <button onClick={() => setIsOnboarding(true)} className="flex-[2] py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"><Send size={16}/> Kirim Offer & Hire</button>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                <div className="bg-blue-600/10 border border-blue-500/30 p-4 rounded-xl flex items-center gap-3">
                                    <div className="p-2 bg-blue-600 rounded-full text-white"><UserPlus size={20} /></div>
                                    <div><h4 className="font-bold text-blue-400 text-sm">Onboarding Pegawai Baru</h4><p className="text-xs text-gray-300 mt-1">Lengkapi data untuk membuat akun pegawai.</p></div>
                                </div>
                                <div className="space-y-3">
                                    <div><label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Posisi / Jabatan</label><GlassInput value={finalRole} onChange={e => setFinalRole(e.target.value)} className="text-sm font-bold" /></div>
                                    <div><label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Gaji Pokok (Rp)</label><GlassInput type="number" value={finalSalary} onChange={e => setFinalSalary(e.target.value)} className="text-sm font-bold" placeholder="0" /></div>
                                    <div><label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Tanggal Masuk</label><input type="date" value={joinDate} onChange={e => setJoinDate(e.target.value)} className="w-full bg-black/30 text-white rounded-xl px-4 py-2.5 text-sm border border-white/10 outline-none focus:border-blue-500"/></div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button onClick={() => setIsOnboarding(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl font-bold text-xs">Kembali</button>
                                    <button onClick={handleConfirmHire} className="flex-[2] py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"><CheckCircle2 size={16} /> Resmikan Pegawai</button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            
            case 'Hired':
                return (
                    <div className="text-center py-6">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_#22c55e]"><CheckCircle2 size={32} className="text-white"/></div>
                        <h3 className="text-xl font-bold text-white">Sudah Diterima!</h3>
                        <p className="text-sm text-gray-400 mt-2 mb-6">Kandidat ini sudah resmi menjadi pegawai.</p>
                        <button onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-xl text-sm font-bold transition-colors">Tutup</button>
                    </div>
                );

            case 'TalentPool':
                return (
                     <div className="text-center py-6">
                        <div className="w-16 h-16 bg-indigo-500/20 border border-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4"><Archive size={32} className="text-indigo-400"/></div>
                        <h3 className="text-xl font-bold text-white">Talent Pool</h3>
                        <p className="text-sm text-gray-400 mt-2 mb-6">Kandidat ini disimpan untuk kebutuhan masa depan.</p>
                        <button onClick={() => onMove(candidate.id, 'Screening')} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl text-sm font-bold transition-colors">Proses Kembali</button>
                    </div>
                );

            default: return null;
        }
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title={`Proses: ${candidate.name}`}>
                <div className="flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xl font-bold text-white shadow-inner">{candidate.name.charAt(0)}</div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">{candidate.roleApplied}</p>
                            <h3 className="text-lg font-bold text-white">{candidate.name}</h3>
                            <div className="flex gap-3 mt-1 text-[10px] text-gray-500">
                                <span className="flex items-center gap-1"><Mail size={10}/> Email</span>
                                <span className="flex items-center gap-1"><Phone size={10}/> Telepon</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1">{renderStageContent()}</div>
                </div>
            </Modal>
            
            {/* PREVIEW IMAGE LOGIC (unchanged) */}
            {previewFile && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm animate-in fade-in">
                    <div className="absolute inset-0" onClick={() => setPreviewFile(null)} />
                    <div className="w-full max-w-4xl bg-[#1e293b] rounded-2xl overflow-hidden relative z-10 flex flex-col h-[85vh] border border-white/10 shadow-2xl">
                         <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center shrink-0">
                             <div><h4 className="font-bold text-white text-lg">{previewFile.label}</h4><p className="text-xs text-gray-400">{candidate.name}</p></div>
                             <div className="flex items-center gap-2">
                                 <button onClick={handleZoomOut} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300"><ZoomOut size={16}/></button>
                                 <span className="text-xs font-mono text-gray-400 w-8 text-center">{(zoomLevel * 100).toFixed(0)}%</span>
                                 <button onClick={handleZoomIn} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300"><ZoomIn size={16}/></button>
                                 <button onClick={handleResetZoom} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 mr-4"><RotateCcw size={16}/></button>
                                 <button onClick={() => setPreviewFile(null)} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"><X size={24} /></button>
                             </div>
                         </div>
                         <div className="flex-1 bg-black/50 overflow-auto flex items-center justify-center p-6 relative">
                             <div className="absolute inset-0 opacity-20 pointer-events-none" style={{backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                             <div style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.2s ease' }} className="origin-center">
                                <img src={previewFile.data} alt="Dokumen Preview" className="max-w-full max-h-full object-contain shadow-2xl rounded-lg" />
                             </div>
                         </div>
                         <div className="p-4 bg-[#1e293b] border-t border-white/10 flex justify-center gap-4 shrink-0">
                            <button onClick={() => { handleDocAction(previewFile.type, 'invalid'); setPreviewFile(null); }} className="flex items-center gap-2 px-6 py-3 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-600/30 rounded-xl font-bold transition-all group"><XCircle size={20}/> Tolak</button>
                            <button onClick={() => { handleDocAction(previewFile.type, 'valid'); setPreviewFile(null); }} className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold shadow-lg transition-all transform active:scale-95 hover:shadow-green-500/20"><CheckCircle2 size={20} /> Valid</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CandidateStageModal;
