import { observe, observable, raw } from "../index";

export const tabsElementSymbol = Symbol("tabs");
export const tabbableSymbol = Symbol("tabbable");

export function tabbable(rootNode = "bliss-tabs") {
  return {
    props: {
      active: { type: Boolean },
    },
    [tabsElementSymbol]: undefined,
    constructorCallback() {
      // Expose state back to composed object.
      this[tabbableSymbol] = observable({});
    },
    connectedCallback() {
      this[tabsElementSymbol] = this.closest(rootNode);
      const nodeList = this[tabsElementSymbol].querySelectorAll(
        `:scope > ${this.tagName}`
      );
      const nodes = Array.from(nodeList);
      this[tabbableSymbol].index = nodes.findIndex((node) => node === this);

      observe(() => {
        // If this.active is true, then set tabs.$activeTab to be this tab.
        if (this.$.active)
          this[tabsElementSymbol].$.activeTab = this[tabbableSymbol].index;
      });

      observe(() => {
        // If tabs.$.activeTab is this tab, then set this tab's active prop to true.
        this.$.active =
          this[tabsElementSymbol].$.activeTab === this[tabbableSymbol].index;
      });
    },

    disconnectedCallback() {
      if (this[tabsElementSymbol].$.activeTab === this[tabbableSymbol].index)
        this[tabsElementSymbol].$.activeTab = undefined;
    },

    activeIsHost() {
      debugger;
    },
  };
}
