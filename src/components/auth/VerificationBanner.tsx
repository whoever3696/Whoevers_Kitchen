import { useState } from 'react';
import { AlertTriangle, X, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function VerificationBanner() {
  const { user, isEmailVerified, resendVerificationEmail } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  if (isEmailVerified || dismissed || !user) {
    return null;
  }

  const handleResend = async () => {
    setSending(true);
    setMessage('');
    const { error } = await resendVerificationEmail();
    setSending(false);

    if (error) {
      setMessage('Failed to send verification email. Please try again.');
    } else {
      setMessage('Verification email sent! Check your inbox.');
    }
  };

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-amber-900 font-medium">
              Email not verified
            </p>
            <p className="text-sm text-amber-800 mt-1">
              You won't be able to recover your account if you forget your password.
              Please verify your email address to enable password recovery.
            </p>
            {message && (
              <p className={`text-sm mt-2 font-medium ${message.includes('Failed') ? 'text-red-700' : 'text-green-700'}`}>
                {message}
              </p>
            )}
            <button
              onClick={handleResend}
              disabled={sending}
              className="mt-2 flex items-center gap-1.5 text-sm font-medium text-amber-900 hover:text-amber-950 disabled:opacity-50"
            >
              <Mail size={16} />
              {sending ? 'Sending...' : 'Resend Verification Email'}
            </button>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-amber-600 hover:text-amber-700 flex-shrink-0"
            aria-label="Dismiss"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
