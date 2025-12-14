
import React from 'react';
import { useGlobalContext } from '../../../context/GlobalContext';
import BranchDistribution from './distribution/BranchDistribution';
import CentralDistribution from './distribution/CentralDistribution';

const Distribution: React.FC = () => {
  const { activeOutlet } = useGlobalContext();
  
  const isCentralOutlet = activeOutlet?.id === '101' || activeOutlet?.id === '201' || activeOutlet?.name.toLowerCase().includes('pusat') || activeOutlet?.name.toLowerCase().includes('gudang');

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 w-full">
        {isCentralOutlet ? <CentralDistribution /> : <BranchDistribution />}
    </div>
  );
};

export default Distribution;
