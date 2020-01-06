---
title: "Host a Static Site or SPA on S3"
date: "2020-01-04"
---

Static sites and SPA's can be hosted cheaply using only AWS services. Many tutorials make this out to be more complicated than it is.

## Overview
Its good to have some static website or SPA available to deploy before starting this process, even if its just a simple hello-world example. This has been tested with [Gatsby](https://www.gatsbyjs.org/tutorial/part-one/), [Create React App](https://reactjs.org/docs/create-a-new-react-app.html#create-react-app) and [Angular](https://angular.io/start) but anything that produces a bunch of files that could constitute a website should work.

* Buy a domain from Route53 (**optional**)
* Get an SSL certificate from ACM (**optional**)
* Create an S3 bucket to hold the files and enable static-website hosting
* Create a CloudFront distribution that points to the bucket's domain
* Update DNS records to point to CloudFront (**optional**)
* Deploy the static website

## Buy a Domain from Route53 (Optional)
Buying a domain is not required, skip to [Create an S3 Bucket to Hold the Files](#create-a-bucket) if you don't want to spend money.

The Route53 interface at https://console.aws.amazon.com/route53/home is fairly self-explanatory. Buying a domain is pretty straight-forward.

Buying a domain somewhere else is also viable, setting up the DNS settings and obtaining an SSL certificate for it will just be more of a shlep.

For the rest of this, let’s pretend the domain is `example.com`.

## Get an SSL Certificate from ACM (Optional)
An SSL certificate isn't required unless the website is to be hosted on a specific domain. CloudFront provides certificates that can be used otherwise.

A free SSL certificate for a specific domain can be obtained from the AWS Certificate Manager at https://console.aws.amazon.com/acm/home?region=eu-west-1#/

There are some things to keep in mind while requesting a certificate:

Request a certificate for both the apex domain as well as the wildcard sub-domain:
- `*.example.com`
- `example.com`

AWS needs to validate that you own the domain that you're requesting a certificate for. This is most easily done via DNS validation, where AWS asks you to create CNAME DNS-records for the domain that they then go and check. After completing the certificate-request wizard you’ll have access to this DNS configuration.

If the domain's DNS is managed with Route53 then the next step is a breeze: click on the dropdown next to each of your domain names and select “Create a record in Route 53”.

If the domain's DNS is managed wlsewhere you’ll have to create the CNAME DNS records that AWS asks for manually.

<h2 id="create-a-bucket">Create an S3 Bucket to Hold the Files</h2>
Navigate to S3 and create a bucket. S3 bucket names need to be globally unique, so name it after your domain (`example.com`)

Public-Access needs to be un-blocked. This can be done during Step 3 of the bucket-creation-wizard by unchecking “Block _all_ public access”

After creating the bucket, static-website-hosting needs to be enabled. This is configured by selecting the bucket on the S3 console, navigating to the “Properties” tab and selecting “Static website hosting”

Finally, make sure than anyone can read any file from the bucket: Update the bucket-policy to the following:
```json
{
  "Version": "2008-10-17",
  "Id": "Public!!!",
  "Statement": [
    {
      "Sid": "2",
      "Effect": "Allow",
      "Principal": "*",
      "Action": [
        "s3:GetObject"
      ],
      "Resource": [
        "arn:aws:s3:::<bucket-name>/*"
      ]
    }
  ]
}
```

Enabling static-website-hosting exposes the bucket as a website via an endpoint (something like http://example.com.s3-website-eu-west-1.amazonaws.com). A name for index and error documents need to be provided so that S3 can make some educated guesses, like serving http://endpoint/pages/intro/index.html when http://endpoint/pages/intro/ is requested.

When serving a SPA from an S3 bucket, it could be advantageous to use `index.html` as the error document. That way the SPA itself can choose what do display, given the URL.

While you’re busy with the S3 interface, upload a placeholder `index.html` file.
Grant public read access to the file, else it won't be available to users who request it.
Prevent anyone from caching the file by setting it’s `Cache-Control` header to `no-store`. This will be useful for seeing if everything works.

## Create a CloudFront Distribution
Head over to the CloudFront page and create a new  web distribution:
- Use the endpoint for the static website created using S3 from before as the _Origin Domain Name_, rather than selecting the S3 bucket from the dropdown. This allows CloudFront to benefit from S3's guesses about which files to serve for url’s that don’t directly reference files.
- Select _Redirect HTTP to HTTPS_ for _Viewer Protocol Policy_
- Select _Yes_ for _Compress Objects Automatically_
- List all the domain names you want to access this website on under _Alternate Domain Names_ (eg. `example.com,www.example.com`) (Don't list any if you're not using a specific domain)
- Select _Custom SSL Certificate _ for _SSL Certificate_ and select the certificate that was provisioned from ACM. Select _Default CloudFront Certificate_ if you're not using a specific domain)
- Set the _Default Root Object_ to `index.html`
- Click _Create Distribution_ and wait 20 min

Take note of the domain name for the newly created CloudFront distribution (it looks something like `xxxxxxxxxxxxxx.cloudfront.net`) if everything worked up until now you’ll be able to access the placeholder `index.html`

## Update DNS Records to Point to CloudFront (Optional)
Don't do this unless you're hosting this site on a specific domain.

If your DNS is managed by Route53, then head over there and select the hosted-zone for your domain.
- Create an A record with a blank name (this maps to  `example.com`), select _Yes_ for _Alias_ and select your CloudFront distribution as the _Alias Target_
- Create an A record with “www” under the name field (this maps to `www.example.com`) that is also aliased to the CloudFront distribution.

If your DNS isn’t managed by Route53 then you’ll probably have to create a CNAME record that points to the url of the CloudFront distribution.

DNS takes some time to propagate, but after a while (5 min to a few hours) you’ll be able to access the placeholder `index.html` page via the new domain.

## Deploy the Static Website
The placeholder `index.html` page uploaded to S3 earlier can be replaced by a _real_ static website or SPA.

### Build and Upload the Static Website
- If the website is built with _Gatsby_, first run `gatsby build` in the terminal. When the website is built, upload all the files in the `public` directory to the root of the S3 bucket. (Also see: https://www.gatsbyjs.org/tutorial/part-eight/#-create-a-production-build)
- If the SPA is built with _Create React App_, run `npm run build` in the terminal and upload all the files in the `build` directory to the root of the S3 bucket. (Also see: https://create-react-app.dev/docs/production-build/)
- For Angular Apps, run `ng build --prod` and upload the contents of the `dist` folder to the root of the S3 bucket. (Also see: https://angular.io/guide/deployment#basic-deployment-to-a-remote-server)

### Configure Caching
Caching strategies for the files need to be set on S3.
Caching is complicated, so prefer to do no caching by setting the `Cache-Control` header of all the files to `no-store` when uploading them manually.

When automating the deployment, consider caching files with a fingerprint in their filename aggressively and prevent caching of files without a fingerprint.

### Configure Permissions
Remember to allow public-read access to all the files, else the website will only consist of 405 error pages.

### Create a Cloudfront Invalidation
The first time someone requests a certain page on the website, that request will end up at CloudFront because of the DNS records created earlier. CloudFront will forward the request to the S3 static-website. The response from S3 will be cached by CloudFront, allowing it to respond directly to future requests.

When deploying a new version of the website, it is wise to create an Invalidation on CloudFront. This tells it to ditch it's cache of the old files, preventing it from serving an out-dated website.

Create an Invalidation by selecting the Distribution for the website on the CloudFront console (https://console.aws.amazon.com/cloudfront/home), selecting the _Invalidations_ tab, and creating an invalidation for all object paths (`/*`).
