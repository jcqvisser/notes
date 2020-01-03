---
title: "Host a Static Site on S3"
date: "2017-08-10"
---

Static websites can be hosted fairly cheaply using AWS. Many tutorials make it out to be more complicated than it really is. &nbsp &nbsp &nbsp &nbsp

## Overview
* Buy a domain on Route53 (`example.com`)
* Get an SSL certificate from ACM (that includes both `*.example.com` and `example.com`)
* Create an S3 bucket to hold the files (named after the domain `example.com`) and enable static-website hosting
* Create a CloudFront distribution that points to the bucket's domain
* Update DNS records to point to CloudFront

## Buy a Domain from Route53
This is pretty straightforward. Go to https://console.aws.amazon.com/route53/home and use the interface.

Buying a domain somewhere else is also viable, setting up the DNS settings for it will just be more of a shlep.

For the rest of this, let’s pretend the domain is `example.com`.

## Get an SSL Certificate from ACM
Get to the AWS Certificate Manager by clicking on the “Services” dropdown and searching for “certificate”.

Click on “Get Started” under the “Provision Certificates” header and then request a public certificate.

Provide the following domain names:
- `*.example.com`
- `example.com`

A certificate with those domain names covers:
-  the apex-domain (`example.com` - no `www`)
- the “www” subdomain (`www.example.com`)
- any other subdomain you might want to use (things like `payments.example.com`)

DNS validation is pretty straightforward, go with that method. After completing the wizard you’ll have access to a DNS configuration that AWS uses to validate that you actually own the domain.

If your domain’s DNS is managed with Route53 then the next step is a breeze: click on the dropdown next to each of your domain names and select “Create a record in Route 53”.

If your woman’s DNS is managed somewhere else you’ll have to create the CNAME DNS record that AWS asks for manually.

## Create an S3 Bucket to Hold the Files
Navigate to S3 and create a bucket. S3 bucket names need to be globally unique, so name it after your domain (`example.com`)

Public-Access needs to be un-blocked. This can be done during Step 3 of the bucket-creation-wizard by unchecking “Block _all_ public access”

After creating the bucket, static-website-hosting needs to be enabled. This is configured by selecting the bucket on the S3 console, navigating to the “Properties” tab and selecting “Static website hosting”

 Enabling static-website-hosting exposes the bucket as a website via an endpoint (something like http://example.com.s3-website-eu-west-1.amazonaws.com). A name for index and error documents need to be provided so that S3 can make some educated guesses, like serving http://endpoint/pages/intro/index.html when http://endpoint/pages/intro/ is requested.

While you’re busy with the S3 interface, upload a placeholder `index.html` file and prevent anyone from caching it by setting it’s `Cache-Control` header to `no-store`. This will be useful for seeing if everything works.

## Create a CloudFront Distribution
Head over to the CloudFront page and create a new  web distribution:
- Use the endpoint for the static website created using S3 from before as the _Origin Domain Name_, rather than selecting the S3 bucket from the dropdown. This allows CloudFront to benefit from S3's guesses about which files to serve for url’s that don’t directly reference files.
- Select _Redirect HTTP to HTTPS_ for _Viewer Protocol Policy_
- Select _Yes_ for _Compress Objects Automatically_
- List all the domain names you want to access this website on under _Alternate Domain Names_ (eg. `example.com,www.example.com`)
- Select _Custom SSL Certificate _ for _SSL Certificate_ and select the certificate that was provisioned from ACM
- Set the _Default Root Object_ to `index.html`
- Click _Create Distribution_ and wait 20 min

Take note of the domain name for the newly created CloudFront distribution (it looks something like `xxxxxxxxxxxxxx.cloudfront.net`) if everything worked up until now you’ll be able to access the placeholder `index.html`

## Update DNS Records to Point to CloudFront
If your DNS is managed by Route53, then head over there and select the hosted-zone for your domain.
- Create an A record with a blank name (this maps to  `example.com`), select _Yes_ for _Alias_ and select your CloudFront distribution as the _Alias Target_
- Create an A record with “www” under the name field (this maps to `www.example.com`) that is also aliased to the CloudFront distribution.

If your DNS isn’t managed by Route53 then you’ll probably have to create a CNAME record that points to the url of the CloudFront distribution.

DNS takes some time to propagate, but after a while (5 min to a few hours) you’ll be able to access the placeholder `index.html` page via the new domain.
