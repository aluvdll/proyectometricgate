declare module "*.jsx" {
  import type { ComponentType } from "react";

  export const SuperAdminPanel: ComponentType<any>;
  const DefaultComponent: ComponentType<any>;
  export default DefaultComponent;
}
