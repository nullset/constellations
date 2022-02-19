import { html, define, observe, observable, raw, render } from "./src/index";
// import {
//   symbol as keyboardNavigableSymbol,
//   mixin as keyboardNavigable,
// } from "./src/mixins/keyboardNavigable";

// import {
//   // tabbableSymbol,
//   tabbable,
//   tabsElementSymbol,
//   self as tabbableSym,
// } from "./src/mixins/tabbable";

// const Tabs = {
//   styles: `
//     :host nav {
//       display: inline-flex;
//     }
//   `,
//   props: {
//     activeTab: { type: Number },
//   },
//   // constructorCallback() {
//   //   console.log("CONSTRUCTOR", this);
//   //   debugger;
//   // },
//   // componentWillLoad() {
//   //   return {
//   //     promise: new Promise((resolve, reject) => {
//   //       setTimeout(() => {
//   //         resolve("aoeu");
//   //       }, 3000);
//   //     }),
//   //     placeholder: html`FOO BAR`,
//   //     error: {
//   //       message: html`This is an error`,
//   //       callback: function () {
//   //         console.log("ERROR", this);
//   //       },
//   //     },
//   //   };
//   // },
//   // componentDidLoad() {
//   //   debugger;
//   // },
//   connectedCallback() {
//     observe(() => {
//       this.$.activeTab = this.$.activeTab ?? 0;
//     });
//   },
//   render() {
//     return html`
//       ${this.$.activeTab}
//       <nav part="tabs">
//         <slot name="tab"></slot>
//       </nav>
//       <div part="content">
//         <slot name="tab-content"></slot>
//       </div>
//     `;
//   },
// };
// define("bliss-tabs", [Tabs]);

// const Tab = {
//   styles: `
//     :host {
//       border-bottom: 2px solid transparent;
//       cursor: pointer;
//     }
//     :host([active]) {
//       border-bottom-color: blueviolet;
//     }
//     :host([disabled]) {
//       opacity: 0.5;
//     }
//     :host(:not(:nth-of-type(1))) {
//       margin-left: 1rem;
//     }
//   `,
//   render() {
//     return html`<slot></slot>`;
//   },
//   onclick(e) {
//     if (!this.$.disabled) {
//       this[tabbableSym].tabsElement.$.activeTab = this[tabbableSym].$.index;
//     }
//   },
// };
// define("bliss-tab", [Tab], {
//   // mixins: [tabbable("bliss-tabs"), keyboardNavigable],
// });

// const TabContent = {
//   connectedCallback() {
//     console.log(tabbableSym, this[tabbableSym]);
//     debugger;
//     observe(() => {
//       const activeIsNotHost =
//         this[tabbableSym].tabsElement.$.activeTab !== this[tabbableSym].$.index;
//       this.$.hidden = activeIsNotHost;
//     });
//   },
//   render() {
//     return html`<slot></slot>`;
//   },
// };
// // define("bliss-tab-content", TabContent, {
// //   mixins: [tabbable("bliss-tabs")],
// // });
// define("bliss-tab-content", [tabbable("bliss-tabs"), TabContent]);

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
  async render() {
    return html`<div>
      My elem: ${this.$.name} :: ${this.$[fooableSym].test}
    </div>`;
  },
  onclick() {
    this.$[fooableSym].test = this.$[fooableSym].test + 1;
  },
};
define("my-elem", [fooable(), MyElem]);

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

const R2 = {
  // shadowClosed: true,  // FIXME: if we set to true, then $ reactions don't seem to work.
  props: {
    slot: { type: String, default: undefined },
    isolate: { type: Boolean, default: false },
    bar: { type: Number, default: 33 },
  },
  connectedCallback() {
    this[cacheSym] = undefined;
    this.$.monkey = "Ceasar";
    console.log("R2 - connected callback");
  },
  handleSlotChange(e) {
    const host = e.target.getRootNode().host;
    const script = e.target
      .assignedElements()
      .find((e) => e.tagName === "SCRIPT");
    if (!script) return;

    const $obj = script.$;
    script.remove();

    // Apply instance lifecyles to host element. Necessary in case host is ever disconnected/re-connected.
    host.setInstanceLifecycles($obj);

    // Fire any "connected" or "component" lifecyle method if the component is connected to the page, as these would have been fired by mounting the component.
    if (host.isConnected) {
      Object.entries($obj).forEach(([key, fn]) => {
        if (/^(connected|component)/.test(key)) fn.call(host);
      });

      // Set up render based on observables.
      if ($obj.render) {
        observe(() => render(host, $obj.render.call(host, html)));
      }
    }
    return;

    // const text = script.innerText.trim();
    // script.remove();

    // // If the script's text hasn't been updated, no need to re-render.
    // if (this[cacheSym] === text) {
    //   return;
    // }

    // // The script's text HAS been updated, so throw away existing object and re-render.
    // this[cacheSym] = text;

    // const host = e.target.getRootNode().host;

    // const func = new Function("html", "observe", `return ${text};`);

    // const obj = func.call(host, html, observe);

    // host.connectedCallback = () => {
    //   host.connectedCallback();
    //   obj.connectedCallback();
    // };
    // debugger;

    // const frag = new DocumentFragment();
    // const func = new Function("html", "observe", `return ${text};`);
    // observe(() => {
    //   const elems = func.call(host, html, observe);
    //   if (elems) render(frag, elems);
    // });

    // if (host.isolate) {
    //   const defaultSlot = e.target
    //     .getRootNode()
    //     .querySelector("slot:not([name])");
    //   defaultSlot.replaceChildren(frag);
    //   // Mut remove all innerHTML content or the shadow DOM default will not show.
    //   host.innerHTML = "";
    // } else {
    //   host.replaceChildren(frag);
    // }
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
define("r-2", [R2]);
