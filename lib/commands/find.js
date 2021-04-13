
import log from '../logger';
import { errors, isErrorType } from 'appium-base-driver';
import strategies from './strategies';
import { Document } from './document';

let commands = {};
let helpers = {};
let extensions = {};

helpers.doFindElementOrEls = async function doFindElementOrEls (params) {

  const { strategy, selector, multiple } = params;

  switch (strategy) {
    case strategies.ID:
      return await this.findByCSSSelector(multiple, `[id='${selector}']`);
    case strategies.ACCESIBILITY_ID:
      return await this.findByCSSSelector(multiple, `[name='${selector}']`);
    case strategies.TAG_NAME:
      return await this.findByCSSSelector(multiple, selector);
    case strategies.CSS_SELECTOR:
      return await this.findByCSSSelector(multiple, selector);
    case strategies.XPATH:
      return await this.findByXpath(multiple, selector);
    case strategies.ELEMENT_ID:
      return await this.findByXpath(multiple, selector);
    default:
      throw new Error(`Unsupported strategy for findElOrEls: ${strategy}`);
  }

};

helpers.findElOrEls = async function findElOrEls (strategy, selector, mult = false, context = '') {
  if (!selector) {
    throw new Error('Must provide a selector when finding elements');
  }

  let params = {
    strategy,
    selector,
    multiple: mult,
    context
  };

  let element;
  let doFind = async () => {
    try {
      element = await this.doFindElementOrEls(params);
    } catch (err) {
      if (isErrorType(err, errors.ProxyRequestError)) {
        // eslint-disable-next-line no-ex-assign
        err = err.getActualError();
      }
      if (isErrorType(err, errors.NoSuchElementError)) {
        return false;
      }
      throw err;
    }
    return element;
  };

  try {
    await this.implicitWaitForCondition(doFind);
  } catch (err) {
    if (err.message && err.message.match(/Condition unmet/)) {
      element = [];
    } else {
      throw err;
    }
  }

  if (mult) {
    return element;
  }

  if (!element) {
    throw new errors.NoSuchElementError();
  }

  return JSON.stringify(element);
};

helpers.findByXpath = async function findByXpath (multiple, selector) {
  log.info(`Find by xpath with selector "${selector}"`);
  let document = new Document(await this.ecp.appUI());
  document.render(await this.ecp.appUI());
  const element = multiple ? await document.xpathSelectAll(selector, this.implicitWaitMs / 1000) : await document.xpathSelect(selector, this.implicitWaitMs / 1000);
  if (!element) {
    throw new errors.NoSuchElementError();
  }
  return element;
};

helpers.findByCSSSelector = async function findByCSSSelector (multiple, selector) {
  log.info(`Find by css selector with selector "${selector}"`);
  let document = new Document(await this.ecp.appUI());
  document.render(await this.ecp.appUI());
  const element = multiple ? document.cssSelectAll(selector, this.implicitWaitMs / 1000) : document.cssSelect(selector, this.implicitWaitMs / 1000);
  if (!element) {
    throw new errors.NoSuchElementError();
  }
  return element;
};

Object.assign(extensions, commands, helpers);
export { commands, helpers };
export default extensions;
