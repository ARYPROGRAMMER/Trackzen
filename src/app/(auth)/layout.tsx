import Image from "next/image"

interface AuthLayoutProps {
    children: React.ReactNode
}
const AuthLayout = ({ children }: AuthLayoutProps) => {
    return (
       <main>
        <Image
          src="/logo.svg"
          alt="Logo"
          width={100}
          height={50}
        />
        {children}
       </main>
    )
}

export default AuthLayout
