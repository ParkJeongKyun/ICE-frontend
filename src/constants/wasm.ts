export const WASM_MANIFEST = {
  core: '/wasm/ice_core_260606.wasm',
  image: '/wasm/ice_image_260606.wasm',
  pe: '/wasm/ice_pe_260606.wasm',
} as const;

export type WasmType = keyof typeof WASM_MANIFEST;
