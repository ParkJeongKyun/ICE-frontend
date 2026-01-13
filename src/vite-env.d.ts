/// <reference types="vite/client" />
declare module '*.glb';
declare module '*.png';
declare module "*.json" {
  const value: any;
  export default value;
}