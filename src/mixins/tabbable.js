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

          // If this.active is true, then set tabs.$.activeTab to be this tab.
          observe(() => {
            if (this.$.active) {
              this[self].root.$.activeTab = this[self].index;
            }
          });

          // If tabs.$.activeTab is this tab, then set this tab's active prop to true.
          observe(() => {
            this.$.active = this[self].root.$.activeTab === this[self].index;
          });
        },
      },

      // [tabsElementSymbol]: undefined,

      activeIsHost() {
        debugger;
      },
    },
  ];
}
