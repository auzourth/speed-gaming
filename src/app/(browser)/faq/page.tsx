'use client';

import { ChevronDown } from 'lucide-react';
import React from 'react';

function Page() {
  const [showFAQ2, setShowFAQ2] = React.useState(false);
  const [showFAQ3, setShowFAQ3] = React.useState(false);
  const [showFAQ4, setShowFAQ4] = React.useState(false);
  return (
    <div className="bg-black text-white min-h-screen ">
      <div className="max-w-2xl mx-auto p-6 pt-16 space-y-6">
        <h1 className="text-center text-2xl font-bold my-12">
          Frequently Asked Questions
        </h1>

        <div className="bg-gray-800 rounded-lg p-4">
          <button
            onClick={() => setShowFAQ2(!showFAQ2)}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="text-base font-medium">
              How long will it take to receive the game?
            </h3>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                showFAQ2 ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showFAQ2 && (
            <div className="mt-3 pt-3 border-t border-gray-700">
              <p className="text-gray-300 text-sm">
                On average, our processing team fulfills orders within 24 hours
                after the payment is completed. This is true for 95% of all
                orders. However, occasionally some titles may be delayed and we
                need some extra time to get them prepared for you, usually
                within couple hours. It can take up to maximum 24 hours.
              </p>
            </div>
          )}
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <button
            onClick={() => setShowFAQ3(!showFAQ3)}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="text-base font-medium">
              Can I play the game using my personal account?
            </h3>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                showFAQ3 ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showFAQ3 && (
            <div className="mt-3 pt-3 border-t border-gray-700">
              <p className="text-gray-300 text-sm">
                Yes, you will need to connect to the seller&apos;s account
                first, download the game, and then that you will be able to play
                freely from your personal account. All of the features like
                trophies, savedata and multiplayer - will work the same way as
                if you&apos;ve purchased it on your own account.
              </p>
            </div>
          )}
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <button
            onClick={() => setShowFAQ4(!showFAQ4)}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="text-base font-medium">
              Is it safe? Are there any risk to my console?
            </h3>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                showFAQ4 ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showFAQ4 && (
            <div className="mt-3 pt-3 border-t border-gray-700">
              <p className="text-gray-300 text-sm">
                Yes, it is 100% safe and secure. This method of buying a digital
                license legally has no risk or harm to your console, as the
                console were designed to allow such game sharing between family
                members.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Page;
