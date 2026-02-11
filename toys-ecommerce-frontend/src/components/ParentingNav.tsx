import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const parentingMenus = [
    { id: 'pregnancy', label: 'Pregnancy', icon: '🤰', path: '/parenting/pregnancy' },
    { id: 'baby', label: 'Baby & Toddler', icon: '👶', path: '/parenting/baby' },
    { id: 'preschooler', label: 'Preschooler', icon: '🧒', path: '/parenting/preschooler' },
    { id: 'magazine', label: 'Magazine', icon: '📖', path: '/parenting/magazine' },
    { id: 'tools', label: 'Tools', icon: '🛠️', path: '/parenting/tools' },
    { id: 'names', label: 'Baby Names', icon: '🏷️', path: '/parenting/names' },
    { id: 'milestones', label: 'Milestones', icon: '✨', path: '/parenting/milestones' },
];

const ParentingNav: React.FC = () => {
    const location = useLocation();

    return (
        <nav className="bg-white border-b border-gray-100 py-4 px-10 flex justify-center gap-8 overflow-x-auto no-scrollbar">
            {parentingMenus.map((menu) => {
                // Check if the current URL matches the menu path
                const isActive = location.pathname === menu.path;

                return (
                    <Link 
                        key={menu.id} 
                        to={menu.path} 
                        className="group flex flex-col items-center min-w-max"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            {/* Optional: Show emoji icon only on hover or if active */}
                            <span className={`text-xs transition-transform duration-300 ${
                                isActive ? 'scale-110' : 'opacity-0 group-hover:opacity-100 group-hover:scale-110'
                            }`}>
                                {menu.icon}
                            </span>
                            <span className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${
                                isActive ? 'text-pink-500' : 'text-gray-400 group-hover:text-pink-500'
                            }`}>
                                {menu.label}
                            </span>
                        </div>
                        
                        {/* The Animated Pink Line */}
                        <div className={`h-0.5 bg-pink-500 transition-all duration-300 ease-out ${
                            isActive ? 'w-full' : 'w-0 group-hover:w-full'
                        }`} />
                    </Link>
                );
            })}
        </nav>
    );
};

export default ParentingNav;