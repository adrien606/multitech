import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Meter {
  id: string;
  building_id: string;
  meter_number: string;
  meter_type: string;
  location: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  buildings?: {
    name: string;
    address: string;
  };
}

export interface MeterReading {
  id: string;
  meter_id: string;
  reading_date: string;
  kwh_value: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  meters?: {
    meter_number: string;
    buildings?: {
      name: string;
    };
  };
}

export const useMeters = () => {
  const [meters, setMeters] = useState<Meter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeters = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('meters')
        .select(`
          *,
          buildings (
            name,
            address
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMeters(data || []);
    } catch (err) {
      console.error('Error fetching meters:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des compteurs');
    } finally {
      setLoading(false);
    }
  };

  const createMeter = async (meterData: Pick<Meter, 'building_id' | 'meter_number' | 'meter_type' | 'location'>) => {
    try {
      const { data, error } = await supabase
        .from('meters')
        .insert([meterData])
        .select(`
          *,
          buildings (
            name,
            address
          )
        `)
        .single();

      if (error) throw error;
      
      setMeters(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err) {
      console.error('Error creating meter:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erreur lors de la création' };
    }
  };

  const updateMeter = async (id: string, meterData: Partial<Pick<Meter, 'meter_number' | 'meter_type' | 'location' | 'is_active'>>) => {
    try {
      const { data, error } = await supabase
        .from('meters')
        .update(meterData)
        .eq('id', id)
        .select(`
          *,
          buildings (
            name,
            address
          )
        `)
        .single();

      if (error) throw error;
      
      setMeters(prev => prev.map(meter => 
        meter.id === id ? { ...meter, ...data } : meter
      ));
      return { data, error: null };
    } catch (err) {
      console.error('Error updating meter:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erreur lors de la mise à jour' };
    }
  };

  const deleteMeter = async (id: string) => {
    try {
      const { error } = await supabase
        .from('meters')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setMeters(prev => prev.filter(meter => meter.id !== id));
      return { error: null };
    } catch (err) {
      console.error('Error deleting meter:', err);
      return { error: err instanceof Error ? err.message : 'Erreur lors de la suppression' };
    }
  };

  useEffect(() => {
    fetchMeters();
  }, []);

  return {
    meters,
    loading,
    error,
    refetch: fetchMeters,
    createMeter,
    updateMeter,
    deleteMeter,
  };
};

export const useMeterReadings = (meterId?: string) => {
  const [readings, setReadings] = useState<MeterReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReadings = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('meter_readings')
        .select(`
          *,
          meters (
            meter_number,
            buildings (
              name
            )
          )
        `)
        .order('reading_date', { ascending: false });

      if (meterId) {
        query = query.eq('meter_id', meterId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setReadings(data || []);
    } catch (err) {
      console.error('Error fetching meter readings:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des relevés');
    } finally {
      setLoading(false);
    }
  };

  const createReading = async (readingData: Pick<MeterReading, 'meter_id' | 'reading_date' | 'kwh_value' | 'notes'>) => {
    try {
      const { data, error } = await supabase
        .from('meter_readings')
        .insert([readingData])
        .select(`
          *,
          meters (
            meter_number,
            buildings (
              name
            )
          )
        `)
        .single();

      if (error) throw error;
      
      setReadings(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err) {
      console.error('Error creating reading:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erreur lors de la création' };
    }
  };

  const updateReading = async (id: string, readingData: Partial<Pick<MeterReading, 'reading_date' | 'kwh_value' | 'notes'>>) => {
    try {
      const { data, error } = await supabase
        .from('meter_readings')
        .update(readingData)
        .eq('id', id)
        .select(`
          *,
          meters (
            meter_number,
            buildings (
              name
            )
          )
        `)
        .single();

      if (error) throw error;
      
      setReadings(prev => prev.map(reading => 
        reading.id === id ? { ...reading, ...data } : reading
      ));
      return { data, error: null };
    } catch (err) {
      console.error('Error updating reading:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erreur lors de la mise à jour' };
    }
  };

  const deleteReading = async (id: string) => {
    try {
      const { error } = await supabase
        .from('meter_readings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setReadings(prev => prev.filter(reading => reading.id !== id));
      return { error: null };
    } catch (err) {
      console.error('Error deleting reading:', err);
      return { error: err instanceof Error ? err.message : 'Erreur lors de la suppression' };
    }
  };

  useEffect(() => {
    fetchReadings();
  }, [meterId]);

  return {
    readings,
    loading,
    error,
    refetch: fetchReadings,
    createReading,
    updateReading,
    deleteReading,
  };
};