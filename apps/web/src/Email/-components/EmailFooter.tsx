import { Link, Section, Text } from "react-email"

interface EmailFooterProps {
  webURL: string
}
export const EmailFooter: React.FC<EmailFooterProps> = (props) => {
  const { webURL } = props

  return (
    <Section className="border-t border-solid border-[#e5e7eb] px-5 py-4 text-center">
      <Text className="m-0 text-[12px] text-[#6b7280]">
        <Link href={webURL} className="text-[#c1002a] underline">
          {webURL}
        </Link>
      </Text>
    </Section>
  )
}
