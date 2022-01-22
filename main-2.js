// import { html, define, observe, observable, raw } from "./src/index";
// import { extender } from "proxy-pants";

// // function compose(...fns) {
// //   return (arg) => fns.reduceRight((acc, fn) => (fn ? fn(acc) : acc), arg);
// // }

// // const sym = Symbol("symbols");

// // function foo(baseObj, str, myObj) {
// //   const extension = Symbol(str);
// //   const obj = Object.create(null);
// //   Object.entries(myObj).forEach(([k, v]) => {
// //     obj[k] = v;
// //   });

// //   // // baseObj[sym] = Object.assign(baseObj, obj);
// //   // if (baseObj[sym]) {
// //   //   baseObj[sym].set(extension, obj);
// //   // } else {
// //   //   baseObj[sym] = new Map([[extension, obj]]);
// //   // }
// //   // debugger;

// //   baseObj[extension] = obj;
// //   debugger;
// //   return baseObj;
// // }

// // class MyElem extends HTMLElement {
// //   constructor() {
// //     super();
// //   }
// //   connectedCallback() {
// //     console.log(this.b);
// //   }
// //   get elemName() {
// //     return "MyElem";
// //   }
// // }

// // const $p = Symbol("patterns");
// // window.$p = $p;

// // const patterns = Symbol.for("✨:patterns");

// // function rr(args, opts = {}) {
// //   let { extendsElement = HTMLElement } = opts;

// //   return Array.from(args).reduce((acc, arg) => {
// //     // fn ? fn(acc) : acc;
// //     if (typeof arg === "function") {
// //       // If an arg is a Class, then simply mixin the existing element.
// //       return Object.apply(extendsElement, arg);
// //     } else if (typeof arg === "object") {
// //       const { name, pattern } = arg;
// //       Object.entries(pattern).forEach(([key, value]) => {
// //         debugger;
// //         if (typeof value === "function") {
// //           extendsElement[name][key] = [value].bind(extendsElement);
// //           debugger;
// //         } else {
// //           // Object.defineProperty(extendsElement, key, {
// //           //   get: () => {
// //           //     return extendsElement[name][key];
// //           //   },
// //           //   set: (value) => {
// //           //     extendsElement[name][key] = value;
// //           //   },
// //           //   configurable: true,
// //           // });
// //         }

// //         // extendsElement[arg.name] = arg.pattern;
// //       });
// //       return extendsElement;

// //       // const { name, pattern } = arg;
// //       // debugger;
// //       // // const sym = Symbol(name);
// //       // if (!extendsElement[$p]) extendsElement[$p] = {};

// //       // extendsElement[$p][name] = pattern;
// //       // return extendsElement;
// //     }
// //   }, extendsElement);
// // }

// // function extension(name, originalObj) {
// //   const obj = Object.entries(originalObj).reduce((acc, [key, value]) => {
// //     acc[key] = value;
// //     return acc;
// //   }, Object.create(null));

// //   return [Symbol(name), obj];
// // }

// // const ASym = Symbol("A");
// // window.ASym = ASym;
// // const aaaa = rr([
// //   {
// //     name: ASym,
// //     pattern: {
// //       a: "apple 2",
// //       get b() {
// //         console.log("this", this);
// //       },
// //     },
// //   },
// //   MyElem,
// // ]);

// // customElements.define(
// //   "my-elem",
// //   MyElem
// //   // compose()
// //   // foo(MyElem, "bar", {
// //   //   get hello() {
// //   //     return "HELLO THERE";
// //   //   },
// //   // })
// // );

// const Tabs = {
//   styles: `
//     :host nav {
//       display: inline-flex;
//     }
//   `,
//   props: {
//     activeTab: { type: Number },
//   },

//   connectedCallback() {
//     observe(() => {
//       this.$.activeTab = this.$.activeTab ?? 0;
//     });
//   },
//   render() {
//     return html`
//       <nav part="tabs">
//         <slot name="tab"></slot>
//       </nav>
//       <div part="content">
//         <slot name="tab-content"></slot>
//       </div>
//     `;
//   },
// };
// define("c-tabs", Tabs);

// const Tabs2 = {
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
//       <nav part="tabs">
//         <slot name="tab"></slot>
//       </nav>
//       <div part="content">
//         <slot name="tab-content"></slot>
//       </div>
//     `;
//   },
// };
// define("bliss-tabs2", Tabs2);

// const tabs = Symbol("tabs");
// const tabbable$ = Symbol("tabbable$");

// function tabbable(rootNode = "bliss-tabs") {
//   return {
//     props: {
//       active: { type: Boolean },
//     },
//     afterConnectedCallback() {
//       this[tabs] = this.getContext(rootNode);
//       this[tabbable$] = observable({}); // Tabbable mixin internal state.
//       const nodeList = this[tabs].querySelectorAll(`:scope > ${this.tagName}`);
//       const nodes = Array.from(nodeList);

//       this[tabbable$].index = nodes.findIndex((node) => node === this);

//       // If this.active is true, then set tabs.$activeTab to be this tab.
//       observe(() => {
//         if (this.$.active) this[tabs].$.activeTab = this[tabbable$].index;
//       });

//       // If tabs.$.activeTab is this tab, then set this tab's active prop to true.
//       observe(() => {
//         this.$.active = this[tabs].$.activeTab === this[tabbable$].index;
//       });
//     },

//     connectedCallback() {
//       this[tabs] = this.getContext(rootNode);
//       this[tabbable$] = observable({}); // Tabbable mixin internal state.
//       const nodeList = this[tabs].querySelectorAll(`:scope > ${this.tagName}`);
//       const nodes = Array.from(nodeList);

//       this[tabbable$].index = nodes.findIndex((node) => node === this);

//       // If this.active is true, then set tabs.$activeTab to be this tab.
//       observe(() => {
//         if (this.$.active) this[tabs].$.activeTab = this[tabbable$].index;
//       });

//       // If tabs.$.activeTab is this tab, then set this tab's active prop to true.
//       observe(() => {
//         this.$.active = this[tabs].$.activeTab === this[tabbable$].index;
//       });
//     },

//     disconnectedCallback() {
//       if (this[tabs].$.activeTab === this[tabbable$].index)
//         this[tabs].$.activeTab = undefined;
//     },
//   };
// }

// const keyboardNavigable = {
//   props: { tabindex: { type: Number, default: 0 } },
//   connectedCallback() {
//     this.addEventListener("keypress", (e) => {
//       if (
//         e.target === this &&
//         !this.$.disabled &&
//         ["Enter", " "].includes(e.key)
//       ) {
//         this.click(e);
//       }
//     });
//   },
//   onclick(e) {
//     debugger;
//   },
// };

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
//       this[tabs].$.activeTab = this[tabbable$].index;
//     }
//   },
// };
// define("c-tab", Tab, {
//   mixins: [tabbable("c-tabs"), keyboardNavigable],
// });

// const TabContent = {
//   connectedCallback() {
//     observe(() => {
//       const activeIsNotHost = this[tabs].$.activeTab !== this[tabbable$].index;
//       this.$.hidden = activeIsNotHost;
//     });
//   },
//   render() {
//     return html`<slot></slot>`;
//   },
// };
// define("c-tab-content", TabContent, { mixins: tabbable("c-tabs") });

// // let fb = document.querySelector("foo-bar");
// // window.mm = new WeakMap();
// // window.oo = { a: "apple" };
// // mm.set(oo, fb);
// // fb = null;
// // console.log(mm);
// // -----------
// // window.ss = new WeakSet();
// // ss.add(fb);
// // console.log(ss);

// // -----------
// // window.mm = new WeakMap();
// // window.oo = { a: "apple" };
// // window.ss = new WeakSet();
// // let fb = document.querySelector("foo-bar");
// // ss.add(fb);
// // mm.set(oo, ss);
// // console.log(mm);

// // -----------

// // import { observable, observe, raw } from "@nx-js/observer-util";

// window.elemStates = new WeakMap();
// window.fb = document.querySelector("foo-bar");
// window.fbs = observable({ a: "apple" });

// elemStates.set(fb, fbs);

// window.stateRefs = new WeakMap();
// stateRefs.set(fbs, fb);

// console.log({ elemStates: elemStates });
// // console.log({ stateRefs: stateRefs });

// setTimeout(() => {
//   stateRefs.delete(fbs);
//   console.log({ stateRefs: stateRefs });
//   fb.remove();
//   console.log({ elemStates: elemStates });
// }, 2000);

import WeakValue from "weak-value";

window.wv = new WeakValue();

// (() => {
const value = {};
// wv.set("any-key", value);
wv.set("any-key", { a: "apple" });
console.log(wv);
// })();

window.elementStates = new Map();
window.constellations = new Map();
// window.states = new WeakMap();

const p1 = document.getElementById("p1");
const p2 = document.getElementById("p2");
window.state = { a: "apple" };
window.state2 = new Map([[Symbol(), { b: "bat" }]]);

// Element is created, created a linked map of element <-> state && state <-> element.
elementStates.set(p1, state);
constellations.set(state, new Set([p1, p2]));
// a. If element is deleted, then also
//    1. Get state reference from `elementStates`.
//    2. Get the state's constellation.
//        a. if the element is in the constellation, delete it
//        b. delete the element from `elementStates` (may not be necessary, but good because it captures the behavior of deleting the element from the constellation set).
//        c1. if the constellation is now empty (size === 0), then delete the state key from the `constellations` map. (Cleans up memory)
//            i. May want to wait a certain amount of time before deleting the state key, as it is possible the element will be simply moved and re-connected in the DOM. (requestIdleCallback)
//        c2. if the constellation is not empty, leave it in place. (Allows still existant elements to continue using the state, even after the originating element is gone)

// ----------------------------------------------------------------
// composedStateObj = Object.assign(Object.create(null), state1, state2, state3);
// elementStates.set(p1, composedStateObj);
