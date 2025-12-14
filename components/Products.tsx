
import React from 'react';
import ProductsFeature from '../features/products/Products';

interface ProductsProps {
  initialSearchTerm?: string;
}

const Products: React.FC<ProductsProps> = ({ initialSearchTerm }) => {
  return <ProductsFeature initialSearchTerm={initialSearchTerm} />;
};

export default Products;
