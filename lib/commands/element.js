
import { errors } from 'appium-base-driver';
import strategies from './strategies';
import log from '../logger';

let commands = {};
let extensions = {};

commands.getAttribute = async function getAttribute (elementId, attribute) {
  const element = await this.findElOrEls(strategies.ELEMENT_ID, elementId);
  return element.attributes[attribute];
};

commands.getName = async function getName (elementId) {
  const element = await this.findElOrEls(strategies.ELEMENT_ID, elementId);
  return element.tag;
};

commands.elementDisplayed = async function elementDisplayed (elementId) {
  const element = await this.findElOrEls(strategies.ELEMENT_ID, elementId);
  return element.isDisplayed;
};

commands.elementEnabled = async function elementEnabled (elementId) {
  return await this.elementDisplayed(elementId);
};

commands.elementSelected = async function elementSelected (elementId) {
  const element = await this.findElOrEls(strategies.ELEMENT_ID, elementId);
  return element.isFocused;
};

commands.setValue = async function setValue (keys, elementId) {
  const element = await this.findElOrEls(strategies.ELEMENT_ID, elementId);
  await element.append(keys);
};

commands.replaceValue = async function replaceValue (keys, elementId) {
  const element = await this.findElOrEls(strategies.ELEMENT_ID, elementId);
  await element.type(keys);
};

commands.setValueImmediate = async function setValueImmediate (keys, elementId) {
  await this.replaceValue(keys, elementId);
};

commands.getText = async function getText (elementId) {
  const element = await this.findElOrEls(strategies.ELEMENT_ID, elementId);
  return element.text;
};

commands.getSize = async function getSize (elementId) {
  const element = await this.findElOrEls(strategies.ELEMENT_ID, elementId);

  if (!element.bounds) {
    return log.errorAndThrow(new errors.ElementNotVisibleError());
  }
  return { width: element.bounds.width, height: element.bounds.height };
};

commands.getLocation = async function getLocation (elementId) {
  const node = await this.findElOrEls(strategies.ELEMENT_ID, elementId);
  if (!node) {
    return log.errorAndThrow(new errors.ElementNotVisibleError());
  }
  return { x: node.bounds.x, y: node.bounds.y };
};

commands.getElementRect = async function getElementRect (elementId) {
  const element = await this.findElOrEls(strategies.ELEMENT_ID, elementId);

  if (!element.bounds) {
    return log.errorAndThrow(new errors.ElementNotVisibleError());
  }
  return element.bounds;
};

commands.click = async function click (elementId) {
  const element = await this.findElOrEls(strategies.ELEMENT_ID, elementId);
  await element.select(this.ecp);
};

commands.clear = async function clear (elementId) {
  await this.replaceValue('', elementId);
};

commands.active = async function active () {
  return await this.findElOrEls(strategies.CSS_SELECTOR, '[focused="true"]:not(:has([focused="true"]))');
};

Object.assign(extensions, commands);
export {commands};
export default extensions;
