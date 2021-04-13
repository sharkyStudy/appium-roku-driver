
import log from './logger';
import {routeConfiguringFunction, server as baseServer} from 'appium-base-driver';
import RokuDriver from './driver';

async function startServer (port, host) {
  let rokuDriver = new RokuDriver();
  let router = routeConfiguringFunction(rokuDriver);
  let server = await baseServer(router, port, host);
  log.info(`RokuDriver server listening on http://${host}:${port}`);
  return server;
}

export {startServer};
