import {
  FiDroplet,
  FiZap,
  FiWind,
  FiTool,
  FiCpu,
  FiSun,
  FiFeather,
  FiHome,
  FiSmile,
  FiShield,
  FiKey,
  FiGrid,
  FiMaximize,
  FiCrosshair,
} from "react-icons/fi";
import { IconType } from "react-icons";

export const CATEGORY_ICONS: Record<string, IconType> = {
  "Plumbing & Drainage": FiDroplet,
  "Electrical Services": FiZap,
  "AC & HVAC Maintenance": FiWind,
  "Carpentry & Woodwork": FiTool,
  "Appliance Repair": FiCpu,
  "Home Cleaning & Sanitation": FiSun,
  "Painting & Wallcare": FiFeather,
  "Roofing & Waterproofing": FiHome,
  "Lawn & Gardening": FiSmile,
  "Pest Control": FiShield,
  "Locksmith & Home Security": FiKey,
  "Masonry & Tile Work": FiGrid,
  "Glass & Window Services": FiMaximize,
  "Disinfection & Sterilization": FiCrosshair,
};

// import { CATEGORY_ICONS } from '@/config/categoryIcons';
// import { FiTool } from 'react-icons/fi';

// export function CategoryBadge({ categoryName }: { categoryName: string }) {
//   // Get icon component dynamically with a fallback
//   const IconComponent = CATEGORY_ICONS[categoryName] || FiTool;

//   return (
//     <div className="flex items-center gap-2">
//       <IconComponent className="text-blue-600 text-lg" />
//       <span>{categoryName}</span>
//     </div>
//   );
// }
