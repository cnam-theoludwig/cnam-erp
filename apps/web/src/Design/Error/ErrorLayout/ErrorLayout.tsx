export interface ErrorLayoutProps extends React.PropsWithChildren {
  statusCode: number
  title: string
  description: string
}
export const ErrorLayout: React.FC<ErrorLayoutProps> = (props) => {
  const { statusCode, title, description, children } = props

  return (
    <main className="flex min-h-full flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-6xl font-extrabold text-primary">{statusCode}</p>
      <h1 className="text-xl font-bold text-content-primary">{title}</h1>
      <p className="text-content-secondary">{description}</p>
      {children}
    </main>
  )
}
