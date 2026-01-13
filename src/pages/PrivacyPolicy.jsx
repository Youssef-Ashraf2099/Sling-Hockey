import React from "react";
import { Shield, Lock, Eye, FileText } from "lucide-react";
import { Button } from "../shared/components/Button";
import { useNavigate } from "react-router-dom";
import Footer from "../components/layout/Footer";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 text-gray-300 font-sans leading-relaxed">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-500" />
            <span className="text-xl font-black text-white tracking-tighter uppercase">Privacy Center</span>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-16 max-w-4xl">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-white mb-4 italic tracking-tight">Privacy Policy</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Last Updated: January 2026</p>
        </div>

        <section className="space-y-12">
          <PolicySection 
            icon={<Lock className="w-6 h-6 text-blue-400" />}
            title="1. Data Collection & Local Storage"
            content="Sling Hockey Pro is designed to be a 'privacy-first' experience. We do not require account creation or personal data collection. Your game progression, including XP, Level, and ELO, is stored exclusively on your device using LocalStorage. This data is obfuscated (encrypted) locally to protect your progress from accidental loss or tampering."
          />

          <PolicySection 
            icon={<Eye className="w-6 h-6 text-purple-400" />}
            title="2. Cookies & Advertising"
            content="We may use standard cookies and tracking technologies to analyze site traffic and deliver personalized advertisements through networks like Google AdSense. These third-party vendors use cookies to serve ads based on your prior visits to our website or other websites on the Internet."
          />

          <PolicySection 
            icon={<FileText className="w-6 h-6 text-green-400" />}
            title="3. User Rights"
            content="Since your data is stored locally, you have total control over it. You can clear your game progress at any time by clearing your browser's cache or local storage for this site. We do not have access to your individual game data on our servers."
          />

          <div className="p-8 rounded-3xl bg-blue-500/5 border border-blue-500/20">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" /> Compliance Note
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              This policy is designed to comply with global standards including GDPR and CCPA. We do not sell any personal data to third parties, as we do not collect any personally identifiable information from your gameplay.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function PolicySection({ icon, title, content }) {
  return (
    <div className="flex gap-6">
      <div className="flex-shrink-0 w-12 h-12 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center shadow-inner">
        {icon}
      </div>
      <div>
        <h2 className="text-xl font-bold text-white mb-3">{title}</h2>
        <p className="text-gray-400 leading-relaxed font-medium">{content}</p>
      </div>
    </div>
  );
}
