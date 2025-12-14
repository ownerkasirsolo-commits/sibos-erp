
import React from 'react';
import { Plus, X } from 'lucide-react';
import { useBranchDistributionLogic } from '../../../hooks/useDistributionLogic';

const BranchDistribution: React.FC = () => {
    const {
        ingredients,
        isRequestingStock, setIsRequestingStock,
        reqItems, setReqItems,
        newItemId, setNewItemId,
        newItemQty, setNewItemQty,
        newItemUnit, setNewItemUnit,
        filteredStockTransfers,
        handleAddItemToRequest,
        handleSubmitRequest,
        handleReceiveShipment
    } = useBranchDistributionLogic();

    return (
        <>
            {!isRequestingStock ? (
                <>
                    <div className="flex justify-between items-center mb-4">
                        <div><h2 className="text-xl font-bold text-white">Order ke Pusat</h2></div>
                        <button onClick={() => setIsRequestingStock(true)} className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg"><Plus size={18} /> <span className="hidden sm:inline">Request Stok</span></button>
                    </div>
                    <div className="space-y-3">
                        {filteredStockTransfers.length === 0 ? <p className="text-gray-500">Kosong</p> : filteredStockTransfers.map(trf => (
                            <div key={trf.id} className="glass-panel p-4 rounded-2xl flex justify-between items-center border border-white/5">
                                <div>
                                    <p className="font-bold text-white text-sm">{trf.id}</p>
                                    <p className="text-xs text-gray-400">{new Date(trf.requestDate).toLocaleDateString()} • {trf.status}</p>
                                </div>
                                {trf.status === 'shipped' && <button onClick={() => handleReceiveShipment(trf)} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold">Terima Barang</button>}
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                /* REQUEST FORM */
                <div className="glass-panel p-6 rounded-3xl border border-orange-500/30">
                    <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold text-white">Request Stok</h3><button onClick={() => setIsRequestingStock(false)}><X/></button></div>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
                        <div className="md:col-span-6"><select className="w-full glass-input rounded-xl p-3 text-sm" value={newItemId} onChange={e => {setNewItemId(e.target.value); const i = ingredients.find(ing => ing.id === e.target.value); if(i) setNewItemUnit(i.unit);}}><option value="">Pilih...</option>{ingredients.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}</select></div>
                        <div className="md:col-span-3"><input type="number" placeholder="Qty" className="w-full glass-input rounded-xl p-3 text-sm" value={newItemQty} onChange={e => setNewItemQty(e.target.value)}/></div>
                        <div className="md:col-span-3"><button onClick={handleAddItemToRequest} className="w-full h-full bg-white/10 hover:bg-orange-500 rounded-xl font-bold">Tambah</button></div>
                    </div>
                    <div className="space-y-2 mb-4">{reqItems.map((item, i) => <div key={i} className="flex justify-between p-2 bg-white/5 rounded-lg"><span>{item.ingredientName}</span><span>{item.quantityRequested} {item.unit}</span></div>)}</div>
                    <button onClick={handleSubmitRequest} className="w-full py-3 bg-orange-600 text-white font-bold rounded-xl">Kirim Request</button>
                </div>
            )}
        </>
    );
};

export default BranchDistribution;
