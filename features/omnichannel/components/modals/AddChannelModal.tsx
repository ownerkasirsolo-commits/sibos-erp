
import React, { useState } from 'react';
import Modal from '../../../../components/common/Modal';
import GlassInput from '../../../../components/common/GlassInput';
import { Search, ShoppingBag, Truck, Globe, MessageCircle, Plus, Check } from 'lucide-react';
import { PlatformId, ConnectedAccount } from '../../types';

interface AddChannelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddChannel: (platform: any) => void;
    existingChannelIds: string[];
}

// Mock Database of Available Integrations
const AVAILABLE_INTEGRATIONS = [
    { id: 'lazada', name: 'Lazada', category: 'Marketplace', icon: 'shopping-bag', color: 'text-blue-500', bg: 'bg-white' },
    { id: 'blibli', name: 'Blibli', category: 'Marketplace', icon: 'shopping-bag', color: 'text-blue-400', bg: 'bg-white' },
    { id: 'zalora', name: 'Zalora', category: 'Fashion', icon: 'shopping-bag', color: 'text-black', bg: 'bg-white' },
    { id: 'grabexpress', name: 'GrabExpress', category: 'Logistic', icon: 'truck', color: 'text-green-600', bg: 'bg-green-100' },
    { id: 'gosend', name: 'GoSend', category: 'Logistic', icon: 'truck', color: 'text-green-500', bg: 'bg-green-100' },
    { id: 'jne', name: 'JNE', category: 'Logistic', icon: 'truck', color: 'text-red-600', bg: 'bg-red-100' },
    { id: 'jnt', name: 'J&T Express', category: 'Logistic', icon: 'truck', color: 'text-red-500', bg: 'bg-red-100' },
    { id: 'whatsapp', name: 'WhatsApp Business', category: 'Social', icon: 'message-circle', color: 'text-green-500', bg: 'bg-green-100' },
    { id: 'facebook_ads', name: 'Facebook Ads', category: 'Marketing', icon: 'globe', color: 'text-blue-600', bg: 'bg-white' },
    { id: 'jurnal', name: 'Jurnal.id', category: 'Accounting', icon: 'globe', color: 'text-purple-600', bg: 'bg-purple-100' },
];

const AddChannelModal: React.FC<AddChannelModalProps> = ({ isOpen, onClose, onAddChannel, existingChannelIds }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = ['All', 'Marketplace', 'Logistic', 'Social', 'Marketing', 'Accounting'];

    const filteredIntegrations = AVAILABLE_INTEGRATIONS.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleAdd = (item: typeof AVAILABLE_INTEGRATIONS[0]) => {
        // Convert to ConnectedAccount format
        const newAccount: ConnectedAccount = {
            id: `${item.id}-${Date.now()}`,
            platformId: item.id as PlatformId, // Cast for simplicity in mock
            name: item.name,
            status: 'connected',
            lastSync: 'Baru saja',
            icon: item.icon,
            metrics: { orders: 0, revenue: 0, rating: 0 }
        };
        onAddChannel(newAccount);
    };

    const getIcon = (iconName: string) => {
        switch(iconName) {
            case 'shopping-bag': return <ShoppingBag size={20} />;
            case 'truck': return <Truck size={20} />;
            case 'message-circle': return <MessageCircle size={20} />;
            default: return <Globe size={20} />;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Direktori Integrasi" size="lg">
            <div className="flex flex-col h-[500px]">
                {/* Search & Filter */}
                <div className="mb-6 space-y-4 shrink-0">
                    <GlassInput 
                        icon={Search}
                        placeholder="Cari platform (misal: Lazada, JNE)..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${selectedCategory === cat ? 'bg-orange-600 text-white border-orange-600' : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredIntegrations.map(item => {
                            const isAdded = existingChannelIds.includes(item.id); // Simple check by ID prefix logic in real app
                            
                            return (
                                <div key={item.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-orange-500/30 transition-all group flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.bg} ${item.color} shadow-lg`}>
                                            {getIcon(item.icon)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white">{item.name}</h4>
                                            <p className="text-xs text-gray-400">{item.category}</p>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => handleAdd(item)}
                                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-orange-600 text-white flex items-center justify-center transition-all shadow-lg hover:shadow-orange-500/20 active:scale-95"
                                        title="Tambahkan Kanal"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            );
                        })}
                        {filteredIntegrations.length === 0 && (
                            <div className="col-span-full text-center py-10 text-gray-500">
                                Platform tidak ditemukan.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default AddChannelModal;
