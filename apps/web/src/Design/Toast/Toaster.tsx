import { Toaster as ToasterSonner } from "sonner"
import { Spinner } from "../Spinner/Spinner.tsx"

export type ToasterProps = React.ComponentProps<typeof ToasterSonner>
export const Toaster: React.FC<ToasterProps> = (props) => {
  return (
    <ToasterSonner
      theme="light"
      richColors
      closeButton
      position="top-center"
      icons={{
        loading: <Spinner size={20} />,
      }}
      toastOptions={{
        style: {
          "--error-bg": "color-mix(in oklab, var(--color-state-error) 20%, white)",
          "--error-text": "color-mix(in oklab, var(--color-state-error) 90%, black)",

          "--success-bg": "color-mix(in oklab, var(--color-state-success) 20%, white)",
          "--success-text": "color-mix(in oklab, var(--color-state-success) 65%, black)",

          "--info-bg": "color-mix(in oklab, var(--color-state-info) 20%, white)",
          "--info-text": "color-mix(in oklab, var(--color-state-info) 75%, black)",

          "--warning-bg": "color-mix(in oklab, var(--color-state-warning) 20%, white)",
          "--warning-text": "var(--color-state-warning-strong)",
        } as React.CSSProperties,
      }}
      {...props}
    />
  )
}
