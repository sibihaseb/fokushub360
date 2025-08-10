import { Link } from "wouter";
import { CircleUser, Twitter, Linkedin, Github } from "lucide-react";
import logoImage from "@assets/FOKUSHUB360_1752707903267.png";

export function Footer() {
  const footerLinks = {
    Product: [
      { name: "Features", href: "#features" },
      { name: "Pricing", href: "#pricing" },
      { name: "API", href: "#" },
      { name: "Integrations", href: "#" }
    ],
    Company: [
      { name: "About", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Contact", href: "#contact" }
    ],
    Support: [
      { name: "Help Center", href: "#" },
      { name: "Documentation", href: "#" },
      { name: "Status", href: "#" },
      { name: "Security", href: "#" }
    ],
    Legal: [
      { name: "Terms of Service", href: "#terms" },
      { name: "Privacy Policy", href: "#privacy" },
      { name: "Your Data Rights", href: "/data-rights" },
      { name: "GDPR Compliance", href: "#gdpr" }
    ]
  };

  return (
    <footer id="contact" className="bg-slate-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-5 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <img 
                src={logoImage} 
                alt="FokusHub360 Logo" 
                className="h-8 w-auto object-contain"
              />
            </div>
            <p className="text-gray-400 mb-6">
              The premium platform for AI-powered virtual focus groups and market research.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-semibold mb-4">{category}</h4>
              <ul className="space-y-2 text-gray-400">
                {links.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="hover:text-white transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; 2024 FokusHub360. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
