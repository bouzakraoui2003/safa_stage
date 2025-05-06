"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Navbar from "./components/Navbar"
import ClientsTable from "./components/ClientsTable"
import VoituresTable from "./components/VoituresTable"
import Reservation from "./components/Reservation"
import Contrat from "./components/Contrat"
import Home from "./components/Home"
import Login from "./components/Login"
import Statistics from "./components/Statistics"
import UserManagement from "./components/UserManagement"
import { useState, useEffect } from "react"
import "./styles/style.css"

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem("user"))
  const [userRole, setUserRole] = useState("user")
  const [pendingAccounts, setPendingAccounts] = useState([])

  // Fetch pending accounts when the app loads
  useEffect(() => {
    if (isAuthenticated) {
      fetchPendingAccounts()
    }
  }, [isAuthenticated])

  // Set user role from localStorage
  useEffect(() => {
    const user = localStorage.getItem("user")
    if (user) {
      const userData = JSON.parse(user)
      setUserRole(userData.role || "user")
    }
  }, [isAuthenticated])

  // Fetch pending accounts
  const fetchPendingAccounts = async () => {
    try {
      const res = await fetch("http://localhost:3001/pendingAccounts")
      const data = await res.json()
      setPendingAccounts(data)
    } catch (error) {
      console.error("Error fetching pending accounts:", error)
    }
  }

  const handleLogin = async (email, password) => {
    try {
      // Fetch accounts
      const res = await fetch("http://localhost:3001/accounts")
      const accounts = await res.json()
      const user = accounts.find((acc) => acc.email === email && acc.password === password)

      if (user) {
        // Check if the account is approved
        if (user.status === "pending") {
          throw new Error("Your account is pending approval by an administrator.")
        }

        // Store user in localStorage (excluding password for security)
        const { password, ...userWithoutPassword } = user
        localStorage.setItem("user", JSON.stringify(userWithoutPassword))
        setIsAuthenticated(true)
        setUserRole(user.role || "user")
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
    setUserRole("user")
  }

  // If user is not authenticated, show login page
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  // If user is authenticated but has role "user", show waiting message
  if (userRole === "user" && isAuthenticated) {
    return (
      <div className="auth-container">
        <div className="auth-form">
          <h2 className="auth-title">Account Pending Approval</h2>
          <div className="auth-success">
            Your account is waiting for administrator approval. Please check back later.
          </div>
          <button className="auth-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/*"
          element={
            <>
              <Navbar
                onLogout={handleLogout}
                userRole={userRole}
                pendingAccountsCount={pendingAccounts.length}
                onPendingAccountsUpdate={fetchPendingAccounts}
              />
              <Routes>
                <Route path="/clients" element={<ClientsTable />} />
                <Route path="/voitures" element={<VoituresTable />} />
                <Route path="/reservations" element={<Reservation />} />
                <Route path="/contrats" element={<Contrat />} />
                <Route path="/statistics" element={<Statistics />} />
                <Route
                  path="/user-management"
                  element={
                    userRole === "admin" ? (
                      <UserManagement onPendingAccountsUpdate={fetchPendingAccounts} />
                    ) : (
                      <Navigate to="/" replace />
                    )
                  }
                />
                <Route path="/" element={<Home />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
