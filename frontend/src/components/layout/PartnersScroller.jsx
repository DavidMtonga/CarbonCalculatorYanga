// frontend/src/components/layout/PartnersScroller.jsx
import React from "react";

const PartnersScroller = () => {
  const partners = [
    { name: "Bwana Lifestyle - Digital Marketing", icon: "fas fa-leaf" },
    { name: "K Mobile Hub", icon: "fas fa-tree" },
    { name: "Musika", icon: "fas fa-solar-panel" },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-50 border-t border-gray-200 py-4 shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-lg font-semibold text-green-600 text-center mb-4">
          Our Partners
        </h3>
        <div className="flex justify-center space-x-8 md:space-x-12 overflow-x-auto py-2">
          {partners.map((partner, index) => (
            <div key={index} className="flex flex-col items-center min-w-max">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white flex items-center justify-center shadow-md mb-2">
                <i
                  className={`${partner.icon} text-green-600 text-xl md:text-2xl`}
                ></i>
              </div>
              <p className="text-sm md:text-base text-gray-700 text-center">
                {partner.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PartnersScroller;
