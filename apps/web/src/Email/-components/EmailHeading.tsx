import { Heading } from "react-email"

interface EmailHeadingProps extends React.PropsWithChildren {}
export const EmailHeading: React.FC<EmailHeadingProps> = (props) => {
  const { children } = props

  return (
    <Heading className="mx-0 my-7.5 p-0 text-center text-[22px] font-semibold text-[#020617]">
      {children}
    </Heading>
  )
}
