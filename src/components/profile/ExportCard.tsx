import { Download } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { buttonClass } from "@/components/ui/Button"

// Plain links: the route answers with a file download, so no client code is needed
export default function ExportCard() {
    return (
        <Card className="p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                    <div className="rounded-md bg-surface-2 p-2.5 text-muted">
                        <Download className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="font-display text-lg font-semibold uppercase tracking-wide">Export your shelf</h2>
                        <p className="max-w-md text-sm text-muted">
                            Download every game with its status, rating, playtime, notes and dates.
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <a href="/api/export?format=csv" download className={buttonClass("secondary", "md")}>CSV</a>
                    <a href="/api/export?format=json" download className={buttonClass("secondary", "md")}>JSON</a>
                </div>
            </div>
        </Card>
    )
}
