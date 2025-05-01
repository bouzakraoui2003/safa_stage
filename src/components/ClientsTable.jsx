"use client"

import React, { useEffect, useState } from "react"
import Select from "react-select"
import "../styles/style.css"

const ClientsTable = () => {
  const [clients, setClients] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingClientId, setEditingClientId] = useState(null)
  const [newClient, setNewClient] = useState({
    conducteur: {
      "1er": {
        Nom: "",
        Prénom: "",
        "Né(e) le": "",
        "Tel Marocain": "",
        "Tel Etranger": "",
        "E-mail": "",
        "Adresse locale": "",
        "Adresse à l'etranger": "",
        "Permis de conduire N°": "",
        "Délivré le": "",
        Carte: "",
        "Passport N°": "",
        "Valable jusqu'au": "",
        "Recommandé(e) par": "",
        Nationalité: ""
      },
      "2eme": {
        Nom: "",
        Prénom: "",
        Tel: "",
        "Permis de conduire N°": "",
        "Délivré le": "",
        "Carburant au départ": "",
      },
      "3eme": {
        Nom: "",
        Prénom: "",
        "Permis de conduire N°": "",
        "Délivré le": "",
      },
    },
  })
  // Add search state
  const [searchTerm, setSearchTerm] = useState("")

  // Add nationalities list
  const nationalities = [
    { value: "marocain", label: "Marocain" },
    { value: "marocaine", label: "Marocaine" },
    { value: "français", label: "Français" },
    { value: "française", label: "Française" },
    { value: "américain", label: "Américain" },
    { value: "américaine", label: "Américaine" },
    { value: "britannique", label: "Britannique" },
    { value: "allemand", label: "Allemand" },
    { value: "allemande", label: "Allemande" },
    { value: "espagnol", label: "Espagnol" },
    { value: "espagnole", label: "Espagnole" },
    { value: "italien", label: "Italien" },
    { value: "italienne", label: "Italienne" },
    { value: "portugais", label: "Portugais" },
    { value: "portugaise", label: "Portugaise" },
    { value: "néerlandais", label: "Néerlandais" },
    { value: "néerlandaise", label: "Néerlandaise" },
    { value: "belge", label: "Belge" },
    { value: "suisse", label: "Suisse" },
    { value: "canadien", label: "Canadien" },
    { value: "canadienne", label: "Canadienne" },
    { value: "australien", label: "Australien" },
    { value: "australienne", label: "Australienne" },
    { value: "chinois", label: "Chinois" },
    { value: "chinoise", label: "Chinoise" },
    { value: "japonais", label: "Japonais" },
    { value: "japonaise", label: "Japonaise" },
    { value: "coréen", label: "Coréen" },
    { value: "coréenne", label: "Coréenne" },
    { value: "indien", label: "Indien" },
    { value: "indienne", label: "Indienne" },
    { value: "brésilien", label: "Brésilien" },
    { value: "brésilienne", label: "Brésilienne" },
    { value: "argentin", label: "Argentin" },
    { value: "argentine", label: "Argentine" },
    { value: "mexicain", label: "Mexicain" },
    { value: "mexicaine", label: "Mexicaine" },
    { value: "russe", label: "Russe" },
    { value: "turc", label: "Turc" },
    { value: "turque", label: "Turque" },
    { value: "égyptien", label: "Égyptien" },
    { value: "égyptienne", label: "Égyptienne" },
    { value: "tunisien", label: "Tunisien" },
    { value: "tunisienne", label: "Tunisienne" },
    { value: "algérien", label: "Algérien" },
    { value: "algérienne", label: "Algérienne" },
    { value: "sénégalais", label: "Sénégalais" },
    { value: "sénégalaise", label: "Sénégalaise" },
    { value: "ivoirien", label: "Ivoirien" },
    { value: "ivoirienne", label: "Ivoirienne" },
    { value: "ghanéen", label: "Ghanéen" },
    { value: "ghanaise", label: "Ghanéenne" },
    { value: "nigérian", label: "Nigérian" },
    { value: "nigériane", label: "Nigériane" },
    { value: "kenyan", label: "Kenyan" },
    { value: "kenyane", label: "Kenyane" },
    { value: "sud-africain", label: "Sud-Africain" },
    { value: "sud-africaine", label: "Sud-Africaine" },
    { value: "autre", label: "Autre" }
  ];

  // Add custom styles for react-select
  const customStyles = {
    control: (provided) => ({
      ...provided,
      borderColor: "#e0e0e0",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#3498db",
      },
      borderRadius: "5px",
      padding: "2px",
      fontSize: "14px",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#3498db" : state.isFocused ? "#ebf5fb" : null,
      color: state.isSelected ? "white" : "#2c3e50",
      padding: "10px 12px",
      cursor: "pointer",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#95a5a6",
    }),
  };

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = () => {
    fetch("http://localhost:3001/clients")
      .then((res) => res.json())
      .then((data) => setClients(data))
      .catch((err) => console.error("Error fetching data:", err))
  }

  const handleModify = (clientId) => {
    const clientToEdit = clients.find((client) => client.id == clientId)
    if (clientToEdit) {
      setNewClient(JSON.parse(JSON.stringify(clientToEdit)))
      setIsEditing(true)
      setEditingClientId(clientId)
      setShowForm(true)
    }
  }

  const handleDelete = (clientId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce client?")) {
      fetch(`http://localhost:3001/clients/${clientId}`, {
        method: "DELETE",
      })
        .then(() => {
          fetchClients()
          // Show success message or notification
          alert("Client supprimé avec succès!")
        })
        .catch((err) => {
          console.error("Error deleting client:", err)
          alert("Une erreur est survenue lors de la suppression du client")
        })
    }
  }

  const handleInputChange = (driverType, field, value) => {
    setNewClient((prev) => ({
      ...prev,
      conducteur: {
        ...prev.conducteur,
        [driverType]: {
          ...prev.conducteur[driverType],
          [field]: value,
        },
      },
    }))
  }

  // Add search handler
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  // Filter clients based on search term
  const filteredClients = clients.filter((client) => {
    if (searchTerm === "") return true

    const searchTermLower = searchTerm.toLowerCase()

    // Search in 1er conducteur
    const nom1 = client.conducteur["1er"].Nom?.toLowerCase() || ""
    const prenom1 = client.conducteur["1er"].Prénom?.toLowerCase() || ""
    const carte1 = client.conducteur["1er"].Carte?.toLowerCase() || ""

    // Search in 2eme conducteur
    const nom2 = client.conducteur["2eme"].Nom?.toLowerCase() || ""
    const prenom2 = client.conducteur["2eme"].Prénom?.toLowerCase() || ""

    // Search in 3eme conducteur
    const nom3 = client.conducteur["3eme"].Nom?.toLowerCase() || ""
    const prenom3 = client.conducteur["3eme"].Prénom?.toLowerCase() || ""

    return (
      nom1.includes(searchTermLower) ||
      prenom1.includes(searchTermLower) ||
      carte1.includes(searchTermLower) ||
      nom2.includes(searchTermLower) ||
      prenom2.includes(searchTermLower) ||
      nom3.includes(searchTermLower) ||
      prenom3.includes(searchTermLower) ||
      `${nom1} ${prenom1}`.includes(searchTermLower) ||
      `${nom2} ${prenom2}`.includes(searchTermLower) ||
      `${nom3} ${prenom3}`.includes(searchTermLower)
    )
  })

  const handleSubmit = (e) => {
    e.preventDefault()

    if (isEditing) {
      // Update existing client
      fetch(`http://localhost:3001/clients/${editingClientId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newClient),
      })
        .then(() => {
          fetchClients()
          setShowForm(false)
          resetForm()
          setIsEditing(false)
          setEditingClientId(null)
          alert("Client modifié avec succès!")
        })
        .catch((err) => {
          console.error("Error updating client:", err)
          alert("Une erreur est survenue lors de la modification du client")
        })
    } else {
      // Create new client
      const newId = clients.length > 0 ? Math.max(...clients.map((c) => Number.parseInt(c.id))) + 1 : 1

      fetch("http://localhost:3001/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: newId,
          ...newClient,
        }),
      })
        .then(() => {
          fetchClients()
          setShowForm(false)
          resetForm()
          alert("Client ajouté avec succès!")
        })
        .catch((err) => {
          console.error("Error adding client:", err)
          alert("Une erreur est survenue lors de l'ajout du client")
        })
    }
  }

  const resetForm = () => {
    setNewClient({
      conducteur: {
        "1er": {
          Nom: "",
          Prénom: "",
          "Né(e) le": "",
          "Tel Marocain": "",
          "Tel Etranger": "",
          "E-mail": "",
          "Adresse locale": "",
          "Adresse à l'etranger": "",
          "Permis de conduire N°": "",
          "Délivré le": "",
          Carte: "",
          "Passport N°": "",
          "Valable jusqu'au": "",
          "Recommandé(e) par": "",
          Nationalité: ""
        },
        "2eme": Object.fromEntries(Object.keys(newClient.conducteur["2eme"]).map((k) => [k, ""])),
        "3eme": Object.fromEntries(Object.keys(newClient.conducteur["3eme"]).map((k) => [k, ""])),
      },
    })
  }

  const handleCancel = () => {
    setShowForm(false)
    setIsEditing(false)
    setEditingClientId(null)
    resetForm()
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Gestion des Clients</h2>
        {!showForm && (
          <button className="nouveau-client-btn" onClick={() => setShowForm(true)}>
            <i className="fas fa-plus"></i> Nouveau Client
          </button>
        )}
      </div>

      {showForm ? (
        <div className="client-form-container">
          <div className="client-form">
            <h2>{isEditing ? "Modifier un Client" : "Ajouter un Nouveau Client"}</h2>
            <form onSubmit={handleSubmit}>
              {["1er", "2eme", "3eme"].map((driverType, index) => (
                <div key={driverType} className="driver-form-section">
                  <h3>
                    {driverType === "1er"
                      ? "1er Conducteur"
                      : driverType === "2eme"
                        ? "2ème Conducteur"
                        : "3ème Conducteur"}
                  </h3>
                  <div className="form-fields-grid">
                    {driverType === "1er" ? (
                      <>
                        <div className="form-group">
                          <label htmlFor={`${driverType}-Nom`}>Nom:</label>
                          <input
                            id={`${driverType}-Nom`}
                            type="text"
                            value={newClient.conducteur[driverType].Nom}
                            onChange={(e) => handleInputChange(driverType, "Nom", e.target.value)}
                            required
                            placeholder="Entrez le nom"
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor={`${driverType}-Prénom`}>Prénom:</label>
                          <input
                            id={`${driverType}-Prénom`}
                            type="text"
                            value={newClient.conducteur[driverType].Prénom}
                            onChange={(e) => handleInputChange(driverType, "Prénom", e.target.value)}
                            required
                            placeholder="Entrez le prénom"
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor={`${driverType}-Nationalité`}>Nationalité:</label>
                          <Select
                            id={`${driverType}-Nationalité`}
                            options={nationalities}
                            onChange={(selectedOption) => handleInputChange(driverType, "Nationalité", selectedOption ? selectedOption.value : "")}
                            value={nationalities.find(option => option.value === newClient.conducteur[driverType].Nationalité)}
                            placeholder="Sélectionnez une nationalité"
                            isClearable
                            isSearchable
                            styles={customStyles}
                            className="react-select-container"
                            classNamePrefix="react-select"
                          />
                        </div>
                      </>
                    ) : null}
                    {Object.keys(newClient.conducteur[driverType]).map((field) => {
                      if (driverType === "1er" && ["Nom", "Prénom", "Nationalité"].includes(field)) {
                        return null; // Skip rendering these fields here
                      }
                      return (
                        <div key={field} className="form-group">
                          <label htmlFor={`${driverType}-${field}`}>{field}:</label>
                          <input
                            id={`${driverType}-${field}`}
                            type={
                              field === "Né(e) le" || field.includes("Délivré") || field.includes("Valable")
                                ? "date"
                                : field.includes("E-mail")
                                  ? "email"
                                  : field.includes("Tel")
                                    ? "tel"
                                    : "text"
                            }
                            value={newClient.conducteur[driverType][field]}
                            onChange={(e) => handleInputChange(driverType, field, e.target.value)}
                            required={driverType === "1er" && ["Nom", "Prénom", "Né(e) le"].includes(field)}
                            placeholder={`Entrez ${field.toLowerCase()}`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="form-buttons">
                <button type="submit" className="submit-btn">
                  {isEditing ? "Mettre à jour" : "Enregistrer"}
                </button>
                <button type="button" className="cancel-btn" onClick={handleCancel}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="table-container">
          {/* Add search input */}
          <div className="search-container">
            <input
              type="text"
              placeholder="Rechercher par nom, prénom ou carte..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>
          <table className="clients-table">
            <thead>
              <tr>
                <th className="id-column">ID</th>
                <th className="driver-column">Conducteur</th>
                <th className="details-column">Détails</th>
                <th className="actions-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <React.Fragment key={client.id}>
                  {/* 1er Conducteur */}
                  <tr className="client-row primary-driver">
                    <td rowSpan="3" className="client-id">
                      {client.id}
                    </td>
                    <td className="driver-title">
                      <div className="driver-badge primary">
                        1<sup>er</sup> Conducteur
                      </div>
                    </td>
                    <td>
                      <div className="driver-details">
                        {Object.entries(client.conducteur["1er"]).map(([key, value]) => (
                          <div key={key} className="driver-detail">
                            <span className="detail-label">{key}:</span>
                            <span className="detail-value">{value || "-"}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td rowSpan="3" className="actions-cell">
                      <div className="action-buttons-container">
                        <button
                          className="action-btn modify-btn"
                          onClick={() => handleModify(client.id)}
                          title="Modifier ce client"
                        >
                          <i className="fas fa-edit"></i> Modifier
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(client.id)}
                          title="Supprimer ce client"
                        >
                          <i className="fas fa-trash-alt"></i> Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* 2ème Conducteur */}
                  <tr className="client-row secondary-driver">
                    <td className="driver-title">
                      <div className="driver-badge secondary">
                        2<sup>ème</sup> Conducteur
                      </div>
                    </td>
                    <td>
                      <div className="driver-details">
                        {Object.entries(client.conducteur["2eme"]).map(([key, value]) => (
                          <div key={key} className="driver-detail">
                            <span className="detail-label">{key}:</span>
                            <span className="detail-value">{value || "-"}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>

                  {/* 3ème Conducteur */}
                  <tr className="client-row tertiary-driver">
                    <td className="driver-title">
                      <div className="driver-badge tertiary">
                        3<sup>ème</sup> Conducteur
                      </div>
                    </td>
                    <td>
                      <div className="driver-details">
                        {Object.entries(client.conducteur["3eme"]).map(([key, value]) => (
                          <div key={key} className="driver-detail">
                            <span className="detail-label">{key}:</span>
                            <span className="detail-value">{value || "-"}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>

                  {/* Separator row */}
                  <tr className="separator-row">
                    <td colSpan="4"></td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ClientsTable
