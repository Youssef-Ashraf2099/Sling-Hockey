import { Shield, Zap, Flame, Star, TrendingUp } from "lucide-react";
import { Modal } from "../../../shared/components/Modal";

export default function DifficultySelector({ isOpen, onSelect, onClose, gameMode = "PVE" }) {
  const difficulties = [
    {
      id: "EASY",
      name: "Training",
      description: "Passive AI. Best for mastering launch angles.",
      rewards: { xp: "+50", elo: "+10" },
      penalty: { xp: "-10", elo: "-5" },
      icon: Shield,
      color: "from-green-500 to-emerald-600",
      accent: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      id: "MEDIUM",
      name: "Competitive",
      description: "Aggressive AI. Balanced and challenging.",
      rewards: { xp: "+100", elo: "+20" },
      penalty: { xp: "-30", elo: "-15" },
      icon: Zap,
      color: "from-blue-500 to-cyan-500",
      accent: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      id: "HARD",
      name: "Grandmaster",
      description: "Elite AI. Fast, accurate, and relentless.",
      rewards: { xp: "+200", elo: "+40" },
      penalty: { xp: "-60", elo: "-30" },
      icon: Flame,
      color: "from-purple-500 to-pink-600",
      accent: "text-pink-400",
      bg: "bg-pink-500/10",
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Select ${gameMode === 'PARTY' ? 'Party' : 'Arena'} Difficulty`}>
      <div className="space-y-4">
        {difficulties.map((diff) => {
          const Icon = diff.icon;
          return (
            <button
              key={diff.id}
              onClick={() => onSelect(diff.id)}
              className={`w-full p-5 rounded-2xl border transition-all duration-300 group relative overflow-hidden bg-gray-900 border-gray-800 hover:border-gray-600 hover:shadow-2xl hover:shadow-black/50`}
            >
              <div className={`absolute inset-0 ${diff.bg} opacity-20 group-hover:opacity-30 transition-opacity`} />
              
              <div className="relative z-10 flex items-center gap-5">
                <div className={`w-14 h-14 bg-gradient-to-br ${diff.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xl font-extrabold text-white tracking-tight">{diff.name}</h3>
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-500">
                      AI Rank: <span className={diff.accent}>Lvl {difficulties.indexOf(diff) + 1}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 font-medium mb-3 line-clamp-1">{diff.description}</p>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3 h-3 text-yellow-400" />
                      <span className="text-xs font-black text-white">{diff.rewards.xp} XP</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3 text-green-400" />
                      <span className="text-xs font-black text-white">{diff.rewards.elo} ELO</span>
                    </div>
                    <div className="ml-auto text-[10px] font-bold text-red-500/60 uppercase">
                      Risk: {diff.penalty.xp} XP
                    </div>
                  </div>
                </div>
              </div>
            </button>
          );
        })}

        <div className="mt-6 p-4 bg-gray-900/50 border border-gray-800 rounded-2xl">
          <p className="text-xs text-center text-gray-500 font-bold leading-relaxed">
            Higher difficulty increases reward multipliers but also raises the XP penalty for defeat. Master the arena to reach grandmaster status.
          </p>
        </div>
      </div>
    </Modal>
  );
}
