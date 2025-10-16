export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          user_id: string
          name: string
          cuit: string
          address: string
          postal_code: string
          city: string
          locality: string
          province: string
          country: string
          rama_key: string | null
          owner_entity: string | null
          phone: string | null
          is_subscribed: boolean
          selected_plan: string | null
          subscription_status: string | null
          subscription_renewal_date: string | null
          services: Json
          payment_methods: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          cuit: string
          address: string
          postal_code: string
          city: string
          locality: string
          province: string
          country?: string
          rama_key?: string | null
          owner_entity?: string | null
          phone?: string | null
          is_subscribed?: boolean
          selected_plan?: string | null
          subscription_status?: string | null
          subscription_renewal_date?: string | null
          services?: Json
          payment_methods?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          cuit?: string
          address?: string
          postal_code?: string
          city?: string
          locality?: string
          province?: string
          country?: string
          rama_key?: string | null
          owner_entity?: string | null
          phone?: string | null
          is_subscribed?: boolean
          selected_plan?: string | null
          subscription_status?: string | null
          subscription_renewal_date?: string | null
          services?: Json
          payment_methods?: Json
          created_at?: string
          updated_at?: string
        }
      }
      employees: {
        Row: {
          id: string
          company_id: string
          name: string
          email: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          email: string
          role: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          email?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      conservation_certificates: {
        Row: {
          id: string
          company_id: string
          presentation_date: string
          expiration_date: string
          intervener: string
          registration_number: string
          pdf_file_url: string | null
          pdf_file_path: string | null
          pdf_file_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          presentation_date: string
          expiration_date: string
          intervener: string
          registration_number: string
          pdf_file_url?: string | null
          pdf_file_path?: string | null
          pdf_file_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          presentation_date?: string
          expiration_date?: string
          intervener?: string
          registration_number?: string
          pdf_file_url?: string | null
          pdf_file_path?: string | null
          pdf_file_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      self_protection_systems: {
        Row: {
          id: string
          company_id: string
          system_name: string
          system_type: string
          location: string
          installation_date: string | null
          last_inspection_date: string
          next_inspection_date: string
          inspection_frequency: string
          responsible_company: string
          status: string
          observations: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          system_name: string
          system_type: string
          location: string
          installation_date?: string | null
          last_inspection_date: string
          next_inspection_date: string
          inspection_frequency: string
          responsible_company: string
          status: string
          observations?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          system_name?: string
          system_type?: string
          location?: string
          installation_date?: string | null
          last_inspection_date?: string
          next_inspection_date?: string
          inspection_frequency?: string
          responsible_company?: string
          status?: string
          observations?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      qr_documents: {
        Row: {
          id: string
          company_id: string
          type: string
          document_name: string
          floor: string | null
          unit: string | null
          pdf_file_url: string | null
          pdf_file_path: string | null
          qr_code_data: string | null
          upload_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          type: string
          document_name: string
          floor?: string | null
          unit?: string | null
          pdf_file_url?: string | null
          pdf_file_path?: string | null
          qr_code_data?: string | null
          upload_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          type?: string
          document_name?: string
          floor?: string | null
          unit?: string | null
          pdf_file_url?: string | null
          pdf_file_path?: string | null
          qr_code_data?: string | null
          upload_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          company_id: string
          date: string
          time: string
          description: string
          corrective_actions: string
          testimonials: Json
          observations: Json
          final_checks: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          date: string
          time: string
          description: string
          corrective_actions: string
          testimonials?: Json
          observations?: Json
          final_checks?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          date?: string
          time?: string
          description?: string
          corrective_actions?: string
          testimonials?: Json
          observations?: Json
          final_checks?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
