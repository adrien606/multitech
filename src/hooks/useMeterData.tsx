import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MeterReading {
  id?: string;
  month: string;
  year: number;
  currentReading: number;
  previousReading: number;
  consumption: number;
  amount: number;
}

export interface MeterLot {
  id?: string;
  name: string;
  clientName: string;
  readings: MeterReading[];
}

export interface BuildingLotData {
  pricePerKwh: number;
  lots: MeterLot[];
}

export function useMeterData() {
  const queryClient = useQueryClient();

  // Récupérer les données des compteurs pour tous les bâtiments
  const { data: meterData = {}, isLoading } = useQuery({
    queryKey: ['meter-data'],
    queryFn: async () => {
      // Récupérer les configurations de prix
      const { data: configs, error: configError } = await supabase
        .from('building_meter_configs' as any)
        .select('building_id, price_per_kwh');
      
      if (configError) throw configError;

      // Récupérer les lots avec leurs relevés
      const { data: lots, error: lotsError } = await supabase
        .from('meter_lots' as any)
        .select(`
          id,
          name,
          client_name,
          building_id,
          meter_readings (
            id,
            month,
            year,
            current_reading,
            previous_reading,
            consumption,
            amount
          )
        `);
      
      if (lotsError) throw lotsError;

      // Organiser les données par bâtiment
      const buildingData: Record<string, BuildingLotData> = {};
      
      // Initialiser avec les configurations de prix
      (configs || []).forEach((config: any) => {
        buildingData[config.building_id] = {
          pricePerKwh: Number(config.price_per_kwh),
          lots: []
        };
      });

      // Ajouter les lots et relevés
      (lots || []).forEach((lot: any) => {
        if (!buildingData[lot.building_id]) {
          buildingData[lot.building_id] = {
            pricePerKwh: 0.36, // Prix par défaut corrigé
            lots: []
          };
        }

        buildingData[lot.building_id].lots.push({
          id: lot.id,
          name: lot.name,
          clientName: lot.client_name || '',
          readings: (lot.meter_readings || []).map((reading: any) => ({
            id: reading.id,
            month: reading.month,
            year: reading.year,
            currentReading: Number(reading.current_reading),
            previousReading: Number(reading.previous_reading),
            consumption: Number(reading.consumption),
            amount: Number(reading.amount)
          }))
        });
      });

      return buildingData;
    }
  });

  // Mutation pour recalculer tous les montants avec le nouveau prix
  const recalculateAmountsMutation = useMutation({
    mutationFn: async ({ buildingId, newPricePerKwh }: { buildingId: string, newPricePerKwh: number }) => {
      // Récupérer tous les relevés pour ce bâtiment
      const { data: lots, error: lotsError } = await supabase
        .from('meter_lots' as any)
        .select('id')
        .eq('building_id', buildingId);
      
      if (lotsError) throw lotsError;

      const lotIds = (lots || []).map((lot: any) => lot.id);

      if (lotIds.length > 0) {
        const { data: readings, error: readingsError } = await supabase
          .from('meter_readings' as any)
          .select('id, consumption')
          .in('lot_id', lotIds);
        
        if (readingsError) throw readingsError;

        // Mettre à jour tous les montants
        const updates = (readings || []).map((reading: any) => ({
          id: reading.id,
          amount: Number(reading.consumption) * newPricePerKwh
        }));

        for (const update of updates) {
          const { error: updateError } = await supabase
            .from('meter_readings' as any)
            .update({ amount: update.amount })
            .eq('id', update.id);
          if (updateError) throw updateError;
        }
      }

      // Mettre à jour le prix dans la configuration
      const { error: upsertError } = await supabase
        .from('building_meter_configs' as any)
        .upsert({
          building_id: buildingId,
          price_per_kwh: newPricePerKwh
        });
      if (upsertError) throw upsertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meter-data'] });
    }
  });

  // Mutation pour créer/mettre à jour la configuration de prix
  const updatePriceMutation = useMutation({
    mutationFn: async ({ buildingId, pricePerKwh }: { buildingId: string, pricePerKwh: number }) => {
      // D'abord, recalculer tous les montants avec le nouveau prix
      await recalculateAmountsMutation.mutateAsync({ buildingId, newPricePerKwh: pricePerKwh });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meter-data'] });
      toast.success("Prix mis à jour - tous les calculs ont été recalculés");
    },
    onError: (err: any) => {
      console.error('Erreur de mise à jour du prix:', err);
      toast.error("Impossible de mettre à jour le prix (droits insuffisants ?)");
    }
  });

  // Mutation pour créer un lot
  const createLotMutation = useMutation({
    mutationFn: async ({ buildingId, name, clientName }: { buildingId: string, name: string, clientName: string }) => {
      const { error } = await supabase
        .from('meter_lots' as any)
        .insert({
          building_id: buildingId,
          name,
          client_name: clientName
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meter-data'] });
      toast.success("Lot ajouté avec succès");
    }
  });

  // Mutation pour supprimer un lot
  const deleteLotMutation = useMutation({
    mutationFn: async (lotId: string) => {
      // Supprimer d'abord les relevés
      await supabase
        .from('meter_readings' as any)
        .delete()
        .eq('lot_id', lotId);

      // Puis supprimer le lot
      const { error } = await supabase
        .from('meter_lots' as any)
        .delete()
        .eq('id', lotId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meter-data'] });
      toast.success("Lot supprimé avec succès");
    }
  });

  // Mutation pour mettre à jour un lot
  const updateLotMutation = useMutation({
    mutationFn: async ({ lotId, name, clientName }: { lotId: string, name?: string, clientName?: string }) => {
      const updates: any = {};
      if (name !== undefined) updates.name = name;
      if (clientName !== undefined) updates.client_name = clientName;

      const { error } = await supabase
        .from('meter_lots' as any)
        .update(updates)
        .eq('id', lotId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meter-data'] });
    }
  });

  // Mutation pour ajouter un relevé
  const addReadingMutation = useMutation({
    mutationFn: async ({ 
      lotId, 
      month, 
      year, 
      currentReading, 
      previousReading, 
      pricePerKwh 
    }: { 
      lotId: string, 
      month: string, 
      year: number, 
      currentReading: number, 
      previousReading: number,
      pricePerKwh: number
    }) => {
      const consumption = currentReading - previousReading;
      const amount = consumption * pricePerKwh;

      const { error } = await supabase
        .from('meter_readings' as any)
        .insert({
          lot_id: lotId,
          month,
          year,
          current_reading: currentReading,
          previous_reading: previousReading,
          consumption,
          amount
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meter-data'] });
      toast.success("Relevé ajouté avec succès");
    }
  });

  // Mutation pour supprimer un relevé
  const deleteReadingMutation = useMutation({
    mutationFn: async (readingId: string) => {
      const { error } = await supabase
        .from('meter_readings' as any)
        .delete()
        .eq('id', readingId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meter-data'] });
      toast.success("Relevé supprimé avec succès");
    }
  });

  // Mutation pour mettre à jour un relevé existant
  const updateReadingMutation = useMutation({
    mutationFn: async ({ 
      readingId, 
      previousReading, 
      consumption, 
      amount 
    }: { 
      readingId: string, 
      previousReading: number, 
      consumption: number, 
      amount: number 
    }) => {
      const { error } = await supabase
        .from('meter_readings' as any)
        .update({
          previous_reading: previousReading,
          consumption,
          amount
        })
        .eq('id', readingId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meter-data'] });
      toast.success("Relevé mis à jour avec succès");
    }
  });

  return {
    meterData,
    isLoading,
    updatePrice: updatePriceMutation.mutate,
    createLot: createLotMutation.mutate,
    deleteLot: deleteLotMutation.mutate,
    updateLot: updateLotMutation.mutate,
    addReading: addReadingMutation.mutate,
    deleteReading: deleteReadingMutation.mutate,
    updateReading: updateReadingMutation.mutate,
    isUpdating: updatePriceMutation.isPending || 
                createLotMutation.isPending || 
                deleteLotMutation.isPending || 
                updateLotMutation.isPending || 
                addReadingMutation.isPending || 
                deleteReadingMutation.isPending ||
                updateReadingMutation.isPending ||
                recalculateAmountsMutation.isPending
  };
}