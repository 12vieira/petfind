import '../styles/globals.css'
import { ActivePetProvider } from '../src/context/ActivePetContext'

export default function App({ Component, pageProps }) {
  return (
    <ActivePetProvider>
      <Component {...pageProps} />
    </ActivePetProvider>
  )
}