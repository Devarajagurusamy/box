'use client';

import React, { useState } from 'react';
import {
  X,
  Send,
  MessageSquare,
  Sparkles,
  Bug,
  Lightbulb,
  HelpCircle,
  Star,
  Check,
  Copy,
  Mail,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast?: (title: string, message?: string) => void;
}

const WEB3FORMS_ACCESS_KEY = 'd3b359a9-154e-4d24-ae48-228bf0a2aedd';

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  onSuccessToast,
}) => {
  const [feedbackType, setFeedbackType] = useState<'suggestion' | 'bug' | 'appreciation' | 'question'>('suggestion');
  const [rating, setRating] = useState<number>(5);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const developerEmail = 'devarajaguru2002@gmail.com';

  const types = [
    { id: 'suggestion', label: 'Suggestion', icon: Lightbulb, color: 'text-amber-400' },
    { id: 'bug', label: 'Bug Report', icon: Bug, color: 'text-rose-400' },
    { id: 'appreciation', label: 'Appreciation', icon: Sparkles, color: 'text-emerald-400' },
    { id: 'question', label: 'Question', icon: HelpCircle, color: 'text-blue-400' },
  ] as const;

  const generateFeedbackBody = () => {
    return `BOX App Feedback
-----------------------------------
Type: ${feedbackType.toUpperCase()}
Rating: ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)} (${rating}/5)
From: ${name.trim() ? name : 'Anonymous'} ${email.trim() ? `(${email})` : ''}
Timestamp: ${new Date().toLocaleString()}

Message:
${message.trim()}
`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: `[BOX Feedback - ${feedbackType.toUpperCase()}] from ${name.trim() || 'Anonymous User'}`,
        from_name: name.trim() ? `${name.trim()} (BOX App)` : 'BOX App User',
        name: name.trim() || 'Anonymous',
        email: email.trim() || 'user@boxapp.local',
        category: feedbackType,
        rating: `${rating} / 5 stars`,
        message: message.trim(),
        full_report: generateFeedbackBody(),
      };

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.status === 200 && data.success) {
        setIsSubmitted(true);
        if (onSuccessToast) {
          onSuccessToast('Feedback Delivered!', 'Thank you! Your feedback has been sent directly to DEVARAJA S G.');
        }
      } else {
        setErrorMessage(data.message || 'Submission failed. You can fallback to email below.');
      }
    } catch {
      setErrorMessage('Network error occurred. You can still send via email or copy text.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFallbackMailto = () => {
    const subject = encodeURIComponent(`[BOX Feedback - ${feedbackType.toUpperCase()}] from ${name.trim() || 'User'}`);
    const body = encodeURIComponent(generateFeedbackBody());
    window.open(`mailto:${developerEmail}?subject=${subject}&body=${body}`, '_blank');
  };

  const handleCopyFeedback = () => {
    if (!message.trim()) return;
    navigator.clipboard.writeText(generateFeedbackBody());
    setIsCopied(true);
    if (onSuccessToast) {
      onSuccessToast('Copied to Clipboard', 'Feedback text copied! You can paste and send directly.');
    }
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleReset = () => {
    setMessage('');
    setName('');
    setEmail('');
    setIsSubmitted(false);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-zinc-800 text-zinc-200 border border-zinc-700">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Feedback for Developer
              </h2>
              <p className="text-[11px] text-zinc-400">
                Directly deliver suggestions & messages to DEVARAJA S G
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSubmitted ? (
          /* Thank You Screen */
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 flex items-center justify-center mx-auto animate-in zoom-in-75 duration-200">
              <Check className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Feedback Sent Successfully!</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Thank you for helping improve BOX. Your feedback has been delivered directly to DEVARAJA S G.
              </p>
            </div>

            <div className="pt-2 flex justify-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Feedback Form */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
            {/* Error banner if any */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 flex items-center justify-between gap-2 text-xs text-rose-300">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={handleFallbackMailto}
                  className="px-2 py-1 bg-rose-900/60 hover:bg-rose-800 rounded text-[11px] font-medium text-white transition shrink-0 underline"
                >
                  Use Email
                </button>
              </div>
            )}

            {/* Feedback Category Tabs */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {types.map((t) => {
                  const Icon = t.icon;
                  const isSelected = feedbackType === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setFeedbackType(t.id)}
                      className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium border transition ${
                        isSelected
                          ? 'bg-zinc-800 border-zinc-600 text-white shadow-xs'
                          : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${t.color}`} />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Star Rating */}
            <div className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800/80 p-2.5 rounded-xl">
              <span className="text-xs font-medium text-zinc-300">Experience Rating</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-zinc-500 hover:scale-110 transition"
                    title={`${star} star${star > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-zinc-600 hover:text-zinc-400'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Name & Email inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Your Name (optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 focus:border-zinc-500 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Your Email (optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. alex@example.com"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 focus:border-zinc-500 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Message Area */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-zinc-300">
                  Your Feedback / Message <span className="text-rose-400">*</span>
                </label>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {message.length} chars
                </span>
              </div>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What do you think of BOX? Any feature requests, bugs, or notes for the developer..."
                className="w-full p-3 bg-zinc-900 border border-zinc-800 focus:border-zinc-500 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none transition resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 gap-2">
              <button
                type="button"
                onClick={handleCopyFeedback}
                disabled={!message.trim() || isSubmitting}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                title="Copy feedback text"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!message.trim() || isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white hover:bg-zinc-100 text-zinc-950 text-xs font-semibold shadow transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-950" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 text-zinc-950" />
                      <span>Submit Feedback</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
