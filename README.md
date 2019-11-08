# Intro

This package uses [Puppeteer](https://www.npmjs.com/package/puppeteer) to start a headless browser session, which will then log into your account and scan for a search query in your downloadable modules.

# Installation

```
npm install -g opencart-find-module-cli

# or
yarn global add opencart-find-module-cli
```

# Usage

```
$ opencart-find-module
```

# Configuration

[Configstore](https://www.npmjs.com/package/configstore) is used to store your credentials on your local machine.

Configuration is stored at `~/.config/configstore/opencart-find-module.json`