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
} from "./src/index";
import { keyboardNavigable } from "./src/mixins/keyboardNavigable";
import { tabbable, symbol as tabbableSym } from "./src/mixins/tabbable";

window.observe = observe;

const Tabs = {
  styles: `
    :host nav {
      display: inline-flex;
      gap: 1rem;
    }
  `,
  props: {
    activeTab: { type: Number, default: 0 },
  },
  render() {
    return html`
      ${this.$.activeTab}
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
      this[tabbableSym].root.$.activeTab = this[tabbableSym].index;
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

const TabNumber = {
  componentDidLoad() {
    // this.$watch(this.previousElementSibling, (watched) => {
    //   observe(() => {
    //     console.log("---", watched.$.activeTab);
    //     this.$.number = watched.$.activeTab;
    //   });
    // });

    this.$watch(
      () => this.previousElementSibling,
      (watched) => {
        console.log("---", watched.$.activeTab);
        this.$.number = watched.$.activeTab;
      }
    );
  },
  render() {
    return html`<b style="font-size: 4em">number: ${this.$.number} </b>`;
  },
};
define("bliss-tab-number", [TabNumber]);

const TabNextNumber = {
  componentDidLoad() {
    // this.$watch(this.previousElementSibling, (watched) => {
    //   observe(() => {
    //     console.log("---", watched.$.activeTab);
    //     this.$.number = watched.$.activeTab;
    //   });
    // });

    this.$watch(
      () => this.nextElementSibling,
      (watched) => {
        console.log("---", watched.$.activeTab);
        this.$.number = watched.$.activeTab;
      }
    );
  },
  render() {
    return html`<b style="font-size: 4em">number: ${this.$.number} </b>`;
  },
};
define("bliss-tab-next-number", [TabNextNumber]);
