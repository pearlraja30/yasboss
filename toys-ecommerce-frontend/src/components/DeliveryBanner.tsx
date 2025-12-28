import React from 'react';

const DeliveryBanner = () => {
  const message = "₹49 Delivery Charge. Free Delivery above ₹500";

  return (
    <div className="bg-[#2D4A73] py-2 overflow-hidden whitespace-nowrap border-b border-[#1e334f]">
      <div className="inline-block animate-marquee group">
        {/* Repeat the message multiple times to create a continuous loop */}
        <span className="text-white font-bold text-sm tracking-wide px-4">
          {message} &nbsp;&nbsp;•&nbsp;&nbsp; {message} &nbsp;&nbsp;•&nbsp;&nbsp; {message} &nbsp;&nbsp;•&nbsp;&nbsp; {message}
        </span>
        <span className="text-white font-bold text-sm tracking-wide px-4">
          {message} &nbsp;&nbsp;•&nbsp;&nbsp; {message} &nbsp;&nbsp;•&nbsp;&nbsp; {message} &nbsp;&nbsp;•&nbsp;&nbsp; {message}
        </span>
      </div>
    </div>
  );
};

export default DeliveryBanner;