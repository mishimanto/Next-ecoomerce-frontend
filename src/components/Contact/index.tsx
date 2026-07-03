"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { FiMail, FiMapPin, FiPhoneCall, FiSend } from "react-icons/fi";
import Breadcrumb from "../Common/Breadcrumb";
import { useSiteSettings } from "@/app/context/SiteSettingsContext";
import { submitContactMessage } from "@/services/api";

const inputClass =
  "w-full rounded-md border border-gray-3 bg-gray-1 px-5 py-3 text-custom-sm text-dark outline-none transition placeholder:text-dark-5 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20";

const Contact = () => {
  const siteSettings = useSiteSettings();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setSubmitting(true);

    try {
      await submitContactMessage({
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        subject: formData.get("subject"),
        message: formData.get("message"),
      });

      toast.success("Message sent successfully.", {
        style: { background: "#16a34a", color: "#fff" },
      });
      form.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send message.", {
        style: { background: "#dc2626", color: "#fff" },
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Breadcrumb title="Contact" pages={["contact"]} />

      <section className="bg-gray-2 py-5 lg:py-10">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 xl:px-0">
          <div className="grid gap-7.5 lg:grid-cols-[370px_1fr]">
            <aside className="rounded-lg border border-gray-3 bg-white p-6 shadow-1 sm:p-7.5">
              <div className="mb-5 border-b border-gray-3 pb-4">
                <p className="text-sm font-medium uppercase text-blue">Need help?</p>
                <h2 className="mt-2 text-2xl font-semibold text-dark">
                  Contact Us
                </h2>
              </div>

              <div className="space-y-5">
                <InfoItem
                  icon={<FiPhoneCall />}
                  label="Phone"
                  value={siteSettings.support_phone || "(+965) 7492-3477"}
                />
                <InfoItem
                  icon={<FiMail />}
                  label="Email"
                  value={siteSettings.support_email || "support@example.com"}
                />
                <InfoItem
                  icon={<FiMapPin />}
                  label="Address"
                  value={siteSettings.address || "685 Market Street, Las Vegas, LA 95820, United States."}
                />
              </div>
            </aside>

            <div className="rounded-lg border border-gray-3 bg-white p-6 shadow-1 sm:p-7.5 lg:p-10">
              <div className="mb-7">
                <h2 className="text-2xl font-semibold text-dark">Send a Message</h2>
                {/* <p className="mt-2 text-custom-sm text-dark-4">
                  Fill out the form below. Your message will appear in the admin panel.
                </p> */}
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-5 grid gap-5 md:grid-cols-2">
                  <Field label="Name" required>
                    <input className={inputClass} name="name" placeholder="Your name" required />
                  </Field>
                  <Field label="Email" required>
                    <input className={inputClass} name="email" type="email" placeholder="you@example.com" required />
                  </Field>
                  <Field label="Phone">
                    <input className={inputClass} name="phone" placeholder="01XXXXXXXXX" />
                  </Field>
                  <Field label="Subject">
                    <input className={inputClass} name="subject" placeholder="How can we help?" />
                  </Field>
                </div>

                <div className="mb-7.5">
                  <Field label="Message" required>
                    <textarea
                      className={`${inputClass} min-h-[150px] resize-none p-5`}
                      name="message"
                      placeholder="Write your message..."
                      required
                    />
                  </Field>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-md bg-blue px-7 py-3 font-medium text-white transition hover:bg-blue-dark disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <FiSend />
                  {submitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-blue-light-5 text-xl text-blue">
        {icon}
      </span>
      <div>
        <p className="text-sm font-medium text-dark">{label}</p>
        <p className="mt-1 text-custom-sm leading-6 text-dark-4">{value}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2.5 block text-custom-sm font-medium text-dark">
        {label} {required && <span className="text-red">*</span>}
      </span>
      {children}
    </label>
  );
}

export default Contact;
