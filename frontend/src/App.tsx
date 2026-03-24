import { useState } from 'react';
import './styles/globals.css';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Header } from './components/Header/Header';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Teams } from './pages/Teams/Teams';
import { Players } from './pages/Players/Players';
import { Games } from './pages/Games/Games';
import { Standings } from './pages/Standings/Standings';

export type Page = 'dashboard' | 'teams' | 'players' | 'games' | 'standings';

const PAGE_TITLES: Record<Page, { title: string; subtitle: string }> = {
  dashboard:  { title: 'Dashboard',           subtitle: 'Resumen general de la temporada' },
  teams:      { title: 'Equipos',             subtitle: 'Gestión de equipos de la liga' },
  players:    { title: 'Jugadores',           subtitle: 'Roster completo de la temporada' },
  games:      { title: 'Juegos',              subtitle: 'Calendario y resultados' },
  standings:  { title: 'Tabla de Posiciones', subtitle: 'Clasificación de la temporada' },
};

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const { title, subtitle } = PAGE_TITLES[currentPage];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':  return <Dashboard />;
      case 'teams':      return <Teams />;
      case 'players':    return <Players />;
      case 'games':      return <Games />;
      case 'standings':  return <Standings />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="main-content">
        <Header title={title} subtitle={subtitle} />
        <main className="page-content">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;