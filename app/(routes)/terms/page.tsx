"use client";

import React from "react";
import Header from "../_common/header";

const TermsPage = () => {
  return (
    <div className="min-h-screen w-full bg-background overflow-x-hidden">
      <Header />

      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        
        <div className="container mx-auto px-6 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-center">
            Terms of Service
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg text-center mb-12">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <div className="max-w-4xl mx-auto prose prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground">
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
              <p className="mb-4">
                These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity (&quot;you&quot;) and XTool.AI (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), concerning your access to and use of the XTool.AI website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the &quot;Site&quot;).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Intellectual Property Rights</h2>
              <p className="mb-4">
                Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the &quot;Content&quot;) and the trademarks, service marks, and logos contained therein (the &quot;Marks&quot;) are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. User Representations</h2>
              <p className="mb-4">
                By using the Site, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary; (3) you have the legal capacity and you agree to comply with these Terms of Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Prohibited Activities</h2>
              <p className="mb-4">
                You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. User Generated Contributions</h2>
              <p className="mb-4">
                The Site may invite you to chat, contribute to, or participate in blogs, message boards, online forums, and other functionality, and may provide you with the opportunity to create, submit, post, display, transmit, perform, publish, distribute, or broadcast content and materials to us or on the Site.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
              <p className="mb-4">
                In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the site, even if we have been advised of the possibility of such damages.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
              <p className="mb-4">
                In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us.
              </p>
            </section>

          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsPage;
