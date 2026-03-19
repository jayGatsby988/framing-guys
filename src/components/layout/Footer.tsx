"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap, Github, Twitter, Linkedin, Heart } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Vision Assist", href: "#vision-demo" },
    { label: "Live Captions", href: "#captions-demo" },
    { label: "Web Overlay", href: "#overlay-demo" },
    { label: "Voice Control", href: "#voice-demo" },
    { label: "AI Companion", href: "#ai-demo" },
  ],
  Company: [
    { label: "Mission", href: "#mission" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
    { label: "Contact", href: "#contact" },
  ],
  Resources: [
    { label: "Documentation", href: "#" },
    { label: "API Reference", href: "#" },
    { label: "Accessibility Guide", href: "#" },
    { label: "WCAG Standards", href: "https://www.w3.org/WAI/standards-guidelines/wcag/" },
    { label: "FAQ", href: "#faq" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
    { label: "Accessibility Statement", href: "#" },
  ],
};

const socialLinks = [
  { icon: Github, label: "GitHub", href: "https://github.com" },
  { icon: Twitter, label: "Twitter / X", href: "https://twitter.com" },
  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com" },
];

export function Footer() {
  const handleNavClick = (href: string) => {
    if (href.startsWith("http")) {
      window.open(href, "_blank", "noopener noreferrer");
      return;
    }
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer
      role="contentinfo"
      className="relative border-t border-[#1F1F28] bg-[#070709] overflow-hidden"
    >
      {/* Animated gradient top border */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, #6366F1 50%, transparent 100%)",
          opacity: 0.6,
        }}
      />

      {/* Background ambient */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-5"
        style={{ background: "radial-gradient(circle, #6366F1, transparent 70%)" }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-2.5 mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
              aria-label="AURA - Back to top"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                <Zap size={18} className="text-white" fill="white" />
              </div>
              <span className="text-xl font-bold gradient-text">AURA</span>
            </button>

            <p className="text-[#9898A8] text-sm leading-relaxed mb-6 max-w-xs">
              <span className="text-white/70 font-medium">A</span>daptive <span className="text-white/70 font-medium">U</span>niversal <span className="text-white/70 font-medium">R</span>eal-time <span className="text-white/70 font-medium">A</span>ccessibility — the ultimate education platform for impaired students.
            </p>

            {/* Accessibility Commitment */}
            <div className="bg-[#0F0F12] border border-[#1F1F28] rounded-xl p-4 mb-6">
              <p className="text-xs text-[#5A5A6E] mb-1 uppercase tracking-wider font-medium">
                Accessibility Commitment
              </p>
              <p className="text-sm text-[#9898A8] leading-relaxed">
                This website is built to WCAG 2.1 AA standards. We believe accessibility is not an afterthought — it&apos;s our foundation.
              </p>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-[#0F0F12] border border-[#1F1F28] flex items-center justify-center text-[#5A5A6E] hover:text-[#F8F8FC] hover:border-indigo-500/40 hover:bg-indigo-600/10 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="lg:col-span-1">
              <h3 className="text-xs font-semibold text-[#5A5A6E] uppercase tracking-wider mb-4">
                {category}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => handleNavClick(link.href)}
                      className="text-sm text-[#9898A8] hover:text-[#F8F8FC] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#1F1F28] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#5A5A6E]">
            © {new Date().getFullYear()} AURA Technologies, Inc. All rights reserved.
          </p>
          <p className="text-xs text-[#5A5A6E] flex items-center gap-1.5">
            Built with{" "}
            <Heart size={12} className="text-red-400" fill="currentColor" />{" "}
            for everyone
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
