import type { Page } from '../../App';
import {
  LayoutDashboard, Trophy, Users, Calendar, Table2
} from 'lucide-react';
import styles from './Sidebar.module.css';

const NAV_ITEMS: { id: Page; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard',           icon: LayoutDashboard },
  { id: 'teams',     label: 'Equipos',             icon: Trophy },
  { id: 'players',   label: 'Jugadores',           icon: Users },
  { id: 'games',     label: 'Juegos',              icon: Calendar },
  { id: 'standings', label: 'Tabla de Posiciones', icon: Table2 },
];

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}>⚾</div>
        <div className={styles.logoText}>
          <span className={styles.logoTitle}>LIDOM</span>
          <span className={styles.logoSub}>Liga de Béisbol</span>
        </div>
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`${styles.navItem} ${currentPage === id ? styles.active : ''}`}
            onClick={() => onNavigate(id)}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.season}>
          <span className={styles.seasonBadge}>RD</span>
          <div>
            <p className={styles.seasonTitle}>Temporada 2025</p>
            <p className={styles.seasonSub}>Round Robin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}