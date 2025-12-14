import React from 'react';
import { Ticket, Mic, UserCheck, SkipForward, Volume2, Plus } from 'lucide-react';
import { useQueueLogic } from './hooks/useQueueLogic';

const Queue: React.FC = () => {
  const {
    currentCalled,
    waitingList,
    historyList,
    handleCall,
    handleSeat,
    handleSkip,
    handleAddQueue,
  } = useQueueLogic();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
      {/* Top Controller */}
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Ticket className="text-orange-500" /> Antrian
            </h2>
            <p className="text-sm text-gray-400">Atur aliran pelanggan.</p>
        </div>
        <button 
            onClick={handleAddQueue}
            className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-orange-600/20"
        >
            <Plus size={20} /> Tiket +
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT: BIG DISPLAY (Simulasi Layar TV) */}
          <div className="glass-panel p-8 rounded-3xl bg-black border-4 border-gray-800 flex flex-col items-center justify-center min-h-[400px] text-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-4 left-4 text-gray-500 font-mono text-xs">Layar Antrian (TV)</div>
              
              {currentCalled ? (
                  <div className="animate-in zoom-in duration-500">
                      <p className="text-2xl text-orange-500 font-bold uppercase tracking-[0.2em] mb-4">Nomor Antrian</p>
                      <h1 className="text-9xl font-black text-white tracking-tighter tabular-nums mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                          {currentCalled.number}
                      </h1>
                      <div className="bg-white/10 px-6 py-3 rounded-2xl inline-block">
                          <p className="text-xl text-gray-300">Silakan Ke Loket / Meja</p>
                          <p className="text-2xl font-bold text-white mt-1">CS - 01</p>
                      </div>
                      <div className="mt-8 flex items-center justify-center gap-2 text-green-400 animate-pulse">
                          <Volume2 size={24} />
                          <span className="font-bold">Memanggil...</span>
                      </div>
                  </div>
              ) : (
                  <div className="text-gray-600">
                      <h1 className="text-4xl font-bold">Menunggu...</h1>
                  </div>
              )}
          </div>

          {/* RIGHT: LIST & CONTROLS */}
          <div className="space-y-4">
              <h3 className="font-bold text-white mb-2">Dalam Antrian ({waitingList.length})</h3>
              
              {waitingList.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-gray-700 rounded-2xl text-gray-500">
                      Kosong
                  </div>
              ) : (
                  waitingList.map(item => (
                      <div key={item.id} className="glass-panel p-4 rounded-xl flex items-center justify-between group hover:border-orange-500/50 transition-colors">
                          <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center font-bold text-xl text-orange-400">
                                  {item.number}
                              </div>
                              <div>
                                  <h4 className="font-bold text-white">{item.customerName}</h4>
                                  <p className="text-xs text-gray-400">{item.type} • {item.pax} Pax</p>
                              </div>
                          </div>
                          
                          <div className="flex gap-2">
                              <button 
                                onClick={() => handleCall(item.id)}
                                className="p-2.5 bg-green-600 hover:bg-green-500 text-white rounded-lg shadow-lg shadow-green-600/20 transition-transform hover:scale-105" title="Panggil"
                              >
                                  <Mic size={18} />
                              </button>
                               <button 
                                onClick={() => handleSeat(item.id)}
                                className="p-2.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg transition-colors" title="Langsung Masuk"
                              >
                                  <UserCheck size={18} />
                              </button>
                              <button 
                                onClick={() => handleSkip(item.id)}
                                className="p-2.5 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition-colors" title="Lewati"
                              >
                                  <SkipForward size={18} />
                              </button>
                          </div>
                      </div>
                  ))
              )}

              {/* Previously Called (History) */}
              <div className="pt-6 border-t border-white/10 mt-6">
                 <h3 className="font-bold text-gray-400 text-sm mb-4">Baru Saja Dipanggil</h3>
                 <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                     {historyList.map(item => (
                         <div key={item.id} className={`px-4 py-2 rounded-lg border text-xs font-bold whitespace-nowrap ${item.status === 'skipped' ? 'border-red-500/30 text-red-400 bg-red-500/5' : 'border-green-500/30 text-green-400 bg-green-500/5'}`}>
                             {item.number} - {item.status}
                         </div>
                     ))}
                 </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Queue;