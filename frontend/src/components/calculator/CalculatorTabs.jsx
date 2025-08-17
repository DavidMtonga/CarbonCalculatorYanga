import React from "react";

const CalculatorTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: "cooking", icon: "fa-utensils", label: "Cooking" },
    // Add other tabs as needed
  ];

  const getTabColor = (tabId) => {
    switch (tabId) {
      case "cooking":
        return "bg-pink-600 hover:bg-pink-700";
      default:
        return "bg-gray-600 hover:bg-gray-700";
    }
  };

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              py-2 px-4 border-b-2 font-medium text-sm rounded-t-lg transition-colors duration-200
              ${
                activeTab === tab.id
                  ? `${getTabColor(tab.id)} text-white border-transparent`
                  : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
              }
            `}
          >
            <i className={`fas ${tab.icon} mr-2`}></i>
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default CalculatorTabs;
