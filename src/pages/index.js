import React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

const IndexPage = () => (
  <Layout>
    <SEO title="Home" />

    <dl>
      <dt>Note Title</dt>
      <dd>
        <small><time>2020-01-01</time></small>
        <p>Note description; a fair amount of text goes here</p>
      </dd>

      <dt>Another Note Title</dt>
      <dd>
        <small><time>2020-01-02</time></small>
        <p>Note description; a fair amount of text goes here. A whole lot of text could be displayed, what then? what will we do? It will have to break at some point.</p>
      </dd>
    </dl>

    <Link to="/page-2/">Go to page 2</Link>
  </Layout>
)

export default IndexPage
