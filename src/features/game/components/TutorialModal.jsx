import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight, Target, Zap, Shield, PartyPopper } from "lucide-react";
import { Button } from "../../../shared/components/Button";

const tutorialSlides = [
  {
    title: "The Goal: Clear the Board",
    description: "To win, you must push ALL 10 pucks to the opponent's side. It's a race against time!",
    image: "/assets/tutorial/initial_layout.png",
    icon: <Target className="w-6 h-6 text-green-400" />,
  },
  {
    title: "Mechanics: Power & Precision",
    description: "Drag a puck into the red rope to stretch it. Release to launch! Pulling at an angle allows for reflected bank shots.",
    image: "/assets/tutorial/launch_mechanic.png",
    icon: <Zap className="w-6 h-6 text-blue-400" />,
  },
  {
    title: "Dynamics: Capture & Flow",
    description: "You can grab ANY puck that enters your half. Watch out for the moving slot and remember to win the game make all the balls to the oponents other side",
    image: "/assets/tutorial/dynamic_slot.png",
    icon: <Shield className="w-6 h-6 text-purple-400" />,
  },
  {
    title: "Party Mode: Power Ups",
    description: "In Party Mode, look for floating icons! 🍄 (Mega) makes you huge, 👻 (Ghost) lets you pass through walls, and ❄️ (Freeze) stops the board.",
    image: "/assets/tutorial/initial_layout.png",
    icon: <PartyPopper className="w-6 h-6 text-pink-400" />,
  },
];

export function TutorialModal({ isOpen, onClose }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentSlide < tutorialSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slide = tutorialSlides[currentSlide];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 hover:bg-gray-800 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-gray-400" />
        </button>

        <div className="flex flex-col md:flex-row h-full">
          {/* Image Container */}
          <div className="md:w-1/2 bg-gray-800 p-6 flex items-center justify-center">
            <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden border border-gray-700 shadow-lg">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Content Container */}
          <div className="md:w-1/2 p-8 flex flex-col justify-between bg-gray-900">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gray-800 rounded-lg">
                  {slide.icon}
                </div>
                <h3 className="text-2xl font-bold text-white leading-tight">
                  {slide.title}
                </h3>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                {slide.description}
              </p>
            </div>

            <div className="space-y-6">
              {/* Progress Dots */}
              <div className="flex justify-center gap-2">
                {tutorialSlides.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentSlide ? "w-8 bg-blue-500" : "w-1.5 bg-gray-700"
                    }`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={handlePrev}
                  disabled={currentSlide === 0}
                >
                  <ChevronLeft className="w-5 h-5 mr-1" /> Back
                </Button>
                <Button
                  variant="primary"
                  className="flex-[2]"
                  onClick={handleNext}
                >
                  {currentSlide === tutorialSlides.length - 1 ? (
                    "Got it!"
                  ) : (
                    <>
                      Next <ChevronRight className="w-5 h-5 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
