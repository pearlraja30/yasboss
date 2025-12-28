import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X, Loader2, ListChecks } from 'lucide-react';
import api from '../../services/api'; 
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion'; // Fixed: Import motion

interface QuizQuestion {
    id?: number;
    category: string;
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: number;
    points: number;
    ageRange: string;
}

const QuizManager: React.FC = () => {
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    
    const initialFormState: QuizQuestion = {
        questionText: '',
        category: 'Educational',
        ageRange: '3-5',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctOption: 0,
        points: 10
    };

    const [formData, setFormData] = useState<QuizQuestion>(initialFormState);

    useEffect(() => {
        loadQuestions();
    }, []);

    const loadQuestions = async () => {
        setLoading(true);
        try {
            // Requirement #7: Fetch all questions for management
            const data = await api.quizService.getAllAdminQuestions();
            setQuestions(data);
        } catch (err) {
            toast.error("Failed to sync with Question Bank");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Requirement #7: Add a new question to the dynamic database
            await api.quizService.addQuestion(formData);
            toast.success("New question added to the bank!");
            setIsAdding(false);
            setFormData(initialFormState);
            loadQuestions();
        } catch (err) {
            toast.error("Could not save question");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure? This will remove the question from the game.")) return;
        try {
            // Requirement #7: Delete a question
            await api.quizService.deleteQuestion(id);
            toast.info("Question removed");
            loadQuestions();
        } catch (err) {
            toast.error("Delete operation failed");
        }
    };

    return (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 min-h-[600px]">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div className="flex items-center gap-4">
                    <div className="bg-pink-50 p-3 rounded-2xl text-pink-600">
                        <ListChecks size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-[#2D4A73]">Quiz Question Bank</h2>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Requirement #5: Gamified Learning Manager</p>
                    </div>
                </div>
                <button 
                    onClick={() => setIsAdding(true)}
                    className="bg-[#2D4A73] text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-pink-600 transition-all shadow-lg shadow-blue-100"
                >
                    <Plus size={18} /> Add New Question
                </button>
            </div>

            {/* Questions Table */}
            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-300" size={40} /></div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-gray-400 text-[10px] uppercase tracking-[0.2em] font-black border-b border-gray-50">
                                <th className="pb-4">Question Details</th>
                                <th className="pb-4">Category</th>
                                <th className="pb-4">Age</th>
                                <th className="pb-4">Points</th>
                                <th className="pb-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {questions.map((q) => (
                                <tr key={q.id} className="group hover:bg-gray-50 transition-colors">
                                    <td className="py-6">
                                        <p className="font-bold text-[#2D4A73] mb-1">{q.questionText}</p>
                                        <div className="flex gap-2">
                                            <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded font-bold uppercase">Ans: {String.fromCharCode(65 + q.correctOption)}</span>
                                        </div>
                                    </td>
                                    <td className="py-6">
                                        <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-tighter">{q.category}</span>
                                    </td>
                                    <td className="py-6 font-bold text-gray-500">{q.ageRange}</td>
                                    <td className="py-6 font-black text-pink-600">+{q.points}</td>
                                    <td className="py-6 text-right">
                                        <button 
                                            onClick={() => q.id && handleDelete(q.id)}
                                            className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Side-Drawer Form */}
            <AnimatePresence>
                {isAdding && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsAdding(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                        />
                        <motion.div 
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 w-full max-w-xl bg-white h-full p-10 overflow-y-auto shadow-2xl z-[101]"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-2xl font-black text-[#2D4A73]">New Question</h3>
                                <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X /></button>
                            </div>

                            <form onSubmit={handleSave} className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Question Text</label>
                                    <textarea 
                                        required className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                                        rows={3} value={formData.questionText} onChange={(e) => setFormData({...formData, questionText: e.target.value})}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Category</label>
                                        <select className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-blue-100" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                                            <option>Educational</option>
                                            <option>Logic</option>
                                            <option>Puzzles</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Age Range</label>
                                        <select className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-blue-100" value={formData.ageRange} onChange={(e) => setFormData({...formData, ageRange: e.target.value})}>
                                            <option>0-2</option>
                                            <option>3-5</option>
                                            <option>6-8</option>
                                            <option>9+</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {['A', 'B', 'C', 'D'].map((opt) => (
                                        <div key={opt}>
                                            <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Option {opt}</label>
                                            <input 
                                                required type="text" className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-blue-100"
                                                value={(formData as any)[`option${opt}`]} 
                                                onChange={(e) => setFormData({...formData, [`option${opt}`]: e.target.value})}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Correct Answer</label>
                                        <select className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold text-green-600 outline-none focus:ring-2 focus:ring-green-100" value={formData.correctOption} onChange={(e) => setFormData({...formData, correctOption: parseInt(e.target.value)})}>
                                            <option value={0}>Option A</option>
                                            <option value={1}>Option B</option>
                                            <option value={2}>Option C</option>
                                            <option value={3}>Option D</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Points Awarded</label>
                                        <input type="number" className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-blue-100" value={formData.points} onChange={(e) => setFormData({...formData, points: parseInt(e.target.value)})} />
                                    </div>
                                </div>

                                <button type="submit" className="w-full bg-[#2D4A73] text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-100 flex items-center justify-center gap-3 mt-6 hover:bg-[#1e334f] transition-all">
                                    <Save size={20} /> Save Question
                                </button>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default QuizManager;