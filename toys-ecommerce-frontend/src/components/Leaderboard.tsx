import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Star } from 'lucide-react';
import api from '../services/api';

const Leaderboard: React.FC = () => {
    const [leaders, setLeaders] = useState<any[]>([]);

    useEffect(() => {
        const loadLeaderboard = async () => {
            try {
                // You'll need to add getLeaderboard to your api.ts
                const data = await api.userService.getLeaderboard();
                setLeaders(data);
            } catch (err) {
                console.error("Leaderboard failed to load");
            }
        };
        loadLeaderboard();
    }, []);

    return (
        <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-gray-100 max-w-2xl mx-auto my-10">
            <div className="text-center mb-10">
                <div className="inline-block bg-yellow-100 p-4 rounded-full text-yellow-600 mb-4">
                    <Trophy size={48} />
                </div>
                <h2 className="text-4xl font-black text-[#2D4A73]">Top Play-Experts</h2>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-2">Requirement #5: Gamified Rankings</p>
            </div>

            <div className="space-y-4">
                {leaders.map((user, index) => (
                    <div key={index} className={`flex items-center justify-between p-6 rounded-[2rem] transition-all ${index === 0 ? 'bg-yellow-50 border-2 border-yellow-200' : 'bg-gray-50'}`}>
                        <div className="flex items-center gap-6">
                            <span className="text-2xl font-black text-gray-300 w-8">#{index + 1}</span>
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                                {index === 0 ? <Medal className="text-yellow-500" /> : <Star className="text-blue-400" />}
                            </div>
                            <span className="text-xl font-black text-[#2D4A73]">{user.name}</span>
                        </div>
                        <div className="text-right">
                            <span className="block text-2xl font-black text-pink-600">{user.points}</span>
                            <span className="text-[10px] font-black text-gray-400 uppercase">Points</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Leaderboard;