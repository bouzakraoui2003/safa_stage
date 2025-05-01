import { Link } from "react-router-dom"
import './Home.css'

const Home = () => {
  return (
    <div className="home-container">
      <div className="cards-grid">
        <Link to="/clients" className="card">
          <div className="card-content">
            <div className="card-icon">
              <i className="fas fa-users"></i>
            </div>
            <h2>Clients</h2>
            <p>Accédez à la gestion complète des clients et conducteurs. Ajoutez, modifiez et consultez les informations de vos clients en quelques clics.</p>
          </div>
        </Link>

        <Link to="/voitures" className="card">
          <div className="card-content">
            <div className="card-icon">
              <i className="fas fa-car"></i>
            </div>
            <h2>Voitures</h2>
            <p>Gérez votre flotte de véhicules efficacement. Suivez la disponibilité, l'entretien et les détails de chaque voiture.</p>
          </div>
        </Link>

        <Link to="/reservations" className="card">
          <div className="card-content">
            <div className="card-icon">
              <i className="fas fa-calendar-alt"></i>
            </div>
            <h2>Réservations</h2>
            <p>Planifiez et organisez toutes vos réservations. Visualisez le calendrier et gérez les disponibilités en temps réel.</p>
          </div>
        </Link>

        <Link to="/contrats" className="card">
          <div className="card-content">
            <div className="card-icon">
              <i className="fas fa-file-contract"></i>
            </div>
            <h2>Contrats</h2>
            <p>Créez et gérez vos contrats de location. Générez des documents professionnels et suivez tous vos accords.</p>
          </div>
        </Link>

        <Link to="/statistics" className="card wide-card">
          <div className="card-content">
            <div className="card-icon">
              <i className="fas fa-chart-bar"></i>
            </div>
            <h2>Statistiques</h2>
            <p>Visualisez les performances de votre entreprise. Accédez aux rapports détaillés et aux analyses essentielles.</p>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default Home
