import { html, define, observe, observable, raw, render } from "./src/index";
import {
  symbol as keyboardNavigableSymbol,
  keyboardNavigable,
} from "./src/mixins/keyboardNavigable";

import {
  // tabbableSymbol,
  tabbable,
  tabsElementSymbol,
  symbol as tabbableSym,
} from "./src/mixins/tabbable";

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
  connectedCallback() {
    // console.log(tabbableSym, this[tabbableSym]);
    // observe(() => {
    //   const activeIsNotHost =
    //     this[tabbableSym].$.activeTab !== this[tabbableSym].$.index;
    //   this.$.hidden = activeIsNotHost;
    // });
  },
  render() {
    return html`<slot></slot>`;
  },
};
define("bliss-tab-content", [tabbable("bliss-tabs"), TabContent]);

import { self as fooableSym, fooable } from "./src/mixins/fooable";
window.fb = fooableSym;

const MyElem = {
  props: {
    name: { type: String, default: "MySuperElem" },
  },
  constructorCallback() {
    console.log("constructorCallback: MyElem");
  },
  connectedCallback() {
    console.log("connectedCallback: MyElem");
  },
  render() {
    return html`<div>
      My elem: ${this.$.name} :: ${this.$[fooableSym].test}
    </div>`;
  },
  onclick() {
    this.$[fooableSym].test = this.$[fooableSym].test + 1;
  },
};
// define("my-elem", { mixins: [fooable(), MyElem] });

// const myElemSym = Symbol("MyElem");
// const OtherElem = {
//   props: {
//     name: { type: String, default: "OtherElem" },
//   },
//   connectedCallback() {
//     this.cluster({ key: "MyElem", element: this.previousElementSibling });
//   },
//   render() {
//     const state = this.previousElementSibling.$;
//     return html`Other: ${state[fooableSym].test}`;
//   },
// };
// define("other-elem", [OtherElem]);

// const ThirdElem = {
//   props: {
//     name: { type: String, default: "ThirdElem" },
//   },
//   connectedCallback() {
//     // this.cluster({ key: "MyElem", element: this.previousElementSibling });
//   },
//   render() {
//     // const state = this.previousElementSibling.$;
//     return html`Third ELEM `;
//   },
// };
// define("third-elem", [OtherElem, ThirdElem]);

const cacheSym = Symbol("cacheSym");
const RenderElem = {
  // shadowClosed: true,  // FIXME: if we set to true, then $ reactions don't seem to work.
  props: {
    slot: { type: String, default: undefined },
    isolate: { type: Boolean, default: false },
    bar: { type: Number, default: 33 },
  },
  connectedCallback() {
    this[cacheSym] = undefined;
    this.$.monkey = "Ceasar";
  },
  handleSlotChange(e) {
    const script = e.target
      .assignedElements()
      .find((e) => e.tagName === "SCRIPT");
    if (!script) return;

    const text = script.innerText.trim();

    // If the script's text hasn't been updated, no need to re-render.
    if (this[cacheSym] === text) {
      script.remove();
      return;
    }

    // The script's text HAS been updated, so throw away existing DOM and re-render.
    // Note that state is maintained across re-rerenders, even if DOM is not.
    this[cacheSym] = text;

    const host = e.target.getRootNode().host;
    const frag = new DocumentFragment();
    const func = new Function("html", "observe", `return ${text};`);
    observe(() => {
      const elems = func.call(host, html, observe);
      if (elems) render(frag, elems);
    });

    if (host.isolate) {
      const defaultSlot = e.target
        .getRootNode()
        .querySelector("slot:not([name])");
      defaultSlot.replaceChildren(frag);
      // Mut remove all innerHTML content or the shadow DOM default will not show.
      host.innerHTML = "";
    } else {
      host.replaceChildren(frag);
    }
  },
  styles: `
    :host([isolate]) *, :host([isolate]) *::before, :host([isolate]) *::after {
      all: initial;
      box-sizing: border-box;
    }
  `,
  render() {
    return html`
      <slot name="script" onslotchange=${this.handleSlotChange}></slot>
      <slot></slot>
    `;
  },
};
define("r-1", [RenderElem]);
