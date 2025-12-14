
import React from 'react';
import { RecruitmentCandidate, RecruitmentStage } from '../../types';
import { Instagram, Linkedin, Facebook, MessageCircle, MoreHorizontal, Calendar, Star, ChevronLeft, ChevronRight, Archive, CheckSquare, BrainCircuit, Activity } from 'lucide-react';

interface RecruitmentPipelineProps {
    candidates: RecruitmentCandidate[];
    onMoveCandidate: (id: string, stage: RecruitmentStage) => void;
    onSelectCandidate: (candidate: RecruitmentCandidate) => void;
    selectedIds?: string[];
    onToggleSelect?: (id: string) => void;
}

const STAGES: { id: RecruitmentStage; label: string; color: string; icon?: React.ReactNode }[] = [
    { id: 'Applied', label: 'Baru Masuk', color: 'bg-blue-500' },
    { id: 'Screening', label: 'Screening CV', color: 'bg-purple-500' },
    { id: 'Interview', label: 'Interview', color: 'bg-orange-500' },
    { id: 'Offering', label: 'Offering', color: 'bg-yellow-500' },
    { id: 'Hired', label: 'Hired', color: 'bg-green-500' },
    { id: 'TalentPool', label: 'Talent Pool', color: 'bg-indigo-500', icon: <Archive size={14} /> }
];

const RecruitmentPipeline: React.FC<RecruitmentPipelineProps> = ({ 
    candidates, onMoveCandidate, onSelectCandidate, 
    selectedIds = [], onToggleSelect 
}) => {

    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData("text/plain", id);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, stage: RecruitmentStage) => {
        e.preventDefault();
        const id = e.dataTransfer.getData("text/plain");
        if(id) {
            onMoveCandidate(id, stage);
        }
    };

    const handleManualMove = (e: React.MouseEvent, candidateId: string, currentStage: RecruitmentStage, direction: 'prev' | 'next') => {
        e.stopPropagation();
        const currentIndex = STAGES.findIndex(s => s.id === currentStage);
        if (currentIndex === -1) return;
        const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
        if (newIndex >= 0 && newIndex < STAGES.length) {
            onMoveCandidate(candidateId, STAGES[newIndex].id);
        }
    };
    
    const getSourceIcon = (source: string) => {
        const s = source.toLowerCase();
        if(s.includes('instagram')) return <Instagram size={12} />;
        if(s.includes('linkedin')) return <Linkedin size={12} />;
        if(s.includes('facebook')) return <Facebook size={12} />;
        return <MessageCircle size={12} />;
    };

    const getAiBadgeColor = (score: number) => {
        if (score >= 80) return 'bg-green-500 text-green-950';
        if (score >= 60) return 'bg-yellow-500 text-yellow-950';
        return 'bg-red-500 text-white';
    };

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 h-[600px] items-start custom-scrollbar">
            {STAGES.map((stage, stageIndex) => {
                const stageCandidates = candidates.filter(c => c.stage === stage.id);
                const isFirstStage = stageIndex === 0;
                const isLastStage = stageIndex === STAGES.length - 1;

                return (
                    <div 
                        key={stage.id}
                        className="flex-shrink-0 w-72 flex flex-col h-full bg-white/5 rounded-2xl border border-white/5"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, stage.id)}
                    >
                        {/* Column Header */}
                        <div className="p-3 border-b border-white/5 flex justify-between items-center bg-black/20 rounded-t-2xl">
                            <div className="flex items-center gap-2">
                                <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`}></div>
                                <span className="font-bold text-white text-sm flex items-center gap-2">
                                    {stage.label}
                                    {stage.icon}
                                </span>
                            </div>
                            <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-gray-300 font-bold">
                                {stageCandidates.length}
                            </span>
                        </div>

                        {/* Drop Zone */}
                        <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                            {stageCandidates.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-white/5 rounded-xl min-h-[100px]">
                                    <p className="text-xs">Kosong</p>
                                </div>
                            )}
                            {stageCandidates.map(c => {
                                const isSelected = selectedIds.includes(c.id);
                                return (
                                <div 
                                    key={c.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, c.id)}
                                    onClick={() => onSelectCandidate(c)}
                                    className={`p-3 rounded-xl border cursor-pointer shadow-lg group relative flex flex-col gap-2 transition-all ${isSelected ? 'bg-blue-600/20 border-blue-500 ring-1 ring-blue-500' : 'bg-[#1e293b] border-white/10 hover:bg-white/5 hover:border-orange-500/50'}`}
                                >
                                    {/* Selection Checkbox */}
                                    {onToggleSelect && (
                                        <div 
                                            onClick={(e) => { e.stopPropagation(); onToggleSelect(c.id); }}
                                            className={`absolute top-2 right-2 p-1 rounded-md transition-all z-10 ${isSelected ? 'bg-blue-500 text-white' : 'bg-black/40 text-gray-500 hover:text-white'}`}
                                        >
                                            <CheckSquare size={14} />
                                        </div>
                                    )}

                                    {/* Card Header */}
                                    <div className="flex justify-between items-start pr-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-xs font-bold text-white shrink-0">
                                                {c.name.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-white leading-tight truncate">{c.name}</p>
                                                <p className="text-[10px] text-gray-400 truncate">{c.roleApplied}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* AI Score Badge (Feature 1) */}
                                    {c.aiMatchScore !== undefined && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className={`px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 ${getAiBadgeColor(c.aiMatchScore)}`}>
                                                <BrainCircuit size={10} /> {c.aiMatchScore}% Match
                                            </div>
                                            {c.interviewScores && (
                                                <div className="px-2 py-0.5 rounded text-[9px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30 flex items-center gap-1">
                                                    <Star size={10} fill="currentColor"/> {c.interviewScores.average.toFixed(1)}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Card Info */}
                                    <div className="flex items-center justify-between text-[10px] text-gray-500 mt-1">
                                        <div className="flex items-center gap-1">
                                            {getSourceIcon(c.source)} {c.source}
                                        </div>
                                        <span className="flex items-center gap-0.5">
                                            <Calendar size={10} /> {new Date(c.applyDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                                        </span>
                                    </div>

                                    {/* NAVIGATION CONTROLS */}
                                    <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-1">
                                        <button 
                                            onClick={(e) => handleManualMove(e, c.id, c.stage, 'prev')}
                                            disabled={isFirstStage}
                                            className={`p-1 rounded-lg transition-colors ${isFirstStage ? 'text-gray-700 cursor-not-allowed' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
                                            title="Mundur"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        
                                        <span className="text-[9px] text-gray-600 font-bold uppercase tracking-wider">
                                            Geser
                                        </span>

                                        <button 
                                            onClick={(e) => handleManualMove(e, c.id, c.stage, 'next')}
                                            disabled={isLastStage}
                                            className={`p-1 rounded-lg transition-colors ${isLastStage ? 'text-gray-700 cursor-not-allowed' : 'text-green-400 hover:bg-green-500/20 hover:text-green-300'}`}
                                            title={isLastStage ? "Selesai" : "Lanjut"}
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    </div>
                )
            })}
        </div>
    );
};

export default RecruitmentPipeline;
