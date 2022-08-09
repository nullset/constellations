import { observe, observable, raw } from "../index";

export const tabsElementSymbol = Symbol("tabs");
export const self = Symbol("tabbable");

export function tabbable(rootNode = "bliss-tabs") {
  return [
    self,
    {
      props: {
        active: { type: Boolean },
      },
      [self]: {
        // get root() {
        //   debugger;
        //   return this.closest ? this.closest(rootNode) : undefined;
        // },
        // TODO: get index() {} is NOT WORKING
        connectedCallback() {
          // Set root DOM node for the tabble plugin.
          this[self].root = this.closest(rootNode);

          // Set the index for this type of element within the root DOM node.
          const nodeList = this[self].root.querySelectorAll(
            `:scope > ${this.tagName}`
          );
          const nodes = Array.from(nodeList);
          this[self].index = nodes.findIndex((node) => node === this);

          observe(() => {
            // If this.active is true, then set tabs.$.activeTab to be this tab.
            if (this.$.active) {
              // this[self].$.tabsElement.$.activeTab = this[self].$.index;
              this[self].root.$.activeTab = this[self].index;
            }
          });

          observe(() => {
            // if (this[self].root.$.activeTab) {
            // debugger;
            // If tabs.$.activeTab is this tab, then set this tab's active prop to true.
            this.$.active = this[self].root.$.activeTab === this[self].index;
            // }
          });
        },
        // connectedCallback() {
        //   // componentDidLoad() {
        //   // Store the element as a "real" DOM node, not a proxy of a DOM node
        //   // this[self].$.tabsElement = raw(this.closest(rootNode));
        //   // Reflect.getOwnPropertyDescriptor(this[self].$, 'tabsElement').value
        //   console.log(this[self]);
        //   // const nodeList = this[self].$.tabsElement.querySelectorAll(
        //   //   `:scope > ${this.tagName}`
        //   // );
        //   debugger;
        //   const nodeList = this.root.querySelectorAll(
        //     `:scope > ${this.tagName}`
        //   );
        //   const nodes = Array.from(nodeList);
        //   this[self].$.index = nodes.findIndex((node) => node === this);
        //   this[self].root = this.root;

        //   observe(() => {
        //     // If this.active is true, then set tabs.$activeTab to be this tab.
        //     if (this.$.active)
        //       // this[self].$.tabsElement.$.activeTab = this[self].$.index;
        //       this.root.activeTab = this[self].$.index;
        //   });

        //   observe(() => {
        //     // If tabs.$.activeTab is this tab, then set this tab's active prop to true.
        //     // this.$.active =
        //     //   this[self].$.tabsElement.$.activeTab === this[self].$.index;
        //   });
        // },

        disconnectedCallback() {
          // if (this[self].$.tabsElement.$.activeTab === this[self].$.index)
          //   this[self].$.tabsElement.$.activeTab = undefined;
        },
      },

      // [tabsElementSymbol]: undefined,

      activeIsHost() {
        debugger;
      },
    },
  ];
}
