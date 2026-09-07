import { useState } from 'react';
import { OPERATOR_SERVICE_URL, fetchWithAuth, getAuthUser } from '../config.js';
import { UserCircle, Shield, Clock, Hash, Activity } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState(getAuthUser() || {});


  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'online': return 'bg-green-500';
      case 'occupato': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="flex-1 p-8 bg-transparent min-h-screen flex justify-center items-start pt-12">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm w-full max-w-3xl overflow-hidden">
        {/* Header Profilo */}
        <div className="bg-[#0B1B32] p-8 flex items-center gap-6 text-white relative">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white/10 shadow-lg bg-gray-600 flex items-center justify-center">
              <UserCircle className="w-16 h-16 text-gray-300" strokeWidth={1} />
            </div>
            <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-4 border-[#0B1B32] ${getStatusColor(user.stato)}`}></div>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold">{user.nome} {user.cognome}</h1>
            <p className="text-[#6ea8fe] uppercase tracking-wider text-sm font-semibold mt-1 flex items-center gap-2">
              <Shield className="w-4 h-4" /> {user.ruolo || 'Operatore'}
            </p>
          </div>
        </div>

        {/* Corpo Profilo */}
        <div className="p-8">
          <h2 className="text-lg font-bold text-[#0B1B32] mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
            <UserCircle className="w-5 h-5 text-[#1976d2]" /> Informazioni Operatore
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-start gap-4">
               <Hash className="w-5 h-5 text-gray-400 mt-0.5" />
               <div>
                 <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Matricola / ID</p>
                 <p className="text-[#0B1B32] font-semibold text-lg">{user.id || user.matricola || 'N/A'}</p>
               </div>
            </div>
          </div>

          <h2 className="text-lg font-bold text-[#0B1B32] mb-6 flex items-center gap-2 border-b border-gray-100 pb-3 mt-8">
            <Activity className="w-5 h-5 text-[#1976d2]" /> Stato Operativo
          </h2>

          <div className="flex gap-4">
            <div className="flex-1 py-3 px-4 rounded-lg font-bold text-sm border-2 border-green-500 bg-green-50 text-green-700 flex items-center justify-center gap-2 cursor-default">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div> Online / Attivo
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
