import React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

const IndexPage = ({ data }) => (
  <Layout>
    <SEO title="Home" />

    <dl>
      {data.allMarkdownRemark.edges.map(({ node }) => (
        <div key={node.id}>
          <dt>
            <Link to={node.fields.slug}>
              {node.frontmatter.title}
            </Link>
          </dt>
          <dd>
            <small>
              <time>{node.frontmatter.date}</time>
            </small>
            <p>{node.excerpt}</p>
          </dd>
        </div>
      ))}
    </dl>

  </Layout>
)

export const query = graphql`
  query {
    allMarkdownRemark(sort: {fields: frontmatter___date,  order: DESC}) {
      edges {
        node {
          id
          frontmatter {
            title
            date(formatString: "YYYY-MM-DD")
          }
          fields { slug }
          excerpt
        }
      }
    }
  }
`

export default IndexPage
