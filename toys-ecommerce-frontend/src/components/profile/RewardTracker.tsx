import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, ShoppingBag, Gamepad2, Gift, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';

interface PointTransaction {
    id: number;
    date: string;
    description: string;
    points: number;
    type: 'EARNED' | 'REDEEMED';
    source: 'QUIZ' | 'ORDER' | 'BONUS';
}

const RewardTracker: React.FC = () => {
    const [transactions, setTransactions] = useState<PointTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRewardHistory = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                // Requirement #4: Fetch points history for the specific user
                const data = await api.rewardService.getPointHistory(user.email);
                setTransactions(data);
            } catch (err) {
                console.error("Failed to load reward history");
                // Mock data for initial testing if API isn't ready
              /*  setTransactions([
                    { id: 1, date: '2025-12-24', description: 'Educational Quiz Completion', points: 50, type: 'EARNED', source: 'QUIZ' },
                    { id: 2, date: '2025-12-23', description: 'Weekend Double Points Bonus', points: 20, type: 'EARNED', source: 'QUIZ' },
                    { id: 3, date: '2025-12-22', description: 'Order #YB-1735123 Purchase', points: 15, type: 'EARNED', source: 'ORDER' },
                ]); */
            } finally {
                setLoading(false);
            }
        };
        fetchRewardHistory();
    }, []);

    const getIcon = (source: string) => {
        switch (source) {
            case 'QUIZ': return <Gamepad2 className="text-purple-500" size={18} />;
            case 'ORDER': return <ShoppingBag className="text-blue-500" size={18} />;
            default: return <Gift className="text-pink-500" size={18} />;
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-[#2D4A73]">Points History</h2>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Requirement #4: Reward Tracker</p>
                </div>
                <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-2xl border border-yellow-100">
                    <TrendingUp size={16} className="text-yellow-600" />
                    <span className="text-yellow-700 font-black text-xs uppercase">Keep playing to earn more!</span>
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-20 bg-gray-50 animate-pulse rounded-3xl" />
                    ))}
                </div>
            ) : (
                <div className="grid gap-4">
                    {transactions.map((tx, index) => (
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            key={tx.id}
                            className="bg-white border border-gray-100 p-6 rounded-[2rem] flex items-center justify-between hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center gap-5">
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    {getIcon(tx.source)}
                                </div>
                                <div>
                                    <h4 className="font-black text-[#2D4A73] text-sm">{tx.description}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Clock size={12} className="text-gray-300" />
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{tx.date}</span>
                                    </div>
                                </div>
                            </div>

                            <div className={`flex items-center gap-1 font-black text-lg ${tx.type === 'EARNED' ? 'text-green-500' : 'text-red-500'}`}>
                                {tx.type === 'EARNED' ? '+' : '-'}{tx.points}
                                <Star size={16} fill="currentColor" />
                            </div>
                        </motion.div>
                    ))}

                    {transactions.length === 0 && (
                        <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                            <Star className="mx-auto text-gray-300 mb-4" size={48} />
                            <p className="text-gray-500 font-bold">No transactions yet. Start a quiz to earn points!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RewardTracker;