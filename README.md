# RedditMap
Web Client Frontend for the RedditMap Project


## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To build assets of the application to publish, use:

```bash
npx gulp build
```

## Deploying Infrastructure

> NOTE: you only need to do this once per environment or if infrastructure itself changes.

### Website S3 + CloudFront Distribution
```bash
AWS_PROFILE=idpi npx gulp deploy --environment=production-www
```

### Data S3 + CloudFront Distribution for RedditMap API
```bash
AWS_PROFILE=idpi npx gulp deploy --environment=production-data
```


## Publish Code/File Changes

### RedditMap Website
```bash
AWS_PROFILE=idpi npx gulp publish --environment=production-www
```

### RedditMap Data Files
```bash
AWS_PROFILE=idpi npx gulp publish --environment=production-data
```
