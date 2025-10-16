
import React from 'react';
import { Card } from '../../components/common/Card';
import { InformationCircleIcon } from '../../components/common/Icons';

const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <Card title={title} className="flex-grow">
    <div className="text-center py-10 flex flex-col flex-grow justify-center items-center">
      <InformationCircleIcon className="w-16 h-16 text-content-muted mx-auto mb-4" />
      <p className="text-xl text-content-muted">Esta sección estará disponible próximamente.</p>
    </div>
  </Card>
);

export default PlaceholderPage;