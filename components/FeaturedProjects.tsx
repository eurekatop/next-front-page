import { FeaturedItem } from '../lib/featured';
import styles from './FeaturedProjects.module.css';

export default function FeaturedProjects({ featured }: { featured: FeaturedItem[] }) {
  return (
    <section className={styles.featured_projects}>
      {featured.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={styles.featured_card}
          style={{ backgroundImage: `url(${item.image})` }}
        >
          <div className={styles.card_bg_pixel}></div>
          <div className={styles.card_content}>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        </a>
      ))}
    </section>
  );
}
