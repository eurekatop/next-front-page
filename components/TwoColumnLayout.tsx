import { ReactNode } from "react";
import styles from './TwoColumnLayout.module.css';

export default function TwoColumnLayout({
  children,
  sidebar
}: {
  children: ReactNode;
  sidebar: ReactNode;
}) {
  return (
    <main className={styles.container}>
      <div className={styles.layout}>
        <div className={styles.mainContent}>{children}</div>
        <aside className={styles.sidebar}>{sidebar}</aside>
      </div>
    </main>
  );
}
