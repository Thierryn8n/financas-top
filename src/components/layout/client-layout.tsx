"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { ChatIA } from "@/components/chat-ia"
import { analiseAutomatica } from "@/services/analise-automatica"
import { useProfile } from "@/hooks/useProfile"
import { NotificationsButton } from "@/components/notifications"
import { Toaster } from "@/components/ui/toaster"
import { FloatingMenu } from "@/components/floating-menu"
import { HeaderMobile } from "@/components/header-mobile"
import { Sidebar } from "@/components/layout/sidebar"

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname()
  const { profile } = useProfile()
  const isAuthPage = pathname === '/login' || pathname === '/register'
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    if (!isAuthPage && profile?.id) {
      // Executar análise inicial
      executarAnaliseAutomatica()

      // Configurar intervalos de análise
      const intervalAnalise = setInterval(() => executarAnaliseAutomatica(), 5 * 60 * 1000) // A cada 5 minutos
      const intervalMetas = setInterval(() => verificarMetas(), 10 * 60 * 1000) // A cada 10 minutos
      const intervalSugestoes = setInterval(() => sugerirAcoes(), 30 * 60 * 1000) // A cada 30 minutos

      return () => {
        clearInterval(intervalAnalise)
        clearInterval(intervalMetas)
        clearInterval(intervalSugestoes)
      }
    }
  }, [isAuthPage, profile?.id])

  const executarAnaliseAutomatica = async () => {
    if (!profile?.id) return
    try {
      await analiseAutomatica.analisarFinancas(profile.id)
    } catch (error) {
      console.error("Erro na análise automática:", error)
    }
  }

  const verificarMetas = async () => {
    if (!profile?.id) return
    try {
      await analiseAutomatica.verificarMetas(profile.id)
    } catch (error) {
      console.error("Erro ao verificar metas:", error)
    }
  }

  const sugerirAcoes = async () => {
    if (!profile?.id) return
    try {
      await analiseAutomatica.sugerirAcoes(profile.id)
    } catch (error) {
      console.error("Erro ao sugerir ações:", error)
    }
  }

  if (isAuthPage) {
    return (
      <>
        {children}
        <Toaster />
      </>
    )
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-950 text-gray-100">
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex-1 md:ml-64 transition-all duration-300">
        <HeaderMobile />
        <main className="flex-1 overflow-y-auto pt-16 md:pt-4 pb-24">
          <div className="container mx-auto p-4 md:p-6">
            {children}
          </div>
        </main>
        <ChatIA />
        <div className="fixed top-4 right-4 z-50 hidden md:block">
          <NotificationsButton />
        </div>
      </div>
      <FloatingMenu />
      <Toaster />
    </div>
  )
} 
