import { useEffect, useState } from 'react';
import api from '../utils/api';
import type { Book, BookIssue } from '../types';
import { Search, Plus, BookOpen, RotateCcw } from 'lucide-react';

export default function LibraryPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [issues, setIssues] = useState<BookIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'books' | 'issues'>('books');
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/library/books'),
      api.get('/library/issues'),
    ]).then(([booksRes, issuesRes]) => {
      setBooks(booksRes.data);
      setIssues(issuesRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const returnBook = async (issueId: string) => {
    try {
      await api.put(`/library/return/${issueId}`);
      const { data } = await api.get('/library/issues');
      setIssues(data);
      const booksData = await api.get('/library/books');
      setBooks(booksData.data);
    } catch (error) { console.error('Error:', error); }
  };

  const filteredBooks = books.filter(b => `${b.title} ${b.author}`.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Library</h1>
          <p className="text-gray-500 mt-1">{books.length} books in collection</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
          <Plus size={18} /> Add Book
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="border-b flex">
          <button onClick={() => setActiveTab('books')}
            className={`px-6 py-3 text-sm font-medium transition ${activeTab === 'books' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}>
            Books ({books.length})
          </button>
          <button onClick={() => setActiveTab('issues')}
            className={`px-6 py-3 text-sm font-medium transition ${activeTab === 'issues' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}>
            Issued ({issues.filter(i => !i.returnDate).length})
          </button>
        </div>

        {activeTab === 'books' && (
          <>
            <div className="p-4 border-b">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search books..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {filteredBooks.map(book => (
                <div key={book.id} className="border rounded-xl p-4 hover:shadow-md transition">
                  <div className="flex items-start gap-3">
                    <div className="bg-indigo-100 p-2 rounded-lg"><BookOpen size={20} className="text-indigo-600" /></div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{book.title}</h3>
                      <p className="text-sm text-gray-500">{book.author}</p>
                      {book.isbn && <p className="text-xs text-gray-400 mt-1">ISBN: {book.isbn}</p>}
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-gray-500">{book.category}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${book.available > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {book.available}/{book.quantity} available
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'issues' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Book</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Issue Date</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Due Date</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {issues.map(issue => (
                  <tr key={issue.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{issue.book?.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{issue.student?.user?.firstName} {issue.student?.user?.lastName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(issue.issueDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(issue.dueDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${issue.returnDate ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {issue.returnDate ? 'Returned' : 'Issued'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {!issue.returnDate && (
                        <button onClick={() => returnBook(issue.id)} className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800">
                          <RotateCcw size={14} /> Return
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
