// An object taking on a particular shape
export function shape (object): Skema {

}

// Enum
export function oneOf (array): Skema {

}

// An array of a certain type
export function arrayOf (type): Skema {

}

// One of many types
export function oneOfType (array): Skema {

}

// An object with property values of a certain type
export function objectOf (type): Skema {

}

// Anything that is ok
export function any (): Skema {

}

// Compose several types which are all composable and within the same type.
// The following types are composable:
// - shape
// - oneOf
// - oneOfType
// - objectOf
export function compose (...types): Skema {

}
