import React from "react"
import { Link } from "gatsby";

const Header = ({title}) => (
  <header className="container mx-auto flex justify-left py-6">
    <Link to="/">
      <h1 className="font-light text-white bg-gray-900 px-4 text-5xl rounded-sm">{title.toUpperCase()}</h1>
    </Link>
  </header>
);

export default Header;
