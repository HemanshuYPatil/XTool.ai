"use client";

import React from "react";
import Header from "../_common/header";

const PrivacyPage = () => {
  return (
    <div className="min-h-screen w-full bg-background overflow-x-hidden">
      <Header />

      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        
        <div className="container mx-auto px-6 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-center">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg text-center mb-12">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <div className="max-w-4xl mx-auto prose prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground">
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="mb-4">
                Welcome to XTool.AI (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice or our practices with regard to your personal information, please contact us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              <p className="mb-4">
                We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, when you participate in activities on the website, or otherwise when you contact us.
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Personal Information Provided by You: Names, email addresses, billing addresses, etc.</li>
                <li>Payment Data: We may collect data necessary to process your payment if you make purchases. All payment data is stored by our payment processor.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="mb-4">
                We use personal information collected via our website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Sharing Your Information</h2>
              <p className="mb-4">
                We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Security of Your Information</h2>
              <p className="mb-4">
                We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Contact Us</h2>
              <p className="mb-4">
                If you have questions or comments about this policy, you may email us or contact us by post.
              </p>
            </section>

          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPage;
