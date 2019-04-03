# Internal swipes packages
## swipes-code package


__How to release:__

The master branch is for stable versions only. This is a version that is used in the live version of the product.

__Bump a stable version with__ - `npm version <major|minor|patch>` and then publish it with `npm publish`

The v2 branch is for beta versions only. This is a version that is used in our new product.

__Bump a beta version with__ - `npm version prerelease` and then publish it with `npm publish --tag beta`. For example if the version is `2.0.0-beta.0` after executing those commands the version should be `2.0.0-beta.1`

__How to install:__

For stable version just use `npm install  @swipesapp/core`
For beta version use `npm install  @swipesapp/core@beta`
If you want to change quickly between stable and beta use tags `npm install  @swipesapp/core@latest` and `npm install  @swipesapp/core@beta`. Don't forget to publish with the right tag otherwise everything by default is `latest`. If you want to check the current tags use `npm info`.

From npm 5 there is no need for the --save option. Packages are added automatically to the local package.json file.
