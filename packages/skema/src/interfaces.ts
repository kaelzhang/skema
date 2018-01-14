import {Options} from './options'

export interface IAsyncOrSyncFunc {
  (...args: any[]): Promise | any
}

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

export type IPType = IType | undefined

export type IWhen = IAsyncOrSyncFunc | undefined
export type IPWhen = any

export type IDefault = IAsyncOrSyncFunc | undefined
export type IPDefault = any

export type IPSingleValidator = AsyncOrSyncFunc | regexp
export type IValidators = IAsyncOrSyncFunc[] | [] | undefined
export type IPValidator = IPSingleValidator | IValidators

export type ISetters = IAsyncOrSyncFunc[] | [] | undefined
export type IPSetter = ISetters | IAsyncOrSyncFunc

export type IBooleanOrUndefined = boolean | undefined

export interface IPExpandedTypeDefinition {
  type?: IPType,
  when?: IPWhen,
  default?: IPDefault,
  validate?: IPValidator,
  set?: IPSetter,
  enumerable?: IBooleanOrUndefined,
  configurable?: IBooleanOrUndefined,
  writable?: IBooleanOrUndefined,
  optional?: IBooleanOrUndefined,
  required?: IBooleanOrUndefined
}

export interface IObjectSkema {
  [propName: string]: IPTypeDefinition
}

export interface ISkema {
  readonly _type: ISkema,
  readonly _when: IWhen,
  readonly _default: IDefault,
  readonly _validate: IValidators,
  readonly _set: ISetters,
  readonly _enumerable: IBooleanOrUndefined,
  readonly _configurable: IBooleanOrUndefined,
  readonly _writable: IBooleanOrUndefined,
  readonly _writable: IBooleanOrUndefined,
  readonly _optional: IBooleanOrUndefined,
  readonly _required: IBooleanOrUndefined,
  readonly _options: Options
}

export type IKey = number | string
export type IPath = IKey[] | []

export interface IContext {
  path: IPath,
  origin: any
}
