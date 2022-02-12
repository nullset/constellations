import { html, define, observe, observable, raw } from "./src/index";
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
  render() {
    return html`<div>My elem: ${this.$[fooableSym].test}</div>`;
  },
  onclick() {
    this.$[fooableSym].test = this.$[fooableSym].test + 1;
  },
};
define("my-elem", [fooable(), MyElem]);

const myElemSym = Symbol("MyElem");
const OtherElem = {
  connectedCallback() {
    this.constellate({ key: myElemSym, element: this.previousElementSibling });
  },
  render() {
    const state = this.previousElementSibling.$;
    return html`Other: ${state[fooableSym].test}`;
  },
};
define("other-elem", [OtherElem]);
