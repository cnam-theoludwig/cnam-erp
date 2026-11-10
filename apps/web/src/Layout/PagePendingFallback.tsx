import { Spinner } from "../Design/Spinner/Spinner.tsx"

export interface PagePendingFallbackProps {}
export const PagePendingFallback: React.FC<PagePendingFallbackProps> = () => {
  return (
    <main className="flex min-h-full items-center justify-center">
      <Spinner />
    </main>
  )
}
