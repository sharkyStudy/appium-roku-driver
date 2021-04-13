import strategies from './strategies';
import {helpers as wait} from '../roku-helpers';
import { log } from 'appium-support/build/lib/logging';

let commands = {};
let helpers = {};
let extensions = {};

commands.getDeviceTime = async function () {
  return await this.ecp.device();
};

commands.sendKey = async function (key) {
  return await this.ecp.keyPress(key);
};

commands.pressHardwareKey = async function (key) {
  return await this.sendKey(key);
};

commands.back = async function () {
  return await this.sendKey('XF86Back');
};

commands.isKeyboardShown = async function () {
  return await this.withContext('ECP', async () => {
    try {
      const element = await this.doFindElementOrEls(strategies.XPATH, '//*[self::Keyboard or self::MiniKeyboard or self::PinPad]');
      return element.isDisplayed;
    } catch (e) {
      return false;
    }
  });
};

commands.hideKeyboard = async function hideKeyboard () {
  await this.sendKey('Enter');
  await wait.waitForCondition({
    error: 'Keyboard is still visible',
    condition: async () => {
      const isKeyboardShown = await this.isKeyboardShown();
      return !isKeyboardShown;
    },
  });
};

commands.getWindowRect = async function getWindowRect () {
  const element = await this.findElOrEls(strategies.XPATH, '//@bounds');
  return element.bounds;
};

commands.getWindowSize = async function getWindowSize () {
  log.info('Getting window size...');
  const { width, height } = await this.getWindowRect();
  return { width, height };
};

Object.assign(extensions, commands, helpers);
export {commands, helpers};
export default extensions;
