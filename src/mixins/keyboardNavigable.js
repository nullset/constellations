export const symbol = Symbol("keyboardNavigable");

export function keyboardNavigable() {
  return [
    symbol,
    {
      props: { tabindex: { type: Number, default: 0 } },
      connectedCallback() {
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
      // FIXME: events are being overridden. Is that what we want?
      onclick(e) {
        debugger;
      },
    },
  ];
}
