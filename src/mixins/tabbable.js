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
        constructorCallback() {
          // Expose state back to composed object.
          this[self].$ = observable({});
        },
        connectedCallback() {
          this[self].tabsElement = this.closest(rootNode);
          console.log(this[self]);
          const nodeList = this[self].tabsElement.querySelectorAll(
            `:scope > ${this.tagName}`
          );
          const nodes = Array.from(nodeList);
          this[self].$.index = nodes.findIndex((node) => node === this);

          observe(() => {
            // If this.active is true, then set tabs.$activeTab to be this tab.
            if (this.$.active)
              this[self].tabsElement.$.activeTab = this[self].$.index;
          });

          observe(() => {
            // If tabs.$.activeTab is this tab, then set this tab's active prop to true.
            this.$.active =
              this[self].tabsElement.$.activeTab === this[self].$.index;
          });
        },

        disconnectedCallback() {
          if (this[self].tabsElement.$.activeTab === this[self].$.index)
            this[self].tabsElement.$.activeTab = undefined;
        },
      },

      // [tabsElementSymbol]: undefined,

      activeIsHost() {
        debugger;
      },
    },
  ];
}
