import React from "react";
import { MessageSquare, Shield, Scale, FileText } from "lucide-react";

interface WelcomeSuggestionsProps {
  onSelect: (question: string) => void;
}

const WelcomeSuggestions = ({ onSelect }: WelcomeSuggestionsProps) => {
  const suggestions = [
    {
      icon: <Scale className="w-5 h-5 text-amber-500" />,
      text: "Explain IPC Section 302 and its punishment",
      emoji: "⚖️"
    },
    {
      icon: <FileText className="w-5 h-5 text-blue-500" />,
      text: "What are my fundamental rights under the Constitution?",
      emoji: "📜"
    },
    {
      icon: <Shield className="w-5 h-5 text-emerald-500" />,
      text: "How do I file an FIR for online fraud?",
      emoji: "🛡️"
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-purple-500" />,
      text: "Summarize this document and highlight key clauses",
      emoji: "📄"
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 max-w-[520px] mx-auto animate-in fade-in zoom-in duration-500">
      {/* AI Avatar / Branding */}
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-full bg-surface-elevated border-2 border-primary/40 flex items-center justify-center shadow-glow overflow-hidden">
          <div className="w-full h-full bg-gradient-to-b from-primary/10 to-primary/5 flex items-center justify-center">
             <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                N
             </div>
          </div>
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-background rounded-full" />
      </div>

      {/* Header Text */}
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          How can NyayaSathi help you?
        </h2>
        <p className="text-muted-foreground text-[15px] leading-relaxed">
          Ask me anything about Indian law, legal documents, your rights, or any legal query in any language.
        </p>
      </div>

      {/* Suggestion Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-8">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelect(suggestion.text)}
            className="flex flex-col items-start p-5 text-left bg-surface-elevated border border-border/50 rounded-xl transition-all duration-200 hover:border-primary hover:bg-surface-chat group"
          >
            <div className="mb-3 p-2 bg-background/50 rounded-lg border border-border/30 group-hover:border-primary/30 transition-colors">
              {suggestion.emoji}
            </div>
            <p className="text-sm font-medium text-secondary group-hover:text-foreground transition-colors leading-snug">
              {suggestion.text}
            </p>
          </button>
        ))}
      </div>

      {/* Hint Footer */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground/60">
          Click any card to send instantly · or type below
        </p>
      </div>
    </div>
  );
};

export default WelcomeSuggestions;
