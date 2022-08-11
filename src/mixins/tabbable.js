import { observe, observable, raw } from "../index";

export const tabsElementSymbol = Symbol("tabs");
export const symbol = Symbol("tabbable");

export function tabbable(rootNode = "bliss-tabs") {
  return [
    symbol,
    {
      props: {
        active: { type: Boolean },
      },
      [symbol]: {
        connectedCallback() {
          // Set root DOM node for the tabble plugin.
          this[symbol].root = this.closest(rootNode);

          // Set the index for this type of element within the root DOM node.
          const nodeList = this[symbol].root.querySelectorAll(
            `:scope > ${this.tagName}`
          );
          const nodes = Array.from(nodeList);
          this[symbol].index = nodes.findIndex((node) => node === this);

          // If this.active is true, then set tabs.$.activeTab to be this tab.
          observe(() => {
            if (this.$.active) {
              this[symbol].root.$.activeTab = this[symbol].index;
            }
          });

          // If tabs.$.activeTab is this tab, then set this tab's active prop to true.
          observe(() => {
            this.$.active =
              this[symbol].root.$.activeTab === this[symbol].index;
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
