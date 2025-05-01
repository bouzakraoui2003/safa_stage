"use client"

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import ClientsTable from "./components/ClientsTable"
import VoituresTable from "./components/VoituresTable"
import Reservation from "./components/Reservation"
import Contrat from "./components/Contrat"
import Home from "./components/Home"
import Login from "./components/Login"
import Statistics from "./components/Statistics"
import { useState } from "react"
import "./styles/style.css"

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem("user"))

  const handleLogin = async (email, password) => {
    try {
      // Fetch accounts
      const res = await fetch("http://localhost:3001/accounts")
      const accounts = await res.json()
      const user = accounts.find((acc) => acc.email === email && acc.password === password)

      if (user) {
        // Store user in localStorage (excluding password for security)
        const { password, ...userWithoutPassword } = user
        localStorage.setItem("user", JSON.stringify(userWithoutPassword))
        setIsAuthenticated(true)
      } else {
        throw new Error("Invalid credentials")
      }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    setIsAuthenticated(false)
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <>
                <Navbar onLogout={handleLogout} />
                <Routes>
                  <Route path="/clients" element={<ClientsTable />} />
                  <Route path="/voitures" element={<VoituresTable />} />
                  <Route path="/reservations" element={<Reservation />} />
                  <Route path="/contrats" element={<Contrat />} />
                  <Route path="/statistics" element={<Statistics />} />
                  <Route path="/" element={<Home />} />
                </Routes>
              </>
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
      </Routes>
    </Router>
  )
}

export default App
