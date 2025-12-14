
import React from 'react';
import { BusinessType } from '../../types';
import POSCulinary from './components/POSCulinary';
import POSRetail from './components/POSRetail';
import { useGlobalContext } from '../../context/GlobalContext';

interface POSProps {
  businessType?: BusinessType; // Optional, fallback to context
  onExit?: () => void;
  onNavigate?: (view: string, searchTerm?: string) => void;
}

const POS: React.FC<POSProps> = ({ onExit, onNavigate }) => {
  const { businessConfig } = useGlobalContext();
  
  // Logic Otomatis: Cek tipe bisnis dari config global
  // Jika tipe bisnis adalah RETAIL (Toko/Swalayan/Grosir) -> Masuk Mode Retail
  // Selain itu (F&B, Jasa, dll) -> Masuk Mode Culinary/Resto
  const isRetailMode = businessConfig?.type === BusinessType.RETAIL;

  // Render Strategy: Strict Mode, No Toggle
  if (isRetailMode) {
      return <POSRetail onExit={onExit} onNavigate={onNavigate} />;
  }

  return <POSCulinary onExit={onExit} onNavigate={onNavigate} />;
};

export default POS;
