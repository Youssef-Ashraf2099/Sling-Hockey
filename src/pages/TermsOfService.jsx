import React from "react";
import { Scale, Book, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "../shared/components/Button";
import { useNavigate } from "react-router-dom";
import Footer from "../components/layout/Footer";

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 text-gray-300 font-sans leading-relaxed">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scale className="w-6 h-6 text-orange-500" />
            <span className="text-xl font-black text-white tracking-tighter uppercase">Legal</span>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-16 max-w-4xl">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-white mb-4 italic tracking-tight">Terms of Service</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Valid as of: January 2026</p>
        </div>

        <section className="space-y-12">
          <TermsSection 
            icon={<Book className="w-6 h-6 text-orange-400" />}
            title="1. Acceptance of Terms"
            content="By accessing Sling Hockey Pro, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site."
          />

          <TermsSection 
            icon={<CheckCircle className="w-6 h-6 text-blue-400" />}
            title="2. Use License"
            content="Permission is granted to temporarily access the game for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title. You may not modify, copy, or use the materials for any commercial purpose without explicit permission."
          />

          <TermsSection 
            icon={<AlertTriangle className="w-6 h-6 text-red-400" />}
            title="3. Disclaimer"
            content="The materials on Sling Hockey Pro are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability or fitness for a particular purpose."
          />

          <div className="p-8 rounded-3xl bg-orange-500/5 border border-orange-500/20">
            <p className="text-sm text-gray-400 leading-relaxed font-bold">
              Note: As an PVE (Player vs Environment) platform, we reserve the right to modify game physics, AI difficulty, and reward scales at any time to maintain game balance.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function TermsSection({ icon, title, content }) {
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
