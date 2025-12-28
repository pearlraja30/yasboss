import React from 'react';
import ProfileOverview from '../components/ProfileOverview';
import OrderTracking from '../components/OrderTracking';
import UserDetails from '../pages/UserDetails';
import RewardTracker from '../components/profile/RewardTracker'; // Assuming this exists

const ProfileDashboard: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#F8F9FA] py-12 px-4">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* 1. Top Section: Profile Overview */}
                <section>
                    <ProfileOverview />
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 2. Left Column: Account Settings & Details */}
                    <div className="lg:col-span-1 space-y-8">
                        <UserDetails />
                    </div>

                    {/* 3. Right Column: Orders & Rewards */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-white rounded-[3rem] p-8 shadow-sm border border-gray-50">
                            <OrderTracking />
                        </section>
                        
                        <section className="bg-white rounded-[3rem] p-8 shadow-sm border border-gray-50">
                            <h3 className="text-2xl font-black text-[#2D4A73] mb-6 px-4">Point History</h3>
                            <RewardTracker />
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileDashboard;