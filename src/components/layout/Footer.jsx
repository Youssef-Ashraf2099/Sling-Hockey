import {
  Trophy,
  BookOpen,
  TrendingUp,
  Mail,
  Github,
  Twitter,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Learn",
      links: [
        { name: "Sling Hockey Rules", href: "/rules", icon: BookOpen },
        { name: "Pro Tips & Strategy", href: "/tips", icon: TrendingUp },
        { name: "How to Play", href: "/tutorial", icon: BookOpen },
      ],
    },
    {
      title: "Compete",
      links: [
        { name: "Global Rankings", href: "/leaderboard", icon: Trophy },
        { name: "Tournament Schedule", href: "/tournaments", icon: Trophy },
        { name: "Season Pass", href: "/season-pass", icon: Trophy },
      ],
    },
    {
      title: "Community",
      links: [
        {
          name: "Discord Server",
          href: "https://discord.gg/slinghockey",
          icon: Twitter,
        },
        {
          name: "Twitter",
          href: "https://twitter.com/slinghockeypro",
          icon: Twitter,
        },
        {
          name: "GitHub",
          href: "https://github.com/slinghockey",
          icon: Github,
        },
      ],
    },
    {
      title: "Support",
      links: [
        { name: "Contact Us", href: "/contact", icon: Mail },
        { name: "Privacy Policy", href: "/privacy", icon: BookOpen },
        { name: "Terms of Service", href: "/terms", icon: BookOpen },
      ],
    },
  ];

  return (
    <footer className="bg-gray-900/80 border-t border-gray-800 mt-auto">
      <div className="container mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="font-bold text-white mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2 group"
                    >
                      <link.icon className="w-4 h-4 text-gray-500 group-hover:text-green-400" />
                      <span>{link.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* SEO Content */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="prose prose-invert max-w-4xl mx-auto text-center">
            <h4 className="text-lg font-bold text-white mb-3">
              Play Sling Hockey Online - The Ultimate Tabletop Sport
            </h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              Sling Hockey Pro is the premier online platform for playing sling
              hockey, also known as string hockey or foosball variants.
              Challenge players worldwide in competitive PVP matches, practice
              against AI opponents with adjustable difficulty, and climb the
              global leaderboard. Customize your pucks with premium skins,
              unlock exclusive board themes, and master the physics-based
              slingshot mechanic. Free to play with optional upgrades.
              Compatible with desktop, tablet, and mobile devices. Join
              thousands of players worldwide and become a Sling Hockey champion
              today!
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-400">
            © {currentYear} Sling Hockey Pro. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://twitter.com/slinghockeypro"
              className="text-gray-400 hover:text-blue-400 transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="https://github.com/slinghockey"
              className="text-gray-400 hover:text-purple-400 transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="mailto:support@slinghockey.pro"
              className="text-gray-400 hover:text-green-400 transition-colors"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Legal Links */}
        <div className="text-center mt-4">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <a
              href="/privacy"
              className="hover:text-gray-300 transition-colors"
            >
              Privacy
            </a>
            <span>•</span>
            <a href="/terms" className="hover:text-gray-300 transition-colors">
              Terms
            </a>
            <span>•</span>
            <a
              href="/cookies"
              className="hover:text-gray-300 transition-colors"
            >
              Cookies
            </a>
            <span>•</span>
            <a href="/dmca" className="hover:text-gray-300 transition-colors">
              DMCA
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
