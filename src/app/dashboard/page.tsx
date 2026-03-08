"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { BarChart, DollarSign, PiggyBank, Target, AlertCircle, TrendingUp, TrendingDown, ArrowUp, ArrowDown } from 'lucide-react'
import { calcularTotais } from '@/services/financas'

interface DadosFinanceiros {
  receitaTotal: number
  despesaTotal: number
  despesaPaga: number
  saldoDisponivel: number
  totalDespesasAtrasadas: number
  temDespesasAtrasadas: boolean
  receitas: any[]
  despesas: any[]
  despesasAtrasadas: any[]
  historicoMensal: {
    mes: string
    receitas: number
    despesas: number
  }[]
  gastosPorCategoria: {
    categoria: string
    valor: number
    percentual: number
  }[]
}

export default function DashboardPage() {
  const [dados, setDados] = useState<DadosFinanceiros | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setErro(null)
      const dadosFinanceiros = await calcularTotais()
      
      // Calcular histórico mensal
      const hoje = new Date()
      const ultimosMeses = Array.from({length: 6}, (_, i) => {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
        return data.toISOString().slice(0, 7)
      }).reverse()

      const historicoMensal = ultimosMeses.map(mes => {
        const receitasMes = dadosFinanceiros.receitas
          .filter(r => r.data.startsWith(mes))
          .reduce((acc, r) => acc + r.valor, 0)
        
        const despesasMes = dadosFinanceiros.despesas
          .filter(d => d.data.startsWith(mes))
          .reduce((acc, d) => acc + d.valor, 0)

        return {
          mes: new Date(mes).toLocaleDateString('pt-BR', { month: 'short' }),
          receitas: receitasMes,
          despesas: despesasMes
        }
      })

      // Calcular gastos por categoria
      const categorias = Array.from(new Set(dadosFinanceiros.despesas.map(d => d.categoria)))
      const gastosPorCategoria = categorias.map(categoria => {
        const valor = dadosFinanceiros.despesas
          .filter(d => d.categoria === categoria)
          .reduce((acc, d) => acc + d.valor, 0)
        
        return {
          categoria,
          valor,
          percentual: (valor / dadosFinanceiros.despesaTotal) * 100
        }
      }).sort((a, b) => b.valor - a.valor)

      setDados({
        ...dadosFinanceiros,
        historicoMensal,
        gastosPorCategoria
      })
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Erro ao carregar dados financeiros'
      setErro(mensagem)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (erro) {
    return (
      <div className="p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Dashboard Financeiro</h1>
        <Card className="p-6 bg-red-500/10 border-red-500/20">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <div>
              <h2 className="font-semibold text-red-500 mb-1">Erro ao carregar dados</h2>
              <p className="text-sm text-gray-400">{erro}</p>
              <button 
                onClick={carregarDados}
                className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded text-sm text-red-500 transition"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (!dados) {
    return (
      <div className="p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Dashboard Financeiro</h1>
        <Card className="p-6 bg-blue-500/10 border-blue-500/20">
          <p className="text-gray-400">Nenhum dado financeiro encontrado. Comece criando receitas e despesas.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">Dashboard Financeiro</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Card de Receitas */}
        <Card className="p-4 md:p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-500/20 rounded-full">
              <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total de Receitas</p>
              <h2 className="text-xl md:text-2xl font-bold">R$ {dados.receitaTotal.toFixed(2)}</h2>
            </div>
          </div>
        </Card>

        {/* Card de Despesas */}
        <Card className="p-4 md:p-6 bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-500/20 rounded-full">
              <BarChart className="h-5 w-5 md:h-6 md:w-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Despesas Pagas</p>
              <h2 className="text-xl md:text-2xl font-bold">R$ {dados.despesaPaga.toFixed(2)}</h2>
              <p className="text-sm text-gray-500">
                Total: R$ {dados.despesaTotal.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        {/* Card de Saldo */}
        <Card className="p-4 md:p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500/20 rounded-full">
              <PiggyBank className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Saldo Disponível</p>
              <h2 className="text-xl md:text-2xl font-bold">R$ {dados.saldoDisponivel.toFixed(2)}</h2>
              <p className="text-sm text-gray-500">
                Após despesas pagas
              </p>
            </div>
          </div>
        </Card>

        {/* Card de Despesas Atrasadas */}
        <Card className={`p-4 md:p-6 ${dados.temDespesasAtrasadas ? 'bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20' : 'bg-gradient-to-br from-gray-500/10 to-gray-500/5 border-gray-500/20'}`}>
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${dados.temDespesasAtrasadas ? 'bg-yellow-500/20' : 'bg-gray-500/20'}`}>
              <AlertCircle className={`h-5 w-5 md:h-6 md:w-6 ${dados.temDespesasAtrasadas ? 'text-yellow-500' : 'text-gray-500'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Despesas Atrasadas</p>
              {dados.temDespesasAtrasadas ? (
                <>
                  <h2 className="text-xl md:text-2xl font-bold text-yellow-500">
                    R$ {dados.totalDespesasAtrasadas.toFixed(2)}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {dados.despesasAtrasadas.length} pendentes
                  </p>
                </>
              ) : (
                <h2 className="text-xl md:text-2xl font-bold text-gray-500">
                  Nenhuma
                </h2>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Gráfico de Evolução Mensal */}
        <Card className="p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-semibold mb-4">Evolução Mensal</h3>
          <div className="h-64">
            <div className="flex h-full items-end gap-2">
              {dados.historicoMensal.map((mes, index) => (
                <div key={index} className="flex-1 flex flex-col gap-1">
                  {/* Barra de Receitas */}
                  <div 
                    className="bg-green-500/50 rounded-t-sm transition-all duration-300"
                    style={{ height: `${(mes.receitas / Math.max(...dados.historicoMensal.map(m => Math.max(m.receitas, m.despesas)))) * 100}%` }}
                  />
                  {/* Barra de Despesas */}
                  <div 
                    className="bg-red-500/50 rounded-t-sm transition-all duration-300"
                    style={{ height: `${(mes.despesas / Math.max(...dados.historicoMensal.map(m => Math.max(m.receitas, m.despesas)))) * 100}%` }}
                  />
                  <span className="text-xs text-center mt-2">{mes.mes}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500/50 rounded-sm" />
                <span>Receitas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500/50 rounded-sm" />
                <span>Despesas</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Gráfico de Distribuição de Gastos */}
        <Card className="p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-semibold mb-4">Distribuição de Gastos</h3>
          <div className="space-y-4">
            {dados.gastosPorCategoria.map((categoria, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{categoria.categoria}</span>
                  <span className="text-gray-400">{categoria.percentual.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full">
                  <div 
                    className="h-full bg-purple-500 rounded-full transition-all duration-300"
                    style={{ width: `${categoria.percentual}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Indicadores de Saúde Financeira */}
      <Card className="p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-semibold mb-4">Indicadores Financeiros</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Taxa de Poupança */}
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <PiggyBank className="h-5 w-5 text-blue-500" />
              <h4 className="font-medium">Taxa de Poupança</h4>
            </div>
            <p className="text-2xl font-bold text-blue-500">
              {((dados.saldoDisponivel / dados.receitaTotal) * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-400">da receita total</p>
          </div>

          {/* Comprometimento de Renda */}
          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-yellow-500" />
              <h4 className="font-medium">Comprometimento de Renda</h4>
            </div>
            <p className="text-2xl font-bold text-yellow-500">
              {((dados.despesaTotal / dados.receitaTotal) * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-400">da receita total</p>
          </div>

          {/* Variação Mensal */}
          {dados.historicoMensal.length >= 2 && (
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <h4 className="font-medium">Variação Mensal</h4>
              </div>
              {(() => {
                const mesAtual = dados.historicoMensal[dados.historicoMensal.length - 1]
                const mesAnterior = dados.historicoMensal[dados.historicoMensal.length - 2]
                const variacao = ((mesAtual.receitas - mesAtual.despesas) - (mesAnterior.receitas - mesAnterior.despesas)) / Math.abs(mesAnterior.receitas - mesAnterior.despesas) * 100
                
                return (
                  <>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-purple-500">
                        {Math.abs(variacao).toFixed(1)}%
                      </p>
                      {variacao > 0 ? (
                        <ArrowUp className="h-5 w-5 text-green-500" />
                      ) : (
                        <ArrowDown className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-400">em relação ao mês anterior</p>
                  </>
                )
              })()}
            </div>
          )}
        </div>
      </Card>

      {/* Últimas Transações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-semibold mb-4">Últimas Receitas</h3>
          <div className="space-y-3 md:space-y-4">
            {dados.receitas.slice(0, 5).map((receita) => (
              <div key={receita.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-3 bg-green-500/5 rounded-lg gap-2">
                <div>
                  <p className="font-medium">{receita.descricao}</p>
                  <p className="text-sm text-gray-400">{new Date(receita.data).toLocaleDateString()}</p>
                </div>
                <p className="text-green-500 font-semibold">R$ {receita.valor.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-semibold mb-4">Últimas Despesas</h3>
          <div className="space-y-3 md:space-y-4">
            {dados.despesas.slice(0, 5).map((despesa) => {
              const dataVencimento = new Date(despesa.data)
              const hoje = new Date()
              hoje.setHours(0, 0, 0, 0)
              dataVencimento.setHours(0, 0, 0, 0)
              const estaAtrasada = !despesa.pago && dataVencimento < hoje

              return (
                <div 
                  key={despesa.id} 
                  className={`flex flex-col md:flex-row justify-between items-start md:items-center p-3 rounded-lg gap-2 ${
                    estaAtrasada ? 'bg-yellow-500/5 border border-yellow-500/20' : 'bg-red-500/5'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{despesa.descricao}</p>
                      {estaAtrasada && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500/20 text-yellow-500">
                          Atrasada
                        </span>
                      )}
                      {despesa.pago && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-500">
                          Paga
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{new Date(despesa.data).toLocaleDateString()}</p>
                  </div>
                  <p className={`font-semibold ${estaAtrasada ? 'text-yellow-500' : 'text-red-500'}`}>
                    R$ {despesa.valor.toFixed(2)}
                  </p>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
} 
