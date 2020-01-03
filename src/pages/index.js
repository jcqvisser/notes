import React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

const IndexPage = ({ data }) => (
  <Layout>
    <SEO title="Home" />

    <dl>
      {data.allMarkdownRemark.edges.map(({ node }) => (
        <Link to={node.fields.slug} key={node.id} className="border-solid border-l-4 block px-4 rounded-sm border-gray-300 hover:border-gray-600">
          <dt>
            <h1>{node.frontmatter.title}</h1>
          </dt>

          <dd>
            <small>
              <time className="text-gray-600">{node.frontmatter.date}</time>
            </small>
            <p>{node.excerpt}</p>
          </dd>
        </Link>
      ))}
    </dl>
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
