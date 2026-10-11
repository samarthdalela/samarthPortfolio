import Home from './pages/index'
import ChatWidget from './components/ChatWidget.jsx'

// The "Ask about me" chat widget is only shown on the home page.
function App() {
  return (
    <>
      <Home />
      <ChatWidget />
    </>
  )
}

export default App
