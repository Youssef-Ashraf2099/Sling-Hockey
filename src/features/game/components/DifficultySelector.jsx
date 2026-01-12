import { Shield, Zap, Flame } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { Modal } from "../../../shared/components/Modal";

export default function DifficultySelector({ isOpen, onSelect, gameMode }) {
  if (gameMode !== "PVE") return null;

  const difficulties = [
    {
      id: "EASY",
      name: "Easy",
      description: "AI takes its time and makes mistakes",
      icon: Shield,
      color: "from-green-500 to-emerald-600",
      accentColor: "bg-green-600/20 text-green-400",
    },
    {
      id: "MEDIUM",
      name: "Medium",
      description: "Balanced opponent with moderate skill",
      icon: Zap,
      color: "from-yellow-500 to-orange-600",
      accentColor: "bg-yellow-600/20 text-yellow-400",
    },
    {
      id: "HARD",
      name: "Hard",
      description: "AI master - will challenge your skills",
      icon: Flame,
      color: "from-red-500 to-red-600",
      accentColor: "bg-red-600/20 text-red-400",
    },
  ];

  return (
    <Modal isOpen={isOpen} title="Choose AI Difficulty">
      <div className="space-y-4">
        {difficulties.map((difficulty) => {
          const Icon = difficulty.icon;
          return (
            <button
              key={difficulty.id}
              onClick={() => onSelect(difficulty.id)}
              className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`bg-gradient-to-br ${difficulty.color} rounded-lg p-3 flex-shrink-0 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-left flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-white">{difficulty.name}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${difficulty.accentColor}`}
                    >
                      AI Lvl {difficulties.indexOf(difficulty) + 1}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {difficulty.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}

        <div className="mt-6 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
          <p className="text-sm text-gray-300">
            💡 <span className="font-semibold">Tip:</span> Start with Easy to
            learn the mechanics, then challenge yourself with harder
            difficulties!
          </p>
        </div>
      </div>
    </Modal>
  );
}
