import { supabase } from "@/lib/supabase"

// Tipos
export interface Receita {
  id: string
  created_at: string
  user_id: string
  valor: number
  descricao: string
  categoria: string
  data: string
}

export interface Despesa {
  id: string
  created_at: string
  user_id: string
  valor: number
  descricao: string
  categoria: string
  data: string
  pago: boolean
}

export interface Sonho {
  id: string
  created_at: string
  user_id: string
  titulo: string
  descricao: string
  valor_meta: number
  valor_atual: number
  data_meta: string
  categoria: string
  prioridade: number
}

// Serviços de Receitas
export const receitasService = {
  listar: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { data, error } = await supabase
      .from("receitas")
      .select("*")
      .eq("user_id", user.id)
      .order("data", { ascending: false })

    if (error) throw error
    return data
  },

  criar: async (receita: Omit<Receita, "id" | "created_at" | "user_id">) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { data, error } = await supabase
      .from("receitas")
      .insert([{ ...receita, user_id: user.id }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  atualizar: async (id: string, receita: Partial<Receita>) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { data, error } = await supabase
      .from("receitas")
      .update(receita)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  excluir: async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { error } = await supabase
      .from("receitas")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) throw error
  }
}

// Serviços de Despesas
export const despesasService = {
  listar: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { data, error } = await supabase
      .from("despesas")
      .select("*")
      .eq("user_id", user.id)
      .order("data", { ascending: false })

    if (error) throw error
    return data
  },

  criar: async (despesa: Omit<Despesa, "id" | "created_at" | "user_id">) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { data, error } = await supabase
      .from("despesas")
      .insert([{ ...despesa, user_id: user.id }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  atualizar: async (id: string, despesa: Partial<Despesa>) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { data, error } = await supabase
      .from("despesas")
      .update(despesa)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  excluir: async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { error } = await supabase
      .from("despesas")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) throw error
  }
}

// Serviços de Sonhos
export const sonhosService = {
  listar: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { data, error } = await supabase
      .from("sonhos")
      .select("*")
      .eq("user_id", user.id)
      .order("prioridade", { ascending: true })

    if (error) throw error
    return data
  },

  criar: async (sonho: Omit<Sonho, "id" | "created_at" | "user_id">) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { data, error } = await supabase
      .from("sonhos")
      .insert([{ ...sonho, user_id: user.id }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  atualizar: async (id: string, sonho: Partial<Sonho>) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { data, error } = await supabase
      .from("sonhos")
      .update(sonho)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  excluir: async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { error } = await supabase
      .from("sonhos")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) throw error
  }
}

// Função para calcular totais
export const calcularTotais = async () => {
  const [receitas, despesas, sonhos] = await Promise.all([
    receitasService.listar(),
    despesasService.listar(),
    sonhosService.listar()
  ])

  const receitaTotal = receitas.reduce((acc, r) => acc + r.valor, 0)
  
  // Calcula o total apenas das despesas pagas
  const despesaPaga = despesas.reduce((acc, d) => d.pago ? acc + d.valor : acc, 0)
  
  // Calcula o total geral de despesas (pagas e não pagas)
  const despesaTotal = despesas.reduce((acc, d) => acc + d.valor, 0)
  
  // Saldo disponível considera apenas despesas pagas
  const saldoDisponivel = receitaTotal - despesaPaga

  // Agrupa despesas por categoria
  const gastosPorCategoria = despesas.reduce((acc, d) => {
    acc[d.categoria] = (acc[d.categoria] || 0) + d.valor
    return acc
  }, {} as Record<string, number>)

  // Verifica despesas atrasadas
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const despesasAtrasadas = despesas.filter(d => {
    const dataDespesa = new Date(d.data)
    dataDespesa.setHours(0, 0, 0, 0)
    return !d.pago && dataDespesa < hoje
  })

  const sonhosPriorizados = sonhos
    .map(sonho => ({
      ...sonho,
      percentualConcluido: (sonho.valor_atual / sonho.valor_meta) * 100,
      valorFaltante: sonho.valor_meta - sonho.valor_atual
    }))
    .sort((a, b) => a.percentualConcluido - b.percentualConcluido)

  return {
    receitas,
    despesas,
    despesasAtrasadas,
    sonhos: sonhosPriorizados,
    receitaTotal,
    despesaTotal,
    despesaPaga,
    saldoDisponivel,
    gastosPorCategoria,
    temDespesasAtrasadas: despesasAtrasadas.length > 0,
    totalDespesasAtrasadas: despesasAtrasadas.reduce((acc, d) => acc + d.valor, 0)
  }
} 
