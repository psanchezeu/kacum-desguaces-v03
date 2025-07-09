import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grua, gruasService } from '../../services/gruasService';
import PageLayout from '../../components/layout/PageLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../../components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Truck, Search, Plus, Eye, Edit, Trash2, FileText, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import Loader from '../../components/ui/loader';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Corrige el problema con el icono por defecto de Leaflet en Webpack
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const GruasMap: React.FC<{ gruas: Grua[] }> = ({ gruas }) => {
  const activeGruas = gruas.filter(g => g.latitud && g.longitud);

  if (activeGruas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ubicación de Grúas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No hay grúas con ubicación disponible para mostrar en el mapa.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calcula el centro del mapa promediando las coordenadas
  const centerLat = activeGruas.reduce((sum, g) => sum + g.latitud!, 0) / activeGruas.length;
  const centerLng = activeGruas.reduce((sum, g) => sum + g.longitud!, 0) / activeGruas.length;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Ubicación de Grúas</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: '400px', width: '100%' }}>
          <MapContainer center={[centerLat, centerLng]} zoom={8} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {activeGruas.map(grua => (
              <Marker key={grua.id} position={[grua.latitud!, grua.longitud!]}>
                <Popup>
                  <b>{grua.matricula}</b><br />
                  {grua.modelo}<br />
                  Estado: {grua.estado}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
};

const GruasPage: React.FC = () => {
  const [gruas, setGruas] = useState<Grua[]>([]);
  const [filteredGruas, setFilteredGruas] = useState<Grua[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [gruaToDelete, setGruaToDelete] = useState<Grua | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchGruas();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredGruas(gruas);
    } else {
      const filtered = gruas.filter(grua => 
        grua.matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grua.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grua.conductor_asignado.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredGruas(filtered);
    }
  }, [searchTerm, gruas]);

  const fetchGruas = async () => {
    try {
      setLoading(true);
      let data = await gruasService.getAll();
      // Añadir coordenadas de ejemplo para demostración
      data = data.map((grua, index) => ({
        ...grua,
        latitud: 40.416775 + (Math.random() - 0.5) * 2, // Coordenadas alrededor de Madrid
        longitud: -3.703790 + (Math.random() - 0.5) * 2,
      }));
      setGruas(data);
      setFilteredGruas(data);
    } catch (error) {
      console.error('Error al cargar grúas:', error);
      toast.error('Error al cargar las grúas');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    navigate('/gruas/nueva');
  };

  const handleEdit = (id: number) => {
    navigate(`/gruas/${id}/editar`);
  };

  const handleView = (id: number) => {
    navigate(`/gruas/${id}`);
  };

  const confirmDelete = (grua: Grua) => {
    setGruaToDelete(grua);
    setDeleteDialogOpen(true);
  };

  const handleDeleteGrua = async () => {
    if (!gruaToDelete) return;
    
    try {
      await gruasService.delete(gruaToDelete.id);
      setGruas(gruas.filter(g => g.id !== gruaToDelete.id));
      toast.success('Grúa eliminada correctamente');
      setDeleteDialogOpen(false);
      setGruaToDelete(null);
    } catch (error) {
      console.error('Error al eliminar la grúa:', error);
      toast.error('Error al eliminar la grúa');
    }
  };

  const handleNewGrua = () => {
    navigate('/gruas/nueva');
  };

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'activa':
        return 'bg-green-500';
      case 'en mantenimiento':
        return 'bg-yellow-500';
      case 'inactiva':
        return 'bg-red-500';
      case 'en servicio':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getITVBadgeColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'vigente':
        return 'bg-green-500';
      case 'próxima a vencer':
        return 'bg-yellow-500';
      case 'vencida':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <PageLayout title="Gestión de Grúas" actions={(
      <Button onClick={handleNewGrua}>
        <Plus className="mr-2 h-4 w-4" />
        Nueva Grúa
      </Button>
    )}>

      <GruasMap gruas={filteredGruas} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="mr-2" />
            Listado de Grúas
          </CardTitle>
          <CardDescription>
            Total: {filteredGruas.length} grúas
          </CardDescription>
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              type="text"
              placeholder="Buscar por matrícula, modelo o conductor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader size="lg" />
            </div>
          ) : filteredGruas.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Matrícula</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Capacidad (kg)</TableHead>
                    <TableHead>Conductor</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>ITV</TableHead>
                    <TableHead>Último Mantenimiento</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGruas.map((grua) => (
                    <TableRow key={grua.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleView(grua.id)}>
                      <TableCell className="font-medium">{grua.matricula}</TableCell>
                      <TableCell>{grua.modelo}</TableCell>
                      <TableCell>{grua.capacidad_kg.toLocaleString()}</TableCell>
                      <TableCell>{grua.conductor_asignado}</TableCell>
                      <TableCell>
                        <Badge className={getEstadoBadgeColor(grua.estado)}>
                          {grua.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <Badge className={getITVBadgeColor(grua.itv_estado)}>
                            {grua.itv_estado}
                          </Badge>
                          <span className="text-xs text-muted-foreground mt-1">
                            {format(new Date(grua.itv_fecha), 'dd/MM/yyyy', { locale: es })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(grua.fecha_ultimo_mantenimiento), 'dd/MM/yyyy', { locale: es })}
                      </TableCell>
                      <TableCell className="space-x-2" onClick={(e) => e.stopPropagation()}>
                        <Button variant="outline" size="icon" onClick={(e) => { e.stopPropagation(); handleView(grua.id); }}>
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={(e) => { e.stopPropagation(); handleEdit(grua.id); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={(e) => { e.stopPropagation(); confirmDelete(grua); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No se encontraron grúas</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar la grúa con matrícula {gruaToDelete?.matricula}?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteGrua}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default GruasPage;
