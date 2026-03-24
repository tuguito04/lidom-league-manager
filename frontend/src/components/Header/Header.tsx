import styles from './Header.module.css';

interface HeaderProps {
  title: string;
  subtitle: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
      <div className={styles.badge}>
        <span className={styles.dot} />
        <span>EN VIVO</span>
      </div>
    </header>
  );
}