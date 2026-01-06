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
import { trpc } from "@/shared/lib/trpc";

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

  const createTicket = trpc.support.createTicket.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setContactForm({ subject: "", message: "" });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.subject || !contactForm.message) {
      toast.error("Please fill in all fields");
      return;
    }

    createTicket.mutate({
      subject: contactForm.subject,
      message: contactForm.message,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Help & Support</h1>
        <p className="text-gray-400 mt-1">
          Get help with TruPlat or contact our support team
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href="mailto:support@truplat.com"
          className="relative flex items-center gap-4 p-4 bg-gray-900 shadow-[inset_0_0_0_1px_theme(colors.gray.800)] clip-notch hover:bg-gray-800 transition-colors group"
        >
          <div className="absolute -top-px -left-px w-2 h-2 border-l border-t border-blue-400" />
          <div className="p-3 bg-blue-500/10 clip-notch-sm border border-blue-500/30">
            <Mail className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="font-medium text-white">Email Support</p>
            <p className="text-sm text-gray-400">support@truplat.com</p>
          </div>
        </a>

        <a
          href="tel:+15125551000"
          className="relative flex items-center gap-4 p-4 bg-gray-900 shadow-[inset_0_0_0_1px_theme(colors.gray.800)] clip-notch hover:bg-gray-800 transition-colors group"
        >
          <div className="absolute -top-px -left-px w-2 h-2 border-l border-t border-green-400" />
          <div className="p-3 bg-green-500/10 clip-notch-sm border border-green-500/30">
            <Phone className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="font-medium text-white">Phone Support</p>
            <p className="text-sm text-gray-400">(512) 555-1000</p>
          </div>
        </a>

        <a
          href="#"
          className="relative flex items-center gap-4 p-4 bg-gray-900 shadow-[inset_0_0_0_1px_theme(colors.gray.800)] clip-notch hover:bg-gray-800 transition-colors group"
        >
          <div className="absolute -top-px -left-px w-2 h-2 border-l border-t border-purple-400" />
          <div className="p-3 bg-purple-500/10 clip-notch-sm border border-purple-500/30">
            <FileText className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex items-center gap-2">
            <div>
              <p className="font-medium text-white">Documentation</p>
              <p className="text-sm text-gray-400">View guides</p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-500" />
          </div>
        </a>
      </div>

      {/* FAQs */}
      <div className="relative bg-gray-900 shadow-[inset_0_0_0_1px_theme(colors.gray.800)] clip-notch p-6">
        <div className="absolute -top-px -left-px w-3 h-3 border-l border-t border-lime-400" />
        <div className="flex items-center gap-3 mb-6">
          <HelpCircle className="w-5 h-5 text-lime-400" />
          <h2 className="text-lg font-semibold text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="shadow-[inset_0_0_0_1px_theme(colors.gray.800)] clip-notch-sm overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpandedFaq(expandedFaq === index ? null : index)
                }
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-800 transition-colors"
              >
                <span className="font-medium text-white">{faq.question}</span>
                {expandedFaq === index ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
              {expandedFaq === index && (
                <div className="px-4 pb-4 text-gray-400">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Form */}
      <div className="relative bg-gray-900 shadow-[inset_0_0_0_1px_theme(colors.gray.800)] clip-notch p-6">
        <div className="absolute -top-px -left-px w-3 h-3 border-l border-t border-blue-400" />
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">
            Send us a Message
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-mono uppercase tracking-wider text-gray-400 mb-2">
              Subject
            </label>
            <select
              value={contactForm.subject}
              onChange={(e) =>
                setContactForm({ ...contactForm, subject: e.target.value })
              }
              className="w-full px-4 py-2.5 shadow-[inset_0_0_0_1px_theme(colors.gray.700)] clip-notch-sm bg-gray-900 text-white font-mono text-sm focus:outline-none focus:shadow-[inset_0_0_0_1px_theme(colors.lime.400/0.5)]"
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
            <label className="block text-sm font-mono uppercase tracking-wider text-gray-400 mb-2">
              Message
            </label>
            <textarea
              value={contactForm.message}
              onChange={(e) =>
                setContactForm({ ...contactForm, message: e.target.value })
              }
              placeholder="Describe your issue or question..."
              className="w-full px-4 py-2.5 shadow-[inset_0_0_0_1px_theme(colors.gray.700)] clip-notch-sm bg-gray-900 text-white font-mono text-sm placeholder:text-gray-500 resize-none focus:outline-none focus:shadow-[inset_0_0_0_1px_theme(colors.lime.400/0.5)]"
              rows={5}
            />
          </div>

          <button
            type="submit"
            disabled={createTicket.isPending}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider clip-notch hover:bg-lime-300 transition-colors disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            {createTicket.isPending ? (
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
      <div className="relative bg-gray-900 shadow-[inset_0_0_0_1px_theme(colors.gray.800)] clip-notch p-6 text-center">
        <div className="absolute -top-px -left-px w-2 h-2 border-l border-t border-gray-600" />
        <p className="text-gray-400">
          <strong className="text-white font-mono uppercase tracking-wider">
            Support Hours:
          </strong>{" "}
          Monday - Friday, 8am - 6pm CT
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Emergency support available 24/7 for Enterprise customers
        </p>
      </div>
    </div>
  );
}
