import { BrowserRouter, Route,  Routes } from 'react-router-dom'
import './App.css'
import ContactListPage from './pages/ContactListPage'
import AddToContactForm from './pages/AddToContactForm'
import DetailContactPage from './pages/DetailContactPage'

function App() {

  return (
    <> 
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<ContactListPage/>} />
        <Route path="/add" element={<AddToContactForm/>} />
        <Route path="/add/:id" element={<AddToContactForm/>} />
        <Route path="/detail/:id" element={<DetailContactPage/>} />
      </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
