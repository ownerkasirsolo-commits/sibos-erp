
import React, { useState } from 'react';
import { BusinessType } from '../types';
import { Briefcase, Building2, User as UserIcon, Store, Sparkles, ArrowRight, ChevronDown, Lock } from 'lucide-react';
import { useGlobalContext } from '../context/GlobalContext';

const Auth: React.FC = () => {
  const { employees, login, setBusinessInfo } = useGlobalContext();
  
  const [isRegister, setIsRegister] = useState(false);
  
  // Login State
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [pin, setPin] = useState('');
  
  // Register State
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [selectedType, setSelectedType] = useState<BusinessType>(BusinessType.CULINARY);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Quick Demo Hack: If fields empty, auto-login as first employee (Owner)
    if (!selectedEmployeeId && employees.length > 0) {
        const boss = employees[0];
        setBusinessInfo("SIBOS Resto & Cafe", BusinessType.CULINARY);
        login(boss.id, boss.pin || '0000');
        return;
    }

    if (login(selectedEmployeeId, pin)) {
        // Assume default business for now since we don't persist business config deeply in mock
        setBusinessInfo("SIBOS Resto & Cafe", BusinessType.CULINARY); 
    } else {
        alert("Login Gagal! PIN Salah atau User tidak ditemukan.");
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate Registration
    setBusinessInfo(businessName || "Bisnis Baru", selectedType);
    // Auto login as Manager (first mock employee for demo purposes)
    if(employees.length > 0) login(employees[0].id, employees[0].pin || '1234');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px]" />

      <div className="relative z-10 w-full max-w-md p-4">
        <div className="glass-panel rounded-3xl p-8 backdrop-blur-2xl border-opacity-20 relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50"></div>

          <div className="text-center mb-10">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-[0_0_40px_-10px_rgba(234,88,12,0.5)] mb-6 transform rotate-3 hover:rotate-6 transition-transform duration-300">
              <Store className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
              SIBOS
            </h1>
            <p className="text-gray-400 text-sm tracking-wide font-light">Smart Integrated Back Office System</p>
          </div>

          <form onSubmit={isRegister ? handleRegisterSubmit : handleLoginSubmit} className="space-y-5">
            {isRegister ? (
              <>
                {/* REGISTER FIELDS */}
                <div className="group">
                  <label className="text-xs font-semibold text-gray-400 ml-1 uppercase tracking-wider mb-1.5 block">Nama Lengkap</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      className="w-full glass-input rounded-xl py-3 pl-10 pr-4 text-gray-200 outline-none placeholder-gray-600"
                      placeholder="Nama Anda"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="text-xs font-semibold text-gray-400 ml-1 uppercase tracking-wider mb-1.5 block">Nama Bisnis</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      className="w-full glass-input rounded-xl py-3 pl-10 pr-4 text-gray-200 outline-none placeholder-gray-600"
                      placeholder="Contoh: Kopi Senja"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="text-xs font-semibold text-gray-400 ml-1 uppercase tracking-wider mb-1.5 block">Tipe Bisnis</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3.5 w-5 h-5 text-gray-500 z-10" />
                    <select
                      className="w-full glass-input rounded-xl py-3 pl-10 pr-10 text-gray-200 outline-none appearance-none cursor-pointer hover:bg-white/5 transition-colors focus:border-orange-500 relative z-0"
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value as BusinessType)}
                    >
                      {Object.values(BusinessType).map((type) => (
                        <option key={type} value={type} className="bg-gray-900 text-gray-200 py-2">
                          {type}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-gray-500 pointer-events-none z-10" />
                  </div>
                </div>
              </>
            ) : (
               /* LOGIN FIELDS */
               <div className="space-y-4">
                 <div className="group">
                  <label className="text-xs font-semibold text-gray-400 ml-1 uppercase tracking-wider mb-1.5 block">Pilih Akun / User</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-500 z-10" />
                    <select 
                        className="w-full glass-input rounded-xl py-3 pl-10 pr-10 text-gray-200 outline-none appearance-none cursor-pointer"
                        value={selectedEmployeeId}
                        onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    >
                        <option value="" className="bg-gray-900">-- Pilih Akun --</option>
                        {employees.map(emp => (
                            <option key={emp.id} value={emp.id} className="bg-gray-900">
                                {emp.name} - {emp.role}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-gray-500 pointer-events-none z-10" />
                  </div>
                </div>
                <div className="group">
                  <label className="text-xs font-semibold text-gray-400 ml-1 uppercase tracking-wider mb-1.5 block">PIN Akses</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                    <input
                      type="password"
                      className="w-full glass-input rounded-xl py-3 pl-10 pr-4 text-gray-200 outline-none placeholder-gray-600"
                      placeholder="Masukkan PIN"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-600 via-orange-500 to-red-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-600/20 transition-transform hover:brightness-110 active:brightness-95 mt-6 flex items-center justify-center gap-2 group"
            >
              {isRegister ? 'Mulai Bisnis Sekarang' : 'Masuk Dashboard'}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 flex flex-col gap-4">
            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink mx-4 text-gray-500 text-xs uppercase tracking-widest font-semibold">Demo Access</span>
                <div className="flex-grow border-t border-white/10"></div>
            </div>

            {!isRegister && (
                <div className="text-center">
                    <p className="text-xs text-gray-500 mb-2">PIN Owner: <strong>0000</strong> &bull; Staff: <strong>1234</strong></p>
                </div>
            )}

            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-sm text-gray-500 hover:text-white text-center w-full mt-2 transition-colors"
            >
              {isRegister ? (
                <span>Sudah punya akun? <span className="text-orange-500 font-semibold">Login disini</span></span>
              ) : (
                <span>Belum punya akun? <span className="text-orange-500 font-semibold">Daftar Bisnis Baru</span></span>
              )}
            </button>
          </div>
        </div>
        
        <p className="text-center text-gray-600 text-xs mt-6">
          &copy; 2025 SIBOS Ecosystem. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Auth;
