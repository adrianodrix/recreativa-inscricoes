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
      brincadeiras: {
        Row: {
          ativo: boolean
          atualizado_em: string
          categoria: Database["public"]["Enums"]["categoria_brincadeira"]
          criado_em: string
          evento_id: string
          formato: Database["public"]["Enums"]["formato_brincadeira"] | null
          foto_path: string | null
          id: string
          limite_participantes: number
          nome: string
          ordem: number
          regras: Json
          video_url: string | null
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          categoria: Database["public"]["Enums"]["categoria_brincadeira"]
          criado_em?: string
          evento_id: string
          formato?: Database["public"]["Enums"]["formato_brincadeira"] | null
          foto_path?: string | null
          id?: string
          limite_participantes: number
          nome: string
          ordem?: number
          regras: Json
          video_url?: string | null
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          categoria?: Database["public"]["Enums"]["categoria_brincadeira"]
          criado_em?: string
          evento_id?: string
          formato?: Database["public"]["Enums"]["formato_brincadeira"] | null
          foto_path?: string | null
          id?: string
          limite_participantes?: number
          nome?: string
          ordem?: number
          regras?: Json
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brincadeiras_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      colaboracoes: {
        Row: {
          evento_id: string
          inscrito_id: string
          tipo: Database["public"]["Enums"]["tipo_comida"]
        }
        Insert: {
          evento_id: string
          inscrito_id: string
          tipo: Database["public"]["Enums"]["tipo_comida"]
        }
        Update: {
          evento_id?: string
          inscrito_id?: string
          tipo?: Database["public"]["Enums"]["tipo_comida"]
        }
        Relationships: [
          {
            foreignKeyName: "colaboracoes_inscrito_id_evento_id_fkey"
            columns: ["inscrito_id", "evento_id"]
            isOneToOne: false
            referencedRelation: "inscritos"
            referencedColumns: ["id", "evento_id"]
          },
        ]
      }
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
      inscritos: {
        Row: {
          apelido: string | null
          atualizado_em: string
          casado: boolean
          conjuge_situacao:
            | Database["public"]["Enums"]["situacao_dependente"]
            | null
          criado_por: string | null
          data_nascimento: string
          evento_id: string
          filhos_situacao:
            | Database["public"]["Enums"]["situacao_dependente"]
            | null
          id: string
          idade: number
          inscrito_em: string
          inscrito_principal_id: string | null
          nome_completo: string
          nome_normalizado: string | null
          tem_filhos_menores: boolean
          vinculo: Database["public"]["Enums"]["tipo_vinculo"]
          whatsapp: string | null
        }
        Insert: {
          apelido?: string | null
          atualizado_em?: string
          casado?: boolean
          conjuge_situacao?:
            | Database["public"]["Enums"]["situacao_dependente"]
            | null
          criado_por?: string | null
          data_nascimento: string
          evento_id: string
          filhos_situacao?:
            | Database["public"]["Enums"]["situacao_dependente"]
            | null
          id?: string
          idade: number
          inscrito_em?: string
          inscrito_principal_id?: string | null
          nome_completo: string
          nome_normalizado?: string | null
          tem_filhos_menores?: boolean
          vinculo: Database["public"]["Enums"]["tipo_vinculo"]
          whatsapp?: string | null
        }
        Update: {
          apelido?: string | null
          atualizado_em?: string
          casado?: boolean
          conjuge_situacao?:
            | Database["public"]["Enums"]["situacao_dependente"]
            | null
          criado_por?: string | null
          data_nascimento?: string
          evento_id?: string
          filhos_situacao?:
            | Database["public"]["Enums"]["situacao_dependente"]
            | null
          id?: string
          idade?: number
          inscrito_em?: string
          inscrito_principal_id?: string | null
          nome_completo?: string
          nome_normalizado?: string | null
          tem_filhos_menores?: boolean
          vinculo?: Database["public"]["Enums"]["tipo_vinculo"]
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inscritos_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscritos_inscrito_principal_id_evento_id_fkey"
            columns: ["inscrito_principal_id", "evento_id"]
            isOneToOne: false
            referencedRelation: "inscritos"
            referencedColumns: ["id", "evento_id"]
          },
        ]
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
      membros_time: {
        Row: {
          atualizado_em: string
          evento_id: string
          inscrito_id: string
          time_id: string
          time_notificado_id: string | null
        }
        Insert: {
          atualizado_em?: string
          evento_id: string
          inscrito_id: string
          time_id: string
          time_notificado_id?: string | null
        }
        Update: {
          atualizado_em?: string
          evento_id?: string
          inscrito_id?: string
          time_id?: string
          time_notificado_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "membros_time_inscrito_id_evento_id_fkey"
            columns: ["inscrito_id", "evento_id"]
            isOneToOne: false
            referencedRelation: "inscritos"
            referencedColumns: ["id", "evento_id"]
          },
          {
            foreignKeyName: "membros_time_time_id_evento_id_fkey"
            columns: ["time_id", "evento_id"]
            isOneToOne: false
            referencedRelation: "times"
            referencedColumns: ["id", "evento_id"]
          },
          {
            foreignKeyName: "membros_time_time_notificado_id_fkey"
            columns: ["time_notificado_id"]
            isOneToOne: false
            referencedRelation: "times"
            referencedColumns: ["id"]
          },
        ]
      }
      participacoes: {
        Row: {
          brincadeira_id: string
          categoria: Database["public"]["Enums"]["categoria_brincadeira"]
          criado_em: string
          evento_id: string
          id: string
        }
        Insert: {
          brincadeira_id: string
          categoria: Database["public"]["Enums"]["categoria_brincadeira"]
          criado_em?: string
          evento_id: string
          id?: string
        }
        Update: {
          brincadeira_id?: string
          categoria?: Database["public"]["Enums"]["categoria_brincadeira"]
          criado_em?: string
          evento_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "participacoes_brincadeira_id_categoria_fkey"
            columns: ["brincadeira_id", "categoria"]
            isOneToOne: false
            referencedRelation: "brincadeiras"
            referencedColumns: ["id", "categoria"]
          },
          {
            foreignKeyName: "participacoes_brincadeira_id_evento_id_fkey"
            columns: ["brincadeira_id", "evento_id"]
            isOneToOne: false
            referencedRelation: "brincadeiras"
            referencedColumns: ["id", "evento_id"]
          },
        ]
      }
      participantes: {
        Row: {
          brincadeira_id: string
          evento_id: string
          inscrito_id: string
          papel: Database["public"]["Enums"]["papel_participante"]
          participacao_id: string
        }
        Insert: {
          brincadeira_id: string
          evento_id: string
          inscrito_id: string
          papel: Database["public"]["Enums"]["papel_participante"]
          participacao_id: string
        }
        Update: {
          brincadeira_id?: string
          evento_id?: string
          inscrito_id?: string
          papel?: Database["public"]["Enums"]["papel_participante"]
          participacao_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "participantes_inscrito_id_evento_id_fkey"
            columns: ["inscrito_id", "evento_id"]
            isOneToOne: false
            referencedRelation: "inscritos"
            referencedColumns: ["id", "evento_id"]
          },
          {
            foreignKeyName: "participantes_participacao_id_brincadeira_id_fkey"
            columns: ["participacao_id", "brincadeira_id"]
            isOneToOne: false
            referencedRelation: "participacoes"
            referencedColumns: ["id", "brincadeira_id"]
          },
        ]
      }
      times: {
        Row: {
          atualizado_em: string
          cor_padrao: string
          criado_em: string
          evento_id: string
          icone_padrao: string
          id: string
          imagem_path: string | null
          nome: string
          ordem: number
        }
        Insert: {
          atualizado_em?: string
          cor_padrao?: string
          criado_em?: string
          evento_id: string
          icone_padrao?: string
          id?: string
          imagem_path?: string | null
          nome: string
          ordem?: number
        }
        Update: {
          atualizado_em?: string
          cor_padrao?: string
          criado_em?: string
          evento_id?: string
          icone_padrao?: string
          id?: string
          imagem_path?: string | null
          nome?: string
          ordem?: number
        }
        Relationships: [
          {
            foreignKeyName: "times_evento_id_fkey"
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
      buscar_jovens_livres: {
        Args: { p_brincadeira_id: string; p_evento_id: string; p_termo: string }
        Returns: {
          apelido: string
          id: string
          nome_completo: string
        }[]
      }
      calcular_idade: {
        Args: { nascimento: string; referencia: string }
        Returns: number
      }
      categoria_elegivel: {
        Args: {
          p_casado: boolean
          p_categoria: Database["public"]["Enums"]["categoria_brincadeira"]
          p_idade: number
        }
        Returns: boolean
      }
      comida_disponivel: { Args: { p_evento_id: string }; Returns: Json }
      confirmar_montagem: { Args: { p_evento_id: string }; Returns: string[] }
      criar_inscricao: { Args: { p: Json }; Returns: Json }
      criar_inscricao_interno: {
        Args: { p: Json; p_ignorar_status: boolean }
        Returns: Json
      }
      criar_inscricao_painel: { Args: { p: Json }; Returns: Json }
      erro_inscricao: {
        Args: { p_codigo: string; p_detalhe?: Json }
        Returns: undefined
      }
      evento_inicio_em: {
        Args: { e: Database["public"]["Tables"]["eventos"]["Row"] }
        Returns: string
      }
      exigir_operador: { Args: never; Returns: undefined }
      inserir_pessoa: {
        Args: {
          p_evento: Database["public"]["Tables"]["eventos"]["Row"]
          p_pessoa: Json
          p_principal_id: string
          p_ref: string
          p_vinculo: Database["public"]["Enums"]["tipo_vinculo"]
        }
        Returns: string
      }
      listar_brincadeiras_disponiveis: {
        Args: { p_evento_id: string }
        Returns: {
          categoria: Database["public"]["Enums"]["categoria_brincadeira"]
          formato: Database["public"]["Enums"]["formato_brincadeira"]
          foto_path: string
          id: string
          limite_participantes: number
          nome: string
          ordem: number
          regras: Json
          vagas_restantes: number
          video_url: string
        }[]
      }
      motivo_fechado: {
        Args: {
          e: Database["public"]["Tables"]["eventos"]["Row"]
          p_total: number
        }
        Returns: string
      }
      normalizar_nome: { Args: { nome: string }; Returns: string }
      obter_evento_publico: { Args: { p_slug: string }; Returns: Json }
      painel_definir_comida: {
        Args: { p_inscrito_id: string; p_tipo: string }
        Returns: undefined
      }
      perfil_atual: {
        Args: never
        Returns: Database["public"]["Enums"]["perfil_usuario"]
      }
      registrar_colaboracao: {
        Args: {
          p_evento_id: string
          p_inscrito_id: string
          p_ref: string
          p_tipo: string
        }
        Returns: undefined
      }
      registrar_participacao: {
        Args: { p_evento_id: string; p_ids: Json; p_part: Json }
        Returns: undefined
      }
      salvar_montagem: {
        Args: { p_alocacao: Json; p_evento_id: string; p_semente: number }
        Returns: undefined
      }
      total_inscritos: { Args: { p_evento_id: string }; Returns: number }
      validar_nome_completo: { Args: { p_nome: string }; Returns: boolean }
      verificar_nome_disponivel: {
        Args: { p_evento_id: string; p_nome: string }
        Returns: boolean
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

