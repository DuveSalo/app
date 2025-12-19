export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          company_id: string | null
          created_at: string
          id: string
          ip_address: unknown
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          company_id?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          company_id?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string
          city: string
          country: string
          created_at: string | null
          cuit: string
          email: string | null
          id: string
          is_subscribed: boolean | null
          locality: string
          name: string
          owner_entity: string | null
          payment_methods: Json | null
          phone: string | null
          postal_code: string
          province: string
          rama_key: string | null
          selected_plan: string | null
          services: Json | null
          subscription_renewal_date: string | null
          subscription_status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address: string
          city: string
          country?: string
          created_at?: string | null
          cuit: string
          email?: string | null
          id?: string
          is_subscribed?: boolean | null
          locality: string
          name: string
          owner_entity?: string | null
          payment_methods?: Json | null
          phone?: string | null
          postal_code: string
          province: string
          rama_key?: string | null
          selected_plan?: string | null
          services?: Json | null
          subscription_renewal_date?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string
          city?: string
          country?: string
          created_at?: string | null
          cuit?: string
          email?: string | null
          id?: string
          is_subscribed?: boolean | null
          locality?: string
          name?: string
          owner_entity?: string | null
          payment_methods?: Json | null
          phone?: string | null
          postal_code?: string
          province?: string
          rama_key?: string | null
          selected_plan?: string | null
          services?: Json | null
          subscription_renewal_date?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      conservation_certificates: {
        Row: {
          company_id: string
          created_at: string | null
          expiration_date: string
          id: string
          intervener: string
          pdf_file_name: string | null
          pdf_file_path: string | null
          pdf_file_url: string | null
          presentation_date: string
          registration_number: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          expiration_date: string
          id?: string
          intervener: string
          pdf_file_name?: string | null
          pdf_file_path?: string | null
          pdf_file_url?: string | null
          presentation_date: string
          registration_number: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          expiration_date?: string
          id?: string
          intervener?: string
          pdf_file_name?: string | null
          pdf_file_path?: string | null
          pdf_file_url?: string | null
          presentation_date?: string
          registration_number?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conservation_certificates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          company_id: string
          created_at: string | null
          email: string
          id: string
          name: string
          role: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          email: string
          id?: string
          name: string
          role: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          company_id: string
          corrective_actions: string
          created_at: string | null
          date: string
          description: string
          final_checks: Json | null
          id: string
          observations: Json | null
          testimonials: Json | null
          time: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          corrective_actions: string
          created_at?: string | null
          date: string
          description: string
          final_checks?: Json | null
          id?: string
          observations?: Json | null
          testimonials?: Json | null
          time: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          corrective_actions?: string
          created_at?: string | null
          date?: string
          description?: string
          final_checks?: Json | null
          id?: string
          observations?: Json | null
          testimonials?: Json | null
          time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      fire_extinguishers: {
        Row: {
          access_obstructed: string
          cabinet_clean: string
          capacity: string
          charge_expiration_date: string
          class: string
          company_id: string
          container_condition: string
          control_date: string
          created_at: string
          door_opens_easily: string
          extinguisher_number: string
          glass_condition: string
          has_seal_and_safety: boolean
          hydraulic_pressure_expiration_date: string
          id: string
          instructions_legible: boolean
          labels_legible: boolean
          manufacturing_year: string
          nozzle_condition: string
          observations: string
          position_number: string
          pressure_within_range: boolean
          signage_condition: string
          signage_floor: string
          signage_height: string
          signage_wall: string
          tag_color: string
          type: string
          updated_at: string
          visibility_obstructed: string
        }
        Insert: {
          access_obstructed?: string
          cabinet_clean: string
          capacity: string
          charge_expiration_date: string
          class: string
          company_id: string
          container_condition: string
          control_date: string
          created_at?: string
          door_opens_easily: string
          extinguisher_number: string
          glass_condition: string
          has_seal_and_safety?: boolean
          hydraulic_pressure_expiration_date: string
          id?: string
          instructions_legible?: boolean
          labels_legible?: boolean
          manufacturing_year: string
          nozzle_condition: string
          observations?: string
          position_number: string
          pressure_within_range?: boolean
          signage_condition?: string
          signage_floor?: string
          signage_height?: string
          signage_wall?: string
          tag_color: string
          type: string
          updated_at?: string
          visibility_obstructed?: string
        }
        Update: {
          access_obstructed?: string
          cabinet_clean?: string
          capacity?: string
          charge_expiration_date?: string
          class?: string
          company_id?: string
          container_condition?: string
          control_date?: string
          created_at?: string
          door_opens_easily?: string
          extinguisher_number?: string
          glass_condition?: string
          has_seal_and_safety?: boolean
          hydraulic_pressure_expiration_date?: string
          id?: string
          instructions_legible?: boolean
          labels_legible?: boolean
          manufacturing_year?: string
          nozzle_condition?: string
          observations?: string
          position_number?: string
          pressure_within_range?: boolean
          signage_condition?: string
          signage_floor?: string
          signage_height?: string
          signage_wall?: string
          tag_color?: string
          type?: string
          updated_at?: string
          visibility_obstructed?: string
        }
        Relationships: [
          {
            foreignKeyName: "fire_extinguishers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          category: string
          company_id: string
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          read_at: string | null
          related_id: string | null
          related_table: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          category: string
          company_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          read_at?: string | null
          related_id?: string | null
          related_table?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          category?: string
          company_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          read_at?: string | null
          related_id?: string | null
          related_table?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_documents: {
        Row: {
          company_id: string
          created_at: string | null
          document_name: string
          extracted_date: string | null
          floor: string | null
          id: string
          pdf_file_path: string | null
          pdf_file_url: string | null
          qr_code_data: string | null
          type: string
          unit: string | null
          updated_at: string | null
          upload_date: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          document_name: string
          extracted_date?: string | null
          floor?: string | null
          id?: string
          pdf_file_path?: string | null
          pdf_file_url?: string | null
          qr_code_data?: string | null
          type: string
          unit?: string | null
          updated_at?: string | null
          upload_date: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          document_name?: string
          extracted_date?: string | null
          floor?: string | null
          id?: string
          pdf_file_path?: string | null
          pdf_file_url?: string | null
          qr_code_data?: string | null
          type?: string
          unit?: string | null
          updated_at?: string | null
          upload_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      self_protection_systems: {
        Row: {
          company_id: string
          created_at: string | null
          drills: Json | null
          expiration_date: string | null
          extension_date: string | null
          extension_pdf_name: string | null
          extension_pdf_path: string | null
          extension_pdf_url: string | null
          id: string
          intervener: string | null
          probatory_disposition_date: string | null
          probatory_disposition_pdf_name: string | null
          probatory_disposition_pdf_path: string | null
          probatory_disposition_pdf_url: string | null
          registration_number: string | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          drills?: Json | null
          expiration_date?: string | null
          extension_date?: string | null
          extension_pdf_name?: string | null
          extension_pdf_path?: string | null
          extension_pdf_url?: string | null
          id?: string
          intervener?: string | null
          probatory_disposition_date?: string | null
          probatory_disposition_pdf_name?: string | null
          probatory_disposition_pdf_path?: string | null
          probatory_disposition_pdf_url?: string | null
          registration_number?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          drills?: Json | null
          expiration_date?: string | null
          extension_date?: string | null
          extension_pdf_name?: string | null
          extension_pdf_path?: string | null
          extension_pdf_url?: string | null
          id?: string
          intervener?: string | null
          probatory_disposition_date?: string | null
          probatory_disposition_pdf_name?: string | null
          probatory_disposition_pdf_path?: string | null
          probatory_disposition_pdf_url?: string | null
          registration_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "self_protection_systems_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      recent_activity: {
        Row: {
          activity_date: string | null
          activity_id: string | null
          activity_type: string | null
          company_id: string | null
          description: string | null
          title: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_certificate_expiration_notifications: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_inspection_due_notifications: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_self_protection_system: {
        Args: {
          p_company_id: string
          p_drills: string
          p_expiration_date: string
          p_extension_date: string
          p_extension_pdf_name?: string
          p_intervener: string
          p_probatory_disposition_date: string
          p_probatory_disposition_pdf_name?: string
          p_registration_number: string
        }
        Returns: string
      }
      get_company_dashboard_stats: {
        Args: { p_company_id: string }
        Returns: Json
      }
      update_self_protection_system: {
        Args: {
          p_company_id: string
          p_drills: string
          p_expiration_date: string
          p_extension_date: string
          p_extension_pdf_name?: string
          p_id: string
          p_intervener: string
          p_probatory_disposition_date: string
          p_probatory_disposition_pdf_name?: string
          p_registration_number: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
