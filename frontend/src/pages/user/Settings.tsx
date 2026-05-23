import { useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { PageContainer } from "@/components/layout/PageContainer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GeneralSettings } from "@/components/settings/GeneralSettings"
import { ManageAccount } from "@/components/settings/ManageAccount"
import { ManageApis } from "@/components/settings/ManageApis"

// Map between the ?section= query param value and the Tabs value.
const PARAM_TO_TAB: Record<string, string> = {
  general: "general",
  "manage-profile": "manage-profile",
  "manage-api": "manage-api",
}

const TAB_TO_PARAM: Record<string, string> = {
  general: "general",
  "manage-profile": "manage-profile",
  "manage-api": "manage-api",
}

export function Settings() {
  const [searchParams, setSearchParams] = useSearchParams()

  const rawSection = searchParams.get("section") ?? "general"
  const activeTab = PARAM_TO_TAB[rawSection] ?? "general"

  // Normalise the URL on first load if the section param is missing or unknown.
  useEffect(() => {
    if (!PARAM_TO_TAB[rawSection]) {
      setSearchParams({ section: "general" }, { replace: true })
    }
  }, [rawSection, setSearchParams])

  const handleTabChange = (value: string) => {
    setSearchParams({ section: TAB_TO_PARAM[value] ?? "general" })
  }

  return (
    <PageContainer title="Settings">
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex flex-col gap-6 md:flex-row md:gap-8"
      >
        {/* Vertical sidebar on md+, horizontal strip on mobile */}
        <TabsList className="flex h-auto w-full flex-row md:w-48 md:flex-col md:justify-start md:gap-1 md:bg-transparent md:p-0">
          <TabsTrigger
            value="general"
            className="w-full justify-start md:data-[state=active]:bg-muted"
          >
            General Settings
          </TabsTrigger>
          <TabsTrigger
            value="manage-profile"
            className="w-full justify-start md:data-[state=active]:bg-muted"
          >
            Manage Account
          </TabsTrigger>
          <TabsTrigger
            value="manage-api"
            className="w-full justify-start md:data-[state=active]:bg-muted"
          >
            Manage APIs
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 min-w-0">
          <TabsContent value="general" className="mt-0">
            <GeneralSettings />
          </TabsContent>
          <TabsContent value="manage-profile" className="mt-0">
            <ManageAccount />
          </TabsContent>
          <TabsContent value="manage-api" className="mt-0">
            <ManageApis />
          </TabsContent>
        </div>
      </Tabs>
    </PageContainer>
  )
}

export default Settings
