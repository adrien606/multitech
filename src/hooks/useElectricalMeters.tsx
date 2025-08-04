import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface ElectricalMeter {
  id: string;
  building_id: string;
  meter_number: string;
  name: string;
  pdl_number?: string;
  supplier?: string;
  contract_reference?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMeterData {
  building_id: string;
  meter_number: string;
  name: string;
  pdl_number?: string;
  supplier?: string;
  contract_reference?: string;
  notes?: string;
}

export interface UpdateMeterData {
  id: string;
  meter_number?: string;
  name?: string;
  pdl_number?: string;
  supplier?: string;
  contract_reference?: string;
  is_active?: boolean;
  notes?: string;
}

export function useElectricalMeters() {
  const queryClient = useQueryClient();

  // Fetch electrical meters
  const { data: meters = [], isLoading } = useQuery({
    queryKey: ['electrical-meters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('electrical_meters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching electrical meters:', error);
        throw error;
      }

      return data as ElectricalMeter[];
    },
  });

  // Create meter mutation
  const createMeterMutation = useMutation({
    mutationFn: async (meterData: CreateMeterData) => {
      const { data, error } = await supabase
        .from('electrical_meters')
        .insert(meterData)
        .select()
        .single();

      if (error) {
        console.error('Error creating electrical meter:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['electrical-meters'] });
      toast.success("Compteur électrique créé avec succès");
    },
    onError: (error) => {
      console.error('Create meter error:', error);
      toast.error("Erreur lors de la création du compteur");
    },
  });

  // Update meter mutation
  const updateMeterMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateMeterData) => {
      const { data, error } = await supabase
        .from('electrical_meters')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating electrical meter:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['electrical-meters'] });
      toast.success("Compteur électrique mis à jour avec succès");
    },
    onError: (error) => {
      console.error('Update meter error:', error);
      toast.error("Erreur lors de la mise à jour du compteur");
    },
  });

  // Delete meter mutation
  const deleteMeterMutation = useMutation({
    mutationFn: async (meterId: string) => {
      const { error } = await supabase
        .from('electrical_meters')
        .delete()
        .eq('id', meterId);

      if (error) {
        console.error('Error deleting electrical meter:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['electrical-meters'] });
      toast.success("Compteur électrique supprimé avec succès");
    },
    onError: (error) => {
      console.error('Delete meter error:', error);
      toast.error("Erreur lors de la suppression du compteur");
    },
  });

  // Helper function to get meters by building
  const getMetersByBuilding = (buildingId: string) => {
    return meters.filter(meter => meter.building_id === buildingId && meter.is_active);
  };

  return {
    meters,
    isLoading,
    getMetersByBuilding,
    createMeter: createMeterMutation.mutate,
    updateMeter: updateMeterMutation.mutate,
    deleteMeter: deleteMeterMutation.mutate,
    isCreating: createMeterMutation.isPending,
    isUpdating: updateMeterMutation.isPending,
    isDeleting: deleteMeterMutation.isPending,
    isModifying: createMeterMutation.isPending || updateMeterMutation.isPending || deleteMeterMutation.isPending,
  };
}