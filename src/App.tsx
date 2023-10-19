import { BrowserRouter, Route,  Routes } from 'react-router-dom'
import './App.css'
import ContactListPage from './pages/ContactListPage'
import AddToContactForm from './pages/AddToContactForm'

function App() {

  return (
    <> 
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<ContactListPage/>} />
        <Route path="/add" element={<AddToContactForm/>} />
        <Route path="/add/:id" element={<AddToContactForm/>} />
      </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
