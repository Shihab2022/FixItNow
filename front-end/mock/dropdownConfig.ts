// dropdownConfig.ts
import { IconType } from "react-icons";
import {
  HiOutlineUser,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineLockClosed,
  HiOutlineBell,
  HiOutlineQuestionMarkCircle,
  HiOutlineMoon,
  HiOutlineRocketLaunch,
  HiOutlineArrowRightOnRectangle,
} from "react-icons/hi2";

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: IconType;
  isDanger?: boolean;
  hasToggle?: boolean;
  hasDividerTop?: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
  badgeText: string;
}

export const USER_PROFILE: UserProfile = {
  name: "Bonnie Green",
  email: "name@flowbite.com",
  avatarUrl:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop",
  badgeText: "PRO",
};

export const DROPDOWN_MENU_ITEMS: MenuItem[] = [
  {
    id: "account",
    label: "Account",
    path: "/account",
    icon: HiOutlineUser,
  },
  {
    id: "settings",
    label: "Settings",
    path: "/settings",
    icon: HiOutlineAdjustmentsHorizontal,
  },
  {
    id: "privacy",
    label: "Privacy",
    path: "/privacy",
    icon: HiOutlineLockClosed,
  },
  {
    id: "notifications",
    label: "Notifications",
    path: "/notifications",
    icon: HiOutlineBell,
  },
  {
    id: "help",
    label: "Help center",
    path: "/help",
    icon: HiOutlineQuestionMarkCircle,
  },
  {
    id: "dark-mode",
    label: "Dark mode",
    path: "#",
    icon: HiOutlineMoon,
    hasToggle: true,
  },
  {
    id: "upgrade",
    label: "Upgrade to PRO",
    path: "/upgrade",
    icon: HiOutlineRocketLaunch,
    hasDividerTop: true,
  },
  {
    id: "signout",
    label: "Sign out",
    path: "/logout",
    icon: HiOutlineArrowRightOnRectangle,
    isDanger: true,
  },
];
