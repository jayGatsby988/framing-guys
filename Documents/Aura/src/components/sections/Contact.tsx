"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Mail, Building, ChevronDown, Send } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

type Tab = "demo" | "waitlist" | "partner";

const tabs: { id: Tab; label: string }[] = [
  { id: "demo", label: "Request Demo" },
  { id: "waitlist", label: "Join Waitlist" },
  { id: "partner", label: "Partner With Us" },
];

const roles = [
  "Student",
  "Educator / Professor",
  "Disability Services Staff",
  "University Administrator",
  "Accessibility Consultant",
  "Parent / Guardian",
  "School IT Staff",
  "Researcher",
  "Other",
];

const waitlistPerks = [
  "Priority campus deployment before public launch",
  "Free academic licenses for qualifying institutions",
  "Direct input on our education feature roadmap",
  "Monthly product updates and case studies",
  "Access to beta features and pilot programs",
];

interface FormData {
  name: string;
  email: string;
  organization: string;
  role: string;
  message: string;
}

const emptyForm: FormData = {
  name: "",
  email: "",
  organization: "",
  role: "",
  message: "",
};

export function Contact() {
  const [activeTab, setActiveTab] = useState<Tab>("waitlist");
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (activeTab !== "waitlist" && !formData.message.trim()) {
      newErrors.message = "Message is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1800));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const handleReset = () => {
    setIsSuccess(false);
    setFormData(emptyForm);
    setErrors({});
  };

  const update = (key: keyof FormData) => (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const inputClass = (error?: string) =>
    cn(
      "w-full bg-[#141418] border rounded-xl px-4 py-3 text-sm text-[#F8F8FC] placeholder:text-[#5A5A6E]",
      "focus:outline-none focus:ring-1 transition-colors",
      error
        ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
        : "border-[#1F1F28] hover:border-[#2F2F40] focus:border-indigo-500/50 focus:ring-indigo-500/20"
    );

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="relative py-24 lg:py-32 bg-[#0F0F12] overflow-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(99,102,241,0.06) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Get Access"
          title="Bring AURA to your campus"
          subtitle="Join thousands of students, educators, and universities waiting to transform accessible education."
          align="center"
          id="contact-heading"
          className="mb-12"
        />

        <div className="grid lg:grid-cols-[1fr_400px] gap-12 max-w-5xl mx-auto">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="bg-[#0F0F12] border border-[#1F1F28] rounded-2xl overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-[#1F1F28]" role="tablist">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    aria-controls={`tab-panel-${tab.id}`}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsSuccess(false);
                      setErrors({});
                    }}
                    className={cn(
                      "flex-1 px-4 py-3.5 text-xs font-medium transition-all",
                      activeTab === tab.id
                        ? "text-[#F8F8FC] border-b-2 border-indigo-500 bg-indigo-600/5"
                        : "text-[#5A5A6E] hover:text-[#9898A8] border-b-2 border-transparent"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">
                  {isSuccess ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-12 text-center gap-4"
                      role="status"
                      aria-live="polite"
                    >
                      <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                        <CheckCircle size={28} className="text-emerald-400" />
                      </div>
                      <h3 className="text-lg font-bold text-[#F8F8FC]">
                        You&apos;re on the list!
                      </h3>
                      <p className="text-sm text-[#9898A8] max-w-xs">
                        Thanks for reaching out. We&apos;ll be in touch within 24-48 hours with next steps.
                      </p>
                      <button
                        onClick={handleReset}
                        className="text-sm text-indigo-400 hover:text-indigo-300 underline mt-2"
                      >
                        Submit another response
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key={activeTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      id={`tab-panel-${activeTab}`}
                      role="tabpanel"
                      onSubmit={handleSubmit}
                      noValidate
                      className="space-y-4"
                    >
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="name"
                            className="block text-xs font-medium text-[#9898A8] mb-1.5"
                          >
                            Full name <span className="text-red-400">*</span>
                          </label>
                          <input
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={update("name")}
                            placeholder="Your name"
                            className={inputClass(errors.name)}
                            aria-describedby={errors.name ? "name-error" : undefined}
                            aria-invalid={!!errors.name}
                          />
                          {errors.name && (
                            <p id="name-error" className="text-xs text-red-400 mt-1">
                              {errors.name}
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="email"
                            className="block text-xs font-medium text-[#9898A8] mb-1.5"
                          >
                            Email address <span className="text-red-400">*</span>
                          </label>
                          <div className="relative">
                            <Mail
                              size={14}
                              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A5A6E]"
                            />
                            <input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={update("email")}
                              placeholder="you@example.com"
                              className={cn(inputClass(errors.email), "pl-9")}
                              aria-describedby={errors.email ? "email-error" : undefined}
                              aria-invalid={!!errors.email}
                            />
                          </div>
                          {errors.email && (
                            <p id="email-error" className="text-xs text-red-400 mt-1">
                              {errors.email}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="organization"
                            className="block text-xs font-medium text-[#9898A8] mb-1.5"
                          >
                            Organization
                          </label>
                          <div className="relative">
                            <Building
                              size={14}
                              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A5A6E]"
                            />
                            <input
                              id="organization"
                              type="text"
                              value={formData.organization}
                              onChange={update("organization")}
                              placeholder="Company or institution"
                              className={cn(inputClass(), "pl-9")}
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="role"
                            className="block text-xs font-medium text-[#9898A8] mb-1.5"
                          >
                            Your role
                          </label>
                          <div className="relative">
                            <select
                              id="role"
                              value={formData.role}
                              onChange={update("role")}
                              className={cn(inputClass(), "appearance-none pr-9")}
                            >
                              <option value="">Select a role</option>
                              {roles.map((r) => (
                                <option key={r} value={r}>
                                  {r}
                                </option>
                              ))}
                            </select>
                            <ChevronDown
                              size={14}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5A5A6E] pointer-events-none"
                            />
                          </div>
                        </div>
                      </div>

                      {activeTab !== "waitlist" && (
                        <div>
                          <label
                            htmlFor="message"
                            className="block text-xs font-medium text-[#9898A8] mb-1.5"
                          >
                            Message <span className="text-red-400">*</span>
                          </label>
                          <textarea
                            id="message"
                            value={formData.message}
                            onChange={update("message")}
                            rows={4}
                            placeholder={
                              activeTab === "demo"
                                ? "Tell us about your accessibility needs and what you'd like to see in the demo..."
                                : "Tell us about your organization and how you'd like to partner with AURA..."
                            }
                            className={cn(inputClass(errors.message), "resize-none")}
                            aria-describedby={errors.message ? "message-error" : undefined}
                            aria-invalid={!!errors.message}
                          />
                          {errors.message && (
                            <p id="message-error" className="text-xs text-red-400 mt-1">
                              {errors.message}
                            </p>
                          )}
                        </div>
                      )}

                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        loading={isSubmitting}
                        className="w-full"
                        icon={<Send size={16} />}
                        iconPosition="right"
                      >
                        {activeTab === "waitlist"
                          ? "Join the Waitlist"
                          : activeTab === "demo"
                          ? "Request Demo"
                          : "Reach Out"}
                      </Button>

                      <p className="text-xs text-[#5A5A6E] text-center">
                        We respect your privacy. No spam, ever.
                      </p>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Right panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="space-y-6"
          >
            <div className="bg-[#0F0F12] border border-[#1F1F28] rounded-2xl p-6">
              <h3 className="text-sm font-bold text-[#F8F8FC] mb-4">
                What you get by joining early
              </h3>
              <ul className="space-y-3">
                {waitlistPerks.map((perk) => (
                  <li key={perk} className="flex items-start gap-3">
                    <div className="mt-0.5 w-4 h-4 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                      <CheckCircle size={10} className="text-indigo-400" />
                    </div>
                    <span className="text-sm text-[#9898A8]">{perk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social proof */}
            <div className="bg-[#0F0F12] border border-[#1F1F28] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex -space-x-2">
                  {["bg-violet-600", "bg-blue-600", "bg-emerald-600", "bg-amber-600"].map(
                    (color, i) => (
                      <div
                        key={i}
                        className={`w-8 h-8 rounded-full ${color} border-2 border-[#0F0F12] flex items-center justify-center text-xs font-bold text-white`}
                      >
                        {["M", "A", "L", "S"][i]}
                      </div>
                    )
                  )}
                </div>
                <p className="text-xs text-[#9898A8]">
                  <span className="text-[#F8F8FC] font-medium">2,400+</span> people waiting
                </p>
              </div>
              <p className="text-xs text-[#5A5A6E] leading-relaxed">
                Students, professors, disability services directors, and accessibility advocates from 120+ universities are already on the waitlist.
              </p>
            </div>

            {/* Contact info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail size={16} className="text-indigo-400 shrink-0" />
                <a
                  href="mailto:hello@aura.ai"
                  className="text-[#9898A8] hover:text-indigo-400 transition-colors"
                >
                  hello@aura.ai
                </a>
              </div>
              <p className="text-xs text-[#5A5A6E]">
                We typically respond within 24 hours on business days.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
