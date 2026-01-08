import {
  Landmark,
  GraduationCap,
  Route,
  Building2,
  TrendingUp,
} from "lucide-react";

export const getInsightIcon = (type: string) => {
  switch (type) {
    case "MUNICIPAL_BOND":
      return <Landmark className="w-4 h-4" />;
    case "SCHOOL_CONSTRUCTION":
      return <GraduationCap className="w-4 h-4" />;
    case "ROAD_PROJECT":
      return <Route className="w-4 h-4" />;
    case "INFRASTRUCTURE":
      return <Building2 className="w-4 h-4" />;
    default:
      return <TrendingUp className="w-4 h-4" />;
  }
};

export const getMarkerColor = (type: string) => {
  switch (type) {
    case "MUNICIPAL_BOND":
      return "#60A5FA";
    case "SCHOOL_CONSTRUCTION":
      return "#34D399";
    case "ROAD_PROJECT":
      return "#FB923C";
    case "INFRASTRUCTURE":
      return "#22D3EE";
    case "ZONING_CHANGE":
      return "#A78BFA";
    case "DEVELOPMENT_PERMIT":
      return "#2DD4BF";
    case "TAX_INCENTIVE":
      return "#FACC15";
    default:
      return "#A3E635";
  }
};
