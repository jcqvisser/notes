---
title: "Set up Semaphore to Deploy a Static Site to S3"
date: "2020-01-06"
---

Somewhat of a follow up to [a previous note](notes/host-a-static-site-or-spa-on-s3/) that describes how to host a static-site on S3

## Overview

Before starting this, make sure you have:
* a Semaphore account, linked to your Github account
* A public Github repo with some static-website or single-page-app

- Set up static site hosting via S3 and CloudFront, as detailled here: [Host a Static Site on S3](bear://x-callback-url/open-note?id=74899200-30C5-4D63-B85C-439EC47210FD-1281-000003B5DD6DF602)
The steps to set up deployment:
- Create an IAM user with permissions to upload files to an S3 bucket and to invalidate a CloudFront cache.
- Configure the AWS cli locally
- Install the Semaphore CLI
- Initialise the project using the Semaphore CLI
- Create Semaphore pipelines.

## Create an IAM user with the right permissions
### Create appropriate Policies
- Using the AWS Management Console, navigate to the IAM service
- Select _Policies_ in the left-hand nav and choose _Create policy_

Allowing Semaphore to deploy a static site to AWS will require two policies; one to upload files to S3 and another to invalidate the CloudFront cache once those files have been uploaded.

#### Policy 1: Allow Upload to S3
This policy allows users to upload files to a specific bucket as long as the bucket owner retains full control of the files.

- After selecting _Create policy_ from the IAM Policies page:
- Set up a policy for the _S3_ service which:
	- Allows the _PutObject_ and _PutObjectAcl_ actions. This gives the user permission to upload files to an S3 bucket and choose who has access to those files via an ACL - Access Control List.
	- Limits the buckets to which the user may upload files (`arn:aws:s3:::<bucket_name>/*`)
	- Ensures the bucket owner has full control of what the user uploads (`"StringEquals": { "s3:x-amz-acl": “bucket-owner-full-control" }`)
- Give this policy an easily identifiable name that links it to the project and a thorough description.

The JSON for this policy looks like this:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "VisualEditor0",
      "Effect": "Allow",
        "Action": [
          "s3:PutObject",
          "s3:PutObjectAcl"
        ],
        "Resource": "arn:aws:s3::<bucket-name>/*”,
        "Condition": {
        "StringEquals": {
          "s3:x-amz-acl": "bucket-owner-full-control"
        }
      }
    }
  ]
}
```

#### Policy 2: Allow CloudFront Cache Invalidation
CloudFront caches objects from S3 for a while, in order for deploys to have a more rapid effect one needs to invalidate the CloudFront  cache.

- After selecting _Create policy_ from the IAM Policies page:
- Set up a policy for the _CloudFront_ service which:
	- allows the _CreateInvalidation_ action.
	- on the right CloudFront distribution (identified by ARN, this can be found from the CloudFront Dashboard for the distribution, it looks like this: `arn:aws:cloudfront::<some-value>:distribution/<distribution-id>`)
- Give this policy an easily identifiable name that links it to the project and a thorough description.

The JSON for this policy looks like:
```JSON
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "VisualEditor0",
      "Effect": "Allow",
      "Action": "cloudfront:CreateInvalidation",
      "Resource": "arn:aws:cloudfront::<account-id>:distribution/<distribution-id>”
    }
  ]
}
```


### Attach the New Policies to a New Group
In order for an IAM user to have the new policies applied to them, they need to be part of a group with these policies attached.

- Navigate to the IAM Groups page via the left-hand nav of. the IAM Management Console and select _Create New Group_
- Give this group a memorable name that links it to the project
- Attach the policies created before to the group

### Create a New User
Semaphore needs to be represented by a user for it to make changes to resources. The user created here will represent Semaphore, the groups it is associated with governs what actions semaphore may take on your resources.

- Select users in the left-hand nav
- Using the blue _Add User_ button follow the wizard to create a new user.
	- a name that indicates the user’s purpose and project
	- allow the user programmatic access , but not AWS Management Console access
	- add the User to the Group created before
- Add appropriate tags to the user. This helps to make billing more understandable.

After the user has been created, AWS will display its _Access key ID_ and _Secret access key_. Take note of these they will need to be provided to Semaphore.

## Install and Configure the AWS CLI Locally
Semaphore’s AWS CLI is the same as the one you can install locally. This CLI saves it’s configuration and credentials as files located at: `~/.aws/config` and `~/.aws/credentials`

Install the AWS CLI using `pip3 install awscli` and configure it with `aws configure`.

The configuration asks for the following:
- AWS Access Key ID
- AWS Secret Access Key
- Default region name
- Default output format

Use the Access Key ID and Secret Access Key generated for the Semaphore user before.

The possible default region names can be found here: [AWS Service Endpoints - AWS General Reference](https://docs.aws.amazon.com/general/latest/gr/rande.html) If you’re outside of the US, consider going for  `eu-west-1`.

Just set the default output format to `json`.

## Install the Semaphore CLI
Follow the guide here: [sem command line tool - Semaphore 2.0 Documentation](https://docs.semaphoreci.com/article/53-sem-reference#download-and-install)

TLDR:
- install the cli with: `curl https://storage.googleapis.com/sem-cli-releases/get.sh | bash`
- log in with: `sem connect <organisation-name>.semaphoreci.com <api-token>`
	- The API token can be found under your personal account settings in the top-left menu on semaphore.
	- The top-left menu also indicates the organisation name

## Initialise the Project Using the Semaphore CLI
Inside the locally cloned Github Git repo, do `sem init` (make sure the github repo is public)

Provide the AWS configuration and credentials to Semaphore with:
```bash
sem create secret <secret-name> \
  --file ~/.aws/config:/home/semaphore/.aws/config \
  --file ~/.aws/credentials:/home/semaphore/.aws/credentials
```

## Create the Semaphore Pipeline Files
Create two Semaphore pipelines, one for building branches, and one for deploying the website to production.

### Build Pipeline
The first pipeline is set up in `.semaphore/semaphore.yml`, it:
* checks out  the repo and installs packages from NPM (caching them, so it’s faster next time)
* builds the website and caches the result
* triggers the next pipeline, if the checked out branch is `master`

```yaml
# .semaphore/semaphore.yml

version: v1.0
name: Build <website name>
agent:
  machine:
    type: e1-standard-2
    os_image: ubuntu1804

blocks:
  - name: “Install dependencies”
    task:
      jobs:
        - name: npm install
          commands:
            - checkout
            # Reuse dependencies from cache and avoid installing them from scratch:
            - cache restore
            - npm install
            - cache store

  - name: “Build site”
    task:
      jobs:
        - name: Build
          commands:
            - checkout
            - cache restore
            # Replace this with command(s) that build your website:
            - npx gatsby build
            # The script puts website files in directory `public`,
            # store it in cache to propagate to deployment:
            - cache store website-build public

promotions:
  - name: Production Deploy
    pipeline_file: production-deploy.yml
    auto_promote_on:
      - result: passed
        branch:
          - master
```

### Deploy Pipeline
The deploy-pipeline is referenced in the build-pipeline file as `production-deploy.yml`, it:
- checks out the cached build from the build-pipeline
- uploads the files that constitute the website to the right S3 Bucket
- creates an invalidation on CloudFront, allowing it to serve the new website.

```yaml
# .semaphore/production-deploy.yml

version: v1.0
name: Deploy <Website Name>
agent:
  machine:
    type: e1-standard-2
    os_image: ubuntu1804
blocks:
  - name: Deploy
    task:
      secrets:
        - name: <secret-name>
      jobs:
        - name: Copy to S3
          commands:
            - checkout
            - cache restore website-build
            - aws s3 cp public "s3://<bucket-name>" --recursive --acl bucket-owner-full-control --cache-control no-store
            - aws cloudfront create-invalidation --distribution-id <distribution-id> --paths "/*"
            - cache delete website-build
```
