
import React, { useState, useRef } from 'react';
import { JobVacancy, RecruitmentCandidate } from '../../types';
import { Store, UploadCloud, CheckCircle2, ArrowRight, FileText, X, Briefcase, User, Phone, Image as ImageIcon, ChevronLeft, GraduationCap, Shield, AlertCircle, ChevronRight, Send } from 'lucide-react';
import GlassInput from '../../../../components/common/GlassInput';

interface PublicJobApplicationProps {
    vacancies: JobVacancy[];
    onClose?: () => void; 
    onSubmit: (candidate: RecruitmentCandidate) => void;
    businessName: string;
}

// Definisi Dokumen sesuai standar HR
const REQUIRED_DOCS = [
    { id: 'cv', label: 'Curriculum Vitae (CV)', required: true, icon: FileText, accept: '.pdf' },
    { id: 'ktp', label: 'Foto KTP / Identitas', required: true, icon: User, accept: '.jpg,.jpeg,.png' },
    { id: 'ijazah', label: 'Ijazah Terakhir', required: true, icon: GraduationCap, accept: '.pdf,.jpg,.jpeg,.png' },
    { id: 'skck', label: 'SKCK (Opsional)', required: false, icon: Shield, accept: '.pdf,.jpg,.jpeg,.png' },
    { id: 'portofolio', label: 'Portofolio (Opsional)', required: false, icon: Briefcase, accept: '.pdf' },
];

const PublicJobApplication: React.FC<PublicJobApplicationProps> = ({ vacancies, onSubmit, businessName, onClose }) => {
    const [viewState, setViewState] = useState<'form' | 'success'>('form');
    const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form State
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('');
    
    // Multi Document State: Map docId -> { data, name, size }
    const [documents, setDocuments] = useState<Record<string, { data: string, name: string, size: string }>>({});
    
    // Refs for multiple file inputs
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
    
    const activeVacancies = vacancies.filter(v => v.status === 'Published');

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleFileChange = (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert("Ukuran file maksimal 5MB");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setDocuments(prev => ({
                    ...prev,
                    [docId]: {
                        data: reader.result as string,
                        name: file.name,
                        size: formatFileSize(file.size)
                    }
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveFile = (docId: string) => {
        setDocuments(prev => {
            const newState = { ...prev };
            delete newState[docId];
            return newState;
        });
        if (fileInputRefs.current[docId]) {
            fileInputRefs.current[docId]!.value = '';
        }
    };

    // Validation Helpers
    const isStep1Valid = () => name.trim() !== '' && phone.trim() !== '' && role !== '';
    const isStep2Valid = () => !REQUIRED_DOCS.some(doc => doc.required && !documents[doc.id]);

    const handleNext = () => {
        if (wizardStep === 1 && isStep1Valid()) setWizardStep(2);
        else if (wizardStep === 2 && isStep2Valid()) setWizardStep(3);
    };

    const handleBack = () => {
        if (wizardStep > 1) setWizardStep((prev) => (prev - 1) as 1 | 2 | 3);
    };

    const handleSubmit = async () => {
        if (!isStep1Valid() || !isStep2Valid()) return;

        setIsSubmitting(true);

        // Simulate network delay for UX
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Flatten documents for storage (just the base64 string)
        const docsPayload: Record<string, string> = {};
        Object.entries(documents).forEach(([key, val]) => {
            const doc = val as { data: string };
            docsPayload[key] = doc.data;
        });

        const newCandidate: RecruitmentCandidate = {
            id: `cand-public-${Date.now()}`,
            name,
            roleApplied: role,
            source: 'Portal / QR Scan',
            stage: 'Applied',
            score: 0,
            applyDate: new Date().toISOString().split('T')[0],
            documents: docsPayload,
        };

        onSubmit(newCandidate);
        setViewState('success');
        setIsSubmitting(false);
    };

    if (viewState === 'success') {
        return (
            <div className="fixed inset-0 bg-[#0f172a] z-[200] flex items-center justify-center p-6 overflow-hidden">
                 <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-green-500/20 rounded-full blur-[100px] pointer-events-none" />
                
                {onClose && (
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                )}

                <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center animate-in zoom-in duration-500 shadow-2xl relative z-10">
                    <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_#22c55e] animate-bounce">
                        <CheckCircle2 size={48} className="text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Lamaran Terkirim!</h2>
                    <p className="text-gray-300 mb-8 leading-relaxed">
                        Terima kasih, <b>{name}</b>. Data Anda sudah masuk ke sistem HR kami. Kami akan menghubungi via WhatsApp jika Anda lolos tahap selanjutnya.
                    </p>
                    <button 
                        onClick={() => {
                            setViewState('form');
                            setWizardStep(1);
                            setName(''); setPhone(''); setRole(''); setDocuments({});
                        }} 
                        className="w-full py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors"
                    >
                        Kirim Lamaran Lain
                    </button>
                    <p className="mt-6 text-[10px] text-gray-500">Powered by SIBOS Ecosystem</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-[#0f172a] text-white font-sans selection:bg-orange-500/30 z-[150] flex flex-col">
            {/* Background Decor */}
            <div className="fixed top-[-10%] right-[-10%] w-[300px] h-[300px] bg-orange-600/10 rounded-full blur-[80px] pointer-events-none" />
            
            {/* Header / Nav */}
            <div className="p-4 flex items-center justify-between border-b border-white/5 bg-[#0f172a]/90 backdrop-blur-md shrink-0 relative z-20">
                <div className="flex items-center gap-3">
                     {onClose && (
                        <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                            <X size={18} />
                        </button>
                     )}
                     <div>
                         <h1 className="font-bold text-sm text-white">{businessName}</h1>
                         <p className="text-[10px] text-gray-400">Portal Karir</p>
                     </div>
                </div>
                {/* Step Indicator */}
                <div className="flex items-center gap-1">
                    {[1, 2, 3].map(s => (
                        <div key={s} className={`w-2 h-2 rounded-full transition-all ${wizardStep >= s ? 'bg-orange-500 scale-110' : 'bg-gray-700'}`}></div>
                    ))}
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 p-6 pb-32">
                <div className="max-w-md mx-auto">
                    
                    {/* STEP 1: INFO */}
                    {wizardStep === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-500/20">
                                    <User size={32} className="text-white" />
                                </div>
                                <h2 className="text-xl font-bold">Informasi Diri</h2>
                                <p className="text-sm text-gray-400">Isi data diri Anda dengan benar.</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1.5 block">Posisi Dilamar</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-4 top-3.5 text-orange-500" size={18} />
                                        <select 
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white appearance-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all cursor-pointer font-medium"
                                            value={role}
                                            onChange={e => setRole(e.target.value)}
                                            required
                                        >
                                            <option value="" className="bg-slate-900 text-gray-500">Pilih Posisi...</option>
                                            {activeVacancies.map(v => (
                                                <option key={v.id} value={v.title} className="bg-slate-900">{v.title}</option>
                                            ))}
                                            <option value="General" className="bg-slate-900">Lamaran Umum / Magang</option>
                                        </select>
                                        <div className="absolute right-4 top-4 pointer-events-none border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-gray-500"></div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1.5 block">Nama Lengkap</label>
                                    <GlassInput 
                                        icon={User}
                                        placeholder="Sesuai KTP" 
                                        value={name} 
                                        onChange={e => setName(e.target.value)}
                                        className="bg-black/20"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1.5 block">WhatsApp</label>
                                    <GlassInput 
                                        icon={Phone}
                                        placeholder="Contoh: 0812..." 
                                        type="tel"
                                        value={phone} 
                                        onChange={e => setPhone(e.target.value)}
                                        className="bg-black/20"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: DOCUMENTS */}
                    {wizardStep === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                             <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/20">
                                    <UploadCloud size={32} className="text-white" />
                                </div>
                                <h2 className="text-xl font-bold">Upload Berkas</h2>
                                <p className="text-sm text-gray-400">Lampirkan dokumen pendukung.</p>
                            </div>

                            <div className="space-y-3">
                                {REQUIRED_DOCS.map((doc) => {
                                    const isUploaded = !!documents[doc.id];
                                    const uploadedData = documents[doc.id];

                                    return (
                                        <div key={doc.id} className={`relative rounded-xl border transition-all duration-300 overflow-hidden ${isUploaded ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10 hover:border-orange-500/30'}`}>
                                            <input 
                                                type="file" 
                                                className="hidden"
                                                accept={doc.accept}
                                                // @ts-ignore
                                                ref={el => fileInputRefs.current[doc.id] = el}
                                                onChange={(e) => handleFileChange(doc.id, e)}
                                            />
                                            
                                            <div 
                                                onClick={() => !isUploaded && fileInputRefs.current[doc.id]?.click()}
                                                className={`p-3.5 flex items-center gap-3 ${!isUploaded ? 'cursor-pointer' : ''}`}
                                            >
                                                <div className={`p-2 rounded-lg shrink-0 ${isUploaded ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-400'}`}>
                                                    {isUploaded ? <CheckCircle2 size={18} /> : <doc.icon size={18} />}
                                                </div>
                                                
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className={`text-xs font-bold ${isUploaded ? 'text-white' : 'text-gray-300'}`}>{doc.label}</p>
                                                        {doc.required && !isUploaded && <span className="text-[9px] text-red-400 bg-red-500/10 px-1.5 rounded border border-red-500/20">Wajib</span>}
                                                    </div>
                                                    
                                                    {isUploaded ? (
                                                        <p className="text-[10px] text-green-400 truncate mt-0.5">{uploadedData.name} • {uploadedData.size}</p>
                                                    ) : (
                                                        <p className="text-[10px] text-gray-500 mt-0.5">Tap untuk upload {doc.accept.replace(/\./g, ' ').toUpperCase()}</p>
                                                    )}
                                                </div>

                                                {isUploaded && (
                                                    <button 
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); handleRemoveFile(doc.id); }}
                                                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                )}
                                            </div>
                                            
                                            {isUploaded && (
                                                <div className="absolute bottom-0 left-0 h-0.5 bg-green-500 w-full animate-in slide-in-from-left duration-700"></div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* STEP 3: REVIEW */}
                    {wizardStep === 3 && (
                        <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                             <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-green-500/20">
                                    <Send size={32} className="text-white ml-1 mt-1" />
                                </div>
                                <h2 className="text-xl font-bold">Review Data</h2>
                                <p className="text-sm text-gray-400">Pastikan data sudah benar sebelum kirim.</p>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
                                 <div>
                                     <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Posisi</p>
                                     <p className="text-white font-bold">{role}</p>
                                 </div>
                                 <div className="grid grid-cols-2 gap-4">
                                     <div>
                                         <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Nama</p>
                                         <p className="text-white text-sm">{name}</p>
                                     </div>
                                     <div>
                                         <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">WhatsApp</p>
                                         <p className="text-white text-sm">{phone}</p>
                                     </div>
                                 </div>
                                 <div>
                                     <p className="text-[10px] text-gray-500 uppercase font-bold mb-2">Dokumen Terlampir</p>
                                     <div className="flex flex-wrap gap-2">
                                         {Object.keys(documents).map(key => {
                                             const docDef = REQUIRED_DOCS.find(d => d.id === key);
                                             return (
                                                 <span key={key} className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded-lg flex items-center gap-1">
                                                     <CheckCircle2 size={10} /> {docDef?.label}
                                                 </span>
                                             )
                                         })}
                                     </div>
                                 </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Footer / Navigation */}
            <div className="p-4 bg-[#0f172a] border-t border-white/10 shrink-0 relative z-20">
                <div className="max-w-md mx-auto flex gap-3">
                    {wizardStep > 1 && (
                        <button 
                            onClick={handleBack}
                            className="flex-1 py-3.5 rounded-xl border border-white/10 text-gray-400 hover:text-white font-bold transition-colors flex items-center justify-center gap-2"
                        >
                            <ChevronLeft size={18} /> Kembali
                        </button>
                    )}
                    
                    {wizardStep < 3 ? (
                        <button 
                            onClick={handleNext}
                            disabled={wizardStep === 1 ? !isStep1Valid() : !isStep2Valid()}
                            className="flex-[2] py-3.5 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            Lanjut <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button 
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex-[2] py-3.5 bg-gradient-to-r from-green-600 to-teal-600 hover:brightness-110 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                            {isSubmitting ? (
                                <span className="animate-pulse">Mengirim...</span>
                            ) : (
                                <>Kirim Lamaran <Send size={18} /></>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PublicJobApplication;
