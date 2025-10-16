// Route Paths
export const ROUTE_PATHS = {
  LOGIN: "/login",
  REGISTER: "/register",
  CREATE_COMPANY: "/create-company",
  SUBSCRIPTION: "/subscribe",
  DASHBOARD: "/dashboard",

  CONSERVATION_CERTIFICATES: "/conservation-certificates",
  NEW_CONSERVATION_CERTIFICATE: "/conservation-certificates/new",
  EDIT_CONSERVATION_CERTIFICATE: "/conservation-certificates/:id/edit",

  SELF_PROTECTION_SYSTEMS: "/self-protection-systems",
  NEW_SELF_PROTECTION_SYSTEM: "/self-protection-systems/new",
  EDIT_SELF_PROTECTION_SYSTEM: "/self-protection-systems/:id/edit",

  QR_ELEVATORS: "/qr-elevators",
  UPLOAD_QR_ELEVATORS: "/qr-elevators/upload",

  QR_WATER_HEATERS: "/qr-water-heaters",
  UPLOAD_QR_WATER_HEATERS: "/qr-water-heaters/upload",

  QR_FIRE_SAFETY: "/qr-fire-safety",
  UPLOAD_QR_FIRE_SAFETY: "/qr-fire-safety/upload",

  QR_DETECTION: "/qr-detection",
  UPLOAD_QR_DETECTION: "/qr-detection/upload",

  EVENT_INFORMATION: "/event-information",
  NEW_EVENT_INFORMATION: "/event-information/new",
  EDIT_EVENT_INFORMATION: "/event-information/:id/edit",

  SETTINGS: "/settings",

  // New Modules
  WATER_TANKS: "/water-tanks",
  PLANT_SPECIES: "/plant-species",
  SANITIZATION: "/sanitization",
  ELECTRICAL_INSTALLATIONS: "/electrical-installations",
  UPLOAD_ELECTRICAL_INSTALLATIONS: "/electrical-installations/upload",
} as const;
