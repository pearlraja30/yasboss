import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, CheckCircle2, AlertCircle, ArrowRight, Sparkles, Loader2, Clock, Zap } from 'lucide-react';
import api from '../services/api'; 
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const QuizPage: React.FC = () => {
    const navigate = useNavigate();
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [timeLeft, setTimeLeft] = useState(30); 
    const [bonusEarned, setBonusEarned] = useState(0);
    const [showBonus, setShowBonus] = useState(false);
    const [isWeekend, setIsWeekend] = useState(false);

    useEffect(() => {
        const day = new Date().getDay();
        if (day === 0 || day === 6) setIsWeekend(true);

        const fetchQuestions = async () => {
            try {
                setLoading(true);
                // The email is no longer passed as a param; 
                // JWT in the header identifies the user
                const data = await api.quizService.getQuestions("Educational");
                
                if (data && data.length > 0) {
                    setQuestions(data);
                } else {
                    toast.error("No questions found for this category.");
                }
            } catch (err: any) {
                console.error("Quiz Fetch Error:", err);
                toast.error(err.response?.status === 403 
                    ? "Access Denied. Please login again." 
                    : "Could not load quiz questions.");
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
    }, []);

    useEffect(() => {
        if (loading || isFinished || selectedOption !== null || questions.length === 0) return;

        if (timeLeft === 0) {
            setSelectedOption(-1); 
            toast.warn("Time's up!");
            return;
        }

        const interval = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft, loading, isFinished, selectedOption, questions.length]);

    const handleOptionSelect = (index: number) => {
        if (selectedOption !== null || timeLeft === 0 || !questions[currentQuestion]) return;
        setSelectedOption(index);
        
        const currentQ = questions[currentQuestion];
        if (index === currentQ.correctOption) {
            const basePoints = currentQ.points || 10;
            const speedBonus = Math.floor(timeLeft / 5); 
            const multiplier = isWeekend ? 2 : 1;
            const totalRoundScore = (basePoints + speedBonus) * multiplier;

            setScore(prev => prev + totalRoundScore);
            
            if (speedBonus > 0) {
                setBonusEarned(speedBonus * multiplier);
                setShowBonus(true);
                setTimeout(() => setShowBonus(false), 2000);
            }

            if (isWeekend) {
                toast.success("Weekend 2x Points! 🚀");
            }
        }
    };

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
            setSelectedOption(null);
            setTimeLeft(30);
        } else {
            setIsFinished(true);
        }
    };

    const handleQuizFinish = async () => {
        setSubmitting(true);
        try {
            // ✨ THE FIX: Removed userData.email from the payload.
            // The backend now retrieves the user identity via 
            // SecurityContextHolder from the JWT.
            const response = await api.rewardService.completeQuiz({ 
                pointsEarned: score,
                quizId: `QUIZ_${Date.now()}`
            });
            
            // Sync local user data with the updated balance from backend
            const userStr = localStorage.getItem('user');
            const userData = JSON.parse(userStr || '{}');
            const updatedUser = { ...userData, rewardPoints: response.newBalance };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            window.dispatchEvent(new Event("storage"));
            
            toast.success(`Points Saved! Total: ${score}`);
            navigate('/profile/rewards'); 
        } catch (err) {
            console.error("Reward Update Error:", err);
            toast.error("Failed to update points.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-[#2D4A73]" size={48} />
            <p className="mt-4 font-black text-[#2D4A73] uppercase tracking-widest">Loading Quiz...</p>
        </div>
    );

    if (questions.length === 0) return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4">
            <AlertCircle className="text-red-500 mb-4" size={48} />
            <p className="font-black text-[#2D4A73] uppercase tracking-widest text-center mb-6">
                No questions available at the moment.
            </p>
            <button onClick={() => navigate('/')} className="text-blue-600 font-bold hover:underline">Go Back Home</button>
        </div>
    );

    if (isFinished) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full bg-white rounded-[3.5rem] p-12 text-center shadow-2xl border border-gray-100">
                    <div className="w-24 h-24 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trophy size={48} />
                    </div>
                    <h2 className="text-4xl font-black text-[#2D4A73] mb-2">Awesome!</h2>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-8">You earned {score} Points</p>
                    <button onClick={handleQuizFinish} disabled={submitting} className="w-full bg-[#2D4A73] text-white py-5 rounded-[2rem] font-black text-lg shadow-xl hover:bg-[#1e334f] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                        {submitting ? <Loader2 className="animate-spin" /> : 'Claim My Rewards'}
                        <Sparkles size={20} />
                    </button>
                </motion.div>
            </div>
        );
    }

    const currentQ = questions[currentQuestion];
    // Map options to match lowercase fields from your Java Model/PostgreSQL
    const options = [currentQ.option_a, currentQ.option_b, currentQ.option_c, currentQ.option_d];

    return (
        <div className="min-h-screen bg-[#F8F9FA] py-20 px-4">
            <div className="max-w-3xl mx-auto relative">
                {isWeekend && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 z-20">
                        <Zap size={14} fill="currentColor" /> Weekend 2x Points Active
                    </div>
                )}

                <AnimatePresence>
                    {showBonus && (
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: -40, opacity: 1 }} exit={{ opacity: 0 }} className="absolute top-0 right-0 bg-yellow-400 text-[#2D4A73] font-black px-4 py-2 rounded-full shadow-lg z-50 flex items-center gap-2">
                            <Sparkles size={16} /> +{bonusEarned} Bonus!
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100">
                        <Clock className={timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-blue-500'} size={24} />
                        <span className={`text-2xl font-black ${timeLeft <= 5 ? 'text-red-500' : 'text-[#2D4A73]'}`}>
                            0:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                        </span>
                    </div>
                    <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm text-right">
                        <span className="text-[10px] font-black text-gray-400 uppercase block">Current Score</span>
                        <span className="text-xl font-black text-[#2D4A73]">{score}</span>
                    </div>
                </div>

                <motion.div key={currentQuestion} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-white rounded-[3.5rem] p-10 md:p-16 shadow-sm border border-gray-100 relative overflow-hidden">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-12 mt-4 leading-tight">
                        {currentQ.questionText}
                    </h3>

                    <div className="grid gap-4">
                        {options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleOptionSelect(index)}
                                disabled={selectedOption !== null || timeLeft === 0}
                                className={`w-full p-6 rounded-3xl text-left font-bold transition-all border-2 flex justify-between items-center ${
                                    selectedOption === index 
                                        ? (index === currentQ.correctOption ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700')
                                        : (selectedOption !== null && index === currentQ.correctOption ? 'bg-green-50 border-green-500 text-green-700' : 'bg-gray-50 border-transparent text-gray-600')
                                }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>

                    <div className="mt-12 flex justify-between items-center">
                        <span className="text-gray-400 font-bold uppercase text-xs">Question {currentQuestion + 1} / {questions.length}</span>
                        <button onClick={handleNext} disabled={selectedOption === null && timeLeft > 0} className="flex items-center gap-2 bg-[#2D4A73] text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-[#1e334f] transition-all disabled:opacity-50">
                            {currentQuestion < questions.length - 1 ? 'Next' : 'Finish'} <ArrowRight size={18} />
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default QuizPage;