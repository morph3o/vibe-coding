import { Routes, Route } from 'react-router-dom'
// import Navbar from './components/Navbar'
import Home from './pages/Home'
import './App.css'

function App() {
  return (
    <>
      {/* <Navbar /> */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<div className="container mt-4"><h1>Acerca de</h1></div>} />
      </Routes>
    </>
  )
}

export default App
