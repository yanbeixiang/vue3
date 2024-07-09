//操作节点 增 删 改 查

export const nodeOps = {
  //创建元素 createElement 注意： vue runtime-dom => 平台(不同平台创建元素的方法不同)

  createElement(tagName: string) {
    return document.createElement(tagName);
  },
  remove(child: Element) {
    let parentNode = child.parentNode;
    if (parentNode) {
      parentNode.removeChild(child);
    }
  },
  insert(child: Element, parent: Element, ancher = null) {
    parent.insertBefore(child, ancher); //ancher = null 相当于 appendchild
  },
  querySelector(select: string) {
    return document.querySelector(select);
  },
  setElementText(el: Element, text: string) {
    el.textContent = text;
  },
  //文本
  createText(text: string) {
    return document.createTextNode(text);
  },
  setText(node: Element, text: string) {
    node.nodeValue = text;
  }
}