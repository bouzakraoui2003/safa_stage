"use client"

import { useState, useEffect } from "react"
import "../styles/style.css"
import emailjs from "@emailjs/browser"
import logoImage from "../images/LPS.png" // Import the logo image

// Initialize EmailJS with your public key
emailjs.init("QNXPAimf9qfKPJdAt")

const Login = ({ onLogin }) => {
  // State for active form view
  const [activeForm, setActiveForm] = useState("login") // 'login', 'signup', 'forgot', 'verify', 'signup-complete'

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })

  // Signup form state
  const [signupData, setSignupData] = useState({
    nom: "",
    prenom: "",
    dateOfBirth: "",
    gender: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  // Email verification state
  const [verificationCode, setVerificationCode] = useState("")
  const [generatedCode, setGeneratedCode] = useState("")
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState("")
  const [resetVerificationCode, setResetVerificationCode] = useState("")
  const [resetGeneratedCode, setResetGeneratedCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")

  // Feedback messages
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Verification attempts and block time
  const [attempts, setAttempts] = useState(0)
  const [blockTime, setBlockTime] = useState(null)

  useEffect(() => {
    if (blockTime) {
      const timer = setTimeout(() => {
        setBlockTime(null)
        setAttempts(0)
      }, blockTime - Date.now())

      return () => clearTimeout(timer)
    }
  }, [blockTime])

  // Generate a random 6-digit code
  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  // Send verification code via EmailJS
  const sendVerificationEmail = async (email, code) => {
    try {
      const templateParams = {
        to_name: email.split("@")[0],
        to_email: email,
        from_name: "LPS - Location Promotion Souss",
        verification_code: code,
        reply_to: email,
      }

      console.log("Sending email with params:", templateParams)

      const response = await emailjs.send("service_jdubq5f", "template_shyvxta", templateParams, "QNXPAimf9qfKPJdAt")

      console.log("EmailJS Response:", response)
      return true
    } catch (error) {
      console.error("Detailed EmailJS Error:", {
        status: error.status,
        text: error.text,
        error: error,
      })

      // Provide specific error messages based on the error
      if (error.status === 422) {
        if (error.text.includes("recipients address is empty")) {
          setError("L'adresse email du destinataire est manquante.")
        } else if (error.text.includes("template")) {
          setError("Erreur avec le template d'email. Veuillez contacter l'administrateur.")
        } else {
          setError(`Erreur de validation: ${error.text}`)
        }
      } else if (error.status === 401) {
        setError("Erreur d'authentification avec le service d'email. Veuillez contacter l'administrateur.")
      } else if (error.status === 429) {
        setError("Trop de tentatives. Veuillez réessayer dans quelques minutes.")
      } else {
        setError(`Erreur lors de l'envoi de l'email: ${error.text || error.message || "Erreur inconnue"}`)
      }
      return false
    }
  }

  // Function to calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
  }

  // Handle login form input changes
  const handleLoginChange = (e) => {
    const { name, value } = e.target
    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle signup form input changes
  const handleSignupChange = (e) => {
    const { name, value } = e.target
    setSignupData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle email verification input change
  const handleVerificationChange = (e) => {
    setVerificationCode(e.target.value)
  }

  // Handle initial signup (email verification)
  const handleInitialSignup = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    const { email } = signupData

    if (!email) {
      setError("Veuillez entrer votre adresse email.")
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Veuillez entrer une adresse email valide.")
      return
    }

    try {
      // Check if email already exists
      const response = await fetch("http://localhost:3001/accounts")
      if (!response.ok) {
        throw new Error("Erreur de connexion au serveur")
      }

      const accounts = await response.json()
      if (accounts.find((acc) => acc.email === email)) {
        setError("Cet email est déjà utilisé.")
        return
      }

      // Generate and send verification code
      const code = generateVerificationCode()
      setGeneratedCode(code)

      setSuccess("Envoi du code de vérification en cours...")
      const emailSent = await sendVerificationEmail(email, code)

      if (emailSent) {
        setSuccess("Un code de vérification a été envoyé à votre email.")
        setActiveForm("verify")
      }
    } catch (err) {
      console.error("Email verification error:", err)
      setError(`Erreur: ${err.message || "Une erreur est survenue lors de la vérification de l'email"}`)
    }
  }

  // Handle verification code submission
  const handleVerificationSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (blockTime && blockTime > Date.now()) {
      const timeLeft = Math.ceil((blockTime - Date.now()) / 1000)
      setError(
        `Vous êtes bloqué en raison de trop nombreuses tentatives. Veuillez réessayer dans ${timeLeft} secondes.`,
      )
      return
    }

    if (!verificationCode) {
      setError("Veuillez entrer le code de vérification.")
      return
    }

    if (verificationCode !== generatedCode) {
      const remainingAttempts = 3 - attempts
      setError(`Code de vérification incorrect. Il vous reste ${remainingAttempts} tentatives.`)
      setAttempts((prev) => prev + 1)

      if (attempts >= 3) {
        setBlockTime(Date.now() + 90000) // Block for 1 minute and 30 seconds
        setError(
          "Vous êtes bloqué en raison de trop nombreuses tentatives. Veuillez réessayer dans 1 minute et 30 secondes.",
        )
      }
      return
    }

    setIsEmailVerified(true)
    setActiveForm("signup-complete")
    setSuccess("Email vérifié avec succès. Veuillez compléter votre inscription.")
    setAttempts(0) // Reset attempts on successful verification
  }

  // Handle complete signup form submission
  const handleCompleteSignupSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validate inputs
    const { nom, prenom, dateOfBirth, gender, email, password, confirmPassword } = signupData

    if (!nom || !prenom || !dateOfBirth || !gender || !email || !password || !confirmPassword) {
      setError("Veuillez remplir tous les champs.")
      return
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.")
      return
    }

    // Calculate age from date of birth
    const age = calculateAge(dateOfBirth)

    try {
      // Create new pending account
      const newAccount = {
        id: Date.now().toString(),
        nom,
        prenom,
        age,
        dateOfBirth,
        gender,
        email,
        password,
        role: "user",
        status: "pending",
      }

      const createResponse = await fetch("http://localhost:3001/pendingAccounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAccount),
      })

      if (!createResponse.ok) {
        throw new Error("Erreur lors de la création du compte")
      }

      // Signup successful
      setSuccess("Compte créé avec succès! Votre compte est en attente d'approbation par un administrateur.")

      // Reset form and switch to login
      setSignupData({
        nom: "",
        prenom: "",
        dateOfBirth: "",
        gender: "",
        email: "",
        password: "",
        confirmPassword: "",
      })
      setIsEmailVerified(false)
      setVerificationCode("")
      setGeneratedCode("")

      setTimeout(() => {
        setActiveForm("login")
      }, 5000)
    } catch (err) {
      setError("Erreur: " + err.message)
    }
  }

  // Login form submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validate inputs
    if (!loginData.email || !loginData.password) {
      setError("Veuillez remplir tous les champs.")
      return
    }

    try {
      // First check if the account is in pending status
      const pendingResponse = await fetch("http://localhost:3001/pendingAccounts")
      if (!pendingResponse.ok) {
        throw new Error("Erreur de connexion au serveur")
      }

      const pendingAccounts = await pendingResponse.json()
      const pendingUser = pendingAccounts.find((acc) => acc.email === loginData.email)

      if (pendingUser) {
        if (pendingUser.password === loginData.password) {
          setError("Votre compte est en attente d'approbation par un administrateur.")
        } else {
          setError("Mot de passe incorrect.")
        }
        return
      }

      // Fetch approved accounts from data.json
      const response = await fetch("http://localhost:3001/accounts")
      if (!response.ok) {
        throw new Error("Erreur de connexion au serveur")
      }

      const accounts = await response.json()
      const user = accounts.find((acc) => acc.email === loginData.email)

      if (!user) {
        setError("Cet email n'existe pas dans notre système.")
        return
      }

      if (user.password !== loginData.password) {
        setError("Mot de passe incorrect.")
        return
      }

      // Login successful
      setSuccess("Connexion réussie!")
      onLogin(loginData.email, loginData.password)
    } catch (err) {
      setError("Erreur de connexion: " + err.message)
    }
  }

  // Handle forgot password form submission
  const handleForgotSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!forgotEmail) {
      setError("Veuillez entrer votre email.")
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(forgotEmail)) {
      setError("Veuillez entrer une adresse email valide.")
      return
    }

    try {
      // Check if email exists
      const response = await fetch("http://localhost:3001/accounts")
      if (!response.ok) {
        throw new Error("Erreur de connexion au serveur")
      }

      const accounts = await response.json()
      const userExists = accounts.some((acc) => acc.email === forgotEmail)

      if (!userExists) {
        setError("Cet email n'existe pas dans notre système.")
        return
      }

      // Generate and send verification code
      const code = generateVerificationCode()
      setResetGeneratedCode(code)

      setSuccess("Envoi du code de vérification en cours...")
      const emailSent = await sendVerificationEmail(forgotEmail, code)

      if (emailSent) {
        setSuccess("Un code de vérification a été envoyé à votre email.")
        setActiveForm("verify")
      }
    } catch (err) {
      console.error("Password reset error:", err)
      setError(`Erreur: ${err.message || "Une erreur est survenue lors de la réinitialisation du mot de passe"}`)
    }
  }

  // Handle verification code submission
  const handleResetVerificationSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (blockTime && blockTime > Date.now()) {
      const timeLeft = Math.ceil((blockTime - Date.now()) / 1000)
      setError(
        `Vous êtes bloqué en raison de trop nombreuses tentatives. Veuillez réessayer dans ${timeLeft} secondes.`,
      )
      return
    }

    if (!resetVerificationCode) {
      setError("Veuillez entrer le code de vérification.")
      return
    }

    if (resetVerificationCode !== resetGeneratedCode) {
      const remainingAttempts = 3 - attempts
      setError(`Code de vérification incorrect. Il vous reste ${remainingAttempts} tentatives.`)
      setAttempts((prev) => prev + 1)

      if (attempts >= 3) {
        setBlockTime(Date.now() + 90000) // Block for 1 minute and 30 seconds
        setError(
          "Vous êtes bloqué en raison de trop nombreuses tentatives. Veuillez réessayer dans 1 minute et 30 secondes.",
        )
      }
      return
    }

    setActiveForm("reset")
    setSuccess("Code vérifié. Veuillez entrer votre nouveau mot de passe.")
    setAttempts(0) // Reset attempts on successful verification
  }

  // Handle password reset submission
  const handleResetSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!newPassword || !confirmNewPassword) {
      setError("Veuillez remplir tous les champs.")
      return
    }

    if (newPassword !== confirmNewPassword) {
      setError("Les mots de passe ne correspondent pas.")
      return
    }

    try {
      // First, get the current accounts
      const response = await fetch("http://localhost:3001/accounts")
      if (!response.ok) {
        throw new Error("Erreur de connexion au serveur")
      }

      const accounts = await response.json()
      const userIndex = accounts.findIndex((acc) => acc.email === forgotEmail)

      if (userIndex === -1) {
        setError("Utilisateur non trouvé.")
        return
      }

      // Create updated account object
      const updatedAccount = {
        ...accounts[userIndex],
        password: newPassword,
      }

      // Update the specific account
      const updateResponse = await fetch(`http://localhost:3001/accounts/${accounts[userIndex].id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedAccount),
      })

      if (!updateResponse.ok) {
        throw new Error("Erreur lors de la mise à jour du mot de passe")
      }

      setSuccess("Mot de passe mis à jour avec succès!")
      setTimeout(() => {
        setActiveForm("login")
        setForgotEmail("")
        setResetVerificationCode("")
        setResetGeneratedCode("")
        setNewPassword("")
        setConfirmNewPassword("")
      }, 2000)
    } catch (err) {
      console.error("Password update error:", err)
      setError(`Erreur: ${err.message || "Une erreur est survenue lors de la mise à jour du mot de passe"}`)
    }
  }

  // Render login form
  const renderLoginForm = () => (
    <form className="auth-form" onSubmit={handleLoginSubmit}>
      <h2 className="auth-title">Connexion</h2>

      {error && <div className="auth-error">{error}</div>}
      {success && <div className="auth-success">{success}</div>}

      <div className="auth-group">
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          name="email"
          value={loginData.email}
          onChange={handleLoginChange}
          placeholder="Entrez votre email"
          autoFocus
        />
      </div>

      <div className="auth-group">
        <label htmlFor="login-password">Mot de passe</label>
        <input
          id="login-password"
          type="password"
          name="password"
          value={loginData.password}
          onChange={handleLoginChange}
          placeholder="Entrez votre mot de passe"
        />
      </div>

      <button className="auth-btn" type="submit">
        Se connecter
      </button>

      <div className="auth-links-col">
        <span
          onClick={() => {
            setActiveForm("signup")
            setError("")
            setSuccess("")
          }}
          className="auth-link"
        >
          Créer un compte
        </span>

        <span
          onClick={() => {
            setActiveForm("forgot")
            setError("")
            setSuccess("")
          }}
          className="auth-link"
        >
          Mot de passe oublié ?
        </span>
      </div>
    </form>
  )

  // Render initial signup form (email only)
  const renderInitialSignupForm = () => (
    <form className="auth-form" onSubmit={handleInitialSignup}>
      <h2 className="auth-title">Créer un compte</h2>

      {error && <div className="auth-error">{error}</div>}
      {success && <div className="auth-success">{success}</div>}

      <div className="auth-group">
        <label htmlFor="signup-email">Email</label>
        <input
          id="signup-email"
          type="email"
          name="email"
          value={signupData.email}
          onChange={handleSignupChange}
          placeholder="Entrez votre email"
          autoFocus
        />
      </div>

      <button className="auth-btn" type="submit">
        Vérifier l'email
      </button>

      <div className="auth-links-col">
        <span
          onClick={() => {
            setActiveForm("login")
            setError("")
            setSuccess("")
          }}
          className="auth-link"
        >
          Déjà un compte ? Se connecter
        </span>
      </div>
    </form>
  )

  // Render verification form
  const renderVerificationForm = () => (
    <form className="auth-form" onSubmit={handleVerificationSubmit}>
      <h2 className="auth-title">Vérification d'email</h2>

      {error && <div className="auth-error">{error}</div>}
      {success && <div className="auth-success">{success}</div>}

      <div className="auth-group">
        <label htmlFor="verification-code">Code de vérification</label>
        <input
          id="verification-code"
          type="text"
          value={verificationCode}
          onChange={handleVerificationChange}
          placeholder="Entrez le code de vérification"
          maxLength={6}
          autoFocus
        />
      </div>

      <button className="auth-btn" type="submit">
        Vérifier
      </button>

      <div className="auth-links-col">
        <span
          onClick={() => {
            setActiveForm("signup")
            setError("")
            setSuccess("")
          }}
          className="auth-link"
        >
          Retour
        </span>
      </div>
    </form>
  )

  // Render complete signup form
  const renderCompleteSignupForm = () => (
    <form className="auth-form" onSubmit={handleCompleteSignupSubmit}>
      <h2 className="auth-title">Compléter l'inscription</h2>

      {error && <div className="auth-error">{error}</div>}
      {success && <div className="auth-success">{success}</div>}

      <div className="auth-group">
        <label htmlFor="signup-nom">Nom</label>
        <input
          id="signup-nom"
          type="text"
          name="nom"
          value={signupData.nom}
          onChange={handleSignupChange}
          placeholder="Entrez votre nom"
          autoFocus
        />
      </div>

      <div className="auth-group">
        <label htmlFor="signup-prenom">Prénom</label>
        <input
          id="signup-prenom"
          type="text"
          name="prenom"
          value={signupData.prenom}
          onChange={handleSignupChange}
          placeholder="Entrez votre prénom"
        />
      </div>

      <div className="auth-group">
        <label htmlFor="signup-dateOfBirth">Date de naissance</label>
        <input
          id="signup-dateOfBirth"
          type="date"
          name="dateOfBirth"
          value={signupData.dateOfBirth}
          onChange={handleSignupChange}
          placeholder="Entrez votre date de naissance"
          max={new Date().toISOString().split("T")[0]} // Prevent future dates
        />
      </div>

      <div className="auth-group">
        <label htmlFor="signup-gender">Genre</label>
        <select
          id="signup-gender"
          name="gender"
          value={signupData.gender}
          onChange={handleSignupChange}
          className="auth-select"
        >
          <option value="">Sélectionnez votre genre</option>
          <option value="homme">Homme</option>
          <option value="femme">Femme</option>
        </select>
      </div>

      <div className="auth-group">
        <label htmlFor="signup-password">Mot de passe</label>
        <input
          id="signup-password"
          type="password"
          name="password"
          value={signupData.password}
          onChange={handleSignupChange}
          placeholder="Créez un mot de passe"
        />
      </div>

      <div className="auth-group">
        <label htmlFor="signup-confirm">Confirmer le mot de passe</label>
        <input
          id="signup-confirm"
          type="password"
          name="confirmPassword"
          value={signupData.confirmPassword}
          onChange={handleSignupChange}
          placeholder="Confirmez votre mot de passe"
        />
      </div>

      <button className="auth-btn" type="submit">
        Créer le compte
      </button>

      <div className="auth-links-col">
        <span
          onClick={() => {
            setActiveForm("login")
            setError("")
            setSuccess("")
          }}
          className="auth-link"
        >
          Déjà un compte ? Se connecter
        </span>
      </div>
    </form>
  )

  // Render forgot password form
  const renderForgotForm = () => (
    <form className="auth-form" onSubmit={handleForgotSubmit}>
      <h2 className="auth-title">Mot de passe oublié</h2>

      {error && <div className="auth-error">{error}</div>}
      {success && <div className="auth-success">{success}</div>}

      <div className="auth-group">
        <label htmlFor="forgot-email">Email</label>
        <input
          id="forgot-email"
          type="email"
          value={forgotEmail}
          onChange={(e) => setForgotEmail(e.target.value)}
          placeholder="Entrez votre email"
          autoFocus
        />
      </div>

      <button className="auth-btn" type="submit">
        Réinitialiser le mot de passe
      </button>

      <div className="auth-links-col">
        <span
          onClick={() => {
            setActiveForm("login")
            setError("")
            setSuccess("")
          }}
          className="auth-link"
        >
          Retour à la connexion
        </span>
      </div>
    </form>
  )

  // Render reset verification form
  const renderResetVerificationForm = () => (
    <form className="auth-form" onSubmit={handleResetVerificationSubmit}>
      <h2 className="auth-title">Vérification</h2>

      {error && <div className="auth-error">{error}</div>}
      {success && <div className="auth-success">{success}</div>}

      <div className="auth-group">
        <label htmlFor="reset-verification-code">Code de vérification</label>
        <input
          id="reset-verification-code"
          type="text"
          value={resetVerificationCode}
          onChange={(e) => setResetVerificationCode(e.target.value)}
          placeholder="Entrez le code de vérification"
          maxLength={6}
          autoFocus
        />
      </div>

      <button className="auth-btn" type="submit">
        Vérifier
      </button>

      <div className="auth-links-col">
        <span
          onClick={() => {
            setActiveForm("forgot")
            setError("")
            setSuccess("")
          }}
          className="auth-link"
        >
          Retour
        </span>
      </div>
    </form>
  )

  // Render password reset form
  const renderResetForm = () => (
    <form className="auth-form" onSubmit={handleResetSubmit}>
      <h2 className="auth-title">Réinitialiser le mot de passe</h2>

      {error && <div className="auth-error">{error}</div>}
      {success && <div className="auth-success">{success}</div>}

      <div className="auth-group">
        <label htmlFor="new-password">Nouveau mot de passe</label>
        <input
          id="new-password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Entrez votre nouveau mot de passe"
          autoFocus
        />
      </div>

      <div className="auth-group">
        <label htmlFor="confirm-new-password">Confirmer le mot de passe</label>
        <input
          id="confirm-new-password"
          type="password"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          placeholder="Confirmez votre nouveau mot de passe"
        />
      </div>

      <button className="auth-btn" type="submit">
        Réinitialiser
      </button>

      <div className="auth-links-col">
        <span
          onClick={() => {
            setActiveForm("verify")
            setError("")
            setSuccess("")
          }}
          className="auth-link"
        >
          Retour
        </span>
      </div>
    </form>
  )

  // Render the appropriate form based on activeForm state
  return (
    <div className="auth-container">
      <div className="auth-logo-container">
        <img src={logoImage || "/placeholder.svg"} alt="LPS Logo" className="auth-logo" />
      </div>
      {activeForm === "login" && renderLoginForm()}
      {activeForm === "signup" && renderInitialSignupForm()}
      {activeForm === "verify" && renderVerificationForm()}
      {activeForm === "signup-complete" && renderCompleteSignupForm()}
      {activeForm === "forgot" && renderForgotForm()}
      {activeForm === "reset" && renderResetForm()}
    </div>
  )
}

export default Login
