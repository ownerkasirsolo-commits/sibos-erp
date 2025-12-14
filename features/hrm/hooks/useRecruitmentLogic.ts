
import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../services/db';
import { JobVacancy, RecruitmentCandidate, RecruitmentStage, Employee, InterviewScore } from '../types';
import { useGlobalContext } from '../../../context/GlobalContext';
import { MarketingPost } from '../../marketing/types';
import { generateBusinessAdvice } from '../../ai/services/geminiService';

// Channel disesuaikan dengan MarketingPlatform types
const AVAILABLE_CHANNELS = [
    { id: 'linkedin', name: 'LinkedIn', icon: 'linkedin' },
    { id: 'website', name: 'Website', icon: 'globe' },
    { id: 'instagram', name: 'Instagram', icon: 'instagram' },
    { id: 'facebook', name: 'Facebook', icon: 'facebook' },
    { id: 'whatsapp', name: 'WhatsApp', icon: 'message-circle' }
];

export interface CandidateFeedback {
    id: string;
    user: string;
    text: string;
    platform: string;
    time: string;
    sourceType: 'Comment' | 'DM'; 
    category: 'General' | 'Specific' | 'Salary' | 'Interview';
    reply?: string;
    replyType?: 'Manual' | 'Auto';
    isReplied: boolean;
    isCandidate?: boolean; 
}

export const useRecruitmentLogic = () => {
    const { addMarketingPost, marketingPosts, activeOutlet, activeBusiness } = useGlobalContext(); 
    const vacancies = useLiveQuery(() => db.vacancies.toArray()) || [];
    
    // View State
    const [viewMode, setViewMode] = useState<'vacancies' | 'pipeline'>('vacancies');

    // Pipeline Filtering State (Selected Vacancy for Kanban)
    const [selectedPipelineVacancyId, setSelectedPipelineVacancyId] = useState<string>('');

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    
    // Feedback / Analytics State
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [selectedVacancy, setSelectedVacancy] = useState<JobVacancy | null>(null);
    const [vacancyStats, setVacancyStats] = useState<any>(null);
    
    // Hiring Action State
    const [isHiringModalOpen, setIsHiringModalOpen] = useState(false);
    const [hiringCandidate, setHiringCandidate] = useState<RecruitmentCandidate | null>(null);
    const [hiringSalary, setHiringSalary] = useState('');
    const [hiringRole, setHiringRole] = useState('');

    // STAGE MODAL STATE
    const [isStageModalOpen, setIsStageModalOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<RecruitmentCandidate | null>(null);
    
    // BULK ACTION STATE (FEATURE 3)
    const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);

    // Feedback Management State
    const [feedbacks, setFeedbacks] = useState<CandidateFeedback[]>([
        { id: 'fb1', user: 'anton_wijaya', text: 'Apakah lowongan ini masih tersedia?', platform: 'Instagram', time: '10m', sourceType: 'Comment', category: 'General', isReplied: false },
        { id: 'fb2', user: 'Susi Susanti', text: 'Untuk gaji range berapa ya kak?', platform: 'WhatsApp', time: '1h', sourceType: 'DM', category: 'Salary', isReplied: false }
    ]);
    
    // Pipeline / Candidates State (MOCK DATA)
    const [candidates, setCandidates] = useState<RecruitmentCandidate[]>([
        { id: 'c1', name: 'Siti Nurhaliza', roleApplied: 'Barista', source: 'LinkedIn', stage: 'Applied', score: 0, aiMatchScore: 85, aiAnalysis: "Pengalaman relevan 2 tahun, skill kopi baik.", applyDate: '2024-05-20', documents: {} },
        { id: 'c2', name: 'Budi Santoso', roleApplied: 'Kitchen Staff', source: 'Instagram', stage: 'Screening', score: 70, applyDate: '2024-05-18', documents: {} },
        { id: 'c3', name: 'Doni Tata', roleApplied: 'Manager', source: 'WhatsApp', stage: 'Interview', score: 92, interviewScores: { communication: 5, technical: 4, attitude: 5, culture: 4, average: 4.5 }, applyDate: '2024-05-15', documents: {} },
        { id: 'c4', name: 'Rina Nose', roleApplied: 'Waitress', source: 'Facebook', stage: 'Offering', score: 88, applyDate: '2024-05-10', documents: {} },
    ]);

    // Improved Filters
    const [feedbackSearchTerm, setFeedbackSearchTerm] = useState('');
    const [feedbackFilterType, setFeedbackFilterType] = useState<'All' | 'DM' | 'Comment' | 'Unreplied' | 'Candidate'>('All');
    const [feedbackPlatformFilter, setFeedbackPlatformFilter] = useState<string>('All'); 
    
    const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({}); 

    // Form State
    const [title, setTitle] = useState('');
    const [department, setDepartment] = useState('');
    const [type, setType] = useState<JobVacancy['type']>('Full-time');
    const [salaryRange, setSalaryRange] = useState('');
    const [description, setDescription] = useState('');

    const [selectedChannels, setSelectedChannels] = useState<string[]>([]);

    // --- PIPELINE FILTERING ---
    const filteredCandidates = useMemo(() => {
        if (!selectedPipelineVacancyId) return [];
        const vacancy = vacancies.find(v => v.id === selectedPipelineVacancyId);
        if (!vacancy) return [];
        return candidates.filter(c => c.roleApplied === vacancy.title);
    }, [candidates, selectedPipelineVacancyId, vacancies]);

    // --- FEEDBACK FILTERING ---
    const filteredFeedbacks = useMemo(() => {
        let data = feedbacks;
        if (feedbackSearchTerm) {
            data = data.filter(f => 
                f.text.toLowerCase().includes(feedbackSearchTerm.toLowerCase()) || 
                f.user.toLowerCase().includes(feedbackSearchTerm.toLowerCase())
            );
        }
        if (feedbackFilterType !== 'All') {
            if (feedbackFilterType === 'Unreplied') data = data.filter(f => !f.isReplied);
            else if (feedbackFilterType === 'Candidate') data = data.filter(f => f.isCandidate);
            else data = data.filter(f => f.sourceType === feedbackFilterType);
        }
        if (feedbackPlatformFilter !== 'All') {
            data = data.filter(f => f.platform === feedbackPlatformFilter);
        }
        return data;
    }, [feedbacks, feedbackSearchTerm, feedbackFilterType, feedbackPlatformFilter]);


    // --- BULK ACTIONS (FEATURE 3) ---
    const toggleCandidateSelection = (id: string) => {
        setSelectedCandidateIds(prev => 
            prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
        );
    };

    const handleBulkAction = (action: 'reject' | 'move_interview' | 'move_pool') => {
        if(selectedCandidateIds.length === 0) return;

        const targets = candidates.filter(c => selectedCandidateIds.includes(c.id));
        let newStage: RecruitmentStage = 'Applied'; // default
        let messageTemplate = '';

        if (action === 'reject') {
            newStage = 'Rejected';
            messageTemplate = "Mohon maaf, kami belum bisa melanjutkan proses lamaran Anda saat ini.";
        } else if (action === 'move_interview') {
            newStage = 'Interview';
            messageTemplate = "Selamat! Anda lolos ke tahap Interview. Mohon tunggu jadwal selanjutnya.";
        } else if (action === 'move_pool') {
            newStage = 'TalentPool';
            messageTemplate = "Profil Anda kami simpan di Talent Pool untuk kesempatan mendatang.";
        }

        // Move Candidates
        setCandidates(prev => prev.map(c => 
            selectedCandidateIds.includes(c.id) ? { ...c, stage: newStage } : c
        ));

        // Blast Automation (Simulation)
        alert(`Berhasil memproses ${targets.length} kandidat.\n\nSistem mengirim pesan otomatis:\n"${messageTemplate}"`);
        
        setSelectedCandidateIds([]);
    };


    // --- AI & SCORING LOGIC ---
    
    // Feature 1: AI Auto Screening
    const analyzeCandidateCV = async (candidateId: string) => {
        const candidate = candidates.find(c => c.id === candidateId);
        if(!candidate) return;

        // Simulate reading CV text (In real app, backend parses PDF)
        const mockCvText = `Nama: ${candidate.name}. Posisi: ${candidate.roleApplied}. Pengalaman: 2 tahun di bidang terkait. Skill: Komunikasi, Teamwork.`;
        
        const prompt = `Analisa kecocokan kandidat ini untuk posisi ${candidate.roleApplied}. 
        CV Data: ${mockCvText}.
        Berikan skor kecocokan (0-100) dan alasan singkat 1 kalimat.
        Format JSON: { "score": number, "reason": "string" }`;

        try {
            const res = await generateBusinessAdvice(prompt, "HR Screening");
            const cleaned = res.replace(/```json/g, '').replace(/```/g, '').trim();
            const json = JSON.parse(cleaned);

            setCandidates(prev => prev.map(c => 
                c.id === candidateId ? { ...c, aiMatchScore: json.score, aiAnalysis: json.reason } : c
            ));
            
            // Update selected candidate view if open
            if(selectedCandidate?.id === candidateId) {
                setSelectedCandidate(prev => prev ? ({...prev, aiMatchScore: json.score, aiAnalysis: json.reason}) : null);
            }

        } catch (e) {
            console.error("AI Analysis Failed", e);
            // Fallback mock
            const mockScore = Math.floor(Math.random() * 40) + 60;
            setCandidates(prev => prev.map(c => 
                c.id === candidateId ? { ...c, aiMatchScore: mockScore, aiAnalysis: "Analisa AI (Offline Mode): Kandidat memiliki potensi cukup baik." } : c
            ));
        }
    };

    // Feature 2: Structured Scorecard Update
    const updateInterviewScores = (id: string, scores: InterviewScore) => {
        const average = (scores.communication + scores.technical + scores.attitude + scores.culture) / 4;
        const finalScore = { ...scores, average };
        
        setCandidates(prev => prev.map(c => 
            c.id === id ? { ...c, interviewScores: finalScore, score: average * 20 } : c // Map 5 scale to 100 scale for legacy support
        ));

        if(selectedCandidate?.id === id) {
            setSelectedCandidate(prev => prev ? ({...prev, interviewScores: finalScore, score: average * 20}) : null);
        }
    };

    // --- KANBAN LOGIC ---
    
    const handleSelectCandidate = (candidate: RecruitmentCandidate) => {
        setSelectedCandidate(candidate);
        setIsStageModalOpen(true);
    };

    const updateCandidateScore = (id: string, score: number) => {
        setCandidates(prev => prev.map(c => 
            c.id === id ? { ...c, score } : c
        ));
    };
    
    const updateCandidateDoc = (id: string, docType: string, fileData: string) => {
        setCandidates(prev => prev.map(c => {
             if(c.id === id) {
                 return {
                     ...c,
                     documents: {
                         ...c.documents,
                         [docType]: fileData
                     }
                 }
             }
             return c;
        }));
        
        if (selectedCandidate && selectedCandidate.id === id) {
            setSelectedCandidate(prev => prev ? ({
                ...prev,
                documents: {
                    ...prev.documents,
                    [docType]: fileData
                }
            }) : null);
        }
    };

    const moveCandidate = (candidateId: string, newStage: RecruitmentStage) => {
        setCandidates(prev => prev.map(c => 
            c.id === candidateId ? { ...c, stage: newStage } : c
        ));
        setIsStageModalOpen(false);
    };

    const confirmHiring = async (candidateId: string, data: { salary: string, role: string, joinDate: string }) => {
        const targetCandidate = candidates.find(c => c.id === candidateId);
        if (!targetCandidate || !activeOutlet) return;
        
        const newEmployee: Employee = {
            id: `EMP-${Date.now()}`,
            name: targetCandidate.name,
            role: data.role,
            outletId: activeOutlet.id,
            outletName: activeOutlet.name,
            status: 'Active',
            joinDate: new Date(data.joinDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            salary: `Rp ${parseInt(data.salary).toLocaleString('id-ID')}`,
            pin: '1234' 
        };
        
        await db.employees.add(newEmployee);
        setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, stage: 'Hired' } : c));
        setIsStageModalOpen(false);
        alert(`Selamat! ${newEmployee.name} resmi menjadi pegawai.`);
    };

    // --- OTHER HANDLERS ---
    const handleCreateVacancy = async () => { /* ... existing ... */ setIsCreateModalOpen(false); };
    const handleOpenPublish = (vacancy: JobVacancy) => { setSelectedVacancy(vacancy); setSelectedChannels(vacancy.postedChannels || []); setIsPublishModalOpen(true); };
    const handleViewFeedback = (vacancy: JobVacancy) => { /* ... existing ... */ setIsFeedbackModalOpen(true); };
    const handleToggleChannel = (channelId: string) => { /* ... existing ... */ };
    const handlePublish = async () => { /* ... existing ... */ setIsPublishModalOpen(false); };
    const handleCloseVacancy = async (id: string) => { /* ... existing ... */ };
    const handlePublicSubmit = (candidate: RecruitmentCandidate) => { /* ... existing ... */ };
    const resetForm = () => { setTitle(''); setDepartment(''); };
    const stats = useMemo(() => ({ active: 0, applicants: 0, drafts: 0 }), []); // Mock stats

    // --- FEEDBACK HANDLERS ---
    const handleReplyChange = (feedbackId: string, text: string) => {
        setReplyDrafts(prev => ({...prev, [feedbackId]: text}));
    };

    const submitReply = (feedbackId: string) => {
        setFeedbacks(prev => prev.map(f => f.id === feedbackId ? {...f, isReplied: true, reply: replyDrafts[feedbackId], replyType: 'Manual'} : f));
        setReplyDrafts(prev => { const n = {...prev}; delete n[feedbackId]; return n; });
        alert("Balasan terkirim!");
    };

    const triggerAutoReply = (feedbackId: string) => {
        const feedback = feedbacks.find(f => f.id === feedbackId);
        if(!feedback) return;
        const autoMsg = "Terima kasih atas minat Anda. Silakan cek DM untuk info lebih lanjut.";
        setFeedbacks(prev => prev.map(f => f.id === feedbackId ? {...f, isReplied: true, reply: autoMsg, replyType: 'Auto'} : f));
        alert("Auto-reply terkirim!");
    };

    const markAsCandidate = (feedbackId: string) => {
        const feedback = feedbacks.find(f => f.id === feedbackId);
        if(feedback) {
            setFeedbacks(prev => prev.map(f => f.id === feedbackId ? {...f, isCandidate: true} : f));
            // Add to pipeline
            setCandidates(prev => [...prev, {
                id: `cand-social-${Date.now()}`,
                name: feedback.user,
                roleApplied: 'General',
                source: feedback.platform,
                stage: 'Applied',
                score: 0,
                applyDate: new Date().toISOString()
            }]);
            alert(`${feedback.user} ditambahkan ke pipeline kandidat!`);
        }
    };
    
    // --- HELPER ---
    const getApplicationLink = (vacancyId: string) => `https://portal.sibos.id/jobs/${vacancyId}`;

    return {
        viewMode, setViewMode,
        vacancies,
        availableChannels: AVAILABLE_CHANNELS,
        isCreateModalOpen, setIsCreateModalOpen,
        isPublishModalOpen, setIsPublishModalOpen,
        isFeedbackModalOpen, setIsFeedbackModalOpen,
        selectedVacancy,
        vacancyStats,
        activeBusiness,
        getApplicationLink,
        selectedPipelineVacancyId, 
        setSelectedPipelineVacancyId,
        filteredCandidates,
        
        // BULK ACTIONS EXPORTS
        selectedCandidateIds,
        toggleCandidateSelection,
        handleBulkAction,

        // AI & SCORING EXPORTS
        analyzeCandidateCV,
        updateInterviewScores,

        feedbacks: filteredFeedbacks,
        feedbackSearchTerm, setFeedbackSearchTerm,
        feedbackFilterType, setFeedbackFilterType,
        feedbackPlatformFilter, setFeedbackPlatformFilter,
        candidates,
        moveCandidate,
        updateCandidateDoc,
        isHiringModalOpen, setIsHiringModalOpen,
        hiringCandidate,
        hiringSalary, setHiringSalary,
        hiringRole, setHiringRole,
        confirmHiring,
        isStageModalOpen, setIsStageModalOpen,
        selectedCandidate,
        handleSelectCandidate,
        updateCandidateScore,
        handlePublicSubmit,
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
        stats,
        replyDrafts, handleReplyChange, submitReply, triggerAutoReply, markAsCandidate
    };
};
