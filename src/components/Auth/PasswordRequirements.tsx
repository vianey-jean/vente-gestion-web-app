
import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordRequirementsProps {
  password: string;
}

const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({ password }) => {
  // Vérifications des exigences du mot de passe
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  const requirements = [
    { text: "Au moins 8 caractères", met: hasMinLength },
    { text: "Au moins une lettre majuscule", met: hasUppercase },
    { text: "Au moins une lettre minuscule", met: hasLowercase },
    { text: "Au moins un chiffre", met: hasNumber },
    { text: "Au moins un caractère spécial", met: hasSpecialChar },
  ];

  const Icon = ({ met }: { met: boolean }) => (
    met ? (
      <Check className="h-4 w-4 text-green-500" />
    ) : (
      <X className="h-4 w-4 text-red-500" />
    )
  );

  return (
    <div className="bg-gray-50 p-4 rounded-md mt-2">
      <h3 className="text-sm font-medium text-gray-700 mb-2">
        Le mot de passe doit contenir:
      </h3>
      <ul className="space-y-1.5">
        {requirements.map((req, index) => (
          <li 
            key={index}
            className="flex items-center text-xs"
          >
            <span className="mr-1.5">
              <Icon met={req.met} />
            </span>
            <span className={req.met ? 'text-gray-700' : 'text-gray-500'}>
              {req.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordRequirements;
