import {
  html,
  define,
  observe,
  unobserve,
  observable,
  raw,
  render,
  // foreign,
  // ref,
} from "./src/index-new";
import { keyboardNavigable } from "./src/mixins/keyboardNavigable";
import { tabbable, symbol as tabbableSym } from "./src/mixins/tabbable";

const Tabs = {
  styles: `
    :host nav {
      display: inline-flex;
      gap: 1rem;
    }
  `,
  props: {
    active: { type: Number, default: 0 },
    fooBar: { type: Boolean, default: true },
    emoji: { type: String },
  },
  connectedCallback() {
    this.emoji = `❤️`;
  },
  render() {
    return html`
      ${this.$.active}
      <nav part="tabs">
        <slot name="tab"></slot>
      </nav>
      <div part="content">
        <slot name="tab-content"></slot>
      </div>
    `;
  },
};
define("bliss-tabs", [Tabs]);

const Tab = {
  styles: `
    :host {
      border-bottom: 2px solid transparent;
      cursor: pointer;
    }
    :host([active]) {
      border-bottom-color: blueviolet;
    }
    :host([disabled]) {
      opacity: 0.5;
    }
  `,
  render() {
    return html`<slot></slot>`;
  },
  onclick(e) {
    if (!this.$.disabled) {
      this[tabbableSym].root.$.active = this[tabbableSym].index;
    }
  },
};
define("bliss-tab", [tabbable("bliss-tabs"), keyboardNavigable(), Tab]);

const TabContent = {
  styles: `
  :host(:not([active])) {
    display: none;
  }
`,
  render() {
    return html`<slot></slot>`;
  },
};
define("bliss-tab-content", [tabbable("bliss-tabs"), TabContent]);
