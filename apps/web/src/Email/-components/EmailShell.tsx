import { NAME } from "@repo/utils/configuration"
import { Body, Container, Head, Html, Section, Tailwind, Text } from "react-email"

interface EmailShellProps extends React.PropsWithChildren {}
export const EmailShell: React.FC<EmailShellProps> = (props) => {
  const { children } = props

  return (
    <Html>
      <Tailwind>
        <Head />
        <Body className="mx-auto my-auto bg-white px-2 font-sans">
          <Container className="mx-auto my-10 max-w-116.25 rounded border border-solid border-[#eaeaea] p-5">
            <Section className="mt-8 text-center">
              <Text className="m-0 text-[28px] font-extrabold text-[#c1002a]">{NAME}</Text>
            </Section>
            {children}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
