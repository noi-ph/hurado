import * as yup from 'yup';

/* eslint-disable prettier/prettier */
type ConditionalSchema<T> =
  T extends string ? yup.StringSchema :
  T extends number ? yup.NumberSchema :
  T extends boolean ? yup.BooleanSchema :
  T extends Record<any, any> ? yup.ObjectSchema<T> :
  T extends Array<any> ? yup.ArraySchema<any, any> :
  yup.AnySchema;

type Shape<Fields> = {
  [Key in keyof Fields]: ConditionalSchema<Fields[Key]>;
};

export function Shape<S>(args: Shape<S>) {
  return yup.object<unknown, Shape<S>>(args as Shape<S>).noUnknown();
}