"use client"

import { useState, useEffect } from "react"
import "../styles/style.css"

const UserManagement = ({ onPendingAccountsUpdate }) => {
  const [pendingAccounts, setPendingAccounts] = useState([])
  const [approvedAccounts, setApprovedAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [activeTab, setActiveTab] = useState("pending")

  // Fetch accounts on component mount
  useEffect(() => {
    fetchAccounts()
  }, [])

  // Fetch both pending and approved accounts
  const fetchAccounts = async () => {
    setLoading(true)
    try {
      // Fetch pending accounts
      const pendingRes = await fetch("http://localhost:3001/pendingAccounts")
      if (!pendingRes.ok) throw new Error("Failed to fetch pending accounts")
      const pendingData = await pendingRes.json()
      setPendingAccounts(pendingData)

      // Fetch approved accounts
      const approvedRes = await fetch("http://localhost:3001/accounts")
      if (!approvedRes.ok) throw new Error("Failed to fetch approved accounts")
      const approvedData = await approvedRes.json()
      setApprovedAccounts(approvedData)
    } catch (err) {
      setError(`Error: ${err.message}`)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Handle account approval
  const handleApproveAccount = async (account, role) => {
    try {
      // Create approved account with selected role
      const approvedAccount = {
        ...account,
        role: role,
        status: "approved",
      }

      // Add to approved accounts
      const addResponse = await fetch("http://localhost:3001/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(approvedAccount),
      })

      if (!addResponse.ok) throw new Error("Failed to approve account")

      // Remove from pending accounts
      const deleteResponse = await fetch(`http://localhost:3001/pendingAccounts/${account.id}`, {
        method: "DELETE",
      })

      if (!deleteResponse.ok) throw new Error("Failed to remove from pending accounts")

      // Update UI
      setSuccess(`Account for ${account.email} approved successfully as ${role}`)
      fetchAccounts()
      if (onPendingAccountsUpdate) onPendingAccountsUpdate()

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("")
      }, 3000)
    } catch (err) {
      setError(`Error: ${err.message}`)
      console.error(err)
    }
  }

  // Handle account rejection
  const handleRejectAccount = async (account) => {
    try {
      // Remove from pending accounts
      const deleteResponse = await fetch(`http://localhost:3001/pendingAccounts/${account.id}`, {
        method: "DELETE",
      })

      if (!deleteResponse.ok) throw new Error("Failed to reject account")

      // Update UI
      setSuccess(`Account for ${account.email} rejected successfully`)
      fetchAccounts()
      if (onPendingAccountsUpdate) onPendingAccountsUpdate()

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("")
      }, 3000)
    } catch (err) {
      setError(`Error: ${err.message}`)
      console.error(err)
    }
  }

  // Handle role change for existing accounts
  const handleChangeRole = async (account, newRole) => {
    try {
      // Update account with new role
      const updatedAccount = {
        ...account,
        role: newRole,
      }

      const updateResponse = await fetch(`http://localhost:3001/accounts/${account.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedAccount),
      })

      if (!updateResponse.ok) throw new Error("Failed to update account role")

      // Update UI
      setSuccess(`Role for ${account.email} changed to ${newRole} successfully`)
      fetchAccounts()

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("")
      }, 3000)
    } catch (err) {
      setError(`Error: ${err.message}`)
      console.error(err)
    }
  }

  // Render loading state
  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>User Management</h2>
        </div>
        <div className="loading-container">
          <p>Loading user accounts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>User Management</h2>
      </div>

      {error && (
        <div className="auth-error" style={{ marginBottom: "20px" }}>
          {error}
        </div>
      )}
      {success && (
        <div className="auth-success" style={{ marginBottom: "20px" }}>
          {success}
        </div>
      )}

      <div className="tabs-container">
        <div className="tabs">
          <button className={`tab ${activeTab === "pending" ? "active" : ""}`} onClick={() => setActiveTab("pending")}>
            Pending Accounts {pendingAccounts.length > 0 && `(${pendingAccounts.length})`}
          </button>
          <button
            className={`tab ${activeTab === "approved" ? "active" : ""}`}
            onClick={() => setActiveTab("approved")}
          >
            Approved Accounts
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "pending" && (
            <div className="table-container">
              {pendingAccounts.length === 0 ? (
                <div className="no-contracts" style={{ padding: "30px", textAlign: "center" }}>
                  <p>No pending accounts to approve.</p>
                </div>
              ) : (
                <table className="clients-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Gender</th>
                      <th>Age</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingAccounts.map((account) => (
                      <tr key={account.id}>
                        <td>
                          {account.nom} {account.prenom}
                        </td>
                        <td>{account.email}</td>
                        <td style={{ textTransform: "capitalize" }}>{account.gender}</td>
                        <td>{account.age}</td>
                        <td>
                          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                            <button
                              className="action-btn"
                              style={{
                                backgroundColor: "#2ecc71",
                                color: "white",
                                border: "none",
                              }}
                              onClick={() => handleApproveAccount(account, "employee")}
                            >
                              <i className="fas fa-user-check"></i> Approve as Employee
                            </button>
                            <button
                              className="action-btn"
                              style={{
                                backgroundColor: "#3498db",
                                color: "white",
                                border: "none",
                              }}
                              onClick={() => handleApproveAccount(account, "admin")}
                            >
                              <i className="fas fa-user-shield"></i> Approve as Admin
                            </button>
                            <button
                              className="action-btn"
                              style={{
                                backgroundColor: "#e74c3c",
                                color: "white",
                                border: "none",
                              }}
                              onClick={() => handleRejectAccount(account)}
                            >
                              <i className="fas fa-user-times"></i> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === "approved" && (
            <div className="table-container">
              {approvedAccounts.length === 0 ? (
                <div className="no-contracts" style={{ padding: "30px", textAlign: "center" }}>
                  <p>No approved accounts found.</p>
                </div>
              ) : (
                <table className="clients-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Gender</th>
                      <th>Age</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedAccounts.map((account) => (
                      <tr key={account.id}>
                        <td>
                          {account.nom} {account.prenom}
                        </td>
                        <td>{account.email}</td>
                        <td style={{ textTransform: "capitalize" }}>{account.gender}</td>
                        <td>{account.age}</td>
                        <td>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "5px 10px",
                              borderRadius: "4px",
                              textTransform: "capitalize",
                              fontWeight: "bold",
                              backgroundColor: account.role === "admin" ? "#e74c3c30" : "#3498db30",
                              color: account.role === "admin" ? "#e74c3c" : "#3498db",
                            }}
                          >
                            {account.role}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                            {account.role !== "employee" && (
                              <button
                                className="action-btn"
                                style={{
                                  backgroundColor: "#2ecc71",
                                  color: "white",
                                  border: "none",
                                }}
                                onClick={() => handleChangeRole(account, "employee")}
                              >
                                <i className="fas fa-user"></i> Set as Employee
                              </button>
                            )}
                            {account.role !== "admin" && (
                              <button
                                className="action-btn"
                                style={{
                                  backgroundColor: "#3498db",
                                  color: "white",
                                  border: "none",
                                }}
                                onClick={() => handleChangeRole(account, "admin")}
                              >
                                <i className="fas fa-user-shield"></i> Set as Admin
                              </button>
                            )}
                            {account.role !== "user" && (
                              <button
                                className="action-btn"
                                style={{
                                  backgroundColor: "#f39c12",
                                  color: "white",
                                  border: "none",
                                }}
                                onClick={() => handleChangeRole(account, "user")}
                              >
                                <i className="fas fa-user-alt-slash"></i> Set as User
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserManagement
