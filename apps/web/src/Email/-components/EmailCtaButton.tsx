import { Button, Section } from "react-email"

interface EmailCtaButtonProps extends React.PropsWithChildren {
  href: string
}
export const EmailCtaButton: React.FC<EmailCtaButtonProps> = (props) => {
  const { href, children } = props

  return (
    <Section className="mb-8 text-center">
      <Button
        className="rounded bg-[#c1002a] px-6 py-3 text-center text-[13px] font-semibold text-white no-underline"
        href={href}
      >
        {children}
      </Button>
    </Section>
  )
}
