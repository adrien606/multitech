import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useBillingSettings() {
  const queryClient = useQueryClient();

  const { data: buildings = [] } = useQuery({
    queryKey: ['buildings-billing'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buildings')
        .select('id, client_billing_enabled');
      
      if (error) throw error;
      return data;
    }
  });

  const updateBillingMutation = useMutation({
    mutationFn: async ({ buildingId, clientBilling }: { buildingId: string, clientBilling: boolean }) => {
      const { error } = await supabase
        .from('buildings')
        .update({ client_billing_enabled: clientBilling })
        .eq('id', buildingId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings-billing'] });
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
    }
  });

  const getBillingStatus = (buildingId: string) => {
    const building = buildings.find(b => b.id === buildingId);
    return building?.client_billing_enabled || false;
  };

  const updateBillingStatus = (buildingId: string, clientBilling: boolean) => {
    updateBillingMutation.mutate({ buildingId, clientBilling });
  };

  return {
    buildingsBilling: buildings.reduce((acc, building) => ({
      ...acc,
      [building.id]: building.client_billing_enabled
    }), {} as Record<string, boolean>),
    getBillingStatus,
    updateBillingStatus,
    isUpdating: updateBillingMutation.isPending
  };
}