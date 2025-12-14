import React from 'react';
import { User } from '../../types';
import { Camera, KeyRound, Save, User as UserIcon, Mail } from 'lucide-react';

interface ProfileSettingsProps {
  user: User;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Panel: Avatar & Info */}
      <div className="lg:col-span-1 space-y-6">
        <div className="glass-panel rounded-2xl p-8 flex flex-col items-center text-center">
            <div className="relative group mb-4">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-white/10 flex items-center justify-center text-5xl font-bold shadow-lg">
                    {user.name.charAt(0)}
                </div>
                <button className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                </button>
            </div>
            <h2 className="text-2xl font-bold text-white">{user.name}</h2>
            <p className="text-gray-400">{user.role}</p>
            <span className="mt-4 text-xs font-semibold uppercase tracking-wider bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full border border-orange-500/20">
              {user.email}
            </span>
        </div>
      </div>

      {/* Right Panel: Forms */}
      <div className="lg:col-span-2 space-y-8">
        {/* User Details Form */}
        <div className="glass-panel rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3"><UserIcon size={20} className="text-orange-500"/> Informasi Akun</h3>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Nama Lengkap</label>
                <input type="text" defaultValue={user.name} className="w-full glass-input rounded-xl p-3" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Alamat Email</label>
                <input type="email" defaultValue={user.email} className="w-full glass-input rounded-xl p-3" />
              </div>
            </div>
            <div className="pt-4 flex justify-end">
              <button type="submit" className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl shadow-lg shadow-orange-600/20 transition-transform hover:scale-105 flex items-center gap-2">
                <Save size={16} /> Simpan Perubahan
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="glass-panel rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3"><KeyRound size={20} className="text-orange-500"/> Keamanan & Password</h3>
          <form className="space-y-6">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Password Saat Ini</label>
              <input type="password" placeholder="••••••••" className="w-full glass-input rounded-xl p-3" />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Password Baru</label>
                  <input type="password" placeholder="••••••••" className="w-full glass-input rounded-xl p-3" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Konfirmasi Password Baru</label>
                  <input type="password" placeholder="••••••••" className="w-full glass-input rounded-xl p-3" />
                </div>
              </div>
            <div className="pt-4 flex justify-end">
              <button type="submit" className="px-6 py-3 glass-button text-gray-300 font-bold rounded-xl flex items-center gap-2">
                 Perbarui Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;