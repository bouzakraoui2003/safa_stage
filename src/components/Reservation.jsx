"use client"

import { useEffect, useState } from "react"
import Select from "react-select"
import "../styles/style.css"

const Reservation = () => {
  const [reservations, setReservations] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [voitures, setVoitures] = useState([])
  const [clients, setClients] = useState([])
  const [newReservation, setNewReservation] = useState({
    voitureId: "",
    clientId: "",
    dateDebut: "",
    dateFin: "",
    lieuReservation: "",
    telClient: "",
    emailClient: "",
    marque: "",
    accessoires: {
      siegeBebe: false,
      carte: false,
      gps: false,
      gallerie: false,
    },
    nationality: "" // Add nationality field
  })
  const [clientOption, setClientOption] = useState(null)
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

  const [filteredVoitures, setFilteredVoitures] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editingReservationId, setEditingReservationId] = useState(null)

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

  useEffect(() => {
    fetchReservations()
    fetchVoitures()
    fetchClients()
  }, [])

  const fetchReservations = () => {
    fetch("http://localhost:3001/reservations")
      .then((res) => res.json())
      .then((data) => setReservations(data))
      .catch((err) => console.error("Error fetching reservations:", err))
  }

  const fetchVoitures = () => {
    fetch("http://localhost:3001/voitures")
      .then((res) => res.json())
      .then((data) => setVoitures(data))
      .catch((err) => console.error("Error fetching voitures:", err))
  }

  const fetchClients = () => {
    fetch("http://localhost:3001/clients")
      .then((res) => res.json())
      .then((data) => setClients(data))
      .catch((err) => console.error("Error fetching clients:", err))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewReservation((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCheckboxChange = (accessoire) => {
    setNewReservation((prev) => ({
      ...prev,
      accessoires: {
        ...prev.accessoires,
        [accessoire]: !prev.accessoires[accessoire],
      },
    }))
  }

  const handleClientInputChange = (driverType, field, value) => {
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

  const handleMarqueChange = (selectedOption) => {
    const marque = selectedOption ? selectedOption.value : ""
    setNewReservation((prev) => ({
      ...prev,
      marque,
      voitureId: "", // Reset voitureId when marque changes
    }))

    if (marque) {
      const availableVoituresByMarque = voitures.filter(
        (voiture) => voiture.marque === marque && voiture.etat === "Disponible",
      )
      setFilteredVoitures(availableVoituresByMarque)
    } else {
      setFilteredVoitures([])
    }
  }

  const handleVoitureIdChange = (selectedOption) => {
    const voitureId = selectedOption ? selectedOption.value : ""
    setNewReservation((prev) => ({
      ...prev,
      voitureId,
    }))
  }

  const handleConducteurChange = (selectedOption) => {
    const clientId = selectedOption ? selectedOption.value : ""
    const client = clients.find((client) => client.id === clientId)
    if (client) {
      setNewReservation((prev) => ({
        ...prev,
        clientId: clientId,
        telClient: client.conducteur["1er"]["Tel Marocain"],
        emailClient: client.conducteur["1er"]["E-mail"],
        nationality: client.conducteur["1er"]["Nationalité"], // Add nationality
      }))
    }
  }

  const saveNewClient = () => {
    if (!newClient.conducteur["1er"].Nom || !newClient.conducteur["1er"].Prénom) {
      alert("Veuillez remplir au moins le nom et prénom du conducteur principal.")
      return
    }

    const newId = clients.length > 0 ? Math.max(...clients.map((c) => Number(c.id))) + 1 : 1

    const clientToSave = {
      id: newId.toString(),
      ...newClient,
    }

    fetch("http://localhost:3001/clients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(clientToSave),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to save client")
        }
        return res.json()
      })
      .then((savedClient) => {
        setClients((prevClients) => [...prevClients, savedClient])

        setNewReservation((prev) => ({
          ...prev,
          clientId: savedClient.id,
          telClient: savedClient.conducteur["1er"]["Tel Marocain"] || "",
          emailClient: savedClient.conducteur["1er"]["E-mail"] || "",
          nationality: savedClient.conducteur["1er"]["Nationalité"], // Add nationality
        }))

        setClientOption("existing")

        alert("Client ajouté avec succès!")
      })
      .catch((err) => {
        console.error("Error saving client:", err)
        alert("Une erreur est survenue lors de l'ajout du client")
      })
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const filteredReservations = reservations.filter((reservation) => {
    if (searchTerm === "") return true

    const voiture = voitures.find((v) => v.id === reservation.voitureId)
    const client = clients.find((c) => c.id === reservation.clientId)

    const voitureMarque = voiture ? voiture.marque.toLowerCase() : ""
    const voitureType = voiture ? voiture.type.toLowerCase() : ""
    const clientNom = client ? client.conducteur["1er"].Nom.toLowerCase() : ""
    const clientPrenom = client ? client.conducteur["1er"].Prénom.toLowerCase() : ""

    const searchTermLower = searchTerm.toLowerCase()

    return (
      voitureMarque.includes(searchTermLower) ||
      voitureType.includes(searchTermLower) ||
      clientNom.includes(searchTermLower) ||
      clientPrenom.includes(searchTermLower)
    )
  })

  const handleEdit = (reservation) => {
    setEditingReservationId(reservation.id)
    setNewReservation({
      voitureId: reservation.voitureId,
      clientId: reservation.clientId,
      dateDebut: reservation.dateDebut,
      dateFin: reservation.dateFin,
      lieuReservation: reservation.lieuReservation,
      telClient: reservation.telClient,
      emailClient: reservation.emailClient,
      marque: voitures.find((v) => v.id === reservation.voitureId)?.marque || "",
      accessoires: reservation.accessoires || {
        siegeBebe: false,
        carte: false,
        gps: false,
        gallerie: false,
      },
      nationality: clients.find((c) => c.id === reservation.clientId)?.conducteur["1er"]["Nationalité"] || "", // Add nationality
    })
    setIsEditing(true)
    setShowForm(true)
    setClientOption("existing")

    const selectedMarque = voitures.find((v) => v.id === reservation.voitureId)?.marque
    if (selectedMarque) {
      const availableVoituresByMarque = voitures.filter(
        (voiture) =>
          voiture.marque === selectedMarque && (voiture.etat === "Disponible" || voiture.id === reservation.voitureId),
      )
      setFilteredVoitures(availableVoituresByMarque)
    }
  }

  const handleDelete = (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette réservation?")) {
      const reservation = reservations.find((r) => r.id === id)
      const voitureId = reservation?.voitureId

      fetch(`http://localhost:3001/reservations/${id}`, {
        method: "DELETE",
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to delete reservation")
          }

          if (voitureId) {
            return fetch(`http://localhost:3001/voitures/${voitureId}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                etat: "Disponible",
              }),
            })
          }
        })
        .then(() => {
          setReservations(reservations.filter((r) => r.id !== id))

          if (voitureId) {
            setVoitures((prevVoitures) =>
              prevVoitures.map((voiture) => (voiture.id === voitureId ? { ...voiture, etat: "Disponible" } : voiture)),
            )
          }

          alert("Réservation supprimée avec succès!")
        })
        .catch((err) => {
          console.error("Error deleting reservation:", err)
          alert("Une erreur est survenue lors de la suppression de la réservation")
        })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const selectedCar = voitures.find((car) => car.id === newReservation.voitureId)
    if (!selectedCar || (selectedCar.etat !== "Disponible" && !isEditing)) {
      alert("Cette voiture n'est pas disponible. Veuillez en choisir une autre.")
      return
    }

    if (isEditing) {
      fetch(`http://localhost:3001/reservations/${editingReservationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newReservation),
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to update reservation")
          }
          return res.json()
        })
        .then(() => {
          fetchReservations()
          setShowForm(false)
          setClientOption(null)
          setIsEditing(false)
          setEditingReservationId(null)
          resetForm()
          alert("Réservation modifiée avec succès!")
        })
        .catch((err) => {
          console.error("Error updating reservation:", err)
          alert("Une erreur est survenue lors de la modification de la réservation")
        })
    } else {
      const newId = reservations.length > 0 ? Math.max(...reservations.map((r) => r.id)) + 1 : 1

      fetch("http://localhost:3001/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: newId,
          ...newReservation,
        }),
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to create reservation")
          }
          return res.json()
        })
        .then(() => {
          fetch(`http://localhost:3001/voitures/${newReservation.voitureId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              etat: "Réservée",
            }),
          })
        })
        .then(() => {
          setVoitures((prevVoitures) =>
            prevVoitures.map((voiture) =>
              voiture.id === newReservation.voitureId ? { ...voiture, etat: "Réservée" } : voiture,
            ),
          )

          const updatedFilteredVoitures = filteredVoitures.filter((voiture) => voiture.id !== newReservation.voitureId)
          setFilteredVoitures(updatedFilteredVoitures)

          fetchReservations()
          setShowForm(false)
          setClientOption(null)
          resetForm()
          alert("Réservation ajoutée avec succès!")
        })
        .catch((err) => {
          console.error("Error in reservation process:", err)
          alert("Une erreur est survenue lors de l'ajout de la réservation")
        })
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setClientOption(null)
    setIsEditing(false)
    setEditingReservationId(null)
    resetForm()
  }

  const resetForm = () => {
    setNewReservation({
      voitureId: "",
      clientId: "",
      dateDebut: "",
      dateFin: "",
      lieuReservation: "",
      telClient: "",
      emailClient: "",
      marque: "",
      accessoires: {
        siegeBebe: false,
        carte: false,
        gps: false,
        gallerie: false,
      },
      nationality: "" // Reset nationality
    })
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
  }

  const availableBrands = Array.from(
    new Set(voitures.filter((voiture) => voiture.etat === "Disponible").map((voiture) => voiture.marque)),
  )

  const marqueOptions = availableBrands.map((marque) => {
    const carsOfBrand = voitures.filter((v) => v.marque === marque && v.etat === "Disponible")
    return {
      value: marque,
      label: `${marque} ${carsOfBrand.length > 0 ? carsOfBrand[0].type : ""}`,
    }
  })

  const matriculeOptions = filteredVoitures.map((voiture) => ({
    value: voiture.id,
    label: `${voiture.matricule} ${voiture.etat === "Disponible" ? "(Disponible)" : "(Indisponible)"}`,
  }))

  const conducteurOptions = clients.map((client) => ({
    value: client.id,
    label: `${client.conducteur["1er"].Nom} ${client.conducteur["1er"].Prénom}`,
  }))

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
  }

  const renderClientOptions = () => {
    return (
      <div className="client-options-container">
        <h2>Choisir une option</h2>
        <div className="client-options-buttons">
          <button className="option-btn existing-client-btn" onClick={() => setClientOption("existing")}>
            <i className="fas fa-user"></i>
            Client Existant
          </button>
          <button className="option-btn new-client-btn" onClick={() => setClientOption("new")}>
            <i className="fas fa-user-plus"></i>
            Nouveau Client
          </button>
        </div>
      </div>
    )
  }

  const renderNewClientForm = () => {
    return (
      <div className="client-form">
        <h2>Ajouter un Nouveau Client</h2>
        <div className="driver-form-section primary-driver">
          <h3>1er Conducteur</h3>
          <div className="form-fields-grid">
            <div className="form-group">
              <label htmlFor="1er-Nom">Nom:</label>
              <input
                id="1er-Nom"
                type="text"
                value={newClient.conducteur["1er"].Nom}
                onChange={(e) => handleClientInputChange("1er", "Nom", e.target.value)}
                required
                placeholder="Entrez le nom"
              />
            </div>
            <div className="form-group">
              <label htmlFor="1er-Prénom">Prénom:</label>
              <input
                id="1er-Prénom"
                type="text"
                value={newClient.conducteur["1er"].Prénom}
                onChange={(e) => handleClientInputChange("1er", "Prénom", e.target.value)}
                required
                placeholder="Entrez le prénom"
              />
            </div>
            <div className="form-group">
              <label htmlFor="1er-Nationalité">Nationalité:</label>
              <Select
                id="1er-Nationalité"
                options={nationalities}
                onChange={(selectedOption) => handleClientInputChange("1er", "Nationalité", selectedOption ? selectedOption.value : "")}
                value={nationalities.find(option => option.value === newClient.conducteur["1er"].Nationalité)}
                placeholder="Sélectionnez une nationalité"
                isClearable
                isSearchable
                styles={customStyles}
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
            {Object.keys(newClient.conducteur["1er"]).map((field) => {
              if (["Nom", "Prénom", "Nationalité"].includes(field)) {
                return null;
              }
              return (
                <div key={field} className="form-group">
                  <label htmlFor={`1er-${field}`}>{field}:</label>
                  <input
                    id={`1er-${field}`}
                    type={
                      field === "Né(e) le" || field.includes("Délivré") || field.includes("Valable")
                        ? "date"
                        : field.includes("E-mail")
                          ? "email"
                          : field.includes("Tel")
                            ? "tel"
                            : "text"
                    }
                    value={newClient.conducteur["1er"][field]}
                    onChange={(e) => handleClientInputChange("1er", field, e.target.value)}
                    required={["Nom", "Prénom", "Né(e) le"].includes(field)}
                    placeholder={`Entrez ${field.toLowerCase()}`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="driver-form-section secondary-driver">
          <h3>2ème Conducteur</h3>
          <div className="form-fields-grid">
            {Object.keys(newClient.conducteur["2eme"]).map((field) => (
              <div key={field} className="form-group">
                <label htmlFor={`2eme-${field}`}>{field}:</label>
                <input
                  id={`2eme-${field}`}
                  type={field.includes("Délivré") ? "date" : field.includes("Tel") ? "tel" : "text"}
                  value={newClient.conducteur["2eme"][field]}
                  onChange={(e) => handleClientInputChange("2eme", field, e.target.value)}
                  placeholder={`Entrez ${field.toLowerCase()}`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="driver-form-section tertiary-driver">
          <h3>3ème Conducteur</h3>
          <div className="form-fields-grid">
            {Object.keys(newClient.conducteur["3eme"]).map((field) => (
              <div key={field} className="form-group">
                <label htmlFor={`3eme-${field}`}>{field}:</label>
                <input
                  id={`3eme-${field}`}
                  type={field.includes("Délivré") ? "date" : "text"}
                  value={newClient.conducteur["3eme"][field]}
                  onChange={(e) => handleClientInputChange("3eme", field, e.target.value)}
                  placeholder={`Entrez ${field.toLowerCase()}`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="form-buttons">
          <button type="button" className="submit-btn" onClick={saveNewClient}>
            Enregistrer Client
          </button>
          <button type="button" className="cancel-btn" onClick={handleCancel}>
            Annuler
          </button>
        </div>
      </div>
    )
  }

  const renderReservationForm = () => {
    return (
      <div className="client-form">
        <h2>{isEditing ? "Modifier la Réservation" : "Ajouter une Nouvelle Réservation"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="driver-form-section">
            <h3>Informations de la Réservation</h3>
            <div className="form-fields-grid">
              <div className="form-group">
                <label>Voiture:</label>
                <Select
                  options={marqueOptions}
                  onChange={handleMarqueChange}
                  placeholder="Sélectionnez la voiture"
                  isClearable
                  styles={customStyles}
                  value={newReservation.marque ? { value: newReservation.marque, label: newReservation.marque } : null}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>
              <div className="form-group">
                <label>Matricule:</label>
                <Select
                  options={matriculeOptions}
                  onChange={handleVoitureIdChange}
                  placeholder="Sélectionnez le matricule"
                  isClearable
                  isDisabled={!newReservation.marque}
                  styles={customStyles}
                  value={
                    newReservation.voitureId
                      ? matriculeOptions.find((option) => option.value === newReservation.voitureId)
                      : null
                  }
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>
              <div className="form-group">
                <label>Conducteur:</label>
                <Select
                  options={conducteurOptions}
                  onChange={handleConducteurChange}
                  placeholder="Sélectionnez le conducteur"
                  isClearable
                  styles={customStyles}
                  value={
                    newReservation.clientId
                      ? conducteurOptions.find((option) => option.value === newReservation.clientId)
                      : null
                  }
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>
              <div className="form-group">
                <label>Tel client:</label>
                <input
                  type="tel"
                  name="telClient"
                  value={newReservation.telClient}
                  onChange={handleInputChange}
                  required
                  readOnly
                />
              </div>
              <div className="form-group">
                <label>E-mail client:</label>
                <input
                  type="email"
                  name="emailClient"
                  value={newReservation.emailClient}
                  onChange={handleInputChange}
                  required
                  readOnly
                />
              </div>
              {isEditing && (
                <div className="form-group">
                  <label>Nationalité:</label>
                  <Select
                    options={nationalities}
                    onChange={(selectedOption) =>
                      setNewReservation((prev) => ({
                        ...prev,
                        nationality: selectedOption ? selectedOption.value : "",
                      }))
                    }
                    value={nationalities.find((option) => option.value === newReservation.nationality)}
                    placeholder="Sélectionnez une nationalité"
                    isClearable
                    isSearchable
                    styles={customStyles}
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>
              )}
              <div className="form-group">
                <label>Date début:</label>
                <input
                  type="date"
                  name="dateDebut"
                  value={newReservation.dateDebut}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Date fin:</label>
                <input
                  type="date"
                  name="dateFin"
                  value={newReservation.dateFin}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Lieu de réservation:</label>
                <input
                  type="text"
                  name="lieuReservation"
                  value={newReservation.lieuReservation}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="accessoires-section">
              <h3>Accessoires Supplémentaires</h3>
              <div className="checkbox-group">
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="siegeBebe"
                    checked={newReservation.accessoires.siegeBebe}
                    onChange={() => handleCheckboxChange("siegeBebe")}
                  />
                  <label htmlFor="siegeBebe">Siège bébé</label>
                </div>
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="carte"
                    checked={newReservation.accessoires.carte}
                    onChange={() => handleCheckboxChange("carte")}
                  />
                  <label htmlFor="carte">Carte</label>
                </div>
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="gps"
                    checked={newReservation.accessoires.gps}
                    onChange={() => handleCheckboxChange("gps")}
                  />
                  <label htmlFor="gps">GPS</label>
                </div>
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="gallerie"
                    checked={newReservation.accessoires.gallerie}
                    onChange={() => handleCheckboxChange("gallerie")}
                  />
                  <label htmlFor="gallerie">Gallerie</label>
                </div>
              </div>
            </div>
          </div>
          <div className="form-buttons">
            <button type="submit" className="submit-btn">
              Enregistrer
            </button>
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Annuler
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Gestion des Réservations</h2>
        {!showForm && (
          <button className="nouveau-client-btn" onClick={() => setShowForm(true)}>
            <i className="fas fa-plus"></i> Nouvelle Réservation
          </button>
        )}
      </div>

      {showForm ? (
        <div className="client-form-container">
          {!clientOption && renderClientOptions()}
          {clientOption === "new" && renderNewClientForm()}
          {clientOption === "existing" && renderReservationForm()}
        </div>
      ) : (
        <div className="table-container">
          <div className="search-container">
            <input
              type="text"
              placeholder="Rechercher par marque de voiture ou nom de conducteur..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>
          <table className="clients-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date de réservation</th>
                <th>Nom</th>
                <th>Email</th>
                <th>Numéro de tel</th>
                <th>Nationalité</th>
                <th>Marque de voiture</th>
                <th>Matricule</th>
                <th>Date de début</th>
                <th>Date de fin</th>
                <th>Accessoires</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map((reservation) => {
                const voiture = voitures.find((v) => v.id === reservation.voitureId)
                const client = clients.find((c) => c.id === reservation.clientId)
                const clientName = client ? `${client.conducteur["1er"].Nom} ${client.conducteur["1er"].Prénom}` : "N/A"
                const clientNationality = client?.conducteur["1er"]["Adresse à l'etranger"]
                  ? client.conducteur["1er"]["Adresse à l'etranger"].split(", ").pop()
                  : "Marocain"

                return (
                  <tr key={reservation.id}>
                    <td>{reservation.id}</td>
                    <td>{new Date().toLocaleDateString()}</td>
                    <td>{clientName}</td>
                    <td>{reservation.emailClient}</td>
                    <td>{reservation.telClient}</td>
                    <td>{clientNationality}</td>
                    <td>{reservation.marque}</td>
                    <td>{voiture?.matricule || "N/A"}</td>
                    <td>{reservation.dateDebut}</td>
                    <td>{reservation.dateFin}</td>
                    <td>
                      {reservation.accessoires ? (
                        <div className="accessoires-list">
                          {reservation.accessoires.siegeBebe && <span className="accessoire-tag">Siège bébé</span>}
                          {reservation.accessoires.carte && <span className="accessoire-tag">Carte</span>}
                          {reservation.accessoires.gps && <span className="accessoire-tag">GPS</span>}
                          {reservation.accessoires.gallerie && <span className="accessoire-tag">Gallerie</span>}
                        </div>
                      ) : (
                        ""
                      )}
                    </td>
                    <td>
                      <div className="action-buttons-container">
                        <button className="action-btn modify-btn" onClick={() => handleEdit(reservation)}>
                          <i className="fas fa-edit"></i> Modifier
                        </button>
                        <button className="action-btn delete-btn" onClick={() => handleDelete(reservation.id)}>
                          <i className="fas fa-trash"></i> Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Reservation
