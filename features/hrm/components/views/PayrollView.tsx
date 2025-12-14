
import React from 'react';
import { DollarSign, Printer, Send, Wallet, TrendingUp, CheckCircle } from 'lucide-react';
import { usePayrollLogic } from '../../hooks/usePayrollLogic';
import GlassPanel from '../../../../components/common/GlassPanel';
import CompactNumber from '../../../../components/common/CompactNumber';

const PayrollView: React.FC = () => {
  const { allPayrolls, totalPayrollEst, handlePaySalary } = usePayrollLogic();

  const handlePayClick = (payroll: any) => {
      if(confirm(`Bayar gaji ${payroll.netSalary.toLocaleString()} via Kas Kecil?`)) {
          handlePaySalary(payroll, 'cash');
      }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in zoom-in-95">
        
        {/* LEFT (9/12): PAYROLL TABLE */}
        <div className="lg:col-span-9">
            <GlassPanel className="p-0 rounded-2xl overflow-hidden bg-black/20 border border-white/5 h-full">
                <div className="p-4 border-b border-white/5 bg-white/5">
                    <h3 className="text-lg font-bold text-white">Daftar Gaji Periode Ini</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-gray-400 font-bold uppercase text-xs">
                            <tr>
                                <th className="p-4">Pegawai</th>
                                <th className="p-4 text-right">Gaji Pokok</th>
                                <th className="p-4 text-right">Bonus</th>
                                <th className="p-4 text-right">Potongan</th>
                                <th className="p-4 text-right">Total (THP)</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {allPayrolls.map(({ employee, data }) => (
                                <tr key={employee.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-4">
                                        <p className="font-bold text-white">{employee.name}</p>
                                        <p className="text-xs text-gray-500">{employee.role}</p>
                                    </td>
                                    <td className="p-4 text-right text-gray-300">
                                        <CompactNumber value={data.baseSalary} currency={false} />
                                    </td>
                                    <td className="p-4 text-right text-green-400">
                                        +<CompactNumber value={data.bonus} currency={false} />
                                    </td>
                                    <td className="p-4 text-right text-red-400">
                                        -<CompactNumber value={data.deduction} currency={false} />
                                    </td>
                                    <td className="p-4 text-right font-bold text-orange-400 text-base">
                                        <CompactNumber value={data.netSalary} />
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${data.status === 'paid' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-white/10 text-gray-400 border-white/10'}`}>
                                            {data.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        {data.status === 'unpaid' ? (
                                            <button 
                                                onClick={() => handlePayClick(data)}
                                                className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg"
                                            >
                                                Bayar
                                            </button>
                                        ) : (
                                            <button className="text-gray-500 cursor-default flex items-center justify-end gap-1 w-full">
                                                <CheckCircle size={16} className="text-green-500"/> Selesai
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassPanel>
        </div>

        {/* RIGHT (3/12): SUMMARY & ACTIONS */}
        <div className="lg:col-span-3 flex flex-col gap-6">
            
            {/* Total Widget */}
            <GlassPanel className="p-6 rounded-2xl bg-gradient-to-br from-orange-600/20 to-orange-900/10 border border-orange-500/20">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-orange-500/20 rounded-xl text-orange-400">
                        <Wallet size={24} />
                    </div>
                    <div>
                         <h4 className="text-sm font-bold text-orange-200 uppercase tracking-wider">Total Estimasi</h4>
                         <p className="text-xs text-orange-300/70">Periode Berjalan</p>
                    </div>
                </div>
                <p className="text-3xl font-black text-white mb-6"><CompactNumber value={totalPayrollEst} /></p>
                
                <button 
                    onClick={() => alert("Fitur pembayaran massal (Batch Payment) akan segera hadir.")}
                    className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-105"
                >
                    <DollarSign size={18} /> Bayar Semua
                </button>
            </GlassPanel>

            {/* Print Action */}
            <GlassPanel className="p-5 rounded-2xl border border-white/5">
                <h4 className="font-bold text-white mb-3 text-sm uppercase tracking-wider">Laporan</h4>
                <div className="space-y-2">
                    <button className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 font-bold rounded-xl border border-white/5 flex items-center justify-center gap-2 transition-colors">
                        <Printer size={16} /> Cetak Slip Masal
                    </button>
                    <button className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 font-bold rounded-xl border border-white/5 flex items-center justify-center gap-2 transition-colors">
                        <TrendingUp size={16} /> Laporan Tahunan
                    </button>
                </div>
            </GlassPanel>
        </div>
    </div>
  );
};

export default PayrollView;
