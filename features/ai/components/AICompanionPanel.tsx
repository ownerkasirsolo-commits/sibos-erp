import React from 'react';
import { BrainCircuit, PanelRightClose, ArrowRight } from 'lucide-react';
import { User } from '../../../types';
import { useGlobalContext } from '../../../context/GlobalContext';

interface AICompanionPanelProps {
    isAIChatOpen: boolean;
    setIsAIChatOpen: (state: boolean) => void;
    aiQuery: string;
    setAiQuery: (query: string) => void;
    aiResponse: string;
    isAiLoading: boolean;
    handleAiAsk: (e: React.FormEvent) => Promise<void>;
    lastQuery: string;
}

const AICompanionPanel: React.FC<AICompanionPanelProps> = ({
    isAIChatOpen, setIsAIChatOpen, aiQuery, setAiQuery, aiResponse,
    isAiLoading, handleAiAsk, lastQuery
}) => {
    const { currentUser } = useGlobalContext();
    if (!isAIChatOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-[#0f172a] shadow-2xl z-[60] border-l border-white/10 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-orange-600/10 to-transparent">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                        <BrainCircuit size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">SIBOS AI Assistant</h3>
                        <p className="text-xs text-orange-400">Powered by Gemini</p>
                    </div>
                </div>
                <button onClick={() => setIsAIChatOpen(false)} className="text-gray-400 hover:text-white p-2">
                    <PanelRightClose size={20} />
                </button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar">
                <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 shrink-0 border border-orange-500/20"><BrainCircuit size={14} /></div>
                    <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/5">
                        <p className="text-gray-300 text-sm leading-relaxed">Halo {currentUser?.name.split(' ')[0]}! Ada yang bisa saya bantu?</p>
                    </div>
                </div>

                {aiResponse && (
                  <>
                     <div className="flex gap-4 flex-row-reverse">
                         <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white shrink-0">
                           <span className="text-xs font-bold">{currentUser?.name.charAt(0)}</span>
                         </div>
                         <div className="bg-orange-600 p-4 rounded-2xl rounded-tr-none text-white shadow-lg shadow-orange-600/10">
                            <p className="text-sm">{lastQuery}</p>
                         </div>
                     </div>
                     <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 shrink-0 border border-orange-500/20"><BrainCircuit size={14} /></div>
                        <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/5 animate-in fade-in zoom-in-95 duration-300">
                           <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{aiResponse}</p>
                        </div>
                     </div>
                  </>
               )}

                {isAiLoading && (
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 shrink-0 border border-orange-500/20"><BrainCircuit size={14} /></div>
                        <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-2">
                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                        </div>
                    </div>
                )}
            </div>
            <div className="p-4 border-t border-white/5 bg-black/20">
                <form onSubmit={handleAiAsk} className="relative">
                    <input type="text" className="w-full glass-input rounded-xl py-3.5 pl-4 pr-12 text-sm text-white focus:border-orange-500/50" placeholder="Tanya strategi bisnis..." value={aiQuery} onChange={(e) => setAiQuery(e.target.value)} />
                    <button type="submit" disabled={!aiQuery.trim() || isAiLoading} className="absolute right-2 top-2 p-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ArrowRight size={16} /></button>
                </form>
            </div>
        </div>
    );
};

export default AICompanionPanel;
