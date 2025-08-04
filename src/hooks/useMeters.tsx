import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MeterReading {
  id: string;
  lot_id: string;
  month: string;
  year: number;
  current_reading: number;
  previous_reading: number;
  consumption: number;
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface MeterLot {
  id: string;
  building_id: string;
  name: string;
  client_name: string;
  created_at: string;
  updated_at: string;
  readings?: MeterReading[];
}

export interface BuildingMeterConfig {
  id: string;
  building_id: string;
  price_per_kwh: number;
  created_at: string;
  updated_at: string;
}

export const useMeters = (buildingId?: string) => {
  const queryClient = useQueryClient();

  // Get building meter configuration
  const { data: meterConfig, isLoading: isLoadingConfig } = useQuery({
    queryKey: ["building-meter-config", buildingId],
    queryFn: async () => {
      if (!buildingId) return null;
      
      const { data, error } = await supabase
        .from("building_meter_configs")
        .select("*")
        .eq("building_id", buildingId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!buildingId
  });

  // Get lots for a building
  const { data: lots, isLoading: isLoadingLots } = useQuery({
    queryKey: ["meter-lots", buildingId],
    queryFn: async () => {
      if (!buildingId) return [];
      
      const { data, error } = await supabase
        .from("meter_lots")
        .select(`
          *,
          meter_readings (*)
        `)
        .eq("building_id", buildingId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as (MeterLot & { meter_readings: MeterReading[] })[];
    },
    enabled: !!buildingId
  });

  // Initialize building configuration
  const initBuildingConfig = useMutation({
    mutationFn: async (buildingId: string) => {
      // Check if config already exists
      const { data: existing } = await supabase
        .from("building_meter_configs")
        .select("*")
        .eq("building_id", buildingId)
        .maybeSingle();

      if (existing) return existing;

      // Create new config
      const { data, error } = await supabase
        .from("building_meter_configs")
        .insert({
          building_id: buildingId,
          price_per_kwh: 0.15
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["building-meter-config"] });
    },
    onError: (error) => {
      toast.error("Erreur lors de l'initialisation de la configuration");
      console.error(error);
    }
  });

  // Initialize default lots
  const initDefaultLots = useMutation({
    mutationFn: async (buildingId: string) => {
      // Check if lots already exist
      const { data: existing } = await supabase
        .from("meter_lots")
        .select("*")
        .eq("building_id", buildingId);

      if (existing && existing.length > 0) return existing;

      // Create default lots
      const defaultLots = [
        { building_id: buildingId, name: "Lot 1", client_name: "" },
        { building_id: buildingId, name: "Lot 2", client_name: "" },
        { building_id: buildingId, name: "Lot 3", client_name: "" }
      ];

      const { data, error } = await supabase
        .from("meter_lots")
        .insert(defaultLots)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meter-lots"] });
    },
    onError: (error) => {
      toast.error("Erreur lors de l'initialisation des lots");
      console.error(error);
    }
  });

  // Update price
  const updatePrice = useMutation({
    mutationFn: async ({ buildingId, price }: { buildingId: string; price: number }) => {
      const { data, error } = await supabase
        .from("building_meter_configs")
        .upsert({
          building_id: buildingId,
          price_per_kwh: price
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["building-meter-config"] });
      toast.success("Prix de refacturation mis à jour");
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour du prix");
      console.error(error);
    }
  });

  // Add lot
  const addLot = useMutation({
    mutationFn: async ({ buildingId, name }: { buildingId: string; name: string }) => {
      const { data, error } = await supabase
        .from("meter_lots")
        .insert({
          building_id: buildingId,
          name,
          client_name: ""
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meter-lots"] });
      toast.success("Nouveau lot ajouté");
    },
    onError: (error) => {
      toast.error("Erreur lors de l'ajout du lot");
      console.error(error);
    }
  });

  // Update lot
  const updateLot = useMutation({
    mutationFn: async ({ lotId, updates }: { lotId: string; updates: Partial<MeterLot> }) => {
      const { data, error } = await supabase
        .from("meter_lots")
        .update(updates)
        .eq("id", lotId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meter-lots"] });
      toast.success("Lot mis à jour");
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour du lot");
      console.error(error);
    }
  });

  // Delete lot
  const deleteLot = useMutation({
    mutationFn: async (lotId: string) => {
      const { error } = await supabase
        .from("meter_lots")
        .delete()
        .eq("id", lotId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meter-lots"] });
      toast.success("Lot supprimé");
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression du lot");
      console.error(error);
    }
  });

  // Add reading
  const addReading = useMutation({
    mutationFn: async (reading: Omit<MeterReading, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("meter_readings")
        .insert(reading)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meter-lots"] });
      toast.success("Relevé ajouté");
    },
    onError: (error) => {
      toast.error("Erreur lors de l'ajout du relevé");
      console.error(error);
    }
  });

  // Update reading
  const updateReading = useMutation({
    mutationFn: async ({ readingId, updates }: { readingId: string; updates: Partial<MeterReading> }) => {
      const { data, error } = await supabase
        .from("meter_readings")
        .update(updates)
        .eq("id", readingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meter-lots"] });
      toast.success("Relevé mis à jour");
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour du relevé");
      console.error(error);
    }
  });

  return {
    // Data
    meterConfig,
    lots: lots?.map(lot => ({
      ...lot,
      readings: lot.meter_readings || []
    })) || [],
    
    // Loading states
    isLoading: isLoadingConfig || isLoadingLots,
    
    // Mutations
    initBuildingConfig,
    initDefaultLots,
    updatePrice,
    addLot,
    updateLot,
    deleteLot,
    addReading,
    updateReading
  };
};