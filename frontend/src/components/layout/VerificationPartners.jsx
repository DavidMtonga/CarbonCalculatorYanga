// frontend/src/components/layout/VerificationPartners.jsx
import React from "react";

const VerificationPartners = () => {
  const partners = [
    { name: "VERRA", icon: "fas fa-globe-africa", color: "text-green-600" },
    {
      name: "Gold Standard",
      icon: "fas fa-certificate",
      color: "text-blue-600",
    },
    { name: "UNFCCC CDM", icon: "fas fa-leaf", color: "text-teal-500" },
    {
      name: "ISO 14064",
      icon: "fas fa-balance-scale",
      color: "text-purple-600",
    },
    {
      name: "WBCSD WRI",
      icon: "fas fa-hand-holding-water",
      color: "text-cyan-600",
    },
  ];

  // Duplicate partners for infinite scroll effect
  const allPartners = [...partners, ...partners];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 my-8">
      <h2 className="text-2xl font-bold text-green-600 mb-8 text-center">
        Aligned with Accredited Third-Party Verification and Standards
      </h2>

      <div className="relative overflow-hidden">
        <div className="animate-marquee whitespace-nowrap">
          {allPartners.map((partner, index) => (
            <div key={index} className="inline-block mx-8 text-center">
              <div className={`${partner.color} text-4xl mb-3`}>
                <i className={partner.icon}></i>
              </div>
              <p className="text-gray-700 font-medium">{partner.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VerificationPartners;
