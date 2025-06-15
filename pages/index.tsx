import Link from "next/link";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getPostSlugs, getPostBySlug } from "../lib/posts";
import { useTranslation } from "next-i18next";
import FeaturedProjects from "../components/FeaturedProjects";
import { getFeaturedItems } from "../lib/featured";
import { getGroupedExplorationItems } from "../lib/explorations";
import TwoColumnLayout from "../components/TwoColumnLayout";
import ExplorationsList from "../components/ExplorationsList";

export default function Home({ posts, featured, groupedItems }) {
  const { t, i18n } = useTranslation("common");

  return (
    <>
      <div className="page-wrapper">
        <aside className="sidebar-column-left"></aside>

        <main className="main-column">
          <h1>{t("welcome")}</h1>
          <p>{t("page.index.welcome")}</p>

          <FeaturedProjects featured={featured} />

          <h2>{t("last_posts")}</h2>
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
                    {new Date(post.frontmatter.date).toLocaleDateString()}
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
        </main>

        <aside className="sidebar-column">
          <ExplorationsList groupedItems={groupedItems} />
        </aside>
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
  console.log("********************************+");
  console.log(groupedItems);

  return {
    props: {
      posts,
      featured,
      groupedItems,
      ...(await serverSideTranslations(locale ?? "en", ["common"])),
    },
  };
}
