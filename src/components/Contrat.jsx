"use client"

import { useEffect, useState } from "react"
import "../styles/style.css"
import { jsPDF } from "jspdf"
// Remove or comment out the jspdf-autotable import since it's not working
// import "jspdf-autotable"

const Contrat = () => {
  const [contracts, setContracts] = useState([])
  const [reservations, setReservations] = useState([])
  const [voitures, setVoitures] = useState([])
  const [clients, setClients] = useState([])
  const [contratData, setContratData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedContract, setExpandedContract] = useState(null)
  const [logoImg, setLogoImg] = useState(null)
  const [carImg, setCarImg] = useState(null)

  // Direct image URLs - using these as primary sources
  const logoUrl = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LPS-zgYjp3NJakjsDFheGhYdLKLJDuNlIv.png"
  const carImageUrl =
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/etatVoiture.jpeg-2hTZOscvwmoMQ3nNvzd3peUBGVUSEy.png"

  // Add these styles to your CSS file
  const conducteurSectionStyles = `
  .conducteur-section {
    margin-bottom: 15px;
    padding: 10px;
    border-radius: 5px;
    background-color: rgba(0, 0, 0, 0.02);
  }

  .conducteur-section h4 {
    margin-top: 0;
    margin-bottom: 10px;
    font-size: 1rem;
    color: #333;
    border-bottom: 1px solid #ddd;
    padding-bottom: 5px;
  }

  .conducteur-section:not(:last-child) {
    margin-bottom: 15px;
  }

  @media print {
    .no-print {
      display: none;
    }
  }

  .pdf-container {
    display: none;
  }
`

  // Add the styles to the document
  useEffect(() => {
    const styleElement = document.createElement("style")
    styleElement.innerHTML = conducteurSectionStyles
    document.head.appendChild(styleElement)

    // Improved image loading with better error handling
    const loadImage = (url, setter) => {
      console.log(`Attempting to load image from: ${url}`)
      const img = new Image()
      img.crossOrigin = "anonymous"

      // Set up event handlers before setting src
      img.onload = () => {
        console.log(`Successfully loaded image from: ${url}`)
        setter(img)
      }

      img.onerror = (e) => {
        console.error(`Error loading image from: ${url}`, e)
      }

      // Set src after event handlers
      img.src = url
    }

    // Load images directly from blob URLs
    loadImage(logoUrl, setLogoImg)
    loadImage(carImageUrl, setCarImg)

    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

  // Function to generate a unique contract number
  const generateContractNumber = (contractId) => {
    // Find the contract in the contratData array
    const existingContract = contratData.find((c) => c.reservationId === String(contractId))

    if (existingContract) {
      return existingContract.numeroContrat
    }

    // If we get here, it means we need to create a new contract number
    // This should only happen if a new reservation was added but no contract was created
    const currentYear = new Date().getFullYear()
    const nextId = contratData.length > 0 ? Math.max(...contratData.map((c) => Number.parseInt(c.id))) + 1 : 1
    const paddedId = String(nextId).padStart(5, "0")
    const newContractNumber = `CR${currentYear}${paddedId}`

    // Create a new contract entry
    const newContract = {
      id: String(nextId),
      reservationId: String(contractId),
      numeroContrat: newContractNumber,
      dateCreation: new Date().toISOString().split("T")[0],
    }

    // Save the new contract to the server
    fetch("http://localhost:3001/contrats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newContract),
    })
      .then((response) => response.json())
      .then((savedContract) => {
        // Update the local state with the new contract
        setContratData((prev) => [...prev, savedContract])
      })
      .catch((error) => {
        console.error("Error saving contract:", error)
      })

    return newContractNumber
  }

  useEffect(() => {
    // Fetch all necessary data
    Promise.all([
      fetch("http://localhost:3001/reservations").then((res) => res.json()),
      fetch("http://localhost:3001/voitures").then((res) => res.json()),
      fetch("http://localhost:3001/clients").then((res) => res.json()),
      fetch("http://localhost:3001/contrats").then((res) => res.json()),
    ])
      .then(([reservationsData, voituresData, clientsData, contratsData]) => {
        setReservations(reservationsData)
        setVoitures(voituresData)
        setClients(clientsData)
        setContratData(contratsData)

        // Create contracts by joining data
        const contractsData = reservationsData.map((reservation) => {
          const voiture = voituresData.find((v) => v.id === reservation.voitureId) || {}
          const client = clientsData.find((c) => c.id === reservation.clientId) || {
            conducteur: { "1er": {} },
          }

          // Find the contract data for this reservation
          const contrat = contratsData.find((c) => c.reservationId === String(reservation.id)) || {}

          return {
            id: reservation.id,
            reservation: reservation,
            voiture: voiture,
            client: client,
            contrat: contrat,
          }
        })

        setContracts(contractsData)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching data:", error)
        setLoading(false)
      })
  }, [])

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  // Update the generatePDF function to handle image loading issues better
  const generatePDF = (contract) => {
    console.log("Starting PDF generation...")

    // Check if images are loaded
    if (!logoImg || !carImg) {
      console.log("Images not loaded yet, loading them now...")

      // Create new Image objects for direct use in PDF
      const logo = new Image()
      logo.crossOrigin = "anonymous"
      logo.src = logoUrl

      const car = new Image()
      car.crossOrigin = "anonymous"
      car.src = carImageUrl

      // Wait for both images to load
      Promise.all([
        new Promise((resolve) => {
          logo.onload = () => {
            console.log("Logo loaded successfully")
            setLogoImg(logo)
            resolve()
          }
          logo.onerror = () => {
            console.error("Failed to load logo")
            resolve() // Continue even if logo fails
          }
        }),
        new Promise((resolve) => {
          car.onload = () => {
            console.log("Car image loaded successfully")
            setCarImg(car)
            resolve()
          }
          car.onerror = () => {
            console.error("Failed to load car image")
            resolve() // Continue even if car image fails
          }
        }),
      ]).then(() => {
        // Try generating PDF again after images are loaded
        setTimeout(() => generatePDF(contract), 500)
      })

      return // Exit this attempt and wait for images
    }

    // Create a new PDF document
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    // Set font
    doc.setFont("helvetica")

    // Function to add a page with specific background color
    const addContractPage = (bgColor = null, pageNumber = 1, totalPages = 3) => {
      // Add background color if specified
      if (bgColor) {
        // Convert hex to RGB
        const r = Number.parseInt(bgColor.slice(1, 3), 16)
        const g = Number.parseInt(bgColor.slice(3, 5), 16)
        const b = Number.parseInt(bgColor.slice(5, 7), 16)

        // Fill the entire page with the background color
        doc.setFillColor(r, g, b)
        doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, "F")
      }

      try {
        // Add header with logo on left and company info on right
        if (logoImg) {
          console.log("Adding logo to PDF")
          try {
            // Position the logo at the top left with original size
            doc.addImage(logoImg, "PNG", 10, 5, 30, 22)
          } catch (error) {
            console.error("Error adding logo to PDF:", error)
          }
        } else {
          console.log("Logo image not available, skipping")
        }

        // Add company information on the right side
        doc.setFontSize(6)
        doc.text("LPS : Location Promotion Souss", 195, 7, { align: "right" })
        doc.text("20, Galerie Yassine N°6, Avenue des FAR, Agadir", 195, 10, { align: "right" })
        doc.text("GSM: +212 (0) 6 00 03 35 02 / +212 (0) 6 61 91 01 26", 195, 13, { align: "right" })
        doc.text("Tél/Fax: +212 (0) 5 28 84 41 07", 195, 16, { align: "right" })
        doc.text("Site: www.lps-car.com", 195, 19, { align: "right" })
        doc.text("E-mail: lpscar.agadir@gmail.com", 195, 22, { align: "right" })

        // Add contract title
        doc.setFontSize(12)
        doc.setFont("helvetica", "bold")
        doc.text("CONTRAT DE LOCATION", 105, 30, { align: "center" })

        // Add contract number and date
        doc.setFontSize(8)
        doc.text(`N° Contrat: ${getContractNumber(contract.id)}`, 15, 35)
        doc.text(`Date de création: ${getContractDate(contract.id)}`, 195, 35, { align: "right" })

        // Add client information
        let yPos = 40
        doc.setFontSize(10)
        doc.setFont("helvetica", "bold")
        doc.text("Informations Client", 15, yPos)
        yPos += 5

        // Premier Conducteur
        doc.setFontSize(8)
        doc.setFont("helvetica", "bold")
        doc.text("Premier Conducteur", 15, yPos)
        doc.setFont("helvetica", "normal")
        yPos += 4
        doc.setDrawColor(0, 0, 0)
        doc.rect(15, yPos - 3, 180, 20)
        doc.setFontSize(7)
        doc.text(`Nom: ${contract.client.conducteur["1er"].Nom || ""}`, 20, yPos)
        doc.text(`Prénom: ${contract.client.conducteur["1er"].Prénom || ""}`, 105, yPos)
        yPos += 4
        doc.text(`Téléphone: ${contract.client.conducteur["1er"]["Tel Marocain"] || ""}`, 20, yPos)
        doc.text(`Email: ${contract.client.conducteur["1er"]["E-mail"] || ""}`, 105, yPos)
        yPos += 4
        doc.text(`Adresse: ${contract.client.conducteur["1er"]["Adresse locale"] || ""}`, 20, yPos)
        doc.text(`Permis: ${contract.client.conducteur["1er"]["Permis de conduire N°"] || ""}`, 105, yPos)
        yPos += 4
        doc.text(`Délivré le: ${contract.client.conducteur["1er"]["Délivré le"] || ""}`, 20, yPos)
        yPos += 10; // Increased space after box

        // Deuxième Conducteur
        if (contract.client.conducteur["2eme"]) {
          doc.setFontSize(8)
          doc.setFont("helvetica", "bold")
          doc.text("Deuxième Conducteur", 15, yPos)
          doc.setFont("helvetica", "normal")
          yPos += 4
          doc.setDrawColor(0, 0, 0)
          doc.rect(15, yPos - 3, 180, 16)
          doc.setFontSize(7)
          doc.text(`Nom: ${contract.client.conducteur["2eme"].Nom || ""}`, 20, yPos)
          doc.text(`Prénom: ${contract.client.conducteur["2eme"].Prénom || ""}`, 105, yPos)
          yPos += 4
          doc.text(`Téléphone: ${contract.client.conducteur["2eme"].Tel || ""}`, 20, yPos)
          doc.text(`Permis: ${contract.client.conducteur["2eme"]["Permis de conduire N°"] || ""}`, 105, yPos)
          yPos += 4
          doc.text(`Délivré le: ${contract.client.conducteur["2eme"]["Délivré le"] || ""}`, 20, yPos)
          doc.text(`Carburant au départ: ${contract.client.conducteur["2eme"]["Carburant au départ"] || ""}`, 105, yPos)
          yPos += 10; // Increased space after box
        }

        // Troisième Conducteur
        if (contract.client.conducteur["3eme"]) {
          doc.setFontSize(8)
          doc.setFont("helvetica", "bold")
          doc.text("Troisième Conducteur", 15, yPos)
          doc.setFont("helvetica", "normal")
          yPos += 4
          doc.setDrawColor(0, 0, 0)
          doc.rect(15, yPos - 3, 180, 12)
          doc.setFontSize(7)
          doc.text(`Nom: ${contract.client.conducteur["3eme"].Nom || ""}`, 20, yPos)
          doc.text(`Prénom: ${contract.client.conducteur["3eme"].Prénom || ""}`, 105, yPos)
          yPos += 4
          doc.text(`Permis: ${contract.client.conducteur["3eme"]["Permis de conduire N°"] || ""}`, 20, yPos)
          doc.text(`Délivré le: ${contract.client.conducteur["3eme"]["Délivré le"] || ""}`, 105, yPos)
          yPos += 10; // Increased space after box
        }

        // --- Add extra space before RESERVATION INFO ---
        yPos += 10;

        // --- RESERVATION INFO (with border, dynamic height, grid layout) ---
        doc.setFontSize(10)
        doc.setFont("helvetica", "bold")
        doc.text("Informations de la Réservation", 15, yPos)
        yPos += 2
        const reservationRows = 6;
        const reservationBoxHeight = reservationRows * 5 + 3;
        doc.setDrawColor(0, 0, 0)
        doc.rect(15, yPos, 180, reservationBoxHeight)
        yPos += 5
        doc.setFontSize(7)
        doc.setFont("helvetica", "normal")
        // Grid layout: 2 columns with about 5px space between key and value
        const keyValueGap = 5; // 5px gap
        doc.text("Date de réservation:", 20, yPos)
        doc.text(`${formatDate(contract.reservation.dateReservation) || formatDate(new Date())}`, 60 + keyValueGap, yPos)
        doc.text("Nom:", 100, yPos)
        doc.text(`${contract.client.conducteur["1er"].Nom || ''} ${contract.client.conducteur["1er"].Prénom || ''}`, 120 + keyValueGap, yPos)
        yPos += 5
        doc.text("Email:", 20, yPos)
        doc.text(`${contract.reservation.emailClient || ''}`, 60 + keyValueGap, yPos)
        doc.text("Numéro de tel:", 100, yPos)
        doc.text(`${contract.reservation.telClient || ''}`, 120 + keyValueGap, yPos)
        yPos += 5
        doc.text("Nationalité:", 20, yPos)
        doc.text(`${contract.client.conducteur["1er"]["Adresse à l'etranger"] ? contract.client.conducteur["1er"]["Adresse à l'etranger"].split(', ').pop() : 'Marocain'}`, 60 + keyValueGap, yPos)
        doc.text("Marque de voiture:", 100, yPos)
        doc.text(`${contract.reservation.marque || contract.voiture.marque || ''}`, 120 + keyValueGap, yPos)
        yPos += 5
        doc.text("Matricule:", 20, yPos)
        doc.text(`${contract.voiture.matricule || ''}`, 60 + keyValueGap, yPos)
        doc.text("Date de début:", 100, yPos)
        doc.text(`${formatDate(contract.reservation.dateDebut)}`, 120 + keyValueGap, yPos)
        yPos += 5
        doc.text("Date de fin:", 20, yPos)
        doc.text(`${formatDate(contract.reservation.dateFin)}`, 60 + keyValueGap, yPos)
        // Accessoires (tag style)
        let accessoiresStr = '';
        if (contract.reservation.accessoires) {
          if (contract.reservation.accessoires.siegeBebe) accessoiresStr += '[Siège bébé] ';
          if (contract.reservation.accessoires.carte) accessoiresStr += '[Carte] ';
          if (contract.reservation.accessoires.gps) accessoiresStr += '[GPS] ';
          if (contract.reservation.accessoires.gallerie) accessoiresStr += '[Gallerie] ';
        }
        doc.text("Accessoires:", 100, yPos)
        doc.text(`${accessoiresStr.trim() || 'Aucun'}`, 120 + keyValueGap, yPos)
        yPos += 5 + 10; // Add extra space after box for visual comfort

        // --- VOITURE INFO (with border, dynamic height, grid layout, with boîte de vitesse, only one section) ---
        doc.setFontSize(10)
        doc.setFont("helvetica", "bold")
        doc.text("Informations de la Voiture", 15, yPos)
        yPos += 2
        const voitureRows = 4;
        const voitureBoxHeight = voitureRows * 5 + 3;
        doc.setDrawColor(0, 0, 0)
        doc.rect(15, yPos, 180, voitureBoxHeight)
        yPos += 5
        doc.setFontSize(7)
        doc.setFont("helvetica", "normal")
        // Grid layout: 2 columns with about 5px space between key and value
        doc.text("Marque:", 20, yPos)
        doc.text(`${contract.voiture.marque || ''}`, 60 + keyValueGap, yPos)
        doc.text("Type:", 100, yPos)
        doc.text(`${contract.voiture.type || ''}`, 120 + keyValueGap, yPos)
        yPos += 5
        doc.text("Model:", 20, yPos)
        doc.text(`${contract.voiture.model || ''}`, 60 + keyValueGap, yPos)
        doc.text("Matricule:", 100, yPos)
        doc.text(`${contract.voiture.matricule || ''}`, 120 + keyValueGap, yPos)
        yPos += 5
        doc.text("Carburant:", 20, yPos)
        doc.text(`${contract.voiture["type carburant"] || ''}`, 60 + keyValueGap, yPos)
        doc.text("Places:", 100, yPos)
        doc.text(`${contract.voiture["nbr de places"] || ''}`, 120 + keyValueGap, yPos)
        yPos += 5
        doc.text("Boîte de vitesse:", 20, yPos)
        doc.text(`${contract.voiture["boite vitesse"] === 'automatic' ? 'Automatique' : 'Manuelle'}`, 60 + keyValueGap, yPos)
        yPos += 8;

        // Before car image and signatures
        // Add 'Etat de Voiture :' bold label
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("L'état des lieux de la voiture :", 15, yPos);
        yPos += 7;
        doc.setFont("helvetica", "normal");
        // Car image on left
        let sectionTop = yPos;
        const leftX = 15;
        const rightX = 110;
        let leftY = sectionTop;
        let rightY = sectionTop;
        if (carImg) {
          try {
            const imgWidth = 60;
            const imgHeight = (carImg.height * imgWidth) / carImg.width;
            doc.addImage(carImg, "JPEG", leftX, leftY, imgWidth, imgHeight);
            leftY += imgHeight + 5;
          } catch (error) {
            leftY += 5;
          }
        } else {
          leftY += 5;
        }
        // Agence/Client signatures below car image (left)
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text("Signature Agence", leftX + 20, leftY + 5, { align: "center" });
        doc.text("Signature Client", leftX + 50, leftY + 5, { align: "center" });
        doc.setDrawColor(0, 0, 0);
        doc.rect(leftX, leftY + 7, 35, 18);
        doc.rect(leftX + 35, leftY + 7, 35, 18);
        // Conducteur signatures stacked on right
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        const conducteurLabels = [
          "Signature 1er Conducteur",
          "Signature 2ème Conducteur",
          "Signature 3ème Conducteur"
        ];
        for (let i = 0; i < 3; i++) {
          doc.text(conducteurLabels[i], rightX + 35, rightY + 5 + i * 25, { align: "center" });
          doc.setDrawColor(0, 0, 0);
          doc.rect(rightX, rightY + 7 + i * 25, 70, 18);
        }

        // Add footer with page number
        doc.setFontSize(6)
        doc.text(`Contrat N° ${getContractNumber(contract.id)} - Page ${pageNumber}/${totalPages}`, 105, 290, {
          align: "center",
        })
      } catch (error) {
        console.error("Error in PDF generation:", error)
        alert("Une erreur s'est produite lors de la génération du PDF. Veuillez réessayer.")
      }
    }

    try {
      // Add first page (white background)
      addContractPage(null, 1, 3)

      // Add second page (pink/purple background) - Updated color
      doc.addPage()
      addContractPage("#eccfed", 2, 3)

      // Add third page (yellow/green background)
      doc.addPage()
      addContractPage("#e9eaa4", 3, 3)

      console.log("PDF generation completed, opening in new tab")

      // Open PDF in a new tab
      const pdfBlob = doc.output("blob")
      const pdfUrl = URL.createObjectURL(pdfBlob)
      window.open(pdfUrl, "_blank")
    } catch (error) {
      console.error("Error in PDF generation:", error)
      alert("Une erreur s'est produite lors de la génération du PDF. Veuillez réessayer.")
    }
  }

  // Update the handlePrint function with better logging
  const handlePrint = (contractId) => {
    console.log(`Print requested for contract ID: ${contractId}`)

    // Find the contract
    const contract = contracts.find((c) => c.id === contractId)
    if (!contract) {
      console.error(`Contract with ID ${contractId} not found`)
      return
    }

    console.log("Contract found, generating PDF...")
    generatePDF(contract)
  }

  const toggleExpand = (contractId) => {
    if (expandedContract === contractId) {
      setExpandedContract(null)
    } else {
      setExpandedContract(contractId)
    }
  }

  // Filter contracts based on search term
  const filteredContracts = contracts.filter((contract) => {
    if (searchTerm === "") return true

    const searchTermLower = searchTerm.toLowerCase()

    // Search in contract number
    const contractNumber = contract.contrat?.numeroContrat || ""

    // Search in client data
    const clientName = `${contract.client.conducteur["1er"].Nom || ""} ${
      contract.client.conducteur["1er"].Prénom || ""
    }`.toLowerCase()
    const clientTel = (contract.client.conducteur["1er"]["Tel Marocain"] || "").toLowerCase()

    // Search in car data
    const carInfo = `${contract.voiture.marque || ""} ${contract.voiture.type || ""} ${
      contract.voiture.matricule || ""
    }`.toLowerCase()

    // Search in reservation data
    const reservationInfo = `${contract.reservation.dateDebut || ""} ${
      contract.reservation.dateFin || ""
    }`.toLowerCase()

    return (
      contractNumber.toLowerCase().includes(searchTermLower) ||
      clientName.includes(searchTermLower) ||
      clientTel.includes(searchTermLower) ||
      carInfo.includes(searchTermLower) ||
      reservationInfo.includes(searchTermLower)
    )
  })

  // Format date for better display
  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Get list of accessories as a string
  const getAccessoriesString = (accessories) => {
    if (!accessories) return "Aucun"

    const items = []
    if (accessories.siegeBebe) items.push("Siège bébé")
    if (accessories.carte) items.push("Carte")
    if (accessories.gps) items.push("GPS")
    if (accessories.gallerie) items.push("Gallerie")

    return items.length > 0 ? items.join(", ") : "Aucun"
  }

  // Get contract number for a reservation
  const getContractNumber = (reservationId) => {
    const contract = contratData.find((c) => c.reservationId === String(reservationId))
    if (contract) {
      return contract.numeroContrat
    }
    return generateContractNumber(reservationId)
  }

  // Get contract creation date
  const getContractDate = (reservationId) => {
    const contract = contratData.find((c) => c.reservationId === String(reservationId))
    if (contract) {
      return formatDate(contract.dateCreation)
    }
    return formatDate(new Date())
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Gestion des Contrats</h2>
      </div>

      {loading ? (
        <div className="loading-container">
          <p>Chargement des données...</p>
        </div>
      ) : (
        <div className="contracts-container">
          <div className="search-container">
            <input
              type="text"
              placeholder="Rechercher par N° contrat, client, voiture ou date..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>

          <div className="contracts-list">
            {filteredContracts.length === 0 ? (
              <div className="no-contracts">
                <p>Aucun contrat trouvé</p>
              </div>
            ) : (
              filteredContracts.map((contract) => (
                <div key={contract.id} className="contract-card">
                  <div className="contract-header" onClick={() => toggleExpand(contract.id)}>
                    <div className="contract-id">N° Contrat: {getContractNumber(contract.id)}</div>
                    <div className="contract-summary">
                      <span className="client-name">
                        {contract.client.conducteur["1er"].Nom} {contract.client.conducteur["1er"].Prénom}
                      </span>
                      <span className="separator">|</span>
                      <span className="car-info">
                        {contract.voiture.marque} {contract.voiture.type} ({contract.voiture.matricule})
                      </span>
                      <span className="separator">|</span>
                      <span className="date-range">
                        {formatDate(contract.reservation.dateDebut)} - {formatDate(contract.reservation.dateFin)}
                      </span>
                    </div>
                    <div className="expand-icon">
                      <i className={`fas fa-chevron-${expandedContract === contract.id ? "up" : "down"}`}></i>
                    </div>
                  </div>

                  {expandedContract === contract.id && (
                    <div className="contract-details">
                      <div className="details-section">
                        <h3>
                          <i className="fas fa-file-contract"></i> Informations Contrat
                        </h3>
                        <div className="details-grid">
                          <div className="detail-item">
                            <span className="detail-label">N° Contrat:</span>
                            <span className="detail-value">{getContractNumber(contract.id)}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Date de création:</span>
                            <span className="detail-value">{getContractDate(contract.id)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="details-section">
                        <h3>
                          <i className="fas fa-user"></i> Informations Client
                        </h3>

                        {/* Premier Conducteur */}
                        <div className="conducteur-section">
                          <h4>Premier Conducteur</h4>
                          <div className="details-grid">
                            <div className="detail-item">
                              <span className="detail-label">Nom:</span>
                              <span className="detail-value">{contract.client.conducteur["1er"].Nom || ""}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Prénom:</span>
                              <span className="detail-value">{contract.client.conducteur["1er"].Prénom || ""}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Téléphone:</span>
                              <span className="detail-value">
                                {contract.client.conducteur["1er"]["Tel Marocain"] || ""}
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Email:</span>
                              <span className="detail-value">{contract.client.conducteur["1er"]["E-mail"] || ""}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Adresse:</span>
                              <span className="detail-value">
                                {contract.client.conducteur["1er"]["Adresse locale"] || ""}
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Permis:</span>
                              <span className="detail-value">
                                {contract.client.conducteur["1er"]["Permis de conduire N°"] || ""}
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Délivré le:</span>
                              <span className="detail-value">
                                {contract.client.conducteur["1er"]["Délivré le"] || ""}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Deuxième Conducteur */}
                        {contract.client.conducteur["2eme"] && (
                          <div className="conducteur-section">
                            <h4>Deuxième Conducteur</h4>
                            <div className="details-grid">
                              <div className="detail-item">
                                <span className="detail-label">Nom:</span>
                                <span className="detail-value">{contract.client.conducteur["2eme"].Nom || ""}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Prénom:</span>
                                <span className="detail-value">{contract.client.conducteur["2eme"].Prénom || ""}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Téléphone:</span>
                                <span className="detail-value">{contract.client.conducteur["2eme"].Tel || ""}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Permis:</span>
                                <span className="detail-value">
                                  {contract.client.conducteur["2eme"]["Permis de conduire N°"] || ""}
                                </span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Délivré le:</span>
                                <span className="detail-value">
                                  {contract.client.conducteur["2eme"]["Délivré le"] || ""}
                                </span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Carburant au départ:</span>
                                <span className="detail-value">
                                  {contract.client.conducteur["2eme"]["Carburant au départ"] || ""}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="details-section">
                        <h3>
                          <i className="fas fa-calendar-alt"></i> Informations Réservation
                        </h3>
                        <div className="details-grid">
                          <div className="detail-item">
                            <span className="detail-label">Date Début:</span>
                            <span className="detail-value">{formatDate(contract.reservation.dateDebut)}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Date Fin:</span>
                            <span className="detail-value">{formatDate(contract.reservation.dateFin)}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Lieu:</span>
                            <span className="detail-value">{contract.reservation.lieuReservation || ""}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Accessoires:</span>
                            <span className="detail-value">
                              {getAccessoriesString(contract.reservation.accessoires)}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Tarif 1 jour:</span>
                            <span className="detail-value">{contract.voiture.tarifs?.["1jour"] || ""} MAD</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Tarif 7 jours:</span>
                            <span className="detail-value">{contract.voiture.tarifs?.["7jours"] || ""} MAD</span>
                          </div>
                        </div>
                      </div>

                      <div className="details-section">
                        <h3>
                          <i className="fas fa-car"></i> Informations de la Voiture
                        </h3>
                        <div className="details-grid">
                          <div className="detail-item">
                            <span className="detail-label">Marque:</span>
                            <span className="detail-value">{contract.voiture.marque || ""}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Type:</span>
                            <span className="detail-value">{contract.voiture.type || ""}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Modèle:</span>
                            <span className="detail-value">{contract.voiture.model || ""}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Matricule:</span>
                            <span className="detail-value">{contract.voiture.matricule || ""}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Carburant:</span>
                            <span className="detail-value">{contract.voiture["type carburant"] || ""}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Places:</span>
                            <span className="detail-value">{contract.voiture["nbr de places"] || ""}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Boîte de vitesse:</span>
                            <span className="detail-value">
                              {contract.voiture["boite vitesse"] === 'automatic' ? 'Automatique' : 'Manuelle'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="contract-actions">
                        <button
                          className="action-btn print-btn"
                          onClick={() => handlePrint(contract.id)}
                          title="Imprimer ce contrat"
                        >
                          <i className="fas fa-print"></i> Imprimer le Contrat
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Contrat
