"use client";

import { useState } from "react";
import {
  X,
  Check,
  AlertCircle,
  Info,
  ChevronLeft,
  ChevronRight,
  Camera,
  Sun,
  Ruler,
  Home,
} from "lucide-react";

interface PhotoExample {
  id: string;
  label: string;
  description: string;
  tips: string[];
  goodExample: {
    description: string;
    features: string[];
  };
  badExample: {
    description: string;
    issues: string[];
  };
}

const photoExamples: Record<string, PhotoExample> = {
  front_exterior: {
    id: "front_exterior",
    label: "Front Exterior",
    description: "A full front view of the property from the street",
    tips: [
      "Stand across the street for a wider angle",
      "Include the entire front of the house",
      "Capture the driveway and front yard",
      "Take in landscape orientation",
    ],
    goodExample: {
      description: "Clear, well-lit photo showing the complete front facade",
      features: [
        "Entire house visible from foundation to roof",
        "Driveway and garage door included",
        "Good natural lighting",
        "Front yard landscaping visible",
      ],
    },
    badExample: {
      description: "Cropped or poorly angled photo",
      issues: [
        "Part of house cut off",
        "Too close to property",
        "Shadows obscuring details",
        "Portrait orientation",
      ],
    },
  },
  rear_exterior: {
    id: "rear_exterior",
    label: "Rear Exterior",
    description: "Full view of the back of the property",
    tips: [
      "Stand at the back property line if possible",
      "Include patio, deck, or outdoor structures",
      "Show the entire rear facade",
      "Capture any pools or outbuildings",
    ],
    goodExample: {
      description: "Complete view of rear elevation and outdoor features",
      features: [
        "Full rear facade visible",
        "Patio or deck clearly shown",
        "Backyard depth visible",
        "Outdoor features captured",
      ],
    },
    badExample: {
      description: "Incomplete or obstructed view",
      issues: [
        "Standing too close",
        "Trees blocking the view",
        "Missing outdoor structures",
        "Blurry or dark image",
      ],
    },
  },
  street_view: {
    id: "street_view",
    label: "Street View",
    description: "View of the street and neighborhood context",
    tips: [
      "Stand in front of the property",
      "Show neighboring houses on both sides",
      "Capture the street condition",
      "Include sidewalks and street parking",
    ],
    goodExample: {
      description: "Wide angle showing neighborhood character",
      features: [
        "Subject property centered",
        "Adjacent homes visible",
        "Street condition clear",
        "Neighborhood style evident",
      ],
    },
    badExample: {
      description: "Too narrow or focused only on subject",
      issues: [
        "No neighborhood context",
        "Cars blocking view",
        "Only showing one direction",
        "Not enough width",
      ],
    },
  },
  kitchen: {
    id: "kitchen",
    label: "Kitchen",
    description: "Main kitchen area showing cabinets and appliances",
    tips: [
      "Stand in a corner for the widest view",
      "Include countertops and cabinets",
      "Show all visible appliances",
      "Turn on lights for better visibility",
    ],
    goodExample: {
      description: "Wide angle showing kitchen layout and finishes",
      features: [
        "Cabinets and countertops visible",
        "Appliances clearly shown",
        "Good lighting throughout",
        "Floor visible for condition",
      ],
    },
    badExample: {
      description: "Tight shot or missing key elements",
      issues: [
        "Only showing one counter",
        "Appliances cut off",
        "Dark or shadowy",
        "Cluttered counters blocking view",
      ],
    },
  },
  living_room: {
    id: "living_room",
    label: "Living Room",
    description: "Main living area showing size and features",
    tips: [
      "Stand in a doorway or corner",
      "Show flooring material clearly",
      "Include windows if possible",
      "Capture ceiling height and features",
    ],
    goodExample: {
      description: "Open view showing room dimensions and finishes",
      features: [
        "Full room visible",
        "Flooring condition clear",
        "Natural light sources shown",
        "Room size apparent",
      ],
    },
    badExample: {
      description: "Partial view or poor angle",
      issues: [
        "Only partial room shown",
        "Furniture blocking view",
        "Too dark",
        "Vertical photo orientation",
      ],
    },
  },
  bathroom: {
    id: "bathroom",
    label: "Bathroom",
    description: "Primary bathroom showing fixtures and finishes",
    tips: [
      "Stand in the doorway",
      "Show vanity, toilet, and shower/tub",
      "Turn on all lights",
      "Include tile work and flooring",
    ],
    goodExample: {
      description: "Clear view of all bathroom fixtures",
      features: [
        "All fixtures visible",
        "Tile work and counters clear",
        "Good lighting",
        "Condition assessable",
      ],
    },
    badExample: {
      description: "Mirror reflection or partial view",
      issues: [
        "Your reflection in mirror",
        "Only showing sink",
        "Toilet not visible",
        "Dark or flash glare",
      ],
    },
  },
  bedroom: {
    id: "bedroom",
    label: "Primary Bedroom",
    description: "Master or primary bedroom",
    tips: [
      "Show the full room from doorway",
      "Include closet if visible",
      "Capture flooring and windows",
      "Show ceiling height if notable",
    ],
    goodExample: {
      description: "Full room view showing size and features",
      features: [
        "Room dimensions evident",
        "Flooring condition clear",
        "Windows visible",
        "Closet area shown if possible",
      ],
    },
    badExample: {
      description: "Too focused on bed or furniture",
      issues: [
        "Just the bed visible",
        "Room size not apparent",
        "Personal items distracting",
        "Poor lighting",
      ],
    },
  },
  garage: {
    id: "garage",
    label: "Garage",
    description: "Garage interior and/or exterior",
    tips: [
      "Show garage door and driveway approach",
      "Capture interior if accessible",
      "Note number of car spaces",
      "Show any attached storage",
    ],
    goodExample: {
      description: "Clear view of garage capacity and condition",
      features: [
        "Full garage door visible",
        "Car capacity evident",
        "Floor and wall condition",
        "Interior lighting if inside",
      ],
    },
    badExample: {
      description: "Obstructed or unclear",
      issues: [
        "Cars blocking view",
        "Too dark inside",
        "Only partial door shown",
        "Storage obscuring space",
      ],
    },
  },
  backyard: {
    id: "backyard",
    label: "Backyard",
    description: "Backyard or outdoor living space",
    tips: [
      "Stand at the back door looking out",
      "Show fence lines and property depth",
      "Capture any landscaping features",
      "Include pools, sheds, or structures",
    ],
    goodExample: {
      description: "Full backyard showing size and features",
      features: [
        "Yard size apparent",
        "Fence lines visible",
        "Landscaping condition",
        "Any structures captured",
      ],
    },
    badExample: {
      description: "Limited or unclear view",
      issues: [
        "Only showing patio",
        "Yard size not evident",
        "Missing structures",
        "Poor weather conditions",
      ],
    },
  },
  damage: {
    id: "damage",
    label: "Damage/Issues",
    description: "Any visible damage or issues to document",
    tips: [
      "Get close enough to show detail",
      "Take multiple angles if needed",
      "Include context of where damage is",
      "Capture all areas of concern",
    ],
    goodExample: {
      description: "Clear documentation of issue with context",
      features: [
        "Damage clearly visible",
        "Location context provided",
        "Multiple angles if complex",
        "Scale reference if helpful",
      ],
    },
    badExample: {
      description: "Unclear or out of context",
      issues: [
        "Too far away to see detail",
        "No location context",
        "Blurry or out of focus",
        "Missing the main issue",
      ],
    },
  },
};

interface PhotoExamplesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId?: string;
}

export const PhotoExamplesModal = ({
  isOpen,
  onClose,
  categoryId = "front_exterior",
}: PhotoExamplesModalProps) => {
  const [currentCategory, setCurrentCategory] = useState(categoryId);
  const categoryKeys = Object.keys(photoExamples);
  const currentIndex = categoryKeys.indexOf(currentCategory);
  const example = photoExamples[currentCategory] || photoExamples.front_exterior;

  if (!isOpen) return null;

  const goToPrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : categoryKeys.length - 1;
    setCurrentCategory(categoryKeys[newIndex]);
  };

  const goToNext = () => {
    const newIndex = currentIndex < categoryKeys.length - 1 ? currentIndex + 1 : 0;
    setCurrentCategory(categoryKeys[newIndex]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[var(--card)] px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[var(--primary)]" />
            <h2 className="font-bold text-[var(--foreground)]">Photo Guide</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--muted)] rounded-lg"
          >
            <X className="w-5 h-5 text-[var(--muted-foreground)]" />
          </button>
        </div>

        {/* Navigation */}
        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
          <button
            onClick={goToPrevious}
            className="p-2 hover:bg-[var(--muted)] rounded-lg"
          >
            <ChevronLeft className="w-5 h-5 text-[var(--muted-foreground)]" />
          </button>
          <div className="text-center">
            <p className="font-semibold text-[var(--foreground)]">{example.label}</p>
            <p className="text-xs text-[var(--muted-foreground)]">
              {currentIndex + 1} of {categoryKeys.length}
            </p>
          </div>
          <button
            onClick={goToNext}
            className="p-2 hover:bg-[var(--muted)] rounded-lg"
          >
            <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Description */}
          <p className="text-[var(--muted-foreground)]">{example.description}</p>

          {/* Tips */}
          <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-[var(--primary)]" />
              <h3 className="font-semibold text-[var(--primary)]">Photography Tips</h3>
            </div>
            <ul className="space-y-2">
              {example.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[var(--foreground)]">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--primary)] flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Good Example */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Check className="w-5 h-5 text-green-400" />
              <h3 className="font-semibold text-green-400">Good Example</h3>
            </div>
            <p className="text-sm text-[var(--foreground)] mb-2">{example.goodExample.description}</p>
            <ul className="space-y-1.5">
              {example.goodExample.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-green-400/90">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            {/* Placeholder for good example image */}
            <div className="mt-3 aspect-video bg-green-500/5 border border-green-500/20 rounded-lg flex items-center justify-center">
              <div className="text-center text-green-400/50">
                <Home className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">Good example image</p>
              </div>
            </div>
          </div>

          {/* Bad Example */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <h3 className="font-semibold text-red-400">Avoid This</h3>
            </div>
            <p className="text-sm text-[var(--foreground)] mb-2">{example.badExample.description}</p>
            <ul className="space-y-1.5">
              {example.badExample.issues.map((issue, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-red-400/90">
                  <X className="w-4 h-4 flex-shrink-0" />
                  {issue}
                </li>
              ))}
            </ul>
            {/* Placeholder for bad example image */}
            <div className="mt-3 aspect-video bg-red-500/5 border border-red-500/20 rounded-lg flex items-center justify-center">
              <div className="text-center text-red-400/50">
                <Home className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">Bad example image</p>
              </div>
            </div>
          </div>

          {/* Quick Reference */}
          <div className="bg-[var(--muted)] rounded-xl p-4">
            <h3 className="font-semibold text-[var(--foreground)] mb-3">Quick Reference</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <Sun className="w-4 h-4 text-yellow-400" />
                <span>Good lighting</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <Ruler className="w-4 h-4 text-blue-400" />
                <span>Landscape mode</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <Camera className="w-4 h-4 text-green-400" />
                <span>Steady hands</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <Home className="w-4 h-4 text-purple-400" />
                <span>Full coverage</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 p-4 bg-[var(--card)] border-t border-[var(--border)]">
          <button
            onClick={onClose}
            className="w-full py-3 bg-[var(--primary)] text-white rounded-lg font-medium hover:bg-[var(--primary)]/90"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};

// Info button component to trigger the modal
export const PhotoInfoButton = ({
  onPress,
}: {
  onPress: () => void;
}) => {
  return (
    <button
      onClick={onPress}
      className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors"
      title="View photo guide"
    >
      <Info className="w-5 h-5 text-[var(--muted-foreground)]" />
    </button>
  );
};

export default PhotoExamplesModal;
