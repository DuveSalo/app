
import { Card } from '../../components/common/Card';
import { InformationCircleIcon } from '../../components/common/Icons';

const PlaceholderPage = ({ title }: { title: string }) => (
  <Card title={title} className="flex-grow">
    <div className="text-center py-10 flex flex-col flex-grow justify-center items-center">
      <InformationCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <p className="text-xl text-gray-400">Esta sección estará disponible próximamente.</p>
    </div>
  </Card>
);

export default PlaceholderPage;