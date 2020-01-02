import React from "react"
import Layout from "../components/layout"
import { graphql } from "gatsby"
import './note.css'

export default ({ data }) => {
  const post = data.markdownRemark
  return (
    <Layout>
      <div className="frontmatter">
        <h1 className="frontmatter__title">{post.frontmatter.title}</h1>
        <time className="frontmatter__date">{post.frontmatter.date}</time>
      </div>

      <div dangerouslySetInnerHTML={{__html: post.html}}></div>
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
    }
  }
`
