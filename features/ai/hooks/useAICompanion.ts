import React, { useState } from 'react';
import { generateBusinessAdvice } from '../services/geminiService';
import { useGlobalContext } from '../../../context/GlobalContext';

export const useAICompanion = () => {
    const { currentUser, businessConfig } = useGlobalContext();

    const [isAIChatOpen, setIsAIChatOpen] = useState(false);
    const [aiQuery, setAiQuery] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    
    // Store simple history
    const [lastQuery, setLastQuery] = useState('');

    const handleAiAsk = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!aiQuery.trim() || !currentUser || !businessConfig) return;

        setLastQuery(aiQuery);
        setIsAiLoading(true);
        setAiResponse('');

        const context = `Bisnis: ${businessConfig.name}, Tipe: ${businessConfig.type}, User: ${currentUser.name} (${currentUser.role})`;
        const response = await generateBusinessAdvice(aiQuery, context);

        setAiResponse(response);
        setIsAiLoading(false);
        setAiQuery('');
    };

    return {
        isAIChatOpen,
        setIsAIChatOpen,
        aiQuery,
        setAiQuery,
        aiResponse,
        isAiLoading,
        handleAiAsk,
        lastQuery
    };
};
