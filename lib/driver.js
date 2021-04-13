import { BaseDriver, DeviceSettings } from 'appium-base-driver';
import desiredConstraints from './desired-caps';
import commands from './commands/index';
import helpers from './roku-helpers';
import log from './logger';
import _ from 'lodash';
import { DEFAULT_ECP_PORT } from 'appium-ecp';
import { tempDir } from 'appium-support';

const NO_PROXY = [
  ['POST', new RegExp('^/session/[^/]+/appium')],
  ['GET', new RegExp('^/session/[^/]+/appium')],
];

class RokuDriver extends BaseDriver {
  constructor (opts = {}, shouldValidateCaps = true) {
    super(opts, shouldValidateCaps);
    this.locatorStrategies = ['id', 'accessibility id', 'tag name', 'xpath', 'css selector'];
    this.desiredCapConstraints = desiredConstraints;
    this.jwpProxyActive = false;
    this.jwpProxyAvoid = _.clone(NO_PROXY);
    this.settings = new DeviceSettings({ ignoreUnimportantViews: false });

    for (let [cmd, fn] of _.toPairs(commands)) {
      RokuDriver.prototype[cmd] = fn;
    }
  }

  async createSession (caps) {
    try {
      let sessionId;
      [sessionId] = await super.createSession(caps);

      let serverDetails = {
        platform: 'ROKU',
        webStorageEnabled: false,
        takesScreenshot: true,
        javascriptEnabled: true,
        databaseEnabled: false,
        networkConnectionEnabled: true,
        locationContextEnabled: false,
        warnings: {},
        desired: this.caps,
      };
      this.caps = Object.assign(serverDetails, this.caps);

      let defaultOpts = {
        tmpDir: await tempDir.staticDir(),
        fullReset: false,
        autoLaunch: true,
        ecpPort: DEFAULT_ECP_PORT,
        rokuInstallTimeout: 30000,
      };
      _.defaults(this.opts, defaultOpts);

      if (this.opts.noReset === true) {
        this.opts.fullReset = false;
      }
      if (this.opts.fullReset === true) {
        this.opts.noReset = false;
      }
      this.opts.fastReset = !this.opts.fullReset && !this.opts.noReset;
      this.opts.skipUninstall = this.opts.fastReset || this.opts.noReset;

      let udn = await helpers.getDeviceInfoFromCaps(this.opts);
      this.opts.udn = udn;
      const properties = {
        ip: this.opts.ip,
        username: this.opts.username,
        password: this.opts.password
      };
      this.ecp = await helpers.createECP(properties);

      await this.startRokuSession(this.opts);
      return [sessionId, this.caps];
    } catch (e) {
      try {
        await this.deleteSession();
      } catch (ign) {}
      throw e;
    }
  }

  async startRokuSession () {
    let isAppInstalled = await this.isAppInstalled(this.opts.appId);
    if (this.opts.fastReset || this.opts.fullReset) {
      if (isAppInstalled) {
        let isAppActivated = await this.isAppActivated(this.opts.appId);
        if (isAppActivated) {
          await this.closeApp();
        }
      }
    }

    if (!this.opts.app) {
      if (this.opts.fullReset) {
        log.errorAndThrow('Full reset requires an app capability, use fastReset if app is not provided');
      }
      log.info('No app capability. Assuming it is already on the device');
      if (this.opts.fastReset) {
        await helpers.resetApp(this.adb, this.opts);
      }
      return;
    }

    const ischcheckedVersion = await this.isCheckVersion(this.opts.app, this.opts.appId);
    if (ischcheckedVersion) {
      this.opts.skipUninstall
        ? await this.activateApp(this.opts.appId, this.opts.contentId, this.opts.mediaType)
        : await this.removeApp(this.opts.appId);
    } else {
      await this.installApp(this.opts.app, this.opts.username, this.opts.password);
    }
  }

  async deleteSession () {
    log.info('Shutting down Roku driver');
    await super.deleteSession();
    if (!this.opts.skipUninstall) {
      const isInstalled = await this.isAppInstalled(this.opts.appId);
      if (isInstalled) {
        await this.removeApp(this.opts.appId);
      }
    } else {
      await this.closeApp();
    }
  }

  validateDesiredCaps (caps) {
    let res = super.validateDesiredCaps(caps);
    if (!res) {
      return res;
    }
  }

  proxyActive (sessionId) {
    super.proxyActive(sessionId);

    return this.jwpProxyActive;
  }

  getProxyAvoidList (sessionId) {
    super.getProxyAvoidList(sessionId);

    return this.jwpProxyAvoid;
  }

  canProxy (sessionId) {
    super.canProxy(sessionId);

    return false;
  }
}

export { RokuDriver };
export default RokuDriver;
