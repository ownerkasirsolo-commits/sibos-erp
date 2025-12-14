
import React from 'react';
import { Employee, Payroll } from '../types';
import { FileText, Plus, Minus, CheckCircle } from 'lucide-react';
import CompactNumber from '../../../components/common/CompactNumber';
import { usePayrollLogic } from '../hooks/usePayrollLogic'; // Import hook

interface PayrollSlipProps {
    employee: Employee;
    payrollData: Payroll;
}

const PayrollSlip: React.FC<PayrollSlipProps> = ({ employee, payrollData }) => {
  const { handlePaySalary } = usePayrollLogic(); // Use Hook

  const onPay = () => {
      if(confirm(`Konfirmasi pembayaran gaji untuk ${employee.name} sebesar Rp ${payrollData.netSalary.toLocaleString()}?`)) {
          handlePaySalary(payrollData, 'cash');
      }
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-orange-500/20 bg-orange-900/10">
        <h4 className="font-bold text-white mb-6 flex items-center gap-2">
            <FileText size={16} className="text-orange-500"/> Slip Gaji (Estimasi {payrollData.period})
        </h4>

        <div className="space-y-3 text-sm">
            <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-gray-400">Gaji Pokok</span>
                <span className="font-bold text-white"><CompactNumber value={payrollData.baseSalary} /></span>
            </div>

            <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-gray-400 flex items-center gap-2"><Plus size={14} className="text-green-500"/> Bonus Kinerja</span>
                <span className="font-bold text-green-400"><CompactNumber value={payrollData.bonus} /></span>
            </div>

            <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-gray-400 flex items-center gap-2"><Minus size={14} className="text-red-500"/> Potongan</span>
                <span className="font-bold text-red-400"><CompactNumber value={payrollData.deduction} /></span>
            </div>
            
            <div className="pt-3 mt-3 border-t border-white/10">
                <div className="flex justify-between items-center bg-orange-500/10 p-4 rounded-xl border border-orange-500/20">
                    <span className="text-orange-200 font-bold uppercase tracking-wider">Take Home Pay</span>
                    <span className="text-2xl font-bold text-orange-400"><CompactNumber value={payrollData.netSalary} /></span>
                </div>
            </div>
        </div>
        
        {payrollData.status === 'unpaid' ? (
            <button 
                onClick={onPay}
                className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors border border-white/10 hover:border-white/30"
            >
                Bayar Gaji Sekarang
            </button>
        ) : (
            <div className="w-full mt-6 py-3 bg-green-600/20 text-green-400 font-bold rounded-xl flex items-center justify-center gap-2 border border-green-500/30">
                <CheckCircle size={18} /> LUNAS / PAID
            </div>
        )}
    </div>
  );
};

export default PayrollSlip;
