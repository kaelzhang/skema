export interface IAsyncOrSyncFunc {
  (...args: any[]): Promise | any
}

type IValidator = AsyncOrSyncFunc | regexp
// Typescript could not assign StringConstructor
// or other constructor of basic types,
// however, the `object` here is actually basic JavaScript types:
// String | Number | Function | RegExp | ...
type IType = object | string | ISkema

// {
//   name: String,
//   age: 'number',
//   profile: Profile,
//   setting: {type: Setting},
// }

// 1. object (Basic JavaScript types)
// search default types -> IExpandedTypeDefinition -> Skema

// 2. string
// search default types -> IExpandedTypeDefinition -> Skema

// 3. Skema -> Skema

// 4. IExpandedTypeDefinition -> Skema

// Interface for parameter(IP) of type definition
export type IPTypeDefinition = IType | IPExpandedTypeDefinition

interface ITypeDefinitionFlags {
  enumerable?: boolean,
  configurable?: boolean,
  writable?: boolean,
  optional?: boolean,
  required?: boolean
}

export interface IPExpandedTypeDefinition {
  type?: IType,
  when?: IAsyncOrSyncFunc | boolean,
  default?: IAsyncOrSyncFunc | any,
  validate?: IValidator | TValidator[],
  set?: IAsyncOrSyncFunc | IAsyncOrSyncFunc[],
  ...ITypeDefinitionFlags
}

export interface ITypeDefinition {
  type?: object,
  when?: IAsyncOrSyncFunc,
  default?: IAsyncOrSyncFunc,
  validate?: TValidator[],
  set?: IAsyncOrSyncFunc[],
  ...ITypeDefinitionFlags
}

export interface ISkema {
  _type?: ISkema,
  _when?: IAsyncOrSyncFunc,
  _default?: IAsyncOrSyncFunc,
  _validate?: TValidator[],
  _set?: IAsyncOrSyncFunc[],
  _enumerable?: boolean,
  _configurable?: boolean,
  _writable?: boolean,
  _writable?: boolean,
  _optional?: boolean,
  _required?: boolean
}
