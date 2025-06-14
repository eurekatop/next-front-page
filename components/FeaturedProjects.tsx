import React from "react";
import styles from "./FeaturedProjects.module.css";

export default function FeaturedProjects() {
  return (
    <section className={styles.featured_projects}>
      <a href="/radioalert" className={styles.featured_card} style={{ backgroundImage: 'url(/images/radio-alert.png)' }}>
        <div className={styles.card_bg_pixel}></div>
        <div className={styles.card_content}>
          <h3>📻 RadioAlert</h3>
          <p>Transcripció de ràdio amb estil retro, terminals i ones IA.</p>
        </div>
      </a>

      <a href="/wordguardian/es/game/8244" className={styles.featured_card} style={{ backgroundImage: 'url(/images/radio-alert.png)' }}>
        <div className={styles.card_bg_pixel}></div>
        <div className={styles.card_content}>
          <h3>🧠 WordGuardian</h3>
          <p>Joc de definicions surrealistes amb aroma de MS-DOS i Wikidata.</p>
        </div>
      </a>
    </section>
  );
}
