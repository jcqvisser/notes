---
title: How to Work with Golang Packages and Modules
date: "2020-01-16"
---

I haven't used Go often enough to ever remember how to deal with packages and modules. Hopefully writing it down helps: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;

The files in a folder make up one package, they should all have the same package declaration at the top: `package main`. The root package is always called `"main"`.

Files in a package can access everything declared in that same package without having to  `import` it.

Initializing a project as a module makes importing things from nested packages easy. Do so with `go mod init modulename` where `modulename` is the url of the repo where the module is hosted, eg. `github.com/username/module`.

Folders inside the module represent other packages. These can be imported by their absolute name, eg. `import (p "modulename/packagename"`

Packages can be nested: The code in a file at  `modulename/packagename/nestedpackagename/some_file.go` with its first line as `package nestedpackagename` can be accessed via `import(np "modulename/packagename/nestedpackagename")`

Things inside a package with names that start with a capital letter can be accessed from outside the package. For example, if the following file exists as `modulename/packagename/constants.go`:

```go
package packagename

Pi := 3.1416
e := 2.7183
```

Then the following can be done in `main.go`:

```go
package main

import(
  "fmt"
  np "github.com/username/module/packagename/nestedpackagename"
)

// works:
fmt.Println(np.Pi)

// does not work:
// fmt.Println(np.e)
```

Packages are stateful. If a global variable in a package is changed  somewhere, it will appear changed _everywhere_ in the app. Global mutable state is bad.

In summary:
 * Initialize a project as a module: `go mod init <module-name>`
 * Files in one package don’t need to import one another
 * Packages can contain packages
 * Import packages using their fully qualified name: `import (p "modulename>/packagename"`
 * Avoid global variables

