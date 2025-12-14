
import React, { useRef, useState } from 'react';
import { Briefcase, Plus, Globe, Users, FileText, CheckCircle2, Megaphone, Share2, BarChart2, MessageCircle, Heart, Eye, MousePointerClick, CornerUpRight, Send, Bot, Filter, Zap, Lock, MessageSquare, Search, UserCheck, Instagram, Facebook, Linkedin, Kanban, Upload, QrCode, Monitor, Copy, Link as LinkIcon, UserPlus, ArrowRight, Trash2, CheckSquare, XCircle, Archive } from 'lucide-react';
import { useRecruitmentLogic } from '../../hooks/useRecruitmentLogic';
import GlassPanel from '../../../../components/common/GlassPanel';
import GlassInput from '../../../../components/common/GlassInput';
import Modal from '../../../../components/common/Modal';
import CompactNumber from '../../../../components/common/CompactNumber';
import RecruitmentPipeline from './RecruitmentPipeline';
import CandidateStageModal from '../modals/CandidateStageModal';
import PublicJobApplication from '../public/PublicJobApplication';

const RecruitmentView: React.FC = () => {
  const {
      vacancies,
      availableChannels,
      isCreateModalOpen, setIsCreateModalOpen,
      isPublishModalOpen, setIsPublishModalOpen,
      isFeedbackModalOpen, setIsFeedbackModalOpen,
      selectedVacancy,
      vacancyStats,
      
      viewMode, setViewMode,

      activeBusiness,
      getApplicationLink,

      // Pipeline Filter
      selectedPipelineVacancyId, 
      setSelectedPipelineVacancyId,
      filteredCandidates,
      
      // BULK ACTIONS (Feature 3)
      selectedCandidateIds,
      toggleCandidateSelection,
      handleBulkAction,

      // Feature 1 & 2 Methods passed to Modal
      analyzeCandidateCV,
      updateInterviewScores,

      // Feedback Logic
      feedbacks, 
      feedbackSearchTerm, setFeedbackSearchTerm,
      feedbackFilterType, setFeedbackFilterType,
      feedbackPlatformFilter, setFeedbackPlatformFilter,
      
      replyDrafts, handleReplyChange, submitReply, triggerAutoReply, markAsCandidate,
      
      // Pipeline & Stage Modal
      candidates, moveCandidate, updateCandidateDoc,
      isStageModalOpen, setIsStageModalOpen,
      selectedCandidate, handleSelectCandidate, updateCandidateScore,
      
      handlePublicSubmit, 

      // Hiring Logic 
      confirmHiring,

      title, setTitle,
      department, setDepartment,
      type, setType,
      salaryRange, setSalaryRange,
      description, setDescription,
      selectedChannels,

      handleCreateVacancy,
      handleOpenPublish,
      handleViewFeedback,
      handleToggleChannel,
      handlePublish,
      handleCloseVacancy,
      stats
  } = useRecruitmentLogic();
  
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showPortalPreview, setShowPortalPreview] = useState(false); 

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      alert("Link tersalin ke clipboard!");
  }

  // --- PREVIEW MODE RENDER ---
  if (showPortalPreview) {
      return (
          <div className="fixed inset-0 z-[100] bg-black">
              <PublicJobApplication 
                  vacancies={vacancies}
                  onClose={() => setShowPortalPreview(false)}
                  onSubmit={(c) => { handlePublicSubmit(c); setShowPortalPreview(false); }}
                  businessName={activeBusiness?.name || "SIBOS Business"}
              />
          </div>
      );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in zoom-in-95 relative">
        
        {/* TOP BAR: TABS & ACTIONS */}
        <div className="lg:col-span-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
             <div className="flex items-center gap-2">
                 <button 
                    onClick={() => setViewMode('vacancies')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'vacancies' ? 'bg-orange-600 text-white shadow-lg' : 'bg-transparent text-gray-400 hover:text-white'}`}
                 >
                     <Briefcase size={16} /> Daftar Lowongan
                 </button>
                 <button 
                    onClick={() => setViewMode('pipeline')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'pipeline' ? 'bg-orange-600 text-white shadow-lg' : 'bg-transparent text-gray-400 hover:text-white'}`}
                 >
                     <Kanban size={16} /> Pipeline Pelamar
                 </button>
             </div>

             <div className="flex gap-2 items-center flex-wrap">
                 {/* PREVIEW BUTTON */}
                 <button 
                    onClick={() => setShowPortalPreview(true)}
                    className="p-2.5 bg-white/5 hover:bg-blue-600/20 text-gray-300 hover:text-blue-400 rounded-xl border border-white/5 transition-colors flex items-center gap-2"
                    title="Lihat Tampilan Pelamar"
                 >
                     <Eye size={18} /> <span className="hidden sm:inline text-xs font-bold">Preview Portal</span>
                 </button>

                 {/* SHARE QR & LINK BUTTON */}
                 <button 
                    onClick={() => setIsShareModalOpen(true)}
                    className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl border border-white/5 transition-colors"
                    title="Share Link / QR Code Global"
                 >
                     <QrCode size={18} />
                 </button>

                 <div className="w-px h-6 bg-white/10 mx-1"></div>

                 {viewMode === 'vacancies' && (
                     <button onClick={() => setIsCreateModalOpen(true)} className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-xl flex items-center gap-2 font-bold text-sm transition-colors">
                        <Plus size={16} /> Buat Lowongan
                    </button>
                 )}
             </div>
        </div>

        {/* ... (CONTENT AREA Logic) ... */}
        {viewMode === 'vacancies' ? (
            <>
                {/* ... (Existing Vacancy List Code) ... */}
                <div className="lg:col-span-9 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {vacancies.map(vac => (
                            <GlassPanel key={vac.id} className="p-5 rounded-2xl border border-white/5 hover:border-orange-500/30 transition-all group relative overflow-hidden">
                                {vac.status === 'Published' && (
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-bl-full -mr-10 -mt-10 pointer-events-none"></div>
                                )}
                                <div className="flex justify-between items-start mb-3 relative z-10">
                                    <div>
                                        <h4 className="font-bold text-white text-lg">{vac.title}</h4>
                                        <p className="text-sm text-gray-400">{vac.department} • <span className="text-orange-400">{vac.type}</span></p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                                        vac.status === 'Published' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                        vac.status === 'Closed' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                        'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                    }`}>
                                        {vac.status}
                                    </span>
                                </div>
                                <div className="flex gap-4 text-xs text-gray-300 mb-4">
                                    <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded">
                                        <Users size={12} /> {vac.applicantsCount} Pelamar
                                    </span>
                                    <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded">
                                        <FileText size={12} /> {vac.salaryRange}
                                    </span>
                                </div>
                                {vac.status === 'Published' && (
                                     <div className="flex items-center gap-2 mb-4 bg-black/20 p-2 rounded-lg border border-white/5">
                                         <LinkIcon size={12} className="text-gray-500" />
                                         <p className="text-[10px] text-blue-400 truncate flex-1 font-mono">{getApplicationLink(vac.id)}</p>
                                         <button onClick={() => copyToClipboard(getApplicationLink(vac.id))} className="text-gray-400 hover:text-white" title="Copy Link">
                                             <Copy size={12} />
                                         </button>
                                     </div>
                                )}
                                <div className="flex gap-2 pt-4 border-t border-white/5">
                                    {vac.status === 'Draft' ? (
                                        <button onClick={() => handleOpenPublish(vac)} className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all">
                                            <Share2 size={14} /> Publish Omnichannel
                                        </button>
                                    ) : (
                                        <button onClick={() => handleViewFeedback(vac)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all border border-white/10">
                                            <BarChart2 size={14} className="text-orange-400"/> Lihat Respon
                                        </button>
                                    )}
                                    {vac.status === 'Published' && (
                                        <button onClick={() => handleCloseVacancy(vac.id)} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-bold transition-colors">
                                            Tutup
                                        </button>
                                    )}
                                </div>
                            </GlassPanel>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-3 flex flex-col gap-4">
                    <GlassPanel className="p-5 rounded-2xl border border-white/5">
                        <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                            <Globe size={16} className="text-blue-400"/> Recruitment Stats
                        </h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5">
                                <span className="text-gray-400 text-sm">Lowongan Aktif</span>
                                <span className="font-bold text-green-400">{stats.active}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5">
                                <span className="text-gray-400 text-sm">Total Pelamar</span>
                                <span className="font-bold text-white">{stats.applicants}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5">
                                <span className="text-gray-400 text-sm">Draft</span>
                                <span className="font-bold text-yellow-400">{stats.drafts}</span>
                            </div>
                        </div>
                    </GlassPanel>
                    
                    <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs text-orange-200/80 leading-relaxed">
                    <div className="flex items-center gap-2 mb-2 text-orange-400 font-bold">
                        <Megaphone size={14} />
                        <span>Tips Rekrutmen</span>
                    </div>
                    Gunakan fitur <b>Publish Omnichannel</b> untuk menyebarkan info lowongan dan mendapatkan <b>Link Pendaftaran</b> yang bisa ditaruh di Bio Instagram atau LinkedIn.
                    </div>
                </div>
            </>
        ) : (
            // PIPELINE VIEW
            <div className="lg:col-span-12 animate-in fade-in slide-in-from-right-4 flex flex-col gap-6 relative">
                
                {/* VACANCY SELECTOR */}
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Briefcase size={20} className="text-blue-400" />
                        <div>
                            <h3 className="text-white font-bold">Pipeline Lamaran</h3>
                            <p className="text-xs text-gray-400">Pilih lowongan untuk melihat kandidat.</p>
                        </div>
                    </div>
                    
                    <div className="relative w-full sm:w-72">
                         <select 
                            className="w-full bg-[#1e293b] text-white border border-white/10 rounded-xl px-4 py-3 text-sm font-bold appearance-none cursor-pointer outline-none focus:border-orange-500"
                            value={selectedPipelineVacancyId}
                            onChange={(e) => setSelectedPipelineVacancyId(e.target.value)}
                         >
                             <option value="">-- Pilih Lowongan Pekerjaan --</option>
                             {vacancies.map(v => (
                                 <option key={v.id} value={v.id}>{v.title}</option>
                             ))}
                         </select>
                         <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                             ▼
                         </div>
                    </div>
                </div>

                {/* PIPELINE CONTENT */}
                {selectedPipelineVacancyId ? (
                    <div className="space-y-4">
                        {/* Link Info Bar */}
                        <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-xl text-xs text-blue-200">
                            <LinkIcon size={14} />
                            <span>Link Lowongan:</span>
                            <span className="font-mono text-white select-all">{getApplicationLink(selectedPipelineVacancyId)}</span>
                            <button onClick={() => copyToClipboard(getApplicationLink(selectedPipelineVacancyId))} className="ml-auto font-bold hover:text-white hover:underline">Copy</button>
                        </div>

                        <RecruitmentPipeline 
                            candidates={filteredCandidates}
                            onMoveCandidate={moveCandidate}
                            onSelectCandidate={handleSelectCandidate} 
                            selectedIds={selectedCandidateIds} // FEATURE 3 PROP
                            onToggleSelect={toggleCandidateSelection} // FEATURE 3 PROP
                        />
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed border-white/10 rounded-3xl bg-white/5">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <Kanban size={40} className="text-gray-500 opacity-50" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-400">Pilih Lowongan</h3>
                        <p className="text-sm text-gray-500 mt-2">Silakan pilih lowongan di atas untuk melihat proses rekrutmen.</p>
                    </div>
                )}
            </div>
        )}

        {/* FEATURE 3: FLOATING BULK ACTION BAR */}
        {selectedCandidateIds.length > 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in w-[90%] max-w-lg">
                <div className="bg-[#1e293b] border border-orange-500/30 rounded-2xl shadow-2xl p-3 flex items-center justify-between gap-4 pr-6 pl-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap">
                            {selectedCandidateIds.length} Dipilih
                        </div>
                        <p className="text-xs text-gray-400 hidden sm:block">Aksi Massal</p>
                    </div>
                    
                    <div className="flex gap-2">
                         <button 
                            onClick={() => handleBulkAction('reject')}
                            className="p-2 text-red-400 hover:text-white hover:bg-red-600/20 rounded-lg transition-colors border border-red-500/20"
                            title="Tolak Semua"
                         >
                             <XCircle size={18} />
                         </button>
                         <button 
                            onClick={() => handleBulkAction('move_pool')}
                            className="p-2 text-indigo-400 hover:text-white hover:bg-indigo-600/20 rounded-lg transition-colors border border-indigo-500/20"
                            title="Pindah Talent Pool"
                         >
                             <Archive size={18} />
                         </button>
                         <button 
                            onClick={() => handleBulkAction('move_interview')}
                            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg"
                         >
                             <MessageSquare size={16} /> Lolos & Invite
                         </button>
                    </div>
                </div>
            </div>
        )}

        {/* ... (Modals remain mostly same) ... */}
        
        {/* MODAL: STAGE ACTION (DYNAMIC) */}
        <CandidateStageModal 
            isOpen={isStageModalOpen}
            onClose={() => setIsStageModalOpen(false)}
            candidate={selectedCandidate}
            onMove={moveCandidate}
            onUpdateScore={updateCandidateScore}
            onUpdateDoc={updateCandidateDoc}
            onHire={(id, data) => confirmHiring(id, data)}
        />

        {/* ... (Publish Modal, Share Modal, Feedback Modal, etc.) ... */}
    </div>
  );
};

export default RecruitmentView;
