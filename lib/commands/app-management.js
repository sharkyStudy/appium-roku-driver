
import fs from 'fs';
import { longSleep } from 'asyncbox';
import log from '../logger';

let commands = {};
let helpers = {};
let extensions = {};

commands.isAppInstalled = async function isAppInstalled (appId) {
  log.info('Check installed app...');
  return await this.ecp.isAppInstalled(appId);
};

commands.appsInstalled = async function appsInstalled () {
  log.info('Check installed apps...');
  return await this.ecp.apps();
};

commands.findAppInstalled = async function findAppInstalled (appId) {
  log.info('Find installed app...');
  const apps = await this.appsInstalled();
  const appInstalled = apps.find((app) => app.id === appId);
  log.info(JSON.stringify(appInstalled));
  return appInstalled;
};

commands.isCheckVersion = async function isCheckVersion (app, appId) {
  log.info('Check version app...');
  const currentApp = await this.ecp.checkVersion(fs.readFileSync(app));
  const appInstalled = await this.findAppInstalled(appId);
  if (!currentApp || !appInstalled) {
    return false;
  }
  return (currentApp.name === appInstalled.appName && currentApp.version === appInstalled.version);
};

commands.activateApp = async function activateApp (appId, contentId, mediaType) {
  await this.launchApp(appId, contentId, mediaType);
};

commands.removeApp = function removeApp (appId) {
  if (appId !== 'dev') {
    return log.errorAndThrow(`App ${appId} can not be removed`);
  }
  return this.ecp.uninstall();
};

commands.terminateApp = async function terminateApp (appId) {
  const activeApp = await this.isAppInstalled(appId);
  if (activeApp) {
    await this.closeApp();
  }
};

commands.installApp = async function installApp (app) {
  return await this.ecp.install(fs.readFileSync(app));
};

commands.launchApp = async function launchApp (appId, contentId, mediaType) {
  log.info('Launch app...');
  return await this.ecp.launch(appId, contentId, mediaType);
};

commands.closeApp = async function closeApp () {
  log.info('Close app...');
  await this.sendKey('Home');
  return this.isStartedApp('Roku');
};

commands.isStartedApp = async function isStartedApp (appId = this.opts.app) {
  return await this.ecp.isStartedApp(appId);
};

commands.isAppActivated = async function isAppActivated (appId = this.opts.app) {
  const { app } = await this.ecp.activeApp();
  if (app === 'Roku') {
    return false;
  }
  const isLocked = await this.isLocked();
  if (isLocked) {
    await this.unlock();
  }
  return app.attributes.id === appId;
};

commands.background = async function background (seconds) {
  const { app } = await this.ecp.activeApp();
  if (typeof app === 'string') {
    return log.errorAndThrow('App is not running');
  }
  await this.closeApp();
  if (seconds === null || seconds === -1) {
    return;
  }
  await longSleep(seconds * 1000);
  await this.activateApp(String(app.id));
};

Object.assign(extensions, commands, helpers);
export { commands, helpers };
export default extensions;
