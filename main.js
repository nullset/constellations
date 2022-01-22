import { html, define, observe, observable, raw } from "./src/index";

const Tabs = {
  styles: `
    :host nav {
      display: inline-flex;
    }
  `,
  props: {
    activeTab: { type: Number },
  },
  // constructorCallback() {
  //   console.log("CONSTRUCTOR", this);
  //   debugger;
  // },
  // componentWillLoad() {
  //   return {
  //     promise: new Promise((resolve, reject) => {
  //       setTimeout(() => {
  //         resolve("aoeu");
  //       }, 3000);
  //     }),
  //     placeholder: html`FOO BAR`,
  //     error: {
  //       message: html`This is an error`,
  //       callback: function () {
  //         console.log("ERROR", this);
  //       },
  //     },
  //   };
  // },
  // componentDidLoad() {
  //   debugger;
  // },
  connectedCallback() {
    observe(() => {
      this.$.activeTab = this.$.activeTab ?? 0;
    });
  },
  render() {
    return html`
      <nav part="tabs">
        <slot name="tab"></slot>
      </nav>
      <div part="content">
        <slot name="tab-content"></slot>
      </div>
    `;
  },
};
define("bliss-tabs", Tabs);

const tabs = Symbol("tabs");
const tabbable$ = Symbol("tabbable$");

function tabbable(rootNode = "bliss-tabs") {
  return {
    props: {
      active: { type: Boolean },
    },
    connectedCallback() {
      this[tabs] = this.getContext(rootNode);
      this[tabbable$] = observable({}); // Tabbable mixin internal state.
      const nodeList = this[tabs].querySelectorAll(`:scope > ${this.tagName}`);
      const nodes = Array.from(nodeList);

      this[tabbable$].index = nodes.findIndex((node) => node === this);

      // If this.active is true, then set tabs.$activeTab to be this tab.
      observe(() => {
        if (this.$.active) this[tabs].$.activeTab = this[tabbable$].index;
      });

      // If tabs.$.activeTab is this tab, then set this tab's active prop to true.
      observe(() => {
        this.$.active = this[tabs].$.activeTab === this[tabbable$].index;
      });
    },

    disconnectedCallback() {
      if (this[tabs].$.activeTab === this[tabbable$].index)
        this[tabs].$.activeTab = undefined;
    },
  };
}

const keyboardNavigable = {
  props: { tabindex: { type: Number, default: 0 } },
  connectedCallback() {
    this.addEventListener("keypress", (e) => {
      if (
        e.target === this &&
        !this.$.disabled &&
        ["Enter", " "].includes(e.key)
      ) {
        this.click(e);
      }
    });
  },
  onclick(e) {
    debugger;
  },
};

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
    :host(:not(:nth-of-type(1))) {
      margin-left: 1rem;
    }
  `,
  render() {
    return html`<slot></slot>`;
  },
  onclick(e) {
    if (!this.$.disabled) {
      this[tabs].$.activeTab = this[tabbable$].index;
    }
  },
};
define("bliss-tab", Tab, {
  mixins: [tabbable("bliss-tabs"), keyboardNavigable],
});

const TabContent = {
  connectedCallback() {
    observe(() => {
      const activeIsNotHost = this[tabs].$.activeTab !== this[tabbable$].index;
      this.$.hidden = activeIsNotHost;
    });
  },
  render() {
    return html`<slot></slot>`;
  },
};
define("bliss-tab-content", TabContent, { mixins: tabbable("bliss-tabs") });

const AlertButton = {
  onclick() {
    alert("You have been alerted");
  },
};
define("bliss-alert-button", AlertButton, {
  base: HTMLButtonElement,
  extend: "button",
});
