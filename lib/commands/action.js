
import log from '../logger';
import helpers from '../roku-helpers';

let commands = {};
let extensions = {};

commands.getScreenshot = async function getScreenshot () {
  log.info('Getting screenshot...');
  const image = await this.ecp.getScreenshot();
  return image.toString('base64');
};

commands.getPageSource = async function getPageSource () {
  log.info('Getting page source...');
  try {
    const source = await this.ecp.appUI();
    return source;
  } catch (error) {
    log.errorAndThrow(error);
  }
};

commands.isLocked = async function isLocked () {
  log.info('Getting status screensaver...');
  const app = await this.ecp.activeApp();
  log.info(JSON.stringify(app));
  return app.screensaver != null ? true : false;
};

commands.unlock = async function unlock () {
  log.info('Unloking screensaver...');
  const isLocked = await this.isLocked();
  if (!isLocked) {
    return;
  }
  await this.sendKey('Enter');
  await helpers.waitForCondition({
    error: 'Screensaver is still visible',
    condition: async () => {
      const isLocked = await this.isLocked();
      return !isLocked;
    },
  });
};

Object.assign(extensions, commands);
export { commands };
export default extensions;
