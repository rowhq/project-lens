/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import Image from "next/image";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-white/5">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Link href="/">
            <Image src="/truplat.svg" alt="TruPlat" width={80} height={20} />
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-gray-500 text-sm mb-12">
          Last updated: January 2025
        </p>

        <div className="space-y-10 text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              1. Introduction
            </h2>
            <p className="mb-3">
              TruPlat, Inc. ("TruPlat," "we," "us," or "our") is committed to
              protecting your privacy. This Privacy Policy explains how we
              collect, use, disclose, and safeguard your information when you
              use our property valuation platform, including our website, mobile
              applications, and related services (collectively, the "Service").
            </p>
            <p>
              By accessing or using the Service, you consent to the collection,
              use, and disclosure of your information as described in this
              Privacy Policy. If you do not agree with our policies and
              practices, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              2. Information We Collect
            </h2>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              2.1 Information You Provide
            </h3>
            <ul className="space-y-2 ml-4">
              <li>
                • <strong className="text-white">Account Information:</strong>{" "}
                Name, email address, phone number, company name, professional
                license numbers (for appraisers)
              </li>
              <li>
                • <strong className="text-white">Property Information:</strong>{" "}
                Addresses you search, property details you submit, photos
                uploaded for appraisals
              </li>
              <li>
                • <strong className="text-white">Payment Information:</strong>{" "}
                Credit card numbers, billing addresses, and transaction history
                (payment processing handled by Stripe)
              </li>
              <li>
                • <strong className="text-white">Communications:</strong>{" "}
                Messages you send to our support team, feedback, and survey
                responses
              </li>
              <li>
                • <strong className="text-white">Appraiser Information:</strong>{" "}
                License credentials, coverage areas, availability schedules,
                banking information for payouts
              </li>
            </ul>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              2.2 Information Collected Automatically
            </h3>
            <ul className="space-y-2 ml-4">
              <li>
                • <strong className="text-white">Usage Data:</strong> Pages
                viewed, features used, search queries, report requests,
                timestamps
              </li>
              <li>
                • <strong className="text-white">Device Information:</strong> IP
                address, browser type, operating system, device identifiers
              </li>
              <li>
                • <strong className="text-white">Location Data:</strong> General
                location based on IP address; precise location only with your
                consent (for appraiser dispatch)
              </li>
              <li>
                • <strong className="text-white">Cookies and Tracking:</strong>{" "}
                We use cookies, pixels, and similar technologies for
                authentication, preferences, and analytics
              </li>
            </ul>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              2.3 Information from Third Parties
            </h3>
            <ul className="space-y-2 ml-4">
              <li>
                •{" "}
                <strong className="text-white">Property Data Providers:</strong>{" "}
                MLS data, county records, tax assessor information, permit
                databases
              </li>
              <li>
                • <strong className="text-white">Identity Verification:</strong>{" "}
                For appraiser onboarding, we verify licenses with state
                regulatory bodies
              </li>
              <li>
                • <strong className="text-white">Payment Processors:</strong>{" "}
                Transaction confirmations and fraud prevention data from Stripe
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              3. How We Use Your Information
            </h2>
            <ul className="space-y-2 ml-4">
              <li>
                • <strong className="text-white">Provide Services:</strong>{" "}
                Generate AI valuations, dispatch appraisers, deliver reports,
                process payments
              </li>
              <li>
                • <strong className="text-white">Improve Our AI:</strong> Train
                and improve our valuation models using aggregated and anonymized
                data
              </li>
              <li>
                • <strong className="text-white">Communications:</strong> Send
                report notifications, account updates, marketing (with consent),
                and respond to inquiries
              </li>
              <li>
                • <strong className="text-white">Security:</strong> Detect
                fraud, prevent abuse, and protect users and the platform
              </li>
              <li>
                • <strong className="text-white">Legal Compliance:</strong> Meet
                regulatory requirements, respond to legal requests, enforce our
                terms
              </li>
              <li>
                • <strong className="text-white">Analytics:</strong> Understand
                usage patterns, measure performance, and improve user experience
              </li>
              <li>
                • <strong className="text-white">Appraiser Matching:</strong>{" "}
                Match properties with qualified appraisers based on location,
                credentials, and availability
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              4. How We Share Your Information
            </h2>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              4.1 Service Providers
            </h3>
            <p className="mb-3">
              We share information with third parties who perform services on
              our behalf:
            </p>
            <ul className="space-y-2 ml-4">
              <li>• Cloud hosting (Vercel, AWS)</li>
              <li>• Payment processing (Stripe)</li>
              <li>• Email delivery (SendGrid)</li>
              <li>• Analytics (Mixpanel, Google Analytics)</li>
              <li>• Customer support tools</li>
            </ul>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              4.2 Appraisers
            </h3>
            <p>
              When you request an on-site or certified appraisal, we share the
              property address and your contact information with the assigned
              licensed appraiser. Appraisers are bound by confidentiality
              agreements.
            </p>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              4.3 Business Transfers
            </h3>
            <p>
              If TruPlat is involved in a merger, acquisition, or sale of
              assets, your information may be transferred as part of that
              transaction. We will notify you of any change in ownership or uses
              of your information.
            </p>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              4.4 Legal Requirements
            </h3>
            <p>We may disclose information when required by law, such as:</p>
            <ul className="space-y-2 ml-4 mt-3">
              <li>• Responding to subpoenas, court orders, or legal process</li>
              <li>• Cooperating with law enforcement investigations</li>
              <li>• Protecting our rights, property, or safety</li>
              <li>• Preventing fraud or illegal activity</li>
            </ul>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              4.5 With Your Consent
            </h3>
            <p>
              We may share information for other purposes when you provide
              explicit consent.
            </p>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              4.6 What We Don't Do
            </h3>
            <p className="text-white">
              We do not sell your personal information to third parties. We do
              not share your data with data brokers or advertisers for their
              independent use.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              5. Data Security
            </h2>
            <p className="mb-3">
              We implement industry-standard security measures:
            </p>
            <ul className="space-y-2 ml-4">
              <li>
                • <strong className="text-white">Encryption:</strong> TLS 1.3
                for data in transit, AES-256 for data at rest
              </li>
              <li>
                • <strong className="text-white">Access Controls:</strong>{" "}
                Role-based access, multi-factor authentication for employees
              </li>
              <li>
                • <strong className="text-white">Infrastructure:</strong> SOC 2
                compliant hosting, regular security audits
              </li>
              <li>
                • <strong className="text-white">Monitoring:</strong> Continuous
                security monitoring and intrusion detection
              </li>
              <li>
                • <strong className="text-white">Employee Training:</strong>{" "}
                Regular security awareness training for all staff
              </li>
            </ul>
            <p className="mt-4">
              While we strive to protect your information, no method of
              transmission or storage is 100% secure. We cannot guarantee
              absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              6. Data Retention
            </h2>
            <ul className="space-y-2 ml-4">
              <li>
                • <strong className="text-white">Property Reports:</strong>{" "}
                Retained for 7 years per USPAP record-keeping requirements
              </li>
              <li>
                • <strong className="text-white">Account Data:</strong> Retained
                while your account is active, plus 3 years after closure
              </li>
              <li>
                • <strong className="text-white">Payment Records:</strong>{" "}
                Retained for 7 years per tax and financial regulations
              </li>
              <li>
                • <strong className="text-white">Usage Logs:</strong> Retained
                for 2 years for security and analytics
              </li>
              <li>
                • <strong className="text-white">Marketing Preferences:</strong>{" "}
                Retained until you opt out
              </li>
            </ul>
            <p className="mt-4">
              You may request deletion of your data, subject to our legal
              retention obligations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              7. Your Rights and Choices
            </h2>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              7.1 Access and Portability
            </h3>
            <p>
              You can request a copy of your personal data in a portable format.
            </p>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              7.2 Correction
            </h3>
            <p>
              You can update your account information at any time or request
              correction of inaccurate data.
            </p>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              7.3 Deletion
            </h3>
            <p>
              You can request deletion of your personal data. Note that we may
              retain certain information as required by law or for legitimate
              business purposes (fraud prevention, legal claims).
            </p>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              7.4 Marketing Opt-Out
            </h3>
            <p>
              You can unsubscribe from marketing emails at any time by clicking
              "unsubscribe" in any email or adjusting your account settings.
              Note that you will still receive transactional emails about your
              account and reports.
            </p>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              7.5 Cookie Preferences
            </h3>
            <p>
              You can manage cookie preferences through your browser settings.
              Disabling cookies may affect functionality.
            </p>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              7.6 Do Not Track
            </h3>
            <p>
              We do not currently respond to "Do Not Track" browser signals.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              8. California Privacy Rights (CCPA)
            </h2>
            <p className="mb-3">
              If you are a California resident, you have additional rights:
            </p>
            <ul className="space-y-2 ml-4">
              <li>
                • Right to know what personal information we collect, use, and
                disclose
              </li>
              <li>• Right to delete personal information (with exceptions)</li>
              <li>
                • Right to opt out of the sale of personal information (we do
                not sell your data)
              </li>
              <li>
                • Right to non-discrimination for exercising your privacy rights
              </li>
            </ul>
            <p className="mt-4">
              To exercise these rights, contact us at{" "}
              <a
                href="mailto:privacy@truplat.com"
                className="text-lime-400 hover:underline"
              >
                privacy@truplat.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              9. Children's Privacy
            </h2>
            <p>
              The Service is not intended for users under 18 years of age. We do
              not knowingly collect personal information from children. If we
              learn we have collected information from a child under 18, we will
              delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              10. International Users
            </h2>
            <p>
              TruPlat operates in the United States. If you access the Service
              from outside the US, your information will be transferred to and
              processed in the US, which may have different data protection laws
              than your country.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              11. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will
              notify you of material changes by email or by posting a notice on
              the Service. Your continued use after changes constitutes
              acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              12. Contact Us
            </h2>
            <p className="mb-3">
              If you have questions about this Privacy Policy or our data
              practices:
            </p>
            <ul className="space-y-2 ml-4">
              <li>
                Email:{" "}
                <a
                  href="mailto:privacy@truplat.com"
                  className="text-lime-400 hover:underline"
                >
                  privacy@truplat.com
                </a>
              </li>
              <li>Mail: TruPlat, Inc., Austin, TX</li>
            </ul>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-12">
        <div className="max-w-3xl mx-auto px-6">
          <Link href="/" className="text-gray-500 text-sm hover:text-white">
            ← Back to Home
          </Link>
        </div>
      </footer>
    </div>
  );
}
