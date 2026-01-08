/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import Image from "next/image";

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-gray-500 text-sm mb-12">
          Last updated: January 2025
        </p>

        <div className="space-y-10 text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              1. Agreement to Terms
            </h2>
            <p className="mb-3">
              These Terms of Service ("Terms") constitute a legally binding
              agreement between you ("User," "you," or "your") and TruPlat, Inc.
              ("TruPlat," "we," "us," or "our") governing your access to and use
              of the TruPlat platform, including our website, mobile
              applications, APIs, and related services (collectively, the
              "Service").
            </p>
            <p>
              By creating an account or using the Service, you agree to be bound
              by these Terms. If you do not agree to these Terms, do not use the
              Service. If you are using the Service on behalf of an
              organization, you represent that you have authority to bind that
              organization to these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              2. Service Description
            </h2>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              2.1 Overview
            </h3>
            <p>
              TruPlat is a property valuation platform that provides AI-powered
              property reports and connects users with licensed real estate
              appraisers. We currently operate exclusively in Texas.
            </p>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              2.2 Products
            </h3>
            <ul className="space-y-2 ml-4">
              <li>
                • <strong className="text-white">AI Reports:</strong> Automated
                property valuations generated using machine learning models and
                aggregated data sources
              </li>
              <li>
                • <strong className="text-white">On-Site Reports:</strong> AI
                reports enhanced with property photos and condition verification
                from a licensed appraiser visit
              </li>
              <li>
                • <strong className="text-white">Certified Appraisals:</strong>{" "}
                Full USPAP-compliant appraisals performed by independent
                licensed appraisers
              </li>
            </ul>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              2.3 Appraiser Marketplace
            </h3>
            <p>
              TruPlat operates a marketplace connecting property owners with
              independent licensed appraisers. Appraisers are independent
              contractors, not employees of TruPlat.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              3. AI Reports — Important Disclaimers
            </h2>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              3.1 Not an Appraisal
            </h3>
            <p className="text-white mb-3">
              AI Reports are NOT appraisals. They are automated estimates based
              on available data and should not be used as the sole basis for
              lending, investment, or legal decisions.
            </p>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              3.2 Limitations
            </h3>
            <ul className="space-y-2 ml-4">
              <li>• AI Reports do not include physical property inspection</li>
              <li>
                • Accuracy depends on the quality and availability of underlying
                data
              </li>
              <li>
                • Reports may not reflect recent renovations, damage, or unique
                property features
              </li>
              <li>
                • Market conditions can change rapidly and may not be reflected
                in reports
              </li>
              <li>
                • AI Reports are not accepted by banks, lenders, or courts as
                formal appraisals
              </li>
            </ul>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              3.3 Intended Use
            </h3>
            <p>
              AI Reports are intended for informational purposes only, including
              preliminary property research, investment screening, pricing
              guidance, and portfolio monitoring.
            </p>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              3.4 No Guarantee
            </h3>
            <p>
              We do not guarantee the accuracy of any valuation. Actual property
              values may differ significantly from AI Report estimates. Users
              should obtain professional appraisals for important financial
              decisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              4. Certified Appraisals
            </h2>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              4.1 Independent Appraisers
            </h3>
            <p>
              Certified appraisals are performed by independent licensed
              appraisers who are not employees of TruPlat. Each appraiser is
              solely responsible for their professional opinion of value and
              compliance with applicable laws and standards.
            </p>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              4.2 USPAP Compliance
            </h3>
            <p>
              All certified appraisals are intended to comply with the Uniform
              Standards of Professional Appraisal Practice (USPAP). Questions
              about a specific appraisal should be directed to the appraiser who
              performed it.
            </p>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              4.3 Lender Acceptance
            </h3>
            <p>
              While our certified appraisals are designed to meet lender
              requirements, TruPlat does not guarantee that any particular
              lender will accept a specific appraisal. Acceptance is at the sole
              discretion of the lender.
            </p>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              4.4 Timeline
            </h3>
            <p>
              Estimated delivery times are not guaranteed. Delays may occur due
              to property access issues, appraiser availability, or other
              factors outside our control.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              5. User Accounts
            </h2>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              5.1 Registration
            </h3>
            <p>
              You must create an account to use certain features. You agree to
              provide accurate, current, and complete information during
              registration and keep it updated.
            </p>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              5.2 Account Security
            </h3>
            <p>
              You are responsible for maintaining the confidentiality of your
              account credentials and for all activities under your account.
              Notify us immediately of any unauthorized access.
            </p>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              5.3 Account Types
            </h3>
            <ul className="space-y-2 ml-4">
              <li>
                • <strong className="text-white">Individual:</strong> For
                personal use
              </li>
              <li>
                • <strong className="text-white">Business:</strong> For
                companies, with ability to add team members
              </li>
              <li>
                • <strong className="text-white">Appraiser:</strong> For
                licensed appraisers joining our network
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              6. User Responsibilities
            </h2>
            <p className="mb-3">You agree to:</p>
            <ul className="space-y-2 ml-4">
              <li>• Provide accurate property information for reports</li>
              <li>• Use the Service only for lawful purposes</li>
              <li>• Not misrepresent AI Reports as formal appraisals</li>
              <li>
                • Not resell, redistribute, or sublicense reports without
                written permission
              </li>
              <li>
                • Not attempt to reverse-engineer our AI models or algorithms
              </li>
              <li>
                • Not use automated systems to access the Service without
                permission
              </li>
              <li>• Comply with all applicable laws and regulations</li>
              <li>• Respect intellectual property rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              7. Fees and Payment
            </h2>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              7.1 Subscription Plans
            </h3>
            <p>
              We offer monthly and annual subscription plans with varying
              features and report allowances. Current pricing is available on
              our website. Prices may change with 30 days notice.
            </p>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              7.2 Billing
            </h3>
            <p>
              Subscriptions are billed in advance. By providing payment
              information, you authorize us to charge your payment method for
              the subscription fee and any one-time purchases.
            </p>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              7.3 One-Time Reports
            </h3>
            <p>
              On-Site Reports and Certified Appraisals are billed at time of
              order. Payment is required before an appraiser is dispatched.
            </p>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              7.4 Refunds
            </h3>
            <ul className="space-y-2 ml-4">
              <li>
                • <strong className="text-white">AI Reports:</strong> No refunds
                once a report is generated
              </li>
              <li>
                • <strong className="text-white">On-Site/Certified:</strong>{" "}
                Full refund if canceled before appraiser dispatch; partial
                refund may be available after dispatch at our discretion
              </li>
              <li>
                • <strong className="text-white">Subscriptions:</strong> No
                refunds for partial months; annual subscriptions may be refunded
                pro-rata within 30 days of purchase
              </li>
            </ul>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              7.5 Taxes
            </h3>
            <p>
              Fees do not include taxes. You are responsible for any applicable
              sales tax, VAT, or similar taxes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              8. Intellectual Property
            </h2>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              8.1 Our Property
            </h3>
            <p>
              The Service, including all software, AI models, algorithms,
              designs, text, graphics, and other content, is owned by TruPlat
              and protected by copyright, trademark, and other intellectual
              property laws.
            </p>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              8.2 Your License
            </h3>
            <p>
              We grant you a limited, non-exclusive, non-transferable license to
              use the Service for your internal business or personal purposes,
              subject to these Terms.
            </p>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              8.3 Report Ownership
            </h3>
            <p>
              You own the reports you purchase, subject to restrictions on
              redistribution. You may share reports with parties directly
              involved in your transaction (lenders, buyers, sellers, agents).
            </p>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              8.4 Feedback
            </h3>
            <p>
              Any feedback, suggestions, or ideas you provide about the Service
              may be used by TruPlat without obligation to you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              9. Limitation of Liability
            </h2>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              9.1 Disclaimer of Warranties
            </h3>
            <p className="uppercase text-sm mb-3">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
              WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WARRANTIES
              OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
              NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE
              UNINTERRUPTED, ERROR-FREE, OR COMPLETELY SECURE.
            </p>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              9.2 Limitation
            </h3>
            <p className="uppercase text-sm mb-3">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, TRUPLAT SHALL NOT BE
              LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
              PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL,
              ARISING FROM YOUR USE OF THE SERVICE.
            </p>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              9.3 Cap on Liability
            </h3>
            <p className="uppercase text-sm">
              OUR TOTAL LIABILITY FOR ANY CLAIM ARISING FROM THESE TERMS OR THE
              SERVICE SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID US
              IN THE 12 MONTHS PRECEDING THE CLAIM OR (B) $100.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              10. Indemnification
            </h2>
            <p>
              You agree to indemnify and hold harmless TruPlat and its officers,
              directors, employees, and agents from any claims, damages, losses,
              or expenses (including reasonable attorneys' fees) arising from
              your use of the Service, your violation of these Terms, or your
              violation of any third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              11. Termination
            </h2>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              11.1 By You
            </h3>
            <p>
              You may terminate your account at any time by contacting support
              or through account settings. Termination does not entitle you to a
              refund of prepaid fees.
            </p>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              11.2 By Us
            </h3>
            <p>
              We may suspend or terminate your account at any time for violation
              of these Terms, suspected fraud, or any other reason at our sole
              discretion. We will attempt to provide notice when reasonable.
            </p>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              11.3 Effect of Termination
            </h3>
            <p>
              Upon termination, your right to use the Service ends immediately.
              You retain access to reports previously purchased. Sections that
              by their nature should survive termination will survive (including
              limitation of liability, indemnification, and dispute resolution).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              12. Dispute Resolution
            </h2>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              12.1 Governing Law
            </h3>
            <p>
              These Terms are governed by the laws of the State of Texas,
              without regard to conflict of law principles.
            </p>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              12.2 Arbitration
            </h3>
            <p>
              Any dispute arising from these Terms or the Service shall be
              resolved by binding arbitration in Austin, Texas, under the rules
              of the American Arbitration Association. You waive any right to
              participate in a class action lawsuit or class-wide arbitration.
            </p>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              12.3 Exceptions
            </h3>
            <p>
              Either party may seek injunctive relief in court for intellectual
              property infringement or unauthorized access to the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              13. General Provisions
            </h2>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              13.1 Changes to Terms
            </h3>
            <p>
              We may modify these Terms at any time. Material changes will be
              communicated via email or notice on the Service. Continued use
              after changes constitutes acceptance.
            </p>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              13.2 Entire Agreement
            </h3>
            <p>
              These Terms, together with our Privacy Policy, constitute the
              entire agreement between you and TruPlat regarding the Service.
            </p>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              13.3 Severability
            </h3>
            <p>
              If any provision of these Terms is found unenforceable, the
              remaining provisions will continue in effect.
            </p>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              13.4 No Waiver
            </h3>
            <p>
              Our failure to enforce any right or provision does not constitute
              a waiver of that right or provision.
            </p>

            <h3 className="text-lg font-medium text-white mb-3 mt-6">
              13.5 Assignment
            </h3>
            <p>
              You may not assign your rights under these Terms without our
              consent. We may assign our rights freely.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              14. Contact
            </h2>
            <p className="mb-3">Questions about these Terms:</p>
            <ul className="space-y-2 ml-4">
              <li>
                Email:{" "}
                <a
                  href="mailto:legal@truplat.com"
                  className="text-lime-400 hover:underline"
                >
                  legal@truplat.com
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
