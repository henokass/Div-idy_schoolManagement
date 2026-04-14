import { useEffect, useState } from 'react';
import api from '../utils/api';
import type { FeePayment, FeeStructure } from '../types';
import { DollarSign, Search, TrendingUp, TrendingDown } from 'lucide-react';

export default function Fees() {
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'structures' | 'payments'>('structures');
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/fees/structures'),
      api.get('/fees/payments'),
    ]).then(([structRes, payRes]) => {
      setStructures(structRes.data);
      setPayments(payRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const totalExpected = structures.reduce((sum, s) => sum + s.amount, 0);
  const totalCollected = payments.reduce((sum, p) => sum + p.amountPaid, 0);

  const filteredPayments = payments.filter(p =>
    `${p.student?.user?.firstName} ${p.student?.user?.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-700';
      case 'PARTIAL': return 'bg-amber-100 text-amber-700';
      case 'UNPAID': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
        <p className="text-gray-500 mt-1">Manage fee structures and payments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center gap-4">
          <div className="bg-blue-500 p-3 rounded-lg"><DollarSign size={24} className="text-white" /></div>
          <div><p className="text-sm text-gray-500">Total Expected</p><p className="text-xl font-bold">{totalExpected.toLocaleString()} Birr</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center gap-4">
          <div className="bg-green-500 p-3 rounded-lg"><TrendingUp size={24} className="text-white" /></div>
          <div><p className="text-sm text-gray-500">Total Collected</p><p className="text-xl font-bold">{totalCollected.toLocaleString()} Birr</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center gap-4">
          <div className="bg-red-500 p-3 rounded-lg"><TrendingDown size={24} className="text-white" /></div>
          <div><p className="text-sm text-gray-500">Outstanding</p><p className="text-xl font-bold">{(totalExpected - totalCollected).toLocaleString()} Birr</p></div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="border-b flex">
          <button onClick={() => setActiveTab('structures')}
            className={`px-6 py-3 text-sm font-medium transition ${activeTab === 'structures' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
            Fee Structures
          </button>
          <button onClick={() => setActiveTab('payments')}
            className={`px-6 py-3 text-sm font-medium transition ${activeTab === 'payments' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
            Payments
          </button>
        </div>

        {activeTab === 'structures' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Fee Name</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Class</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Term</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {structures.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{s.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{s.class?.name}</td>
                    <td className="px-6 py-4 text-sm font-medium">{s.amount.toLocaleString()} Birr</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{s.term} - {s.academicYear}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(s.dueDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'payments' && (
          <>
            <div className="p-4 border-b">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search payments..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Method</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredPayments.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{p.student?.user?.firstName} {p.student?.user?.lastName}</td>
                      <td className="px-6 py-4 text-sm font-medium">{p.amountPaid.toLocaleString()} Birr</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(p.paymentDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{p.paymentMethod || '-'}</td>
                      <td className="px-6 py-4"><span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(p.status)}`}>{p.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredPayments.length === 0 && <div className="text-center py-8 text-gray-500">No payments found</div>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
