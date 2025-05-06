"use client"

import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Calendar, Car, Users, CreditCard, Filter, RefreshCw } from "lucide-react"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#8dd1e1"]

const StatisticsDashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("all")
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    // Fetch data from your JSON server
    const fetchData = async () => {
      try {
        const [clientsRes, voituresRes, reservationsRes, contratsRes, accountsRes] = await Promise.all([
          fetch("http://localhost:3001/clients"),
          fetch("http://localhost:3001/voitures"),
          fetch("http://localhost:3001/reservations"),
          fetch("http://localhost:3001/contrats"),
          fetch("http://localhost:3001/accounts"),
        ])

        const clients = await clientsRes.json()
        const voitures = await voituresRes.json()
        const reservations = await reservationsRes.json()
        const contrats = await contratsRes.json()
        const accounts = await accountsRes.json()

        setData({ clients, voitures, reservations, contrats, accounts })
        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate statistics from data
  const calculateStats = () => {
    if (!data) return null

    // Filter data based on time range if needed
    let filteredReservations = [...data.reservations]

    if (timeRange !== "all") {
      const now = new Date()
      const startDate = new Date()

      if (timeRange === "week") {
        startDate.setDate(now.getDate() - 7)
      } else if (timeRange === "month") {
        startDate.setMonth(now.getMonth() - 1)
      } else if (timeRange === "year") {
        startDate.setFullYear(now.getFullYear() - 1)
      }

      filteredReservations = data.reservations.filter((res) => {
        const resDate = new Date(res.dateDebut)
        return resDate >= startDate && resDate <= now
      })
    }

    // Calculate car statistics
    const carsByBrand = data.voitures.reduce((acc, car) => {
      acc[car.marque] = (acc[car.marque] || 0) + 1
      return acc
    }, {})

    const carsByStatus = data.voitures.reduce((acc, car) => {
      acc[car.etat] = (acc[car.etat] || 0) + 1
      return acc
    }, {})

    const carsByFuelType = data.voitures.reduce((acc, car) => {
      acc[car["type carburant"]] = (acc[car["type carburant"]] || 0) + 1
      return acc
    }, {})

    // Calculate reservation statistics
    const reservationsByMonth = filteredReservations.reduce((acc, res) => {
      const month = new Date(res.dateDebut).toLocaleString("default", { month: "short" })
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {})

    const reservationsByLocation = filteredReservations.reduce((acc, res) => {
      acc[res.lieuLivraison] = (acc[res.lieuLivraison] || 0) + 1
      return acc
    }, {})

    // Calculate accessory usage
    const accessoryUsage = filteredReservations.reduce((acc, res) => {
      if (res.accessoires) {
        if (res.accessoires.siegeBebe) acc.siegeBebe = (acc.siegeBebe || 0) + 1
        if (res.accessoires.carte) acc.carte = (acc.carte || 0) + 1
        if (res.accessoires.gps) acc.gps = (acc.gps || 0) + 1
        if (res.accessoires.gallerie) acc.gallerie = (acc.gallerie || 0) + 1
      }
      return acc
    }, {})

    // Calculate client statistics
    const clientsByGender = data.accounts.reduce((acc, account) => {
      acc[account.gender] = (acc[account.gender] || 0) + 1
      return acc
    }, {})

    // Calculate average reservation duration
    const avgDuration =
      filteredReservations.reduce((total, res) => {
        const start = new Date(res.dateDebut)
        const end = new Date(res.dateFin)
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
        return total + days
      }, 0) / (filteredReservations.length || 1)

    // Format data for charts
    const carBrandData = Object.entries(carsByBrand).map(([name, value]) => ({ name, value }))
    const carStatusData = Object.entries(carsByStatus).map(([name, value]) => ({ name, value }))
    const carFuelData = Object.entries(carsByFuelType).map(([name, value]) => ({ name, value }))
    const reservationMonthData = Object.entries(reservationsByMonth).map(([name, value]) => ({ name, value }))
    const reservationLocationData = Object.entries(reservationsByLocation).map(([name, value]) => ({ name, value }))
    const accessoryData = Object.entries(accessoryUsage).map(([name, value]) => ({
      name: name === "siegeBebe" ? "Siège bébé" : name === "carte" ? "Carte" : name === "gps" ? "GPS" : "Gallerie",
      value,
    }))
    const genderData = Object.entries(clientsByGender).map(([name, value]) => ({
      name: name === "homme" ? "Hommes" : "Femmes",
      value,
    }))

    // Calculate most popular cars
    const carPopularity = filteredReservations.reduce((acc, res) => {
      acc[res.marque] = (acc[res.marque] || 0) + 1
      return acc
    }, {})

    const popularCarsData = Object.entries(carPopularity)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }))

    // Nouvelle statistique: Clients marocains vs étrangers
    let marocainCount = 0
    let etrangerCount = 0

    data.clients.forEach((client) => {
      const nationalite = client.conducteur["1er"].Nationalité?.toLowerCase() || ""
      if (nationalite.includes("marocain") || nationalite.includes("marocaine")) {
        marocainCount++
      } else if (nationalite) {
        etrangerCount++
      }
    })

    const nationalityData = [
      { name: "Marocains", value: marocainCount },
      { name: "Étrangers", value: etrangerCount },
    ]

    return {
      totalClients: data.clients.length,
      totalCars: data.voitures.length,
      totalReservations: filteredReservations.length,
      totalContracts: data.contrats.length,
      availableCars: data.voitures.filter((car) => car.etat === "Disponible").length,
      reservedCars: data.voitures.filter((car) => car.etat === "Réservée").length,
      avgDuration: avgDuration.toFixed(1),
      carBrandData,
      carStatusData,
      carFuelData,
      reservationMonthData,
      reservationLocationData,
      accessoryData,
      genderData,
      popularCarsData,
      nationalityData,
      marocainCount,
      etrangerCount,
    }
  }

  const stats = calculateStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-medium">Chargement des statistiques...</p>
        </div>
      </div>
    )
  }

  if (!data || !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-lg font-medium text-red-500">Erreur lors du chargement des données</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
            <RefreshCw className="mr-2 h-4 w-4 inline" /> Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Statistiques et Analyses</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border rounded p-2 text-sm ml-2" // Added ml-2 for margin-left
            >
              <option value="all">Toutes les données</option>
              <option value="week">7 derniers jours</option>
              <option value="month">30 derniers jours</option>
              <option value="year">12 derniers mois</option>
            </select>
          </div>
        </div>
      </div>

      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Vue d'ensemble
          </button>
          <button className={`tab ${activeTab === "cars" ? "active" : ""}`} onClick={() => setActiveTab("cars")}>
            Voitures
          </button>
          <button
            className={`tab ${activeTab === "reservations" ? "active" : ""}`}
            onClick={() => setActiveTab("reservations")}
          >
            Réservations
          </button>
          <button className={`tab ${activeTab === "clients" ? "active" : ""}`} onClick={() => setActiveTab("clients")}>
            Clients
          </button>
        </div>

        <div className="tab-content">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="table-container p-4">
                  <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="text-sm font-medium">Total Clients</h3>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.totalClients}</div>
                    <p className="text-xs text-muted-foreground">{data.accounts.length} comptes utilisateurs</p>
                  </div>
                </div>
                <div className="table-container p-4">
                  <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="text-sm font-medium">Total Voitures</h3>
                    <Car className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.totalCars}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.availableCars} disponibles, {stats.reservedCars} réservées
                    </p>
                  </div>
                </div>
                <div className="table-container p-4">
                  <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="text-sm font-medium">Réservations</h3>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.totalReservations}</div>
                    <p className="text-xs text-muted-foreground">Durée moyenne: {stats.avgDuration} jours</p>
                  </div>
                </div>
                <div className="table-container p-4">
                  <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="text-sm font-medium">Contrats</h3>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.totalContracts}</div>
                    <p className="text-xs text-muted-foreground">
                      Taux de conversion: {((stats.totalContracts / stats.totalReservations) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="table-container col-span-4">
                  <div className="p-4 border-b">
                    <h3 className="font-medium">Réservations par mois</h3>
                  </div>
                  <div className="p-4">
                    <div style={{ height: "350px" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.reservationMonthData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" name="Réservations" fill="#3498db" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                <div className="table-container col-span-3">
                  <div className="p-4 border-b">
                    <h3 className="font-medium">Voitures par marque</h3>
                  </div>
                  <div className="p-4">
                    <div style={{ height: "350px" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.carBrandData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {stats.carBrandData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="table-container">
                  <div className="p-4 border-b">
                    <h3 className="font-medium">Voitures les plus populaires</h3>
                    <p className="text-xs text-muted-foreground">Basé sur le nombre de réservations</p>
                  </div>
                  <div className="p-4">
                    <div style={{ height: "300px" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={stats.popularCarsData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={100} />
                          <Tooltip />
                          <Bar dataKey="value" name="Réservations" fill="#2ecc71" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                <div className="table-container">
                  <div className="p-4 border-b">
                    <h3 className="font-medium">État des voitures</h3>
                    <p className="text-xs text-muted-foreground">Répartition par statut</p>
                  </div>
                  <div className="p-4">
                    <div style={{ height: "300px" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.carStatusData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {stats.carStatusData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  entry.name === "Disponible"
                                    ? "#2ecc71"
                                    : entry.name === "Réservée"
                                      ? "#3498db"
                                      : entry.name === "En Réparation"
                                        ? "#f39c12"
                                        : "#e74c3c"
                                }
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                <div className="table-container">
                  <div className="p-4 border-b">
                    <h3 className="font-medium">Accessoires demandés</h3>
                    <p className="text-xs text-muted-foreground">Options les plus populaires</p>
                  </div>
                  <div className="p-4">
                    <div style={{ height: "300px" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.accessoryData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" name="Demandes" fill="#9b59b6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cars Tab */}
          {activeTab === "cars" && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="table-container">
                  <div className="p-4 border-b">
                    <h3 className="font-medium">Répartition par marque</h3>
                  </div>
                  <div className="p-4">
                    <div style={{ height: "300px" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.carBrandData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {stats.carBrandData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                <div className="table-container">
                  <div className="p-4 border-b">
                    <h3 className="font-medium">État des voitures</h3>
                  </div>
                  <div className="p-4">
                    <div style={{ height: "300px" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.carStatusData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {stats.carStatusData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  entry.name === "Disponible"
                                    ? "#2ecc71"
                                    : entry.name === "Réservée"
                                      ? "#3498db"
                                      : entry.name === "En Réparation"
                                        ? "#f39c12"
                                        : "#e74c3c"
                                }
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                <div className="table-container">
                  <div className="p-4 border-b">
                    <h3 className="font-medium">Type de carburant</h3>
                  </div>
                  <div className="p-4">
                    <div style={{ height: "300px" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.carFuelData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {stats.carFuelData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.name === "Essence" ? "#e74c3c" : "#3498db"} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              <div className="table-container">
                <div className="p-4 border-b">
                  <h3 className="font-medium">Voitures à surveiller</h3>
                  <p className="text-xs text-muted-foreground">
                    Voitures dont l'assurance ou la visite technique expire bientôt
                  </p>
                </div>
                <div className="p-4">
                  <div className="rounded-md border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="p-2 text-left font-medium">Marque</th>
                          <th className="p-2 text-left font-medium">Modèle</th>
                          <th className="p-2 text-left font-medium">Matricule</th>
                          <th className="p-2 text-left font-medium">Assurance expire le</th>
                          <th className="p-2 text-left font-medium">Visite expire le</th>
                          <th className="p-2 text-left font-medium">État</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.voitures
                          .filter((car) => {
                            const now = new Date()
                            const assuranceDate = new Date(car["date d'expiration d'assurance"])
                            const visiteDate = new Date(car["date d'expiration de la visite"])
                            const oneMonthFromNow = new Date()
                            oneMonthFromNow.setMonth(now.getMonth() + 1)

                            return assuranceDate <= oneMonthFromNow || visiteDate <= oneMonthFromNow
                          })
                          .map((car, index) => {
                            const assuranceDate = new Date(car["date d'expiration d'assurance"])
                            const visiteDate = new Date(car["date d'expiration de la visite"])
                            const now = new Date()

                            const assuranceExpired = assuranceDate < now
                            const visiteExpired = visiteDate < now

                            return (
                              <tr key={car.id} className={index % 2 === 0 ? "bg-muted/20" : undefined}>
                                <td className="p-2">{car.marque}</td>
                                <td className="p-2">{car.type}</td>
                                <td className="p-2">{car.matricule}</td>
                                <td className={`p-2 ${assuranceExpired ? "text-red-500 font-medium" : ""}`}>
                                  {new Date(car["date d'expiration d'assurance"]).toLocaleDateString()}
                                  {assuranceExpired && " (Expirée)"}
                                </td>
                                <td className={`p-2 ${visiteExpired ? "text-red-500 font-medium" : ""}`}>
                                  {new Date(car["date d'expiration de la visite"]).toLocaleDateString()}
                                  {visiteExpired && " (Expirée)"}
                                </td>
                                <td className="p-2">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      car.etat === "Disponible"
                                        ? "bg-green-100 text-green-800"
                                        : car.etat === "Réservée"
                                          ? "bg-blue-100 text-blue-800"
                                          : car.etat === "En Réparation"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {car.etat}
                                  </span>
                                </td>
                              </tr>
                            )
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reservations Tab */}
          {activeTab === "reservations" && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="table-container">
                  <div className="p-4 border-b">
                    <h3 className="font-medium">Réservations par mois</h3>
                  </div>
                  <div className="p-4">
                    <div style={{ height: "300px" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stats.reservationMonthData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="value"
                            name="Réservations"
                            stroke="#3498db"
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                <div className="table-container">
                  <div className="p-4 border-b">
                    <h3 className="font-medium">Réservations par lieu</h3>
                  </div>
                  <div className="p-4">
                    <div style={{ height: "300px" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.reservationLocationData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" name="Réservations" fill="#9b59b6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              <div className="table-container">
                <div className="p-4 border-b">
                  <h3 className="font-medium">Accessoires demandés</h3>
                  <p className="text-xs text-muted-foreground">Options les plus populaires dans les réservations</p>
                </div>
                <div className="p-4">
                  <div style={{ height: "300px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.accessoryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Demandes" fill="#e74c3c" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="table-container">
                <div className="p-4 border-b">
                  <h3 className="font-medium">Réservations récentes</h3>
                </div>
                <div className="p-4">
                  <div className="rounded-md border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="p-2 text-left font-medium">Client</th>
                          <th className="p-2 text-left font-medium">Voiture</th>
                          <th className="p-2 text-left font-medium">Date début</th>
                          <th className="p-2 text-left font-medium">Date fin</th>
                          <th className="p-2 text-left font-medium">Durée</th>
                          <th className="p-2 text-left font-medium">Lieu</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.reservations
                          .sort((a, b) => new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime())
                          .slice(0, 5)
                          .map((reservation, index) => {
                            const client = data.clients.find((c) => c.id === reservation.clientId)
                            const voiture = data.voitures.find((v) => v.id === reservation.voitureId)
                            const startDate = new Date(reservation.dateDebut)
                            const endDate = new Date(reservation.dateFin)
                            const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

                            return (
                              <tr key={reservation.id} className={index % 2 === 0 ? "bg-muted/20" : undefined}>
                                <td className="p-2">
                                  {client
                                    ? `${client.conducteur["1er"].Nom} ${client.conducteur["1er"].Prénom}`
                                    : "N/A"}
                                </td>
                                <td className="p-2">
                                  {voiture ? `${voiture.marque} ${voiture.type}` : reservation.marque}
                                </td>
                                <td className="p-2">{new Date(reservation.dateDebut).toLocaleDateString()}</td>
                                <td className="p-2">{new Date(reservation.dateFin).toLocaleDateString()}</td>
                                <td className="p-2">{days} jours</td>
                                <td className="p-2">{reservation.lieuLivraison}</td>
                              </tr>
                            )
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Clients Tab */}
          {activeTab === "clients" && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="table-container">
                  <div className="p-4 border-b">
                    <h3 className="font-medium">Répartition par genre</h3>
                  </div>
                  <div className="p-4">
                    <div style={{ height: "300px" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.genderData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            <Cell fill="#3498db" />
                            <Cell fill="#e74c3c" />
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                <div className="table-container">
                  <div className="p-4 border-b">
                    <h3 className="font-medium">Répartition par nationalité</h3>
                  </div>
                  <div className="p-4">
                    <div style={{ height: "300px" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.nationalityData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                          >
                            <Cell fill="#27ae60" /> {/* Vert pour les Marocains */}
                            <Cell fill="#f39c12" /> {/* Orange pour les Étrangers */}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="table-container">
                  <div className="p-4 border-b">
                    <h3 className="font-medium">Clients les plus actifs</h3>
                    <p className="text-xs text-muted-foreground">Basé sur le nombre de réservations</p>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      {data.clients
                        .map((client) => {
                          const reservationCount = data.reservations.filter((r) => r.clientId === client.id).length
                          return {
                            client,
                            reservationCount,
                          }
                        })
                        .sort((a, b) => b.reservationCount - a.reservationCount)
                        .slice(0, 5)
                        .map(({ client, reservationCount }) => (
                          <div key={client.id} className="flex items-center">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                              {client.conducteur["1er"].Nom.charAt(0)}
                              {client.conducteur["1er"].Prénom.charAt(0)}
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium">
                                {client.conducteur["1er"].Nom} {client.conducteur["1er"].Prénom}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {client.conducteur["1er"]["E-mail"] || "Email non disponible"}
                              </p>
                            </div>
                            <div className="ml-auto">
                              <div className="text-sm font-medium">{reservationCount}</div>
                              <p className="text-xs text-muted-foreground">réservations</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
                <div className="table-container">
                  <div className="p-4 border-b">
                    <h3 className="font-medium">Détails des nationalités</h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium mb-2">Clients marocains</h3>
                        <div className="text-2xl font-bold">{stats.marocainCount}</div>
                        <p className="text-xs text-muted-foreground">
                          {((stats.marocainCount / stats.totalClients) * 100).toFixed(1)}% du total des clients
                        </p>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium mb-2">Clients étrangers</h3>
                        <div className="text-2xl font-bold">{stats.etrangerCount}</div>
                        <p className="text-xs text-muted-foreground">
                          {((stats.etrangerCount / stats.totalClients) * 100).toFixed(1)}% du total des clients
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="table-container">
                <div className="p-4 border-b">
                  <h3 className="font-medium">Analyse des clients</h3>
                  <p className="text-xs text-muted-foreground">Statistiques détaillées sur les clients</p>
                </div>
                <div className="p-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium mb-2">Âge moyen</h3>
                      <div className="text-2xl font-bold">
                        {(data.accounts.reduce((sum, account) => sum + account.age, 0) / data.accounts.length).toFixed(
                          1,
                        )}{" "}
                        ans
                      </div>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium mb-2">Taux de fidélité</h3>
                      <div className="text-2xl font-bold">
                        {(
                          (data.clients.filter(
                            (client) => data.reservations.filter((r) => r.clientId === client.id).length > 1,
                          ).length /
                            data.clients.length) *
                          100
                        ).toFixed(1)}
                        %
                      </div>
                      <p className="text-xs text-muted-foreground">Clients avec plus d'une réservation</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium mb-2">Réservations par client</h3>
                      <div className="text-2xl font-bold">
                        {(data.reservations.length / data.clients.length).toFixed(1)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StatisticsDashboard
