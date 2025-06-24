'use client';
import React from 'react';

interface Step {
  label: string;
  status: 'completed' | 'processing' | 'null';
  timestamp?: string;
}

interface OrderStepperProps {
  steps: Step[];
  className?: string;
}

const OrderStepper: React.FC<OrderStepperProps> = ({
  steps,
  className = '',
}) => {
  // Static step labels
  const stepLabels = ['pending', 'processing', 'Completed'];
  const stepDescriptions = [
    'Order is pending.',
    'Order is processing.',
    'The order completed.',
  ];

  console.log('steps:', steps);

  return (
    <div className={`w-full ${className}`}>
      {/* Progress Bar */}
      <div className="relative mb-8">
        {/* Background line */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-600"></div>

        {/* Progress line */}
        <div
          className="absolute top-4 left-2 h-0.5 bg-green-500 transition-all duration-300"
          style={{
            width:
              steps.filter((step) => step.status === 'completed').length ===
              steps.length
                ? 'calc(100% - 2rem)'
                : `${
                    (steps.filter((step) => step.status === 'completed')
                      .length /
                      (steps.length - 1)) *
                    100
                  }%`,
          }}
        ></div>

        <div className="flex items-center justify-between relative">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex flex-col items-center relative z-10"
            >
              {/* Step Circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-200 ${
                  step.status === 'completed'
                    ? 'bg-green-500'
                    : step.status === 'processing'
                    ? 'bg-yellow-500'
                    : 'bg-gray-600'
                }`}
              >
                {step.status === 'completed'
                  ? '✓'
                  : step.status === 'processing'
                  ? '✓'
                  : index + 1}
              </div>

              {/* Step Label */}
              <span className={`mt-2 text-xs text-center ${'text-gray-400'}`}>
                {stepLabels[index]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Details */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex items-start space-x-3 ${
              step.status === 'null' ? 'opacity-60' : ''
            }`}
          >
            <div
              className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                step.status === 'completed'
                  ? 'bg-green-500'
                  : step.status === 'processing'
                  ? 'bg-yellow-500'
                  : 'bg-gray-600'
              }`}
            />
            <div className="flex-1 flex gap-2">
              {step.timestamp && (
                <div className="text-gray-400 text-sm mb-1">
                  {step.timestamp}
                </div>
              )}
              <div
                className={`text-sm ${
                  step.status === 'completed' || step.status === 'processing'
                    ? 'text-white font-medium'
                    : 'text-gray-400'
                }`}
              >
                {stepDescriptions[index]}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderStepper;
