
import type { Updater } from '../util/types';


/*
Design notes:
  - Controls are the most elementary form components that handle presenting/updating some state (e.g. text input).
  - Controls are split up into two components: the basic UI component, and a higher order component that connects
    the UI component to the form context through an *accessor*.
  - The basic UI component uses `Control` as suffix. It takes `ControlBufferProps<B>` as props, where `B` is
    the underlying buffer data type of the control.
  - This "control buffer" should be the result of the accessor optic when connected to the form context. For example:
    - If the accessor is a `Lens<A, F>`, then `B` will be equivalent to `F`
    - If the accessor is a `Prism<A, F>`, then `B` will be equivalent to `null | F`
    - If the accessor is a `Traversal<A, F>`, then `B` will be equivalent to `Array<F>`
*/

export type ControlBufferProps<B> = {
    buffer: B,
    updateBuffer: (bufferUpdated: Updater<B>) => void,
};
