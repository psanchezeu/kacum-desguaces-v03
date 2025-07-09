
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Column<T> {
  header: string;
  accessor: ((item: T) => string | number | boolean | React.ReactNode) | string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  idField: keyof T;
  basePath: string;
  onDelete?: (id: number) => void;
  noActions?: boolean;
  emptyMessage?: string;
  compact?: boolean; // Propiedad para tablas compactas
  paginated?: boolean; // Propiedad para habilitar paginación
  defaultPageSize?: number; // Tamaño de página predeterminado
}

const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  idField,
  basePath,
  onDelete,
  noActions = false,
  emptyMessage = "No hay datos disponibles",
  compact = false,
  paginated = true, // Por defecto habilitamos la paginación
  defaultPageSize = 10, // Tamaño de página predeterminado
}: DataTableProps<T>) => {
  const navigate = useNavigate();
  
  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(defaultPageSize);
  
  // Calcular el número total de páginas
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // Obtener los elementos de la página actual
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentData = paginated ? data.slice(startIndex, endIndex) : data;
  
  // Funciones para la navegación entre páginas
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };
  
  const goToPreviousPage = () => {
    goToPage(currentPage - 1);
  };
  
  const goToNextPage = () => {
    goToPage(currentPage + 1);
  };
  
  // Manejar cambio en el tamaño de página
  const handlePageSizeChange = (value: string) => {
    const newSize = parseInt(value, 10);
    setPageSize(newSize);
    setCurrentPage(1); // Resetear a la primera página cuando cambia el tamaño
  };

  const handleView = (id: number) => {
    navigate(`${basePath}/${id}`);
  };

  const handleEdit = (id: number) => {
    navigate(`${basePath}/${id}/editar`);
  };

  const handleDelete = (id: number) => {
    if (onDelete) {
      onDelete(id);
    }
  };

  // Function to get the value based on the accessor type
  const getCellValue = (item: T, accessor: string | ((item: T) => any)) => {
    if (typeof accessor === 'function') {
      return accessor(item);
    } else {
      return item[accessor];
    }
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow className={compact ? "h-9" : ""}>
            {columns.map((column, index) => (
              <TableHead key={index} className={compact ? "py-1" : ""}>{column.header}</TableHead>
            ))}
            {!noActions && <TableHead className={`text-right ${compact ? "py-1" : ""}`}>Acciones</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentData.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (noActions ? 0 : 1)}
                className="text-center p-4"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            currentData.map((item) => (
              <TableRow key={String(item[idField])} className={compact ? "h-10" : ""}>
                {columns.map((column, index) => (
                  <TableCell key={index} className={compact ? "py-1" : ""}>
                    {column.render ? column.render(item) : getCellValue(item, column.accessor)}
                  </TableCell>
                ))}
                {!noActions && (
                  <TableCell className={`text-right ${compact ? "py-1" : ""}`}>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleView(Number(item[idField]))}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleEdit(Number(item[idField]))}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleDelete(Number(item[idField]))}
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      {/* Controles de paginación */}
      {paginated && totalItems > 0 && (
        <div className="flex items-center justify-between px-4 py-2 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Filas por página:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="h-8 w-20">
                <SelectValue placeholder={pageSize.toString()} />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 25, 50, 100].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-1 text-sm">
            <span className="text-muted-foreground">
              {startIndex + 1}-{endIndex} de {totalItems}
            </span>
            <div className="flex items-center gap-1 ml-2">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={currentPage === 1}
                onClick={goToPreviousPage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={currentPage === totalPages}
                onClick={goToNextPage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
