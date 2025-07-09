import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { campasService, CampaFormData } from '../../services/campasService';
import PageLayout from '../../components/layout/PageLayout';
import CampaForm from './CampaForm';

const NuevaCampaPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (data: CampaFormData) => {
    setIsSubmitting(true);
    try {
      await campasService.create(data);
      toast.success('Campa creada correctamente');
      navigate('/campas');
    } catch (error) {
      console.error('Error al crear la campa:', error);
      toast.error('Error al crear la campa');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout title="Nueva Campa">
      <CampaForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </PageLayout>
  );
};

export default NuevaCampaPage;
