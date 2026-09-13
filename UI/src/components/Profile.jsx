import { useState } from 'react';
import { OPERATOR_SERVICE_URL, fetchWithAuth, getAuthUser } from '../config.js';
import { UserCircle, Shield, Clock, Hash, Activity, MapPin } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState(getAuthUser() || {});

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'online': return 'bg-green-500';
      case 'occupato': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-green-500'; // Default to green for demo
    }
  };

  const statusColor = getStatusColor(user.stato);

  return (
    <div className="flex-1 p-8 h-full overflow-y-auto flex justify-center items-start pt-12 relative z-0">
      
      {/* Elementi decorativi di background per un effetto "premium" */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-[#0B1B32]/5 to-transparent -z-10 pointer-events-none"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-[#0088cc]/10 rounded-full blur-[80px] -z-10"></div>
      <div className="absolute top-40 right-20 w-96 h-96 bg-cyan-400/10 rounded-full blur-[80px] -z-10"></div>

      {/* Main Card */}
      <div className="bg-white/90 backdrop-blur-2xl border border-white/60 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-4xl overflow-hidden relative transition-all duration-300 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
        
        {/* Header Profilo con gradiente premium */}
        <div className="bg-gradient-to-r from-[#0B1B32] via-[#152a4a] to-[#0B1B32] p-10 flex items-end gap-8 text-white relative h-[220px]">
          {/* Overlay pattern sottile */}
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:16px_16px] pointer-events-none"></div>
          
          {/* Avatar Area */}
          <div className="relative group/avatar">
            <div className="w-32 h-32 rounded-3xl overflow-hidden border-[4px] border-white/10 shadow-2xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center transform group-hover/avatar:scale-[1.03] transition-transform duration-300 backdrop-blur-md relative z-10">
              <UserCircle className="w-20 h-20 text-white/40" strokeWidth={1} />
            </div>
            {/* Status Indicator con Effetto Glow */}
            <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-[#0B1B32] ${statusColor} shadow-[0_0_15px_rgba(34,197,94,0.6)] flex items-center justify-center z-20`}>
                <div className="absolute inset-0 rounded-full bg-white opacity-20 animate-ping"></div>
                <div className="w-2 h-2 rounded-full bg-white relative z-10"></div>
            </div>
          </div>
          
          {/* Titolo e Ruolo */}
          <div className="mb-2 z-10">
            <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 drop-shadow-md">
                {user.nome || 'Giulia'} {user.cognome || 'Bianchi'}
            </h1>
            <div className="mt-3 inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md shadow-sm">
              <Shield className="w-4 h-4 text-[#6ea8fe]" /> 
              <span className="text-[#6ea8fe] uppercase tracking-widest text-[11px] font-bold">
                {user.ruolo || 'OPERATORE'}
              </span>
            </div>
          </div>
        </div>

        {/* Corpo Profilo */}
        <div className="p-10 bg-gradient-to-b from-white to-gray-50/50">
          
          {/* Informazioni Operatore */}
          <div className="mb-12">
              <h2 className="text-xl font-black text-[#0B1B32] mb-6 flex items-center gap-3">
                <div className="bg-[#e0f2fe] p-2 rounded-xl text-[#0088cc] shadow-sm">
                    <UserCircle className="w-5 h-5" />
                </div>
                Operator Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Card ID */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_20px_-6px_rgba(6,81,237,0.15)] hover:-translate-y-1 transition-all duration-300 group/card relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#0088cc] group-hover/card:w-1.5 transition-all"></div>
                    <Hash className="w-6 h-6 text-[#0088cc] mb-4 opacity-80" />
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Employee ID</p>
                        <p className="text-[#0B1B32] font-black text-2xl">{user.id || user.matricola || '3'}</p>
                    </div>
                </div>

                {/* Card Reparto */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_20px_-6px_rgba(139,92,246,0.15)] hover:-translate-y-1 transition-all duration-300 group/card relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 group-hover/card:w-1.5 transition-all"></div>
                    <MapPin className="w-6 h-6 text-purple-500 mb-4 opacity-80" />
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Department</p>
                        <p className="text-[#0B1B32] font-black text-xl">Operations Center</p>
                    </div>
                </div>

              </div>
          </div>

          {/* Operational Status */}
          <div>
              <h2 className="text-xl font-black text-[#0B1B32] mb-6 flex items-center gap-3">
                <div className="bg-[#dcfce7] p-2 rounded-xl text-green-600 shadow-sm">
                    <Activity className="w-5 h-5" />
                </div>
                Operational Status
              </h2>

              <div className="flex">
                <div className="relative group/status cursor-default">
                    {/* Glow Effect Sottostante */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-[1rem] blur-md opacity-30 group-hover/status:opacity-50 transition duration-500"></div>
                    
                    {/* Badge Principale */}
                    <div className="relative bg-white border border-green-200 px-8 py-4 rounded-[1rem] font-black text-lg text-green-700 flex items-center justify-center gap-4 shadow-sm">
                        <div className="relative flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                        </div>
                        System Online / Active
                    </div>
                </div>
              </div>
          </div>

        </div>
      </div>
    </div>
  );
}
