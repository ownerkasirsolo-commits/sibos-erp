
import React, { useState, useMemo } from 'react';
import { Globe, Search, Network, Building2, Plus, Users } from 'lucide-react';
import Modal from '../../../../components/common/Modal';
import GlassInput from '../../../../components/common/GlassInput';
import { BusinessEntity } from '../../../../types';

interface SupplierDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBusinesses: BusinessEntity[];
  activeBusinessId: string | null | undefined;
  currentSupplierNames: string[]; // To filter out already added suppliers
  onAddBusiness: (biz: BusinessEntity) => void;
}

const SupplierDirectoryModal: React.FC<SupplierDirectoryModalProps> = ({ 
    isOpen, onClose, availableBusinesses, activeBusinessId, currentSupplierNames, onAddBusiness 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtering Logic
  const discoverableBusinesses = useMemo(() => {
      if (!searchTerm) return [];
      const lowerQuery = searchTerm.toLowerCase();
      
      return availableBusinesses.filter(biz => 
          biz.id !== activeBusinessId && // Exclude self
          !currentSupplierNames.includes(biz.name) && // Exclude existing suppliers
          biz.name.toLowerCase().includes(lowerQuery)
      );
  }, [availableBusinesses, searchTerm, activeBusinessId, currentSupplierNames]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Direktori Ekosistem SIBOS" size="lg">
        <div className="flex flex-col h-[500px]">
            <div className="mb-6 shrink-0">
                <div className="flex items-center gap-2 mb-1 text-blue-400">
                    <Globe size={18} />
                    <span className="text-xs font-bold uppercase tracking-wider">B2B Network</span>
                </div>
                <p className="text-sm text-gray-400 mb-4">Temukan supplier dan mitra bisnis terpercaya dalam jaringan SIBOS.</p>

                <GlassInput 
                    icon={Search}
                    placeholder="Ketik nama bisnis (contoh: Mart, Grosir)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-1"
                    autoFocus
                />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 bg-black/20 p-2 rounded-2xl border border-white/5">
                {searchTerm && discoverableBusinesses.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        <p>Tidak ditemukan bisnis dengan nama tersebut.</p>
                    </div>
                )}
                
                {!searchTerm && (
                    <div className="text-center py-20 text-gray-500 flex flex-col items-center">
                        <Network size={48} className="mb-4 opacity-20" />
                        <p className="font-bold">Mulai Pencarian</p>
                        <p className="text-xs mt-1">Ketik nama bisnis untuk mulai mencari mitra.</p>
                    </div>
                )}

                {discoverableBusinesses.map(biz => (
                    <div key={biz.id} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all flex justify-between items-center group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gray-800 border border-white/10 overflow-hidden shadow-lg">
                                <img src={biz.logo} alt={biz.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors text-lg">{biz.name}</h4>
                                <div className="flex items-center gap-3 mt-1">
                                    <p className="text-xs text-gray-400 flex items-center gap-1"><Building2 size={12} /> {biz.type}</p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1"><Users size={12} /> {biz.role}</p>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => onAddBusiness(biz)}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                        >
                            <Plus size={16} /> Hubungkan
                        </button>
                    </div>
                ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/10 text-center text-[10px] text-gray-500">
                Menampilkan mitra yang telah terverifikasi dalam ekosistem SIBOS.
            </div>
        </div>
    </Modal>
  );
};

export default SupplierDirectoryModal;
