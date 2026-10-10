import Header from './Header'
import Footer from './Footer'
import Hero from '../components/Hero'
import { About, Education, Experience, Skills } from '../components/Sections'
import Projects from '../components/Projects'
import Contact from '../components/Contact'
import { useRevealOnScroll } from '../hooks'

function Home() {
  useRevealOnScroll()
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Education />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

export default Home
