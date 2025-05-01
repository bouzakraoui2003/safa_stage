"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/style.css"

const Settings = ({ onLogout }) => {
  const navigate = useNavigate()
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")))
  const [editMode, setEditMode] = useState(false)
  const [newName, setNewName] = useState(user.nom)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")

  const handleEditClick = () => {
    setEditMode(true)
  }

  const handleSaveClick = async () => {
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.")
      return
    }

    const updatedUser = { ...user, nom: newName }
    if (newPassword) {
      updatedUser.password = newPassword
    }

    try {
      const res = await fetch("http://localhost:3001/accounts/" + user.id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUser),
      })

      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(updatedUser))
        setUser(updatedUser)
        setEditMode(false)
        setError("")
      } else {
        setError("Erreur lors de la mise à jour des informations.")
      }
    } catch (error) {
      setError("Erreur lors de la mise à jour des informations.")
    }
  }

  const handleLogoutClick = () => {
    onLogout()
    navigate("/")
  }

  return (
    <div className="settings-container">
      <h2>Paramètres Personnels</h2>
      {error && <p className="error">{error}</p>}
      {editMode ? (
        <div>
          <div className="form-group">
            <label>Nom:</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Nouveau mot de passe:</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Confirmer le mot de passe:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button className="save-btn" onClick={handleSaveClick}>
            Enregistrer
          </button>
        </div>
      ) : (
        <div>
          <p>Nom: {user.nom}</p>
          <p>Prénom: {user.prenom}</p>
          <p>Âge: {user.age}</p>
          <p>Email: {user.email}</p>
          <button className="edit-btn" onClick={handleEditClick}>
            Modifier
          </button>
        </div>
      )}
      <button className="logout-btn" onClick={handleLogoutClick}>
        <i className="fas fa-sign-out-alt"></i> Déconnexion
      </button>
    </div>
  )
}

export default Settings
