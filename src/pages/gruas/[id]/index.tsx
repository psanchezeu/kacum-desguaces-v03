import React from 'react';
import { useParams } from 'react-router-dom';
import GruaDetailView from '../GruaDetailView';
import PageLayout from '../../../components/layout/PageLayout';

const GruaDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return <div>ID de grúa no válido</div>;
  }

  return (
    <PageLayout title="Detalle de Grúa">
      <GruaDetailView />
    </PageLayout>
  );
};

export default GruaDetailPage;
