# 🚀 Appium Roku Driver

[![NPM version](http://img.shields.io/npm/v/appium-roku-driver.svg)](https://npmjs.org/package/appium-roku-driver)
[![Downloads](http://img.shields.io/npm/dm/appium-roku-driver.svg)](https://npmjs.org/package/appium-roku-driver)

Appium Roku Driver is a test automation tool for Roku devices. Appium Roku Driver automates Roku applications, tested on real devices. Appium Roku Driver is part of the [Appium](https://github.com/appium/appium) test automation tool.

## Installation

In order to use `appium-roku-driver`, we need to use `appium` version `1.16.0` or higher

```
npm i -g appium-roku-driver
```

## 🚀 Usage

Import Roku Driver, set and create a session:

```js
import { RokuDriver } from "appium-roku-driver";

let capabilities = {
  app: "/Users/my-computer/3_Grid.zip",
  deviceName: "Home",
  appId: "dev",
  platformName: "Roku",
  contentId: "MV005011860000",
  mediaType: "season",
  ip: "10.10.1.1",
  username: "rokuUser",
  password: "rokuPass",
};

let driver = new RokuDriver();
await driver.createSession(capabilities);
```

## 🚀 Capabilities

Desired capabilities (caps) are a set of keys and values (i.e., a map or hash) sent to the Appium server to tell the server what kind of automation session we’re interested in starting up. There are various capabilities that can modify the behavior of the server during automation.

| Capability        | Mandatory Fields | Description                                                                                                                                   |
| ----------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| app               | `✅`             | `The absolute local path or remote http URL to a .zip`<sup>1</sup>                                                                            |
| appId             | `✅`             | `The appId is the identification for (channel / app) inside the OS`                                                                           |
| deviceName        | `✅`             | `The kind of device to use`<sup>1</sup>                                                                                                       |
| platformName      | `✅`             | `Platform target will be automated`<sup>1</sup>                                                                                               |
| contentId         | `✅`             | `Partner defined unique identifier for a specific piece of content`<sup>2</sup>                                                               |
| mediaType         | `✅`             | `Parameter to give context to the type of contentID passed`<sup>2</sup>                                                                       |
| ip                | `✅`             | `Ip of the device on which the automation will be executed`                                                                                   |
| username          | `✅`             | `Username of device`<sup>3</sup>                                                                                                              |
| password          | `✅`             | `Password of device`<sup>3</sup>                                                                                                              |
| noReset           | `🔲`             | `Don't reset app state before this session. See in the osicial documentation of Appium for more details`<sup>4</sup>                          |
| fullReset         | `🔲`             | `Perform a complete reset. See in the osicial documentation of Appium for more details`<sup>4</sup>                                           |
| newCommandTimeout | `🔲`             | `How long (in seconds) Appium will wait for a new command from the client before assuming the client quit and ending the session`<sup>1</sup> |

<sup>1</sup> [Appium Desired Capabilities](https://appium.io/docs/en/writing-running-appium/caps/)

<sup>2</sup> [Developer environment setup](https://developer.roku.com/en-gb/docs/developer-program/getting-started/developer-setup.md)

<sup>3</sup> [Developer environment setup](https://developer.roku.com/en-gb/docs/developer-program/getting-started/developer-setup.md)

<sup>4</sup> [Reset Strategies](https://appium.io/docs/en/writing-running-appium/other/reset-strategies/index.html)

## 🚀 Commands

### Session

These commands are used for session administration.

```javascript
createSession(capabilities);
```

```javascript
deleteSession();
```

```javascript
validateDesiredCaps(capabilities);
```

### Actions

These commands are used for actions administration.

```javascript
getPageSource();
```

```javascript
getScreenshot();
```

### App Managment

These commands are used for application administration.

```javascript
isAppInstalled(appId);
```

```javascript
appsInstalled();
```

```javascript
findAppInstalled(appId);
```

```javascript
isCheckVersion(app, appId);
```

```javascript
activateApp(appId, contentId, mediaType);
```

```javascript
removeApp(appId);
```

```javascript
terminateApp(appId);
```

```javascript
installApp(app, username, password);
```

```javascript
launchApp(appId, contentId, mediaType);
```

```javascript
closeApp();
```

```javascript
isStartedApp(appId);
```

```javascript
isAppActivated(appId);
```

```javascript
background(seconds);
```

### General

```javascript
getDeviceTime();
```

```javascript
sendKey(key);
```

```javascript
pressHardwareKey(key);
```

```javascript
back();
```

```javascript
isKeyboardShown();
```

```javascript
hideKeyboard();
```
