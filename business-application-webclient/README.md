This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

![Webapp home page](docs/webclient-home.png)

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
## Deploying on Openshift

```
npx nodeshift --strictSSL=false --dockerImage=nodeshift/ubi8-s2i-web-app --imageTag=14.x --build.env YARN_ENABLED=true --expose
Need to install the following packages:
  nodeshift
Ok to proceed? (y) y
```

For more details about how to deploy React and Angular JS apps on Openshift see this post: https://developers.redhat.com/blog/2018/10/04/modern-web-apps-openshift-part-1/

## Demo the Sample Use Cases

