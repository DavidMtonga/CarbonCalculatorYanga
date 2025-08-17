import React from "react";

const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorClass = "text-blue-600",
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            {Icon && (
              <div className={`flex-shrink-0 ${colorClass}`}>
                <Icon className="h-6 w-6" />
              </div>
            )}
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">{value}</p>
                {subtitle && (
                  <p className="ml-2 text-sm text-gray-500">{subtitle}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {trend && (
          <div
            className={`flex items-center ${
              trend.isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            <svg
              className={`h-4 w-4 ${
                trend.isPositive ? "transform rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 14l-7-7m0 0l-7 7m7-7v18"
              />
            </svg>
            <span className="ml-1 text-sm font-medium">{trend.value}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
