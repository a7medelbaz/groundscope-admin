import {
  LayoutDashboard,
  Workflow,
  Plane,
  ClipboardList,
  TrendingUp,
  Tags,
  CircleParking,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * Maps each navigation translation key to its lucide icon.
 * Single source of truth so the sidebar never hardcodes icons inline.
 */
export const navIcons: Record<string, LucideIcon> = {
  "nav.overview": LayoutDashboard,
  "nav.operations": Workflow,
  "nav.flights": Plane,
  "nav.reports": ClipboardList,
  "nav.analytics": TrendingUp,
  "nav.serviceTypes": Tags,
  "nav.stands": CircleParking,
  "nav.units": Truck,
  "nav.users": Users,
};
