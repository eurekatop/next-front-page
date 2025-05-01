import Link from "next/link";
import { getPostSlugs, getPostBySlug } from "../lib/posts";

export default function Home({ posts }) {
  return (
    <div className="container">
      <h1>Benvingut a Eurekatop</h1>
      <p>
        Explora idees, tecnologia i contingut. Tot el que no sabies que volies
        llegir. 😉
      </p>

      <h2>Últims articles</h2>
      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
  {posts.slice(0, 5).map((post) => (
    <li className="card" key={post.slug}>
      {post.frontmatter.image && (
        <Link href={`/blog/${post.slug}`}>
          <img
            src={post.frontmatter.image}
            alt={post.frontmatter.title}
          />
        </Link>
      )}
      <div className="card-content">
        <Link href={`/blog/${post.slug}`}>
          <h3>{post.frontmatter.title}</h3>
        </Link>
        <p style={{ fontSize: "0.9rem", color: "#666", margin: "0.25rem 0" }}>
          {new Date(post.frontmatter.date).toLocaleDateString()}
        </p>
        <p>{post.frontmatter.summary}</p>
      </div>
    </li>
  ))}
</ul>

      <p style={{ marginTop: "2rem" }}>
        <Link href="/blog">Veure tots els articles →</Link>
      </p>
    </div>
  );
}

export async function getServerSideProps({ locale }) {
  const slugs = getPostSlugs(locale);
  console.debug("Slugs:", slugs);
  console.debug("Locale:", locale);
  const posts = slugs
    .map((slug) => getPostBySlug(slug, locale))
    .sort(
      (a, b) =>
        new Date(b.frontmatter.date).getTime() -
        new Date(a.frontmatter.date).getTime()
    );

  return {
    props: {
      posts,
    },
  };
}
