import React from 'react';
import { CalendarDays, Users, Phone, Check, X, MoreHorizontal, Plus, Table } from 'lucide-react';
import { useReservationsLogic } from './hooks/useReservationsLogic';

const Reservations: React.FC = () => {
  const {
    filterDate,
    setFilterDate,
    filteredReservations,
    handleStatusChange,
  } = useReservationsLogic();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <CalendarDays className="text-orange-500" /> Reservasi
            </h2>
            <p className="text-sm text-gray-400">Jadwal booking meja.</p>
         </div>
         <div className="flex gap-2 w-full md:w-auto">
             <input 
               type="date" 
               value={filterDate}
               onChange={(e) => setFilterDate(e.target.value)}
               className="glass-input rounded-xl px-4 py-2 text-white"
             />
             <button className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-orange-600/20">
                 <Plus size={18} /> Booking +
             </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reservation List */}
          <div className="lg:col-span-2 space-y-4">
              {filteredReservations.length === 0 ? (
                  <div className="glass-panel p-12 rounded-3xl text-center flex flex-col items-center justify-center">
                      <CalendarDays size={48} className="text-gray-600 mb-4" />
                      <h3 className="text-lg font-bold text-gray-400">Tidak ada reservasi</h3>
                      <p className="text-gray-500 text-sm">Belum ada booking untuk tanggal ini.</p>
                  </div>
              ) : (
                  filteredReservations.map(res => (
                      <div key={res.id} className={`glass-panel p-4 rounded-2xl border-l-4 flex flex-col md:flex-row gap-4 items-start md:items-center transition-all ${
                          res.status === 'confirmed' ? 'border-l-green-500' : 
                          res.status === 'seated' ? 'border-l-blue-500' :
                          res.status === 'cancelled' ? 'border-l-red-500 opacity-60' : 'border-l-orange-500'
                      }`}>
                          {/* Time & Pax */}
                          <div className="flex flex-col items-center justify-center min-w-[80px] text-center border-r border-white/5 pr-4 md:pr-0 md:border-r-0 md:border-b-0">
                              <span className="text-2xl font-bold text-white">{res.time}</span>
                              <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                                  <Users size={12} /> {res.pax} Pax
                              </div>
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-lg text-white truncate">{res.customerName}</h4>
                              <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-400">
                                  <span className="flex items-center gap-1"><Phone size={12} /> {res.phone}</span>
                                  {res.tableNumber && <span className="flex items-center gap-1 text-orange-400 bg-orange-500/10 px-2 rounded"><Table size={12} /> {res.tableNumber}</span>}
                              </div>
                              {res.notes && <p className="text-xs text-gray-500 italic mt-2">"{res.notes}"</p>}
                          </div>

                          {/* Status & Actions */}
                          <div className="flex flex-row md:flex-col items-end gap-2 w-full md:w-auto mt-2 md:mt-0">
                              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                  res.status === 'confirmed' ? 'bg-green-500/10 text-green-400' :
                                  res.status === 'seated' ? 'bg-blue-500/10 text-blue-400' :
                                  res.status === 'cancelled' ? 'bg-red-500/10 text-red-400' : 'bg-orange-500/10 text-orange-400'
                              }`}>
                                  {res.status}
                              </span>
                              
                              <div className="flex gap-2">
                                  {res.status !== 'seated' && res.status !== 'cancelled' && (
                                    <>
                                        <button onClick={() => handleStatusChange(res.id, 'seated')} className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors" title="Check-In">
                                            <Check size={16} />
                                        </button>
                                        <button onClick={() => handleStatusChange(res.id, 'cancelled')} className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors" title="Batal">
                                            <X size={16} />
                                        </button>
                                    </>
                                  )}
                                  <button className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                                      <MoreHorizontal size={16} />
                                  </button>
                              </div>
                          </div>
                      </div>
                  ))
              )}
          </div>

          {/* Table Stats (Mock Visual) */}
          <div className="glass-panel p-6 rounded-3xl h-fit">
              <h3 className="font-bold text-white mb-4">Status Meja</h3>
              <div className="grid grid-cols-3 gap-3">
                  {Array.from({length: 9}).map((_, i) => (
                      <div key={i} className={`aspect-square rounded-xl flex flex-col items-center justify-center border ${
                          i === 1 || i === 3 ? 'bg-red-500/20 border-red-500/30 text-red-400' : // Occupied
                          i === 4 ? 'bg-orange-500/20 border-orange-500/30 text-orange-400' : // Reserved
                          'bg-green-500/10 border-green-500/20 text-green-400' // Available
                      }`}>
                          <Table size={20} />
                          <span className="text-xs font-bold mt-1">T-0{i+1}</span>
                          <span className="text-[9px] uppercase mt-1 opacity-70">
                              {i === 1 || i === 3 ? 'Full' : i === 4 ? 'Book' : 'Free'}
                          </span>
                      </div>
                  ))}
              </div>
              <div className="mt-6 space-y-2 text-xs text-gray-400">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500/20 border border-green-500/30 rounded"></div> Kosong</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-500/20 border border-orange-500/30 rounded"></div> Reserved</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500/20 border border-red-500/30 rounded"></div> Terisi</div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Reservations;
