import React from 'react';
import {
    Home,
    FileText,
    ShieldCheck,
    QrCode,
    Info,
    Settings,
    Edit,
    Droplet,
    Sprout,
    Zap,
    TestTube,
    X,
    Plus,
    Trash2,
    Check,
    Flame,
    BellRing,
    AlertTriangle,
    ChevronsLeft,
    ChevronsRight,
    ChevronDown,
    Users,
    Calendar,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Search,
    Eye
} from 'lucide-react';

const STROKE_WIDTH = 1.5;

// --- Custom App Logo ---
// Se mantiene el icono del logo personalizado para conservar la identidad de la marca.
export const AppLogoIcon: React.FC<{className?: string}> = ({className = "size-8"}) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g clipPath="url(#clip0_6_330_logo_app_icons)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z"
        fill="currentColor"
      ></path>
    </g>
    <defs>
      <clipPath id="clip0_6_330_logo_app_icons"><rect width="48" height="48" fill="white"></rect></clipPath>
    </defs>
  </svg>
);

// --- Iconos de la Aplicación ---
// Se reexportan los iconos de Lucide con los nombres de componentes originales y clases por defecto
// para asegurar cambios no disruptivos en la aplicación. La mayoría de los iconos
// usaban un grosor de trazo de 1.5, por lo que se mantiene para consistencia visual.

export const HomeIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6", ...props }) => <Home className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const DocumentTextIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6", ...props }) => <FileText className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const ShieldCheckIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6", ...props }) => <ShieldCheck className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const QrCodeIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6", ...props }) => <QrCode className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const InformationCircleIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6", ...props }) => <Info className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const Cog6ToothIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6", ...props }) => <Settings className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const EditIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5", ...props }) => <Edit className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const WaterDropletIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6", ...props }) => <Droplet className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const SproutIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6", ...props }) => <Sprout className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const ElectricalIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6", ...props }) => <Zap className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const TestTubeIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6", ...props }) => <TestTube className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const CloseIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6", ...props }) => <X className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const PlusIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5", ...props }) => <Plus className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const TrashIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5", ...props }) => <Trash2 className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const CheckIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5", ...props }) => <Check className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const FireIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6", ...props }) => <Flame className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const BellAlertIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6", ...props }) => <BellRing className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const ExclamationTriangleIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6", ...props }) => <AlertTriangle className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const ChevronDoubleLeftIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6", ...props }) => <ChevronsLeft className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const ChevronDoubleRightIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6", ...props }) => <ChevronsRight className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const ChevronDownIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5", ...props }) => <ChevronDown className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const UsersIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6", ...props }) => <Users className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const SearchIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6", ...props }) => <Search className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const EyeIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5", ...props }) => <Eye className={className} strokeWidth={STROKE_WIDTH} {...props} />;


// --- Iconos del Dashboard ---
// Estos iconos usaban un grosor de trazo de 2, por lo que usamos el valor por defecto de Lucide.
export const CalendarIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6", ...props }) => <Calendar className={className} {...props} />;
export const TrendingUpIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6", ...props }) => <TrendingUp className={className} {...props} />;
export const AlertCircleIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6", ...props }) => <AlertCircle className={className} {...props} />;
export const CheckCircleIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6", ...props }) => <CheckCircle className={className} {...props} />;