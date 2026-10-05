export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      agents: {
        Row: {
          created_at: string
          full_name: string
          id: string
          is_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      building_meter_configs: {
        Row: {
          building_id: string
          created_at: string
          id: string
          price_per_kwh: number
          updated_at: string
        }
        Insert: {
          building_id: string
          created_at?: string
          id?: string
          price_per_kwh?: number
          updated_at?: string
        }
        Update: {
          building_id?: string
          created_at?: string
          id?: string
          price_per_kwh?: number
          updated_at?: string
        }
        Relationships: []
      }
      buildings: {
        Row: {
          address: string
          client_billing_enabled: boolean
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          address: string
          client_billing_enabled?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          address?: string
          client_billing_enabled?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      control_documents: {
        Row: {
          created_at: string
          document_year: number | null
          file_path: string
          file_size: number
          file_type: string
          filename: string
          id: string
          notes: string | null
          original_filename: string
          regulatory_control_id: string
          status: string
          updated_at: string
          uploaded_by: string | null
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          created_at?: string
          document_year?: number | null
          file_path: string
          file_size: number
          file_type: string
          filename: string
          id?: string
          notes?: string | null
          original_filename: string
          regulatory_control_id: string
          status?: string
          updated_at?: string
          uploaded_by?: string | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          created_at?: string
          document_year?: number | null
          file_path?: string
          file_size?: number
          file_type?: string
          filename?: string
          id?: string
          notes?: string | null
          original_filename?: string
          regulatory_control_id?: string
          status?: string
          updated_at?: string
          uploaded_by?: string | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_control_documents_regulatory_control"
            columns: ["regulatory_control_id"]
            isOneToOne: false
            referencedRelation: "regulatory_controls"
            referencedColumns: ["id"]
          },
        ]
      }
      control_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      electrical_meters: {
        Row: {
          building_id: string
          contract_reference: string | null
          created_at: string
          id: string
          is_active: boolean
          meter_number: string
          name: string
          notes: string | null
          pdl_number: string | null
          supplier: string | null
          updated_at: string
        }
        Insert: {
          building_id: string
          contract_reference?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          meter_number: string
          name: string
          notes?: string | null
          pdl_number?: string | null
          supplier?: string | null
          updated_at?: string
        }
        Update: {
          building_id?: string
          contract_reference?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          meter_number?: string
          name?: string
          notes?: string | null
          pdl_number?: string | null
          supplier?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      meter_lots: {
        Row: {
          building_id: string
          client_name: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          building_id: string
          client_name?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          building_id?: string
          client_name?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      meter_readings: {
        Row: {
          amount: number
          consumption: number
          created_at: string
          current_reading: number
          id: string
          lot_id: string
          month: string
          previous_reading: number
          updated_at: string
          year: number
        }
        Insert: {
          amount: number
          consumption: number
          created_at?: string
          current_reading: number
          id?: string
          lot_id: string
          month: string
          previous_reading?: number
          updated_at?: string
          year: number
        }
        Update: {
          amount?: number
          consumption?: number
          created_at?: string
          current_reading?: number
          id?: string
          lot_id?: string
          month?: string
          previous_reading?: number
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "meter_readings_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "meter_lots"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          pin_code: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          pin_code: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          pin_code?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      provider_buildings: {
        Row: {
          building_id: string
          created_at: string
          id: string
          provider_id: string
        }
        Insert: {
          building_id: string
          created_at?: string
          id?: string
          provider_id: string
        }
        Update: {
          building_id?: string
          created_at?: string
          id?: string
          provider_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_buildings_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_buildings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_contract_buildings: {
        Row: {
          building_id: string
          created_at: string
          id: string
          provider_contract_id: string
        }
        Insert: {
          building_id: string
          created_at?: string
          id?: string
          provider_contract_id: string
        }
        Update: {
          building_id?: string
          created_at?: string
          id?: string
          provider_contract_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_contract_buildings_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_contract_buildings_provider_contract_id_fkey"
            columns: ["provider_contract_id"]
            isOneToOne: false
            referencedRelation: "provider_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_contracts: {
        Row: {
          created_at: string
          file_path: string
          file_size: number
          file_type: string
          filename: string
          id: string
          notes: string | null
          original_filename: string
          provider_id: string
          status: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_path: string
          file_size: number
          file_type: string
          filename: string
          id?: string
          notes?: string | null
          original_filename: string
          provider_id: string
          status?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_path?: string
          file_size?: number
          file_type?: string
          filename?: string
          id?: string
          notes?: string | null
          original_filename?: string
          provider_id?: string
          status?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_contracts_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_specialities: {
        Row: {
          created_at: string
          id: string
          provider_id: string
          speciality_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          provider_id: string
          speciality_id: string
        }
        Update: {
          created_at?: string
          id?: string
          provider_id?: string
          speciality_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_specialities_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_specialities_speciality_id_fkey"
            columns: ["speciality_id"]
            isOneToOne: false
            referencedRelation: "specialities"
            referencedColumns: ["id"]
          },
        ]
      }
      providers: {
        Row: {
          address: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          is_active: boolean
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      regulatory_controls: {
        Row: {
          actual_cost: number | null
          assigned_provider_id: string | null
          building_id: string
          completed_date: string | null
          control_type_id: string
          created_at: string
          created_by: string | null
          due_date: string
          estimated_cost: number | null
          id: string
          next_due_date: string | null
          notes: string | null
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          actual_cost?: number | null
          assigned_provider_id?: string | null
          building_id: string
          completed_date?: string | null
          control_type_id: string
          created_at?: string
          created_by?: string | null
          due_date: string
          estimated_cost?: number | null
          id?: string
          next_due_date?: string | null
          notes?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          actual_cost?: number | null
          assigned_provider_id?: string | null
          building_id?: string
          completed_date?: string | null
          control_type_id?: string
          created_at?: string
          created_by?: string | null
          due_date?: string
          estimated_cost?: number | null
          id?: string
          next_due_date?: string | null
          notes?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "regulatory_controls_assigned_provider_id_fkey"
            columns: ["assigned_provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "regulatory_controls_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "regulatory_controls_control_type_id_fkey"
            columns: ["control_type_id"]
            isOneToOne: false
            referencedRelation: "control_types"
            referencedColumns: ["id"]
          },
        ]
      }
      specialities: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      task_comments: {
        Row: {
          author: string
          comment_type: string
          created_at: string
          id: string
          photo_filename: string | null
          photo_url: string | null
          task_id: string
          text: string
        }
        Insert: {
          author: string
          comment_type?: string
          created_at?: string
          id?: string
          photo_filename?: string | null
          photo_url?: string | null
          task_id: string
          text: string
        }
        Update: {
          author?: string
          comment_type?: string
          created_at?: string
          id?: string
          photo_filename?: string | null
          photo_url?: string | null
          task_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_photos: {
        Row: {
          filename: string
          id: string
          task_id: string
          uploaded_at: string
          url: string
        }
        Insert: {
          filename: string
          id?: string
          task_id: string
          uploaded_at?: string
          url: string
        }
        Update: {
          filename?: string
          id?: string
          task_id?: string
          uploaded_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_photos_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to_id: string | null
          building_id: string
          created_at: string
          description: string
          due_date: string
          id: string
          priority: number
          proof_photo: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to_id?: string | null
          building_id: string
          created_at?: string
          description: string
          due_date: string
          id?: string
          priority?: number
          proof_photo?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to_id?: string | null
          building_id?: string
          created_at?: string
          description?: string
          due_date?: string
          id?: string
          priority?: number
          proof_photo?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_id_fkey"
            columns: ["assigned_to_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tasks_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      log_activity: {
        Args: {
          p_action: string
          p_details?: Json
          p_entity_id?: string
          p_entity_type: string
          p_user_id: string
        }
        Returns: string
      }
    }
    Enums: {
      user_role: "admin" | "supervisor" | "agent" | "facility_manager"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["admin", "supervisor", "agent", "facility_manager"],
    },
  },
} as const
