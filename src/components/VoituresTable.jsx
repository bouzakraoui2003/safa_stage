import { useEffect, useState } from "react"
import "../styles/style.css"

const VoituresTable = () => {
  const [voitures, setVoitures] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingVoitureId, setEditingVoitureId] = useState(null)
  const [newVoiture, setNewVoiture] = useState({
    marque: "",
    type: "",
    model: "",
    matricule: "",
    "type carburant": "",
    "nbr de places": "",
    "boite vitesse": "",
    tarifs: {
      "1jour": "",
      "3jours": "",
      "7jours": "",
    },
    "date d'expiration d'assurance": "",
    "date d'expiration de la visite": "",
    etat: "Disponible", // Default value for 'Etat'
    image: "" // Added image field
  })
  // Add search state
  const [searchTerm, setSearchTerm] = useState("")
  // Add state for selected image
  const [selectedImage, setSelectedImage] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)

  useEffect(() => {
    fetchVoitures()
  }, [])

  const fetchVoitures = () => {
    console.log("Fetching voitures...")
    fetch("http://localhost:3001/voitures")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok")
        }
        return res.json()
      })
      .then((data) => {
        console.log("Fetched voitures:", data)
        setVoitures(data)
      })
      .catch((err) => console.error("Error fetching voitures:", err))
  }

  const handleModify = (voitureId) => {
    const voitureToEdit = voitures.find((v) => v.id == voitureId)
    if (voitureToEdit) {
      setNewVoiture(JSON.parse(JSON.stringify(voitureToEdit)))
      setIsEditing(true)
      setEditingVoitureId(voitureId)
      setShowForm(true)
      
      // Set preview image if the car has an image
      if (voitureToEdit.image) {
        // For preview, use URL.createObjectURL with the file
        // or a placeholder if we're just editing
        setPreviewImage("/placeholder.svg")
      } else {
        setPreviewImage(null)
      }
    }
  }

  const handleDelete = (voitureId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette voiture?")) {
      fetch(`http://localhost:3001/voitures/${voitureId}`, {
        method: "DELETE",
      })
        .then(() => {
          fetchVoitures()
          alert("Voiture supprimée avec succès!")
        })
        .catch((err) => {
          console.error("Error deleting voiture:", err)
          alert("Une erreur est survenue lors de la suppression")
        })
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith("tarifs.")) {
      const tarifKey = name.split(".")[1]
      setNewVoiture((prev) => ({
        ...prev,
        tarifs: {
          ...prev.tarifs,
          [tarifKey]: value,
        },
      }))
    } else {
      setNewVoiture((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        alert("Format d'image non valide. Veuillez sélectionner une image JPG, JPEG ou PNG.");
        return;
      }
      
      // Get just the filename
      const fileName = file.name
      
      // Create the full path as requested
      const fullPath = `C:\\Users\\Setup Game\\Desktop\\safa_stage_3\\lps-cars\\src\\voiture_images\\${fileName}`
      setSelectedImage(fileName)
      
      // Create a preview URL for the selected file
      const previewUrl = URL.createObjectURL(file)
      setPreviewImage(previewUrl)
      
      // Update the newVoiture state with the full path
      setNewVoiture(prev => ({
        ...prev,
        image: fullPath
      }))
    }
  }

  // Remove selected image
  const handleRemoveImage = () => {
    setSelectedImage(null)
    setPreviewImage(null)
    setNewVoiture(prev => ({
      ...prev,
      image: ""
    }))
  }

  // Add search handler
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  // Filter voitures based on search term
  const filteredVoitures = voitures.filter((voiture) => {
    if (searchTerm === "") return true

    const searchTermLower = searchTerm.toLowerCase()
    const marque = voiture.marque?.toLowerCase() || ""
    const type = voiture.type?.toLowerCase() || ""
    const matricule = voiture.matricule?.toLowerCase() || ""

    return (
      marque.includes(searchTermLower) ||
      type.includes(searchTermLower) ||
      matricule.includes(searchTermLower) ||
      `${marque} ${type}`.includes(searchTermLower)
    )
  })

  const handleSubmit = (e) => {
    e.preventDefault()

    if (isEditing) {
      // Update existing voiture
      fetch(`http://localhost:3001/voitures/${editingVoitureId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newVoiture),
      })
        .then(() => {
          fetchVoitures()
          setShowForm(false)
          resetForm()
          setIsEditing(false)
          setEditingVoitureId(null)
          alert("Voiture modifiée avec succès!")
        })
        .catch((err) => {
          console.error("Error updating voiture:", err)
          alert("Une erreur est survenue lors de la modification")
        })
    } else {
      // Create new voiture
      const newId = voitures.length > 0 ? Math.max(...voitures.map((v) => parseInt(v.id))) + 1 : 1

      fetch("http://localhost:3001/voitures", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: String(newId),
          ...newVoiture,
        }),
      })
        .then(() => {
          fetchVoitures()
          setShowForm(false)
          resetForm()
          alert("Voiture ajoutée avec succès!")
        })
        .catch((err) => {
          console.error("Error adding voiture:", err)
          alert("Une erreur est survenue lors de l'ajout")
        })
    }
  }

  const resetForm = () => {
    setNewVoiture({
      marque: "",
      type: "",
      model: "",
      matricule: "",
      "type carburant": "",
      "nbr de places": "",
      "boite vitesse": "",
      tarifs: {
        "1jour": "",
        "3jours": "",
        "7jours": "",
      },
      "date d'expiration d'assurance": "",
      "date d'expiration de la visite": "",
      etat: "Disponible", // Default value for 'Etat'
      image: "" // Reset image field
    })
    setSelectedImage(null)
    setPreviewImage(null)
  }

  const handleCancel = () => {
    setShowForm(false)
    setIsEditing(false)
    setEditingVoitureId(null)
    resetForm()
  }

  // Helper function to extract filename from full path
  const getImageFilename = (fullPath) => {
    if (!fullPath) return null
    return fullPath.split('\\').pop()
  }

  // Helper function to create a proper image URL
  const createImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already a relative path starting with /
    if (imagePath.startsWith('/')) {
      return imagePath;
    }
    
    // If it's an absolute path, extract just the filename
    const filename = imagePath.split('\\').pop();
    
    // Return the path relative to the public folder
    return `/voiture_images/${filename}`;
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1900 }, (_, i) => currentYear - i)

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Gestion des Voitures</h2>
        {!showForm && (
          <button className="nouveau-client-btn" onClick={() => setShowForm(true)}>
            <i className="fas fa-plus"></i> Nouvelle Voiture
          </button>
        )}
      </div>

      {showForm ? (
        <div className="client-form-container">
          <div className="client-form">
            <h2>{isEditing ? "Modifier une Voiture" : "Ajouter une Nouvelle Voiture"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="driver-form-section">
                <h3>Informations de la Voiture</h3>
                <div className="form-fields-grid">
                  <div className="form-group">
                    <label>Marque:</label>
                    <input
                      type="text"
                      name="marque"
                      value={newVoiture.marque}
                      onChange={handleInputChange}
                      required
                      placeholder="Entrez la marque"
                    />
                  </div>
                  <div className="form-group">
                    <label>Type:</label>
                    <input
                      type="text"
                      name="type"
                      value={newVoiture.type}
                      onChange={handleInputChange}
                      required
                      placeholder="Entrez le type"
                    />
                  </div>
                  <div className="form-group">
                    <label>Model:</label>
                    <select name="model" value={newVoiture.model} onChange={handleInputChange} required>
                      <option value="">Sélectionnez l'année</option>
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Matricule:</label>
                    <input
                      type="text"
                      name="matricule"
                      value={newVoiture.matricule}
                      onChange={handleInputChange}
                      required
                      placeholder="Entrez le matricule"
                    />
                  </div>
                  <div className="form-group">
                    <label>Type de carburant:</label>
                    <select
                      name="type carburant"
                      value={newVoiture["type carburant"]}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Sélectionnez</option>
                      <option value="Essence">Essence</option>
                      <option value="Diesel">Diesel</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Nombre de places:</label>
                    <input
                      type="number"
                      name="nbr de places"
                      value={newVoiture["nbr de places"]}
                      onChange={handleInputChange}
                      required
                      min="2"
                      max="12"
                      placeholder="Entrez le nombre de places"
                    />
                  </div>
                  <div className="form-group">
                    <label>Boîte de vitesse:</label>
                    <select
                      name="boite vitesse"
                      value={newVoiture["boite vitesse"]}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Sélectionnez</option>
                      <option value="automatic">Automatique</option>
                      <option value="manuelle">Manuelle</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Tarif 1 jour (MAD):</label>
                    <input
                      type="number"
                      name="tarifs.1jour"
                      value={newVoiture.tarifs["1jour"]}
                      onChange={handleInputChange}
                      required
                      placeholder="Tarif pour 1 jour"
                    />
                  </div>
                  <div className="form-group">
                    <label>Tarif 3 jours (MAD):</label>
                    <input
                      type="number"
                      name="tarifs.3jours"
                      value={newVoiture.tarifs["3jours"]}
                      onChange={handleInputChange}
                      required
                      placeholder="Tarif pour 3 jours"
                    />
                  </div>
                  <div className="form-group">
                    <label>Tarif 7 jours (MAD):</label>
                    <input
                      type="number"
                      name="tarifs.7jours"
                      value={newVoiture.tarifs["7jours"]}
                      onChange={handleInputChange}
                      required
                      placeholder="Tarif pour 7 jours"
                    />
                  </div>
                  <div className="form-group">
                    <label>Date d'expiration d'assurance:</label>
                    <input
                      type="date"
                      name="date d'expiration d'assurance"
                      value={newVoiture["date d'expiration d'assurance"]}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Date d'expiration de la visite:</label>
                    <input
                      type="date"
                      name="date d'expiration de la visite"
                      value={newVoiture["date d'expiration de la visite"]}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Etat:</label>
                    <select name="etat" value={newVoiture.etat} onChange={handleInputChange} required>
                      <option value="Disponible">Disponible</option>
                      <option value="Réservée">Réservée</option>
                      <option value="En Réparation">En Réparation</option>
                      <option value="Hors Service">Hors Service</option>
                    </select>
                  </div>
                  
                  {/* Add image upload field - spans 2 columns */}
                  <div className="form-group image-upload-group">
                    <label>Photo de voiture:</label>
                    <div className="image-upload-container">
                      <input
                        type="file"
                        id="car-image"
                        className="image-upload-input"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      <label htmlFor="car-image" className="image-upload-label">
                        <i className="fas fa-upload"></i> Choisir une image
                      </label>
                      
                      {previewImage && (
                        <div className="image-preview-container">
                          <img src={previewImage || "/placeholder.svg"} alt="Aperçu" className="image-preview" />
                          <button 
                            type="button" 
                            className="remove-image-btn" 
                            onClick={handleRemoveImage}
                            title="Supprimer l'image"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      )}
                      
                      <small>
                        Sélectionnez une image depuis le dossier voiture_images
                      </small>
                    </div>
                  </div>
                </div>
              </div>
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
              placeholder="Rechercher par marque, type ou matricule..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>
          <table className="clients-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Photo de voiture</th> {/* New column for car image */}
                <th>Marque</th>
                <th>Type</th>
                <th>Model</th>
                <th>Matricule</th>
                <th>Carburant</th>
                <th>Places</th>
                <th>Boîte de vitesse</th>
                <th>Tarifs (1j/3j/7j)</th>
                <th>Assurance</th>
                <th>Visite</th>
                <th>Etat</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVoitures.map((voiture) => (
                <tr key={voiture.id}>
                  <td>{voiture.id}</td>
                  <td className="car-image-cell">
                    {voiture.image ? (
                      <img 
                        src={createImageUrl(voiture.image)}
                        alt={`${voiture.marque} ${voiture.type}`} 
                        className="car-thumbnail"
                        onError={(e) => {
                          console.error("Image failed to load:", e);
                          e.target.src = "/placeholder.svg";
                          e.target.alt = "Image non disponible";
                        }}
                      />
                    ) : (
                      <div className="no-image">Pas d'image</div>
                    )}
                  </td>
                  <td>{voiture.marque}</td>
                  <td>{voiture.type}</td>
                  <td>{voiture.model}</td>
                  <td>{voiture.matricule}</td>
                  <td>{voiture["type carburant"]}</td>
                  <td>{voiture["nbr de places"]}</td>
                  <td>{voiture["boite vitesse"] === "automatic" ? "Automatique" : "Manuelle"}</td>
                  <td>
                    {voiture.tarifs["1jour"]} / {voiture.tarifs["3jours"]} / {voiture.tarifs["7jours"]} MAD
                  </td>
                  <td>{voiture["date d'expiration d'assurance"]}</td>
                  <td>{voiture["date d'expiration de la visite"]}</td>
                  <td>{voiture.etat}</td>
                  <td className="actions-cell">
                    <div className="action-buttons-container">
                      <button
                        className="action-btn modify-btn"
                        onClick={() => handleModify(voiture.id)}
                        title="Modifier cette voiture"
                      >
                        <i className="fas fa-edit"></i> Modifier
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(voiture.id)}
                        title="Supprimer cette voiture"
                      >
                        <i className="fas fa-trash-alt"></i> Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default VoituresTable