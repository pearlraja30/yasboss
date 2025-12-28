import { Home, Search, ShoppingBag, Heart } from 'lucide-react';

const MobileBottomNav = () => (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] bg-white/70 backdrop-blur-xl border border-white/30 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-3xl p-4 flex justify-around items-center z-[100]">
        <button className="flex flex-col items-center text-pink-600">
            <Home size={22} />
        </button>
        <button className="flex flex-col items-center text-gray-400">
            <Search size={22} />
        </button>
        <button className="relative flex flex-col items-center text-gray-400">
            <ShoppingBag size={22} />
            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">0</span>
        </button>
        <button className="flex flex-col items-center text-gray-400">
            <Heart size={22} />
        </button>
    </div>
);