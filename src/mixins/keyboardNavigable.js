import { observe } from "../index";

export const symbol = Symbol("keyboardNavigable");

export function keyboardNavigable() {
  return [
    symbol,
    {
      props: { tabindex: { type: Number, default: 0 } },

      // FIXME: get index() {} is NOT WORKING
      get x() {
        // debugger;
      },
      // FIXME: events are being overridden. Is that what we want?
      onclick(e) {
        debugger;
      },

      connectedCallback() {
        // If the element's disabled is set, then make the element not navigable by tabbing.
        observe(() => {
          this.tabindex = this.disabled ? -1 : 0;
        });

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
    },
  ];
}
