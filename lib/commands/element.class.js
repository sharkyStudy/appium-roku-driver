import { Element as XMLElement } from 'libxmljs2';
import { performance } from 'perf_hooks';
import { selectAll, selectOne } from './css-select';

export class Element {

  constructor (node, document = null) {
    this.document = document;
    this._node = node;
    this._root = document._node;
  }

  get node () {
    if (this._root === this.document._root) {
      return this._node;
    }

    const node = this.document._root?.get(this._node.path());

    if (node) {
      this._node = node;
      this._root = this.document._root;
    }

    return this._node;
  }

  get parent () {
    const node = this.node.parent();
    return node instanceof XMLElement ? new Element(node, this.document) : null;
  }

  get parents () {
    const elements = [];
    let parent = this.parent;

    while (parent != null) {
      elements.push(parent);
      parent = parent.parent;
    }

    return elements;
  }

  get siblings () {
    return this.parent?.children || [this];
  }

  get prev () {
    const node = this.node.prevElement();
    return node instanceof XMLElement ? new Element(node, this.document) : null;
  }

  get next () {
    const node = this.node.nextElement();
    return node instanceof XMLElement ? new Element(this.sdk, node, this.document) : null;
  }

  get children () {
    const elements = [];

    for (const node of this.node.childNodes()) {
      if (node instanceof XMLElement) {
        elements.push(new Element(this.sdk, node, this.document));
      }
    }

    return elements;
  }

  get tag () {
    return this.node.name().toUpperCase();
  }

  get path () {
    return this.node.path();
  }

  get index () {
    let index = 0;
    let node = this.node;

    while ((node = node.prevElement())) {
      index++;
    }

    return index;
  }

  get attributes () {
    const attrs = {};

    for (const attr of this.node.attrs()) {
      attrs[attr.name()] = attr.value();
    }

    return attrs;
  }

  get text () {
    return this.xpathSelectAll('./descendant-or-self::*[(self::Label or self::SimpleLabel) and @text]')
      .filter((element) => element.isDisplayed)
      .map((element) => element.attributes.text.trim())
      .filter((text) => text)
      .join('\n');
  }

  get bounds () {
    const bounds = this.attributes.bounds;

    if (!bounds) {
      return null;
    }

    const [x, y, width, height] = JSON.parse(`[${bounds.slice(1, -1)}]`);

    return {
      width: Math.ceil(width),
      height: Math.ceil(height),
      x: Math.floor(x),
      y: Math.floor(y),
    };
  }

  get isConnected () {
    return this.node && this._root === this.document._root;
  }

  get isFocused () {
    return this.node.attr('focused')?.value() === 'true';
  }

  get isInFocusChain () {
    const elementChain = [this, ...this.parents];
    const focusedElement = this.document.focusedElement;
    const focusedElementChain = [focusedElement, ...focusedElement.parents];
    const count = Math.min(elementChain.length, focusedElementChain.length);

    return elementChain[elementChain.length - count].isSameNode(focusedElementChain[focusedElementChain.length - count]);
  }

  get isDisplayed () {
    return !this.node.get('./ancestor-or-self::*[@visible="false" or @opacity="0"]');
  }

  isSameNode (element) {
    return this === element || this.node === element.node || this.path === element.path;
  }

  async clear () {
    await appendOrSetText(this, '', true);
  }

  async type (text) {
    await appendOrSetText(this, text, true);
  }

  async append (text) {
    await appendOrSetText(this, text, false);
  }

  async select (ecp) {
    await this.focus(ecp);
    await ecp.keypress('Select');
  }

  async focus (ecp) {
    const move = async (key) => {
      const { path, attributes } = this.document.focusedElement;

      await ecp.keypress(key);

      const endTime = performance.now() + 5 * 1000;
      while (performance.now() <= endTime) {
        await this.document.render();

        const { path: newPath, attributes: newAttributes } = this.document.focusedElement;

        if (path !== newPath) {
          return;
        }

        for (const [key, value] of Object.entries(attributes)) {
          if (newAttributes[key] !== value) {
            return;
          }
        }
      }

      throw new Error('Could not focus');
    };

    let variants = this.cssSelectAll('*:not(:has(*))').length;

    while (this.isConnected && this.isDisplayed && !this.isInFocusChain && variants--) {
      const focusedElement = this.document.focusedElement;
      const focusChain = [focusedElement, ...focusedElement.parents].reverse();
      const chain = [this, ...this.parents].reverse();
      const depth = Math.min(chain.length, focusChain.length);

      for (let moved = false, i = 0; !moved && i < depth; i++) {
        const target = chain[i];
        const source = focusChain[i];

        if (target.isSameNode(source)) {
          continue;
        }

        const targetBounds = target.bounds;
        const sourceBounds = source.bounds;

        if (!targetBounds || !sourceBounds) {
          continue;
        }

        if (targetBounds.y < sourceBounds.y) {
          moved = true;
          await move('Up');
        } else if (targetBounds.y > sourceBounds.y) {
          moved = true;
          await move('Down');
        } else if (targetBounds.x < sourceBounds.x) {
          moved = true;
          await move('Left');
        } else if (targetBounds.x > sourceBounds.x) {
          moved = true;
          await move('Right');
        }
      }
    }

    if (!this.isDisplayed) {
      throw new Error('Not visible');
    }

    if (!this.isInFocusChain) {
      throw new Error('Not focused');
    }
  }

  cssSelect (css, timeoutInSeconds) {
    return findElOrEls(
      this,
      () => {
        const node = normalizeNode(selectOne(css, this.node));
        return node ? new Element(node, this.document) : null;
      },
      timeoutInSeconds
    );
  }

  cssSelectAll (css, timeoutInSeconds) {
    return findElOrEls(
      this,
      () => {
        const nodes = normalizeNodes(selectAll(css, this.node));
        return nodes.map((node) => new Element(node, this.document));
      },
      timeoutInSeconds
    );
  }

  xpathSelect (xpath, timeoutInSeconds) {
    return findElOrEls(
      this,
      () => {
        const node = normalizeNode(this.node.get(xpath));
        return node ? new Element(node, this.document) : null;
      },
      timeoutInSeconds
    );
  }

  xpathSelectAll (xpath, timeoutInSeconds) {
    return findElOrEls(
      this,
      () => {
        const nodes = normalizeNodes(this.node.find(xpath));
        return nodes.map((node) => new Element(node, this.document));
      },
      timeoutInSeconds
    );
  }

  toString () {
    return this.node.toString({
      type: 'xml',
      whitespace: false,
      declaration: false,
      selfCloseEmpty: true,
    });
  }
}

function findElOrEls (element, getElOrEls, timeoutInSeconds) {
  if (typeof timeoutInSeconds !== 'number') {
    return getElOrEls();
  }

  return (async () => {
    const endTime = performance.now() + timeoutInSeconds * 1000;
    let elOrEls = getElOrEls();
    while ((Array.isArray(elOrEls) ? elOrEls.length === 0 : !elOrEls) && endTime > performance.now()) {
      await element.document.render();
      elOrEls = getElOrEls();
    }

    return elOrEls;
  })();
}

async function appendOrSetText (element, text, clear) {
  let keyboard = element.xpathSelect('./ancestor-or-self::*[self::Keyboard or self::MiniKeyboard or self::PinPad]');

  if (keyboard) {
    if (clear || text) {
      await keyboard.focus();
    }

    if (clear) {
      const input = keyboard.xpathSelect('.//*[@text]');
      const cursor = keyboard.xpathSelect('.//*[@bounds and contains(@uri, "cursor_textInput")]');
      if (input && (cursor?.bounds?.x || keyboard.attributes.text)) {
        for (let i = 0, n = input.attributes.text.length; i < n; i++) {
          await element.sdk.ecp.keypress('Backspace');
        }
      }
    }

    if (text) {
      await element.sdk.ecp.type(text);
    }

    return;
  }
  await element.select();

  keyboard = await element.document.xpathSelect('//*[self::Keyboard or self::MiniKeyboard or self::PinPad]', 5);

  if (keyboard) {
    await appendOrSetText(keyboard, text, clear);
  } else {
    throw new Error('Keyboard dialog did not appear after pressing `Select` on element');
  }

  const submitButton = keyboard.xpathSelect('./ancestor-or-self::*[self::Dialog or self::KeyboardDialog or self::PinDialog or self::ProgressDialog]//ButtonGroup');

  if (submitButton) {
    await submitButton.select();
  } else {
    await element.sdk.ecp.keypress('Enter');
  }

  const isKeyboardClosed = !(await element.document.xpathSelect('self::*[not(./descendant-or-self::*[self::Keyboard or self::MiniKeyboard or self::PinPad])]', 5));
  if (isKeyboardClosed) {
    throw new Error('Keyboard dialog did not disappear');
  }
}

function normalizeNode (node) {
  if (node instanceof XMLElement) {
    return node;
  }

  const element = node?.parent();
  return element instanceof XMLElement ? element : null;
}

function normalizeNodes (nodes) {
  const elements = [];

  for (const node of nodes) {
    const element = normalizeNode(node);

    if (element) {
      elements.push(element);
    }
  }

  return elements;
}
