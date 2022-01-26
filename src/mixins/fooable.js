import { observe, observable, raw } from "../index";

export const self = Symbol("fooable");
window.sym = self;

export function fooable() {
  return [
    self,
    {
      props: {
        active: { type: Boolean },
      },
      [self]: {
        // $: observable({}),
        constructorCallback() {
          // Expose state back to composed object.
          // console.log(this);
          // debugger;
          // this[self].$ = observable({});
          this.$[self] = Object.create(null);
          console.log("constructorCallback: fooable");
        },
        connectedCallback() {
          this.$[self].test = 44;
          console.log("connectedCallback: fooable");
        },
      },
    },
  ];
}
