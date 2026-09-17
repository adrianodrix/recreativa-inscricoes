export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      eventos: {
        Row: {
          aberto_manual: boolean
          agradecimento: Json
          atualizado_em: string
          boas_vindas: Json | null
          capa_path: string | null
          criado_em: string
          data_evento: string
          endereco: string
          hora_fim: string
          hora_inicio: string
          id: string
          inscricoes_fim: string
          inscricoes_inicio: string
          limite_inscritos: number
          link_maps: string
          montagem_confirmada_em: string | null
          montagem_confirmada_por: string | null
          montagem_semente: number | null
          montagem_status: Database["public"]["Enums"]["status_montagem"]
          nome: string
          recomendacoes: Json | null
          slug: string
          valor_inscricao: number
        }
        Insert: {
          aberto_manual?: boolean
          agradecimento: Json
          atualizado_em?: string
          boas_vindas?: Json | null
          capa_path?: string | null
          criado_em?: string
          data_evento: string
          endereco: string
          hora_fim: string
          hora_inicio: string
          id?: string
          inscricoes_fim: string
          inscricoes_inicio: string
          limite_inscritos: number
          link_maps: string
          montagem_confirmada_em?: string | null
          montagem_confirmada_por?: string | null
          montagem_semente?: number | null
          montagem_status?: Database["public"]["Enums"]["status_montagem"]
          nome: string
          recomendacoes?: Json | null
          slug: string
          valor_inscricao?: number
        }
        Update: {
          aberto_manual?: boolean
          agradecimento?: Json
          atualizado_em?: string
          boas_vindas?: Json | null
          capa_path?: string | null
          criado_em?: string
          data_evento?: string
          endereco?: string
          hora_fim?: string
          hora_inicio?: string
          id?: string
          inscricoes_fim?: string
          inscricoes_inicio?: string
          limite_inscritos?: number
          link_maps?: string
          montagem_confirmada_em?: string | null
          montagem_confirmada_por?: string | null
          montagem_semente?: number | null
          montagem_status?: Database["public"]["Enums"]["status_montagem"]
          nome?: string
          recomendacoes?: Json | null
          slug?: string
          valor_inscricao?: number
        }
        Relationships: []
      }
      limites_comida: {
        Row: {
          evento_id: string
          limite: number
          tipo: Database["public"]["Enums"]["tipo_comida"]
        }
        Insert: {
          evento_id: string
          limite: number
          tipo: Database["public"]["Enums"]["tipo_comida"]
        }
        Update: {
          evento_id?: string
          limite?: number
          tipo?: Database["public"]["Enums"]["tipo_comida"]
        }
        Relationships: [
          {
            foreignKeyName: "limites_comida_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios_painel: {
        Row: {
          ativo: boolean
          atualizado_em: string
          criado_em: string
          email: string
          id: string
          nome: string
          perfil: Database["public"]["Enums"]["perfil_usuario"]
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          criado_em?: string
          email: string
          id: string
          nome: string
          perfil?: Database["public"]["Enums"]["perfil_usuario"]
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          criado_em?: string
          email?: string
          id?: string
          nome?: string
          perfil?: Database["public"]["Enums"]["perfil_usuario"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calcular_idade: {
        Args: { nascimento: string; referencia: string }
        Returns: number
      }
      evento_inicio_em: {
        Args: { e: Database["public"]["Tables"]["eventos"]["Row"] }
        Returns: string
      }
      normalizar_nome: { Args: { nome: string }; Returns: string }
      perfil_atual: {
        Args: never
        Returns: Database["public"]["Enums"]["perfil_usuario"]
      }
    }
    Enums: {
      categoria_brincadeira: "casais" | "jovens" | "criancas" | "pais_e_filhos"
      formato_brincadeira: "individual" | "em_grupo"
      papel_participante:
        | "pessoa"
        | "conjuge"
        | "filho"
        | "pai"
        | "mae"
        | "responsavel"
      perfil_usuario: "analitico" | "operador" | "administrador"
      situacao_dependente:
        | "cadastrado"
        | "vai_se_cadastrar"
        | "nao_quer_cadastrar"
      status_envio: "pendente" | "enviando" | "enviado" | "falhou"
      status_montagem: "rascunho" | "confirmado"
      tipo_aviso:
        | "confirmacao_inscricao"
        | "times_confirmacao"
        | "times_alteracao"
        | "times_lembrete"
      tipo_comida: "salgado" | "doce" | "refrigerante" | "suco"
      tipo_vinculo: "principal" | "conjuge" | "filho"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      categoria_brincadeira: ["casais", "jovens", "criancas", "pais_e_filhos"],
      formato_brincadeira: ["individual", "em_grupo"],
      papel_participante: [
        "pessoa",
        "conjuge",
        "filho",
        "pai",
        "mae",
        "responsavel",
      ],
      perfil_usuario: ["analitico", "operador", "administrador"],
      situacao_dependente: [
        "cadastrado",
        "vai_se_cadastrar",
        "nao_quer_cadastrar",
      ],
      status_envio: ["pendente", "enviando", "enviado", "falhou"],
      status_montagem: ["rascunho", "confirmado"],
      tipo_aviso: [
        "confirmacao_inscricao",
        "times_confirmacao",
        "times_alteracao",
        "times_lembrete",
      ],
      tipo_comida: ["salgado", "doce", "refrigerante", "suco"],
      tipo_vinculo: ["principal", "conjuge", "filho"],
    },
  },
} as const

