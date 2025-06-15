
import { ExplorationItem } from '../lib/explorations';
import styles from './ExplorationsList.module.css';

interface Props {
  groupedItems: Record<string, Record<string, ExplorationItem[]>>;
}

export default function ExplorationsList({ groupedItems }: Props) {
  return (
    <aside className={styles.wrapper}>
      {Object.entries(groupedItems).map(([category, groups]) => (
        <div key={category} className={styles.categoryBlock}>
          <h3 className={styles.categoryTitle}>{category}</h3>
          {Object.entries(groups).map(([group, items]) => (
            <div key={group} className={styles.groupBlock}>
              <h4 className={styles.groupTitle}>{group}</h4>
              <ul className={styles.list}>
                {items.map((item) => (
                  <li key={item.url} className={styles.item}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.link}
                    >
                      <span className={styles.name}>{item.title}</span>
                    </a>
                    <span className={styles.description}>{item.description}</span>
                    {
                      (!!item.author ) && (<span className={styles.author}> by {item.author}</span>)
                    }
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </aside>
  );
}
