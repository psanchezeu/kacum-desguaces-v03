import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { campasService, Campa, CampaFormData } from '../../services/campasService';
import PageLayout from '../../components/layout/PageLayout';
import CampaForm from './CampaForm';
import Loader from '../../components/ui/loader';

const EditarCampaPage: React.FC = () => {
  const [campa, setCampa] = useState<Campa | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const fetchCampa = async () => {
      if (!id) {
        setError('No se proporcionó un ID de campa');
        setLoading(false);
        return;
      }

      try {
        const data = await campasService.getById(Number(id));
        setCampa(data);
      } catch (err) {
        setError('Error al cargar los datos de la campa.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCampa();
  }, [id]);

  const handleSubmit = async (data: CampaFormData) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      await campasService.update(Number(id), data);
      toast.success('Campa actualizada correctamente');
      navigate('/campas');
    } catch (error) {
      console.error('Error al actualizar la campa:', error);
      toast.error('Error al actualizar la campa');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <PageLayout title="Editar Campa">
        <div className="text-center text-red-500">{error}</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={`Editar Campa: ${campa?.nombre}`}>
      {campa && (
        <CampaForm
          onSubmit={handleSubmit}
          initialData={campa}
          isSubmitting={isSubmitting}
        />
      )}
    </PageLayout>
  );
};

export default EditarCampaPage;
