import { InformationCircleIcon } from '../../components/common/Icons';

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex flex-col h-full items-center justify-center gap-4">
    <InformationCircleIcon className="w-16 h-16 text-muted-foreground" />
    <div className="text-center">
      <h2 className="text-base font-medium text-foreground mb-1">{title}</h2>
      <p className="text-sm text-muted-foreground">Esta sección estará disponible próximamente.</p>
    </div>
  </div>
);

export default PlaceholderPage;
