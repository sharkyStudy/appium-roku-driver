
import { waitForCondition as wait } from 'asyncbox';
import log from './logger';
import ECP from 'appium-ecp';

let helpers = {};

helpers.getDeviceInfoFromCaps = async function getDeviceInfoFromCaps (opts = {}) {
  let ecp = await ECP.createECP(opts);
  let deviceId = await ecp.setDeviceId();
  log.info(`Using device: ${deviceId}`);
  return deviceId;
};

helpers.createECP = async function createECP (opts = {}) {
  let ecp = await ECP.createECP(opts);
  await ecp.setDeviceId();
  return ecp;
};

helpers.waitForCondition = async function waitForCondition ({ error, condition, timeout = 30000, interval = 1000 }) {
  await wait(condition, {
    error,
    waitMs: timeout,
    intervalMs: interval,
    log
  });
};

export {helpers};
export default helpers;
