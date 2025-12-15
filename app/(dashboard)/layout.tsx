import type React from "react"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { ChristmasSnow } from "@/components/christmas-snow"
import { ChristmasBanner } from "@/components/christmas-banner"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <ChristmasSnow />
      <Sidebar userRole={user.role} />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <ChristmasBanner />
        <Header user={user} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
