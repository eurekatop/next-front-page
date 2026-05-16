import Link from "next/link";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getPostSlugs, getPostBySlug } from "../lib/posts";
import { useTranslation } from "next-i18next";
import FeaturedProjects from "../components/FeaturedProjects";
import { getFeaturedItems } from "../lib/featured";
import { getGroupedExplorationItems } from "../lib/explorations";
import ExplorationsList from "../components/ExplorationsList";

export default function Home({ posts, featured, groupedItems }) {
  const { t, i18n } = useTranslation("common");

  return (
    <>
      <div className="page-wrapper page-wrapper-single">
        <main className="main-column home-column">
          <h1>{t("welcome")}</h1>
          <p>{t("page.index.welcome")}</p>
          <p>{t("page.index.notebook_intro")}</p>

          <h2>{t("recent_notes")}</h2>
          <ul style={{ listStyle: "none", paddingLeft: 0 }}>
            {posts.slice(0, 5).map((post) => (
              <li className="card" key={post.slug}>
                {post.frontmatter.image && (
                  <Link
                    rel="alternate"
                    hrefLang={`${i18n.language}`}
                    href={`/blog/${post.slug}`}
                  >
                    <img
                      src={post.frontmatter.image}
                      alt={post.frontmatter.title}
                    />
                  </Link>
                )}
                <div className="card-content">
                  <Link
                    rel="alternate"
                    hrefLang={`${i18n.language}`}
                    href={`/blog/${post.slug}`}
                  >
                    <h3>{post.frontmatter.title}</h3>
                  </Link>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "#666",
                      margin: "0.25rem 0",
                    }}
                  >
                    {post.postDate}
                  </p>
                  <p>{post.frontmatter.summary}</p>
                </div>
              </li>
            ))}
          </ul>

          <p style={{ marginTop: "2rem" }}>
            <Link rel="alternate" hrefLang={`${i18n.language}`} href="/blog">
              {t("see_all_posts")}
            </Link>
          </p>

          <section className="home-section">
            <h2>{t("archived_experiments")}</h2>
            <p>{t("page.index.archived_experiments_desc")}</p>
            <FeaturedProjects featured={featured} />
          </section>

          <section className="home-section home-section-muted">
            <h2>{t("interesting_links")}</h2>
            <p>{t("page.index.interesting_links_desc")}</p>
            <ExplorationsList groupedItems={groupedItems} />
          </section>
        </main>
      </div>
    </>
  );
}

export async function getServerSideProps({ locale }) {
  const slugs = getPostSlugs(locale);
  const posts = slugs
    .map((slug) => getPostBySlug(slug, locale))
    .sort(
      (a, b) =>
        new Date(b.frontmatter.date).getTime() -
        new Date(a.frontmatter.date).getTime()
    );

  const featured = getFeaturedItems(locale);
  const groupedItems = getGroupedExplorationItems(locale);

  return {
    props: {
      posts,
      featured,
      groupedItems,
      ...(await serverSideTranslations(locale ?? "en", ["common"])),
    },
  };
}
