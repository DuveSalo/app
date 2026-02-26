import { InformationCircleIcon } from '../../components/common/Icons';

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex flex-col h-full items-center justify-center gap-4">
    <InformationCircleIcon className="w-16 h-16 text-neutral-300" />
    <div className="text-center">
      <h2 className="text-lg font-medium text-neutral-900 mb-1">{title}</h2>
      <p className="text-sm text-neutral-500">Esta sección estará disponible próximamente.</p>
    </div>
  </div>
);

export default PlaceholderPage;
