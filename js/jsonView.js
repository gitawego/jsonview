class JsonView extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    let data = null;
    Object.defineProperty(this, "data", {
      get() {
        return data;
      },
      set(value) {
        data = value;
        this.render();
      }
    });
    this.addEventListener("click", this.toggleView);
  }
  disconnectedCallback() {
    this.removeEventListener("click", this.toggleView);
  }
  toggleView(evt) {
    const node = evt.target.closest(".header");
    console.log(node);
    const pNode = node.parentNode;
    if (!pNode) {
      return;
    }
    const closed = pNode.classList.contains("closed");
    pNode.classList[closed ? "add" : "remove"]("open");
    pNode.classList[closed ? "remove" : "add"]("closed");
  }
  render() {
    this.innerHTML = this[
      Array.isArray(this.data) ? "renderArray" : "renderObject"
    ](this.data);
  }
  typeof(value) {
    return Object.prototype.toString
      .call(value)
      .match(/object (.*?)]/)[1]
      .toLowerCase();
  }
  renderArray(items, name) {
    const html = [
      '<div class="package array open">',
      name
        ? `<div class="header"><span class="name">${name}</span><span class="type">array</span></div>`
        : "",
      name ? '<div class="children">' : ""
    ];
    items.forEach((item, i) => {
      const type = this.typeof(item);
      const itemName = String(i);
      switch (type) {
        case "object":
          html.push(this.renderObject(item, itemName));
          break;
        case "array":
          html.push(this.renderArray(item, itemName));
          break;
        default:
          html.push(this.renderPrimitive(item, itemName));
      }
    });
    html.push("</div>");
    if (name) {
      html.push("</div>");
    }
    return html.join("");
  }
  renderObject(item, name) {
    const keys = Object.keys(item);
    const html = [
      '<div class="package object open">',
      name
        ? `<div class="header"><span class="name">${name}</span><span class="type">object</span></div>`
        : "",
      name ? '<div class="children">' : ""
    ];
    for (const key of keys) {
      const type = this.typeof(item[key]);
      switch (type) {
        case "object":
          html.push(this.renderObject(item[key], key));
          break;
        case "array":
          html.push(this.renderArray(item[key], key));
          break;
        default:
          html.push(this.renderPrimitive(item[key], key));
      }
    }
    html.push("</div>");
    if (name) {
      html.push("</div>");
    }
    return html.join("");
  }
  renderPrimitive(item, key) {
    const type = this.typeof(item);
    item = String(item);
    if (item.length > 20) {
      item = `<textarea readonly>${item}</textarea>`;
    }
    return `<div class="package ${type}">
    <span class="name">${key}: </span>
    <span class="value">${item}</span>
    <span class="type">${type}</span>
  </div>`;
  }
}
customElements.define("json-view", JsonView);
