'use client';
import React, { useState } from 'react';
import Modal from './Modal';
import { v4 as uuidv4 } from 'uuid';
import { Copy } from 'lucide-react';
import InputField from '@/components/ui/InputField';

interface GeneratedCode {
  name: string;
  email: string;
  code: string;
}

interface CodeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (code: GeneratedCode) => void;
}

const CodeGeneratorModal: React.FC<CodeGeneratorModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(
    null
  );
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const generateCode = () => {
    if (!name) return;

    const newCode: GeneratedCode = {
      name,
      email,
      code: uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase(),
    };

    setGeneratedCode(newCode);
  };

  const handleSave = () => {
    if (generatedCode && onSave) {
      onSave(generatedCode);
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setGeneratedCode(null);
    setIsCopied(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Redemption Code">
      <div className="space-y-4">
        <InputField
          label="Name"
          value={name}
          onChange={setName}
          placeholder="Enter recipient name"
          required
        />

        <InputField
          label="Email (Optional)"
          value={email}
          onChange={setEmail}
          placeholder="Enter recipient email"
          type="email"
        />

        <button
          onClick={generateCode}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
          disabled={!name}
        >
          Generate Code
        </button>

        {generatedCode && (
          <div className="mt-4 space-y-4">
            <div className="bg-gray-700 p-4 rounded space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-gray-400 text-sm">Name:</span>
                  <p>{generatedCode.name}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(generatedCode.name)}
                  className="p-2 hover:bg-gray-600 rounded transition-colors"
                >
                  <Copy size={16} />
                </button>
              </div>

              {generatedCode.email && (
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-gray-400 text-sm">Email:</span>
                    <p>{generatedCode.email}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(generatedCode.email)}
                    className="p-2 hover:bg-gray-600 rounded transition-colors"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div>
                  <span className="text-gray-400 text-sm">
                    Redemption Code:
                  </span>
                  <p className="font-mono text-lg font-bold text-green-400">
                    {generatedCode.code}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(generatedCode.code)}
                  className="p-2 hover:bg-gray-600 rounded transition-colors"
                >
                  <Copy size={16} />
                </button>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <span className="text-gray-400 text-sm">Redemption URL:</span>
                  <p className="font-mono">{`${window.location.origin}/redeem/${generatedCode.code}`}</p>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `${window.location.origin}/redeem/${generatedCode.code}`
                    )
                  }
                  className="p-2 hover:bg-gray-600 rounded transition-colors"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>

            {isCopied && (
              <div className="text-green-400 text-center">
                Copied to clipboard!
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={handleSave}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
              >
                Save Code
              </button>
              <button
                onClick={resetForm}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CodeGeneratorModal;
