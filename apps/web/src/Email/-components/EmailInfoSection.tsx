import { Section } from "react-email"

interface EmailInfoSectionProps extends React.PropsWithChildren {}
export const EmailInfoSection: React.FC<EmailInfoSectionProps> = (props) => {
  const { children } = props

  return <Section className="mb-4 rounded bg-[#fdf2f4] px-4 py-4">{children}</Section>
}
