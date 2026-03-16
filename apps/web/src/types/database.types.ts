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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string
          id: string
          metadata: Json | null
          target_id: string
          target_type: string
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          target_id: string
          target_type: string
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
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
          bank_transfer_status: string | null
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
          payment_method: string
          payment_methods: Json | null
          phone: string | null
          postal_code: string
          province: string
          rama_key: string | null
          selected_plan: string | null
          services: Json | null
          subscription_renewal_date: string | null
          subscription_status: string | null
          trial_ends_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address: string
          bank_transfer_status?: string | null
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
          payment_method?: string
          payment_methods?: Json | null
          phone?: string | null
          postal_code: string
          province: string
          rama_key?: string | null
          selected_plan?: string | null
          services?: Json | null
          subscription_renewal_date?: string | null
          subscription_status?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string
          bank_transfer_status?: string | null
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
          payment_method?: string
          payment_methods?: Json | null
          phone?: string | null
          postal_code?: string
          province?: string
          rama_key?: string | null
          selected_plan?: string | null
          services?: Json | null
          subscription_renewal_date?: string | null
          subscription_status?: string | null
          trial_ends_at?: string | null
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
      manual_payments: {
        Row: {
          amount: number
          company_id: string
          created_at: string
          id: string
          period_end: string
          period_start: string
          receipt_uploaded_at: string | null
          receipt_url: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          company_id: string
          created_at?: string
          id?: string
          period_end: string
          period_start: string
          receipt_uploaded_at?: string | null
          receipt_url?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string
          id?: string
          period_end?: string
          period_start?: string
          receipt_uploaded_at?: string | null
          receipt_url?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "manual_payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      mp_webhook_log: {
        Row: {
          action: string
          data_id: string
          id: string
          notification_id: string
          payload: Json
          processed: boolean
          processing_error: string | null
          received_at: string
          type: string
        }
        Insert: {
          action: string
          data_id: string
          id?: string
          notification_id: string
          payload: Json
          processed?: boolean
          processing_error?: string | null
          received_at?: string
          type: string
        }
        Update: {
          action?: string
          data_id?: string
          id?: string
          notification_id?: string
          payload?: Json
          processed?: boolean
          processing_error?: string | null
          received_at?: string
          type?: string
        }
        Relationships: []
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
      payment_transactions: {
        Row: {
          company_id: string
          created_at: string
          currency: string
          fee_amount: number | null
          gross_amount: number
          id: string
          net_amount: number | null
          paid_at: string | null
          paypal_transaction_id: string
          status: string
          subscription_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          currency?: string
          fee_amount?: number | null
          gross_amount: number
          id?: string
          net_amount?: number | null
          paid_at?: string | null
          paypal_transaction_id: string
          status: string
          subscription_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          currency?: string
          fee_amount?: number | null
          gross_amount?: number
          id?: string
          net_amount?: number | null
          paid_at?: string | null
          paypal_transaction_id?: string
          status?: string
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      paypal_webhook_log: {
        Row: {
          event_id: string
          event_type: string
          id: string
          payload: Json
          processed: boolean
          processing_error: string | null
          received_at: string
          resource_id: string | null
          resource_type: string | null
        }
        Insert: {
          event_id: string
          event_type: string
          id?: string
          payload: Json
          processed?: boolean
          processing_error?: string | null
          received_at?: string
          resource_id?: string | null
          resource_type?: string | null
        }
        Update: {
          event_id?: string
          event_type?: string
          id?: string
          payload?: Json
          processed?: boolean
          processing_error?: string | null
          received_at?: string
          resource_id?: string | null
          resource_type?: string | null
        }
        Relationships: []
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
      subscription_plans: {
        Row: {
          created_at: string
          description: string
          features: string[]
          highlighted: boolean
          id: string
          is_active: boolean
          key: string
          name: string
          price: number
          sort_order: number
          tag: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          features?: string[]
          highlighted?: boolean
          id?: string
          is_active?: boolean
          key: string
          name: string
          price: number
          sort_order?: number
          tag?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          features?: string[]
          highlighted?: boolean
          id?: string
          is_active?: boolean
          key?: string
          name?: string
          price?: number
          sort_order?: number
          tag?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          activated_at: string | null
          amount: number
          cancelled_at: string | null
          company_id: string
          created_at: string
          currency: string
          current_period_end: string | null
          current_period_start: string | null
          failed_payments_count: number
          id: string
          mp_plan_id: string | null
          mp_preapproval_id: string | null
          next_billing_time: string | null
          payment_provider: string
          paypal_plan_id: string | null
          paypal_subscription_id: string | null
          plan_key: string
          plan_name: string
          status: string
          subscriber_email: string | null
          suspended_at: string | null
          updated_at: string
        }
        Insert: {
          activated_at?: string | null
          amount: number
          cancelled_at?: string | null
          company_id: string
          created_at?: string
          currency?: string
          current_period_end?: string | null
          current_period_start?: string | null
          failed_payments_count?: number
          id?: string
          mp_plan_id?: string | null
          mp_preapproval_id?: string | null
          next_billing_time?: string | null
          payment_provider?: string
          paypal_plan_id?: string | null
          paypal_subscription_id?: string | null
          plan_key: string
          plan_name: string
          status?: string
          subscriber_email?: string | null
          suspended_at?: string | null
          updated_at?: string
        }
        Update: {
          activated_at?: string | null
          amount?: number
          cancelled_at?: string | null
          company_id?: string
          created_at?: string
          currency?: string
          current_period_end?: string | null
          current_period_start?: string | null
          failed_payments_count?: number
          id?: string
          mp_plan_id?: string | null
          mp_preapproval_id?: string | null
          next_billing_time?: string | null
          payment_provider?: string
          paypal_plan_id?: string | null
          paypal_subscription_id?: string | null
          plan_key?: string
          plan_name?: string
          status?: string
          subscriber_email?: string | null
          suspended_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_company_id_fkey"
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
        Args: never
        Returns: undefined
      }
      create_inspection_due_notifications: { Args: never; Returns: undefined }
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
      is_admin: { Args: never; Returns: boolean }
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
