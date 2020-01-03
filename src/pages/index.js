import React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

const IndexPage = ({ data }) => (
  <Layout>
    <SEO title="Home" />

    <ul className="ml-0">
      {data.allMarkdownRemark.edges.map(({ node }) => (
        <li key={node.fields.slug} className="list-none">
          <div>
            <Link
              to={node.fields.slug}
              className="border-solid border-l-4 block px-4 rounded-sm border-gray-300 hover:border-gray-600 hover:bg-transparent no-underline"
            >
              <h1>{node.frontmatter.title}</h1>
              <time className="text-gray-700 block">{node.frontmatter.date}</time>
              <p>{node.excerpt}</p>
            </Link>
          </div>
        </li>
      ))}
    </ul>
  </Layout>
)

export const query = graphql`
  query {
    allMarkdownRemark(sort: { fields: frontmatter___date, order: DESC }) {
      edges {
        node {
          id
          frontmatter {
            title
            date(formatString: "YYYY-MM-DD")
          }
          fields {
            slug
          }
          excerpt
        }
      }
    }
  }
`

export default IndexPage
