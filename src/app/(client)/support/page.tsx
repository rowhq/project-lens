"use client";

import { useState } from "react";
import {
  HelpCircle,
  MessageSquare,
  FileText,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Send,
  Loader2,
} from "lucide-react";
import { useToast } from "@/shared/components/ui/Toast";

const faqs = [
  {
    question: "How long does an AI appraisal take?",
    answer:
      "AI-powered appraisals typically complete within 5-15 minutes. Reports with on-site verification may take 2-3 business days depending on appraiser availability in your area.",
  },
  {
    question: "What property types are supported?",
    answer:
      "We currently support single-family homes, condos, townhouses, multi-family properties (2-4 units), and commercial properties in the state of Texas.",
  },
  {
    question: "How accurate are AI appraisals?",
    answer:
      "Our AI appraisals use multiple data sources including MLS data, county records, and market trends. Confidence scores are provided with each report. For higher accuracy, we recommend adding on-site verification.",
  },
  {
    question: "Can I share reports with borrowers?",
    answer:
      "Yes! Each completed report can be shared via secure link. You can set expiration dates and download permissions for shared links.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express) and ACH bank transfers. Enterprise clients can request invoice billing.",
  },
  {
    question: "How do I request a revision or dispute a valuation?",
    answer:
      "You can submit a dispute request from the report detail page. Our team will review your concerns and any additional comparable data you provide within 1-2 business days.",
  },
];

export default function SupportPage() {
  const toast = useToast();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.subject || !contactForm.message) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setContactForm({ subject: "", message: "" });
    toast.success("Message sent! We'll get back to you within 24 hours.");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Help & Support</h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          Get help with TruPlat or contact our support team
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href="mailto:support@truplat.com"
          className="flex items-center gap-4 p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl hover:bg-[var(--secondary)] transition-colors"
        >
          <div className="p-3 bg-blue-500/20 rounded-lg">
            <Mail className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="font-medium text-[var(--foreground)]">Email Support</p>
            <p className="text-sm text-[var(--muted-foreground)]">support@truplat.com</p>
          </div>
        </a>

        <a
          href="tel:+15125551000"
          className="flex items-center gap-4 p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl hover:bg-[var(--secondary)] transition-colors"
        >
          <div className="p-3 bg-green-500/20 rounded-lg">
            <Phone className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="font-medium text-[var(--foreground)]">Phone Support</p>
            <p className="text-sm text-[var(--muted-foreground)]">(512) 555-1000</p>
          </div>
        </a>

        <a
          href="#"
          className="flex items-center gap-4 p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl hover:bg-[var(--secondary)] transition-colors"
        >
          <div className="p-3 bg-purple-500/20 rounded-lg">
            <FileText className="w-5 h-5 text-purple-500" />
          </div>
          <div className="flex items-center gap-2">
            <div>
              <p className="font-medium text-[var(--foreground)]">Documentation</p>
              <p className="text-sm text-[var(--muted-foreground)]">View guides</p>
            </div>
            <ExternalLink className="w-4 h-4 text-[var(--muted-foreground)]" />
          </div>
        </a>
      </div>

      {/* FAQs */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <HelpCircle className="w-5 h-5 text-[var(--primary)]" />
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-[var(--border)] rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--secondary)] transition-colors"
              >
                <span className="font-medium text-[var(--foreground)]">{faq.question}</span>
                {expandedFaq === index ? (
                  <ChevronUp className="w-4 h-4 text-[var(--muted-foreground)]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[var(--muted-foreground)]" />
                )}
              </button>
              {expandedFaq === index && (
                <div className="px-4 pb-4 text-[var(--muted-foreground)]">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="w-5 h-5 text-[var(--primary)]" />
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Send us a Message
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Subject
            </label>
            <select
              value={contactForm.subject}
              onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
              className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg bg-[var(--card)] text-[var(--foreground)]"
            >
              <option value="">Select a topic</option>
              <option value="technical">Technical Issue</option>
              <option value="billing">Billing Question</option>
              <option value="valuation">Valuation Dispute</option>
              <option value="account">Account Help</option>
              <option value="feature">Feature Request</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Message
            </label>
            <textarea
              value={contactForm.message}
              onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
              placeholder="Describe your issue or question..."
              className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] resize-none"
              rows={5}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Message
              </>
            )}
          </button>
        </form>
      </div>

      {/* Business Hours */}
      <div className="bg-[var(--secondary)] rounded-xl p-6 text-center">
        <p className="text-[var(--muted-foreground)]">
          <strong className="text-[var(--foreground)]">Support Hours:</strong> Monday - Friday, 8am - 6pm CT
        </p>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Emergency support available 24/7 for Enterprise customers
        </p>
      </div>
    </div>
  );
}
