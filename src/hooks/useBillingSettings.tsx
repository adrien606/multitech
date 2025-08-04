import { useState, useEffect } from 'react';

export function useBillingSettings() {
  const [buildingsBilling, setBuildingsBilling] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('buildingsBilling');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('buildingsBilling', JSON.stringify(buildingsBilling));
  }, [buildingsBilling]);

  const getBillingStatus = (buildingId: string) => {
    return buildingsBilling[buildingId] || false;
  };

  const updateBillingStatus = (buildingId: string, clientBilling: boolean) => {
    setBuildingsBilling(prev => ({
      ...prev,
      [buildingId]: clientBilling
    }));
  };

  return {
    buildingsBilling,
    getBillingStatus,
    updateBillingStatus
  };
}