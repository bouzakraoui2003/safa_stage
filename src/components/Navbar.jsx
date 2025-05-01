"use client"

import { useState, useEffect, useRef } from "react"
import { Link, useLocation } from "react-router-dom"
import "../styles/style.css"

const Navbar = ({ onLogout }) => {
  const location = useLocation()
  const [showSettings, setShowSettings] = useState(false)
  const [userData, setUserData] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [editedName, setEditedName] = useState({ nom: "", prenom: "" })
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const settingsRef = useRef(null)

  // Function to check if a link is active
  const isActive = (path) => {
    return location.pathname === path ? "active" : ""
  }

  // Load user data from localStorage
  useEffect(() => {
    const user = localStorage.getItem("user")
    if (user) {
      const parsedUser = JSON.parse(user)
      setUserData(parsedUser)
      setEditedName({ nom: parsedUser.nom, prenom: parsedUser.prenom })
    }
  }, [])

  // Close settings when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const toggleSettings = () => {
    setShowSettings(!showSettings)
    setEditMode(false)
    setShowPasswordChange(false)
    setError("")
    setSuccess("")
  }

  const handleEditName = () => {
    setEditMode(true)
    setShowPasswordChange(false)
  }

  const handleSaveName = async () => {
    try {
      // Fetch the current user data
      const response = await fetch(`http://localhost:3001/accounts/${userData.id}`)
      const currentUser = await response.json()

      // Update with new name
      const updatedUser = {
        ...currentUser,
        nom: editedName.nom,
        prenom: editedName.prenom,
      }

      // Save to server
      await fetch(`http://localhost:3001/accounts/${userData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUser),
      })

      // Update localStorage
      const { password, ...userWithoutPassword } = updatedUser
      localStorage.setItem("user", JSON.stringify(userWithoutPassword))

      // Update state
      setUserData(userWithoutPassword)
      setEditMode(false)
      setSuccess("Nom mis à jour avec succès!")

      setTimeout(() => {
        setSuccess("")
      }, 3000)
    } catch (err) {
      setError("Erreur lors de la mise à jour du nom")
      console.error(err)
    }
  }

  const handleShowPasswordChange = () => {
    setShowPasswordChange(true)
    setEditMode(false)
    setPasswordData({ current: "", new: "", confirm: "" })
  }

  const handlePasswordChange = async () => {
    try {
      // Validate passwords
      if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
        setError("Tous les champs sont obligatoires")
        return
      }

      if (passwordData.new !== passwordData.confirm) {
        setError("Les nouveaux mots de passe ne correspondent pas")
        return
      }

      // Fetch the current user data to verify current password
      const response = await fetch(`http://localhost:3001/accounts/${userData.id}`)
      const currentUser = await response.json()

      if (currentUser.password !== passwordData.current) {
        setError("Mot de passe actuel incorrect")
        return
      }

      // Update with new password
      const updatedUser = {
        ...currentUser,
        password: passwordData.new,
      }

      // Save to server
      await fetch(`http://localhost:3001/accounts/${userData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUser),
      })

      setShowPasswordChange(false)
      setSuccess("Mot de passe mis à jour avec succès!")

      setTimeout(() => {
        setSuccess("")
      }, 3000)
    } catch (err) {
      setError("Erreur lors de la mise à jour du mot de passe")
      console.error(err)
    }
  }

  return (
    <nav className="navbar">
      {/* Make the brand a link to home */}
      <Link to="/" className="navbar-brand">
        <img src="" alt="LPS Logo" className="navbar-logo-img" />
        <span className="navbar-company-name">Location Promotion Souss</span>
      </Link>

      <ul>
        <li className={isActive("/clients")}>
          <Link to="/clients">Clients</Link>
        </li>
        <li className={isActive("/voitures")}>
          <Link to="/voitures">Voitures</Link>
        </li>
        <li className={isActive("/reservations")}>
          <Link to="/reservations">Réservations</Link>
        </li>
        <li className={isActive("/contrats")}>
          <Link to="/contrats">Contrats</Link>
        </li>
        <li className={isActive("/statistics")}>
          <Link to="/statistics">Statistiques</Link>
        </li>
      </ul>

      <div className="navbar-actions">
        <button className="settings-btn" onClick={toggleSettings}>
          <i className="fas fa-user-cog"></i> Paramètres personnels
        </button>

        {showSettings && (
          <div className="settings-dropdown" ref={settingsRef}>
            <div className="settings-header">
              <h3>Paramètres personnels</h3>
              <button className="close-btn" onClick={toggleSettings}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            {error && <div className="settings-error">{error}</div>}
            {success && <div className="settings-success">{success}</div>}

            {!editMode && !showPasswordChange && userData && (
              <div className="profile-info">
                <div className="info-item">
                  <span className="info-label">Nom:</span>
                  <span className="info-value">
                    {userData.nom} {userData.prenom}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{userData.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Âge:</span>
                  <span className="info-value">{userData.age} ans</span>
                </div>

                <div className="settings-actions">
                  <button className="edit-btn" onClick={handleEditName}>
                    <i className="fas fa-edit"></i> Modifier le nom
                  </button>
                  <button className="password-btn" onClick={handleShowPasswordChange}>
                    <i className="fas fa-key"></i> Changer le mot de passe
                  </button>
                  <button className="logout-btn settings-logout" onClick={onLogout}>
                    <i className="fas fa-sign-out-alt"></i> Déconnexion
                  </button>
                </div>
              </div>
            )}

            {editMode && (
              <div className="edit-form">
                <h4>Modifier le nom</h4>
                <div className="form-group">
                  <label>Nom:</label>
                  <input
                    type="text"
                    value={editedName.nom}
                    onChange={(e) => setEditedName({ ...editedName, nom: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Prénom:</label>
                  <input
                    type="text"
                    value={editedName.prenom}
                    onChange={(e) => setEditedName({ ...editedName, prenom: e.target.value })}
                  />
                </div>
                <div className="form-actions">
                  <button className="save-btn" onClick={handleSaveName}>
                    <i className="fas fa-save"></i> Enregistrer
                  </button>
                  <button className="cancel-btn" onClick={() => setEditMode(false)}>
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {showPasswordChange && (
              <div className="password-form">
                <h4>Changer le mot de passe</h4>
                <div className="form-group">
                  <label>Mot de passe actuel:</label>
                  <input
                    type="password"
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Nouveau mot de passe:</label>
                  <input
                    type="password"
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Confirmer le mot de passe:</label>
                  <input
                    type="password"
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                  />
                </div>
                <div className="form-actions">
                  <button className="save-btn" onClick={handlePasswordChange}>
                    <i className="fas fa-save"></i> Enregistrer
                  </button>
                  <button className="cancel-btn" onClick={() => setShowPasswordChange(false)}>
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
