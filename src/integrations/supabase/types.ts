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
      agent_identities: {
        Row: {
          agent_id: string
          created_at: string
          creation_date: string
          id: string
          name: string
          updated_at: string
          version: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          creation_date?: string
          id?: string
          name: string
          updated_at?: string
          version?: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          creation_date?: string
          id?: string
          name?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      core_truths: {
        Row: {
          agent_identity_id: string
          category: string
          created_at: string
          id: string
          order_index: number
          truth: string
        }
        Insert: {
          agent_identity_id: string
          category: string
          created_at?: string
          id?: string
          order_index?: number
          truth: string
        }
        Update: {
          agent_identity_id?: string
          category?: string
          created_at?: string
          id?: string
          order_index?: number
          truth?: string
        }
        Relationships: [
          {
            foreignKeyName: "core_truths_agent_identity_id_fkey"
            columns: ["agent_identity_id"]
            isOneToOne: false
            referencedRelation: "agent_identities"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_anchors: {
        Row: {
          agent_identity_id: string
          anchor_type: string
          created_at: string
          description: string
          id: string
          reference_data: Json | null
        }
        Insert: {
          agent_identity_id: string
          anchor_type: string
          created_at?: string
          description: string
          id?: string
          reference_data?: Json | null
        }
        Update: {
          agent_identity_id?: string
          anchor_type?: string
          created_at?: string
          description?: string
          id?: string
          reference_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "memory_anchors_agent_identity_id_fkey"
            columns: ["agent_identity_id"]
            isOneToOne: false
            referencedRelation: "agent_identities"
            referencedColumns: ["id"]
          },
        ]
      }
      sacred_principles: {
        Row: {
          agent_identity_id: string
          created_at: string
          id: string
          principle_key: string
          principle_value: string
        }
        Insert: {
          agent_identity_id: string
          created_at?: string
          id?: string
          principle_key: string
          principle_value: string
        }
        Update: {
          agent_identity_id?: string
          created_at?: string
          id?: string
          principle_key?: string
          principle_value?: string
        }
        Relationships: [
          {
            foreignKeyName: "sacred_principles_agent_identity_id_fkey"
            columns: ["agent_identity_id"]
            isOneToOne: false
            referencedRelation: "agent_identities"
            referencedColumns: ["id"]
          },
        ]
      }
      truth_evolution_log: {
        Row: {
          agent_identity_id: string
          change_type: string
          created_at: string
          id: string
          new_value: string
          previous_value: string | null
          reason: string
        }
        Insert: {
          agent_identity_id: string
          change_type: string
          created_at?: string
          id?: string
          new_value: string
          previous_value?: string | null
          reason: string
        }
        Update: {
          agent_identity_id?: string
          change_type?: string
          created_at?: string
          id?: string
          new_value?: string
          previous_value?: string | null
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "truth_evolution_log_agent_identity_id_fkey"
            columns: ["agent_identity_id"]
            isOneToOne: false
            referencedRelation: "agent_identities"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
