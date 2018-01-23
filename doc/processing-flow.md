# Processing Flow

For a given object `data`, and `key`:

1. `when`: First check if we need to process `key`, if skipped then the value will be maintained and untouched
2. `default`: If `key` is not found in `data` and `default` supplied, then assign the default value to `tmpData[key]`. The default value in its rule will override the default definition in its type.
3. `validate`: First we will use the validators from type, then from rule, one by one.
4. `set`: setters from type, then from rule, and change `tmpData[key]`
5. According to `enumerable`, `configurable` and `writable`, create the `finalData`
6. END.
