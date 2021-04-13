import { parseXml } from 'libxmljs2';
import { Element } from './element.class';

const rootXML = '<app-ui></app-ui>';
const rootNode = parseXml(rootXML, { noblanks: true });

export class Document extends Element {

  constructor (xml) {
    super(rootNode, xml);
    this.xml = rootXML;
  }

  get focusedElement () {
    return this.cssSelect('[focused="true"]:not(:has([focused="true"]))') || this;
  }

  get isKeyboardShown () {
    return this.xpathSelect('//*[self::Keyboard or self::MiniKeyboard or self::PinPad]')?.isDisplayed || false;
  }

  async clear () {
    const keyboard = this.xpathSelect('//*[self::Keyboard or self::MiniKeyboard or self::PinPad]');

    if (keyboard) {
      await keyboard.clear();
    } else {
      throw new Error('Keyboard must be visible to clear the field');
    }
  }

  async type (text) {
    const keyboard = this.xpathSelect('//*[self::Keyboard or self::MiniKeyboard or self::PinPad]');

    if (keyboard) {
      await keyboard.type(text);
    } else {
      await this.sdk.ecp.type(text);
    }
  }

  async append (text) {
    const keyboard = this.xpathSelect('//*[self::Keyboard or self::MiniKeyboard or self::PinPad]');

    if (keyboard) {
      await keyboard.append(text);
    } else {
      await this.sdk.ecp.type(text);
    }
  }

  render (xml) {
    if (xml !== this.xml) {
      this.xml = xml;
      this._root = this._node = parseXml(xml, { noblanks: true });
    }
  }
}
