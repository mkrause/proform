
export type ControlBufferProps<F> = {
    buffer: F,
    updateBuffer: (bufferUpdated: F) => void,
};
