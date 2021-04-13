import log from '../logger';
import { errors } from 'appium-base-driver';

let commands = {}, helpers = {}, extensions = {};

commands.setContext = async function setContext (name) {
  if (name === 'NATIVE_APP') {
    return this.setContext('ECP');
  }
  const contexts = await this.getContexts();
  if (!contexts.includes(name)) {
    throw new errors.NoSuchContextError();
  }
  this.curContext = name;
};

commands.getContexts = function getContexts () {
  this.contexts = ['ECP'];
  log.info(`Available contexts: ${JSON.stringify(this.contexts)}`);
  return this.contexts;
};


Object.assign(extensions, commands, helpers);
export { commands, helpers };
export default extensions;