# Reddit Map
Web Client Frontend for the Reddit Map Project

## Background

Reddit Map is a project of computer, data, and social scientists to explore and visualize Reddit as a space. The site running the visualizations is available at https://redditmap.social. The code that runs the application frontend is here.

## Main Tasks

### Dependencies
Install dependencies with `npm install`.

### Developing
Start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

### Publishing Changes to Site

After you commit changes to our development mainline branch, `main`, you'll want to cut a release and publish changes for the world to see. We've setup a GitHub action to make that easy for you.

Merge the branch `main` into `publish`. The publish action will take care of the rest for you, building the site static resources, syncing remote files, and dealing with HTTP caching. It will take several minutes for the build, sync, and HTTP cache invalidation tasks to complete. 


## Other Tasks

There are Gulp tasks that allow you to perform other actions, but most people won't need to use them if they're working directly on the application layer.

### Deploying Infrastructure

You only need this if you're setting up an endpoint for the first time, or if the infrastructure configuration needs to be updated. Note that you'll need sufficient permissons in iDPI's AWS account.

```bash
AWS_PROFILE=idpi npx gulp deploy --environment=production-www
```

### Manually Building Assets

To manually build assets, use:

```bash
npx gulp build
```

### Publishing Changes to Site

You can run the publish action locally, if you have permissions with iDPI's AWS account. Use the following command:

```bash
AWS_PROFILE=idpi npx gulp publish --environment=production-www
```
