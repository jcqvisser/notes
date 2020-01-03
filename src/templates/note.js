import React from "react"
import Layout from "../components/layout"
import { graphql, Link } from "gatsby"

export default ({ data }) => {
  const post = data.markdownRemark

  return (
    <Layout>
      <Link to={post.fields.slug} className="border-solid border-l-4 block px-4 rounded-sm border-gray-300 hover:border-gray-600 mb-6">
        <h1>{post.frontmatter.title}</h1>
        <time className="text-gray-600">{post.frontmatter.date}</time>
      </Link>

      <div  dangerouslySetInnerHTML={{__html: post.html}}></div>
    </Layout>
  )
}

export const query = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      frontmatter {
        title
        date
      }
      fields {
        slug
      }
    }
  }
`
