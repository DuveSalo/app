

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
    Eye,
    CreditCard,
    Receipt,
    XCircle,
    type LucideProps,
} from 'lucide-react';

const STROKE_WIDTH = 1.5;

// --- Custom App Logo ---
// Se mantiene el icono del logo personalizado para conservar la identidad de la marca.
export const AppLogoIcon = ({className = "size-8"}: {className?: string}) => (
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

export const HomeIcon = ({ className = "w-6 h-6", ...props }: LucideProps) => <Home className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const DocumentTextIcon = ({ className = "w-6 h-6", ...props }: LucideProps) => <FileText className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const ShieldCheckIcon = ({ className = "w-6 h-6", ...props }: LucideProps) => <ShieldCheck className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const QrCodeIcon = ({ className = "w-6 h-6", ...props }: LucideProps) => <QrCode className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const InformationCircleIcon = ({ className = "w-6 h-6", ...props }: LucideProps) => <Info className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const Cog6ToothIcon = ({ className = "w-6 h-6", ...props }: LucideProps) => <Settings className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const EditIcon = ({ className = "w-5 h-5", ...props }: LucideProps) => <Edit className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const WaterDropletIcon = ({ className = "w-6 h-6", ...props }: LucideProps) => <Droplet className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const SproutIcon = ({ className = "w-6 h-6", ...props }: LucideProps) => <Sprout className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const ElectricalIcon = ({ className = "w-6 h-6", ...props }: LucideProps) => <Zap className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const TestTubeIcon = ({ className = "w-6 h-6", ...props }: LucideProps) => <TestTube className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const CloseIcon = ({ className = "w-6 h-6", ...props }: LucideProps) => <X className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const PlusIcon = ({ className = "w-5 h-5", ...props }: LucideProps) => <Plus className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const TrashIcon = ({ className = "w-5 h-5", ...props }: LucideProps) => <Trash2 className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const CheckIcon = ({ className = "w-5 h-5", ...props }: LucideProps) => <Check className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const FireIcon = ({ className = "w-6 h-6", ...props }: LucideProps) => <Flame className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const BellAlertIcon = ({ className = "w-6 h-6", ...props }: LucideProps) => <BellRing className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const ExclamationTriangleIcon = ({ className = "w-6 h-6", ...props }: LucideProps) => <AlertTriangle className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const ChevronDoubleLeftIcon = ({ className = "w-6 h-6", ...props }: LucideProps) => <ChevronsLeft className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const ChevronDoubleRightIcon = ({ className = "w-6 h-6", ...props }: LucideProps) => <ChevronsRight className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const ChevronDownIcon = ({ className = "w-5 h-5", ...props }: LucideProps) => <ChevronDown className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const UsersIcon = ({ className = "w-6 h-6", ...props }: LucideProps) => <Users className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const SearchIcon = ({ className = "w-6 h-6", ...props }: LucideProps) => <Search className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const EyeIcon = ({ className = "w-5 h-5", ...props }: LucideProps) => <Eye className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const CreditCardIcon = ({ className = "w-5 h-5", ...props }: LucideProps) => <CreditCard className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const ReceiptIcon = ({ className = "w-5 h-5", ...props }: LucideProps) => <Receipt className={className} strokeWidth={STROKE_WIDTH} {...props} />;
export const XCircleIcon = ({ className = "w-5 h-5", ...props }: LucideProps) => <XCircle className={className} strokeWidth={STROKE_WIDTH} {...props} />;


// --- Iconos del Dashboard ---
// Estos iconos usaban un grosor de trazo de 2, por lo que usamos el valor por defecto de Lucide.
export const CalendarIcon = ({ className = "w-6 h-6", ...props }: LucideProps) => <Calendar className={className} {...props} />;
export const TrendingUpIcon = ({ className = "w-6 h-6", ...props }: LucideProps) => <TrendingUp className={className} {...props} />;
export const AlertCircleIcon = ({ className = "w-6 h-6", ...props }: LucideProps) => <AlertCircle className={className} {...props} />;
export const CheckCircleIcon = ({ className = "w-6 h-6", ...props }: LucideProps) => <CheckCircle className={className} {...props} />;