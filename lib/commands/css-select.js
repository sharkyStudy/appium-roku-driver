import * as cssSelect from 'css-select';
import BaseAdapter from 'css-select-base-adapter';
import { Element as XMLElement } from 'libxmljs2';

const XmlAdapter = BaseAdapter({
  isTag (node) {
    return node instanceof XMLElement;
  },

  getName (node) {
    return node.name().toLowerCase();
  },

  getAttributeValue (node, name) {
    let attribute = node.attr(name);

    if (!attribute && name === 'id') {
      return (node.attr('name') || node.attr('uiElementId'))?.value();
    }

    if (!attribute) {
      for (const attr of node.attrs()) {
        if (attr.name().toLowerCase() === name) {
          attribute = attr;
        }
      }
    }

    return attribute?.value();
  },

  getText (node) {
    let text = this.getAttributeValue(node, 'text') || '';

    const nodes = this.getChildren(node);
    for (const node of nodes) {
      text += this.getText(node);
    }

    return text;
  },

  getParent (node) {
    let parent = node.parent();

    if (parent instanceof XMLElement) {
      return parent;
    }

    return null;
  },

  getChildren (node) {
    let nodes = node.childNodes();
    let elements = [];

    for (const node of nodes) {
      if (node instanceof XMLElement) {
        elements.push(node);
      }
    }

    return elements;
  },

  isHovered (node) {
    return this.getAttributeValue(node, 'focused') === 'true';
  },

  isActive (node) {
    return this.isHovered(node) && !node.get('./descendant::*[@focused="true"]');
  },
});

export function selectOne (query, context) {
  return cssSelect.selectOne(query, context, { adapter: XmlAdapter });
}

export function selectAll (query, context) {
  return cssSelect.selectAll(query, context, { adapter: XmlAdapter });
}
