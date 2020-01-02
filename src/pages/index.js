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
          <dt>{node.frontmatter.title}</dt>
          <dd>
            <small>
              <time>{node.frontmatter.date}</time>
            </small>
            <p>{node.excerpt}</p>
          </dd>
        </div>
      ))}
    </dl>

    <Link to="/page-2/">Go to page 2</Link>
  </Layout>
)

export const query = graphql`
  query {
    allMarkdownRemark {
      edges {
        node {
          id
          frontmatter {
            title
            date(formatString: "YYYY-MM-DD")
          }
          excerpt
        }
      }
    }
  }
`

export default IndexPage
