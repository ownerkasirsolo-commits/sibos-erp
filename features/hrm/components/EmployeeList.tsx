
import React from 'react';
import { Employee } from '../types';
import { MapPin, Calendar, MoreHorizontal, MessageCircle } from 'lucide-react';

interface EmployeeListProps {
    employees: Employee[];
    onSelect: (emp: Employee) => void;
    onChat?: (emp: Employee) => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ employees, onSelect, onChat }) => {
  return (
    <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-white/10">
                    <th className="pb-4 pl-4">Nama Pegawai</th>
                    <th className="pb-4">Posisi & Outlet</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4">Bergabung</th>
                    <th className="pb-4">Gaji</th>
                    <th className="pb-4 text-right pr-4">Aksi</th>
                </tr>
            </thead>
            <tbody className="text-sm text-gray-300">
                {employees.map((emp) => (
                    <tr key={emp.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => onSelect(emp)}>
                        <td className="py-4 pl-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center font-bold text-white shadow-inner">
                                    {emp.name.charAt(0)}
                                </div>
                                <span className="font-semibold text-white">{emp.name}</span>
                            </div>
                        </td>
                        <td className="py-4">
                            <div className="flex flex-col">
                                <span className="font-medium text-orange-400">{emp.role}</span>
                                <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                    <MapPin size={10} /> {emp.outletName}
                                </span>
                            </div>
                        </td>
                        <td className="py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                emp.status === 'Active' 
                                ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                                : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            }`}>
                                {emp.status === 'Active' ? 'AKTIF' : 'CUTI'}
                            </span>
                        </td>
                        <td className="py-4 text-gray-400 flex items-center gap-2">
                            <Calendar size={14} /> {emp.joinDate}
                        </td>
                        <td className="py-4 font-mono text-gray-300">
                            {emp.salary}
                        </td>
                        <td className="py-4 text-right pr-4">
                            <div className="flex items-center justify-end gap-2">
                                {onChat && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onChat(emp); }}
                                        className="p-2 hover:bg-blue-600/20 text-blue-400 hover:text-white rounded-lg transition-colors"
                                        title="Chat Pegawai"
                                    >
                                        <MessageCircle size={18} />
                                    </button>
                                )}
                                <button className="p-2 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-colors">
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );
};

export default EmployeeList;
