import React from "react";
import { PiezaTienda } from "../../../services/recambiosService";

interface ProductCardProps {
  pieza: PiezaTienda;
  onAddToCart: () => void;
}

declare const ProductCard: React.FC<ProductCardProps>;

export default ProductCard;
