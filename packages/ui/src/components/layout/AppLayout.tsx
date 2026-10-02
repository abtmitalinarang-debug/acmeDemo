import { ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'
import { Toaster } from "@repo/utils/toast"

interface IAppLayout {
  children: ReactNode
}
export default function AppLayout({ children }: IAppLayout) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <Toaster position="bottom-right" theme="dark" />
    </>
  )
}
