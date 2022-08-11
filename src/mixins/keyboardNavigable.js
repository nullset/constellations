import { observe } from "../index";

export const symbol = Symbol("keyboardNavigable");

export function keyboardNavigable() {
  return [
    symbol,
    {
      props: { tabindex: { type: Number, default: 0 } },

      connectedCallback() {
        // If the element's disabled is set, then make the element not navigable by tabbing.
        observe(() => {
          this.tabindex = this.disabled ? -1 : 0;
        });

        // If user tabs to the element and presses "Enter" or "Space" then click the element.
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
