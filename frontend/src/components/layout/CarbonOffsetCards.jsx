import React from "react";

const CarbonOffsetCards = () => {
  const offsetOptions = [
    {
      title: "Plant Trees",
      description:
        "Support local reforestation projects. One tree offsets approximately 25kg of CO2 annually.",
      buttonText: "Plant Now",
      bgColor: "bg-green-50",
      buttonColor: "bg-green-600 hover:bg-green-700",
      icon: "🌱",
    },
    {
      title: "Eco Waste Management",
      description:
        "Fund innovative recycling programs and waste reduction initiatives.",
      buttonText: "Support",
      bgColor: "bg-blue-50",
      buttonColor: "bg-green-600 hover:bg-green-700",
      icon: "♻️",
    },
    {
      title: "Green Building Projects",
      description:
        "Invest in sustainable building practices and renewable energy infrastructure.",
      buttonText: "Invest",
      bgColor: "bg-yellow-50",
      buttonColor: "bg-green-600 hover:bg-green-700",
      icon: "🏗️",
    },
  ];

  const handleOffsetClick = (title) => {
    // This can be connected to actual offset purchasing logic
    console.log(`Offset option selected: ${title}`);
    // You can add navigation or modal logic here
  };

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-green-600 mb-2 text-center">
          Offset Your Carbon
        </h2>
        <h3 className="text-xl font-bold text-green-600 mb-6 text-center">
          Footprint
        </h3>

        <div className="space-y-6">
          {offsetOptions.map((option, index) => (
            <div key={index} className={`${option.bgColor} rounded-lg p-4`}>
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl">{option.icon}</span>
                <h4 className="text-lg font-semibold text-green-600">
                  {option.title}
                </h4>
              </div>

              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {option.description}
              </p>

              <button
                onClick={() => handleOffsetClick(option.title)}
                className={`w-full py-2 px-4 ${option.buttonColor} text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
              >
                {option.buttonText}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            All offset projects are verified and certified for maximum
            environmental impact.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CarbonOffsetCards;
