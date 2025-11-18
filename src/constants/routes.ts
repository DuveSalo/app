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
  EDIT_QR_ELEVATORS: "/qr-elevators/:id/edit",

  QR_WATER_HEATERS: "/qr-water-heaters",
  UPLOAD_QR_WATER_HEATERS: "/qr-water-heaters/upload",
  EDIT_QR_WATER_HEATERS: "/qr-water-heaters/:id/edit",

  QR_FIRE_SAFETY: "/qr-fire-safety",
  UPLOAD_QR_FIRE_SAFETY: "/qr-fire-safety/upload",
  EDIT_QR_FIRE_SAFETY: "/qr-fire-safety/:id/edit",

  QR_DETECTION: "/qr-detection",
  UPLOAD_QR_DETECTION: "/qr-detection/upload",
  EDIT_QR_DETECTION: "/qr-detection/:id/edit",

  EVENT_INFORMATION: "/event-information",
  NEW_EVENT_INFORMATION: "/event-information/new",
  EDIT_EVENT_INFORMATION: "/event-information/:id/edit",

  FIRE_EXTINGUISHERS: "/fire-extinguishers",
  NEW_FIRE_EXTINGUISHER: "/fire-extinguishers/new",
  EDIT_FIRE_EXTINGUISHER: "/fire-extinguishers/:id/edit",

  SETTINGS: "/settings",

  // New Modules
  WATER_TANKS: "/water-tanks",
  PLANT_SPECIES: "/plant-species",
  SANITIZATION: "/sanitization",
  ELECTRICAL_INSTALLATIONS: "/electrical-installations",
  UPLOAD_ELECTRICAL_INSTALLATIONS: "/electrical-installations/upload",
  EDIT_ELECTRICAL_INSTALLATIONS: "/electrical-installations/:id/edit",
} as const;
