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
        const reservationRows = 7; // 7 lines
        const reservationBoxHeight = reservationRows * 5 + 3;
        doc.setDrawColor(0, 0, 0)
        doc.rect(15, yPos, 180, reservationBoxHeight)
        yPos += 5
        doc.setFontSize(7)
        doc.setFont("helvetica", "normal")
        const keyValueGap = 5;
        // Ligne 1
        doc.text("Date de réservation:", 20, yPos)
        doc.text(`${formatDate(contract.reservation.dateReservation) || formatDate(new Date())}`, 60 + keyValueGap, yPos)
        doc.text("Nom:", 100, yPos)
        doc.text(`${contract.client.conducteur["1er"].Nom || ''} ${contract.client.conducteur["1er"].Prénom || ''}`, 120 + keyValueGap, yPos)
        yPos += 5
        // Ligne 2
        doc.text("Email:", 20, yPos)
        doc.text(`${contract.reservation.emailClient || ''}`, 60 + keyValueGap, yPos)
        doc.text("Numéro de tel:", 100, yPos)
        doc.text(`${contract.reservation.telClient || ''}`, 120 + keyValueGap, yPos)
        yPos += 5
        // Ligne 3
        doc.text("Nationalité:", 20, yPos)
        doc.text(`${contract.client.conducteur["1er"]["Adresse à l'etranger"] ? contract.client.conducteur["1er"]["Adresse à l'etranger"].split(', ').pop() : 'Marocain'}`, 60 + keyValueGap, yPos)
        doc.text("Marque de voiture:", 100, yPos)
        doc.text(`${contract.reservation.marque || contract.voiture.marque || ''}`, 120 + keyValueGap, yPos)
        yPos += 5
        // Ligne 4
        doc.text("Matricule:", 20, yPos)
        doc.text(`${contract.voiture.matricule || ''}`, 60 + keyValueGap, yPos)
        doc.text("Date de début:", 100, yPos)
        doc.text(`${formatDate(contract.reservation.dateDebut)}`, 120 + keyValueGap, yPos)
        yPos += 5
        // Ligne 5
        doc.text("Lieu de livraison:", 20, yPos)
        doc.text(`${contract.reservation.lieuLivraison || ''}`, 60 + keyValueGap, yPos)
        doc.text("Date de fin:", 100, yPos)
        doc.text(`${formatDate(contract.reservation.dateFin)}`, 120 + keyValueGap, yPos)
        yPos += 5
        // Ligne 6 (Accessoires, only left side)
        let accessoiresStr = '';
        if (contract.reservation.accessoires) {
          if (contract.reservation.accessoires.siegeBebe) accessoiresStr += '[Siège bébé] ';
          if (contract.reservation.accessoires.carte) accessoiresStr += '[Carte] ';
          if (contract.reservation.accessoires.gps) accessoiresStr += '[GPS] ';
          if (contract.reservation.accessoires.gallerie) accessoiresStr += '[Gallerie] ';
        }
        doc.text("Accessoires:", 20, yPos)
        doc.text(`${accessoiresStr.trim() || 'Aucun'}`, 60 + keyValueGap, yPos)
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

      // Add verso page (white background, conditions générales)
      doc.addPage()
      addConditionsGeneralesPage(doc, null)

      // Add second page (pink/purple background) - Updated color
      doc.addPage()
      addContractPage("#eccfed", 2, 3)
      doc.addPage()
      addConditionsGeneralesPage(doc, "#eccfed")

      // Add third page (yellow/green background)
      doc.addPage()
      addContractPage("#e9eaa4", 3, 3)
      doc.addPage()
      addConditionsGeneralesPage(doc, "#e9eaa4")

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
                            <span className="detail-label">Lieu de livraison:</span>
                            <span className="detail-value">{contract.reservation.lieuLivraison || ""}</span>
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

function addConditionsGeneralesPage(doc, bgColor = null) {
  let r, g, b;
  if (bgColor) {
    r = Number.parseInt(bgColor.slice(1, 3), 16)
    g = Number.parseInt(bgColor.slice(3, 5), 16)
    b = Number.parseInt(bgColor.slice(5, 7), 16)
    doc.setFillColor(r, g, b)
    doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, "F")
  }
  // Try to maximize font size to fill the page
  const conditions = [
    "Le présent contrat a été établi et daté comme indiqué au verso. Il engage LOCATION PROMOTION SOUSS qui sera appelée le loueur et la personne, société ou compagnie par qui est signé ce contrat, qui sera dénommée le locataire :",
    '',
    "Article Premier - UTILISATION DU VEHICULE :",
    "Le locataire s'engage à ne pas conduire en état d'ébriété et à ne pas laisser conduire le véhicule par d'autres personnes que lui-même ou celles agréées par le loueur et dont il est le porte garant ; et à utiliser le véhicule que pour ses besoins personnels ; il est interdit de participer à toute compétition quelle qu'elle soit, d'utiliser le véhicule à des fins illicites, ou des transports de marchandises, le locataire s'engage à ne pas solliciter directement des documents douaniers, il est interdit au locataire de surcharger le véhicule loué en transportant un nombre de passagers supérieur à celui porté sur le contrat, sous peine d'être déchu de l'assurance.",
    '',
    "Article 2 - ETAT DE LA VOITURE :",
    "La voiture est livrée en parfait état de marche et de propreté. Les compteurs et leurs prises plombés, et les plombs ne pourront être enlevés ou violés sous peine de déchéance pour le location sur la base de 800 kilomètres par jour. Le véhicule sera rendu dans le même état de propreté, à défaut le locataire devra acquitter les frais de remise en état. Ces cinq manquants sont en bon état, sans coupures, fusées sur normale. En cas de détérioration d'un de l'un pour cause autre que l'usure normale, le locataire s'engage à le remplacer immédiatement par un même dimension et d'usure sensiblement égale, ou d'en payer le montant.",
    '',
    "Article 3 - ESSENCE ET HUILE :",
    "Il appartient à la charge du locataire de vérifier en permanence les niveaux d'huile et d'eau, vérifier les niveaux de la boîte à vitesses et du pont arrière tous les 1000 kilomètres. Il justifiera des travaux par des factures correspondantes (qui lui seront remboursées) sous peine d'avoir à payer une indemnité pour usure anormale.",
    '',
    "Article 4 - ENTRETIEN ET REPARATION :",
    "L'usure mécanique normale est à la charge du loueur. Toutes les réparations provenant, soit d'une usure anormale, soit d'une négligence de la part du locataire ou d'une cause accidentelle seront à sa charge et exécutées par nos soins. Dans le cas où le véhicule serait immobilisé en dehors de la région, les réparations (qu'elles soient dues à l'usure normale ou à une cause accidentelle, ne seront exécutées qu'après accord télégraphique du loueur ou par l'agent régional de la marque du véhicule. Elles devront faire l'objet d'une facture acquittée et très détaillée. Les pièces défectueuses remplacées seront remises avec la facture acquittée. En aucun cas et en aucune circonstance, le locataire ne pourra réclamer des dommages et intérêts, soit pour retard de la remise du véhicule, ou annulation de la location, soit pour immobilisation dans le cas de réparations nécessaires d'usure normale et effectuées au cours de la location. La responsabilité du loueur ne pourra jamais être invoquée, même en cas d'accidents de personnes ou de choses ayant pu résulter de vices ou de défauts de construction ou de réparations de la voiture.",
    '',
    "Article 5 - ASSURANCES :",
    "1- Le locataire est garanti pour les risques suivants :",
    "    1- Une assurance en illimité contre les tiers.",
    "    2- Contre le vol de l'incendie et contre tous dommages, à l'exclusion des vêtements et tous objets transportés.",
    "    3- Sont également garantis les personnes transportées.",
    "    4- En cas de dégâts à la voiture, avec toutes fois une franchise de 10 000 DH restant à sa charge dans le cas d'accident à moins que le locataire n'ait souscrit avant la location et avec l'accord de loueur une complément de location pour suppression de franchise.",
    "    5- En cas d'accident, vol ou incendie, le locataire est tenu d'établir l'unique responsabilité des dégâts injustifiés par sa faute et prend en charges la totalité des frais de réparation. Si l'accident n'est pas justifié, le locataire sera tenu intégralement responsable.",
    "    6- Le locataire s'engage à déclarer au loueur, dans les 48 heures et immédiatement aux autorités, police ou gendarmerie, tout accident, vol ou incendie, même partiel sous peine d'être déchu du bénéfice de l'assurance. Sa déclaration devra obligatoirement mentionner : les circonstances, la date, le lieu et l'heure, le numéro ou nom de l'agent, le nom et l'adresse des adversaires, ainsi que le numéro de la voiture de l'adversaire. S'il y a lieu, il joindra à cette déclaration tout rapport de police, ou gendarmerie ou constat d'huissier, s'il en a été établi, et il ne devra en aucun cas discuter la responsabilité ni traiter ou transiger avec des tiers relativement à l'accident.",
    "    7- Il paiera une somme de 150 dirhams HT par jour,",
    "    pour indemnité de changement de la voiture pendant toute la durée de l'immobilisation provenant d'usure anormale ou d'accident.",
    "    8- La voiture n'est assurée que pour toute la durée du location. Passé ce délai, le loueur décline toute responsabilité pour les accidents ou dommages qui pourraient causer et dont il devra avoir été avisé par tout bordereau de location.",
    "    9- Enfin, il n'y a pas assurance pour tout conducteur non muni d'un permis en état de validité ou d'un permis datant de moins d'une année.",
    "    10- Le loueur décline toute responsabilité pour les amendes et autres dus ou dégâts et vols de la voiture pourrait causer pendant la période de location si le locataire a délibérément fourni au loueur des informations fausses concernant son identité ou son adresse ou la validité de son permis de conduire.",
    '',
    "Article 6 - LOCATION, CAUTION, PROLONGATION :",
    "Les prix de location, ainsi que la caution, sont déterminés par les tarifs en vigueur et payables d'avance - pour un temps supérieur à celui indiqué sur le contrat. Il devra après avoir obtenu l'accord du loueur, faire parvenir le montant de la location supplémentaire 48 heures avant l'expiration de la location en cours sous peine de ne pouvoir être assuré et de se voir refuser toute autorisation de bus de confiance.",
    "La journée de location compte de l'heure du début à toute journée commencée.",
    '',
    "Article 7 - RAPATRIEMENT DE LA VOITURE :",
    "Le locataire s'interdit formellement d'abandonner le véhicule.",
    "En cas d'impossibilité matérielle, Celui-ci sera rapatrié aux frais du locataire, la location restant due jusqu'au retour au véhicule.",
    '',
    "Article 8 - PAPIERS DE LA VOITURE :",
    "Le locataire dès la fin de la location et à la rentrée de la voiture, doit restituer la carte grise et tous les papiers nécessaires à la circulation, faute de quoi, ces pièces étant indispensables à la revente, le locataire devra acquitter au loueur quotidiennement des frais de duplicata jusqu'à leur remise à la société.",
    "En cas de perte de papiers, le locataire sera facturé selon le coût des papiers et des frais de duplicata.",
    '',
    "Article 9 - RESPONSABILITE :",
    "Le locataire demeure seul responsable des contraventions et procès-verbaux établis contre lui.",
    '',
    "Article 10 - COMPETENCE :",
    "De convention expresse et en cas de contestation quelconque, le tribunal régional d'Agadir sera seul compétent",
    "Le client déclare avoir pris connaissance et d'accepté les conditions générales de location.",
    "(Lu et lettre approuvé avec les termes)."
  ];
  let bestFontSize = 5.5;
  let bestY = 22;
  let minFontSize = 5.5;
  let maxFontSize = 10;
  let pageHeight = 295;
  let marginTop = 22;
  let marginBottom = 10;
  let usableHeight = pageHeight - marginTop - marginBottom;
  // Binary search for best font size
  while (maxFontSize - minFontSize > 0.1) {
    let midFontSize = (minFontSize + maxFontSize) / 2;
    let y = marginTop;
    doc.setFontSize(midFontSize)
    doc.setFont("helvetica", "normal")
    for (let i = 0; i < conditions.length; i++) {
      const splitText = doc.splitTextToSize(conditions[i], 175);
      y += splitText.length * (midFontSize * 0.52);
    }
    if (y < marginTop + usableHeight) {
      bestFontSize = midFontSize;
      minFontSize = midFontSize;
    } else {
      maxFontSize = midFontSize;
    }
  }
  // Render with bestFontSize
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.text("CONDITIONS GENERALES", 105, 15, { align: "center" })
  doc.setFontSize(bestFontSize)
  doc.setFont("helvetica", "normal")
  let y = marginTop;
  for (let i = 0; i < conditions.length; i++) {
    const splitText = doc.splitTextToSize(conditions[i], 175);
    doc.text(splitText, 17, y);
    y += splitText.length * (bestFontSize * 0.52);
  }
}
