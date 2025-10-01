import FormControl from '@mui/joy/FormControl';
import FormHelperText from '@mui/joy/FormHelperText';
import * as React from 'react';

export { FormControl, FormHelperText };

export const Form = (props: React.HTMLProps<HTMLFormElement>) => {
  // Only pass valid form props to <form>
  const allowed = [
    'acceptCharset',
    'action',
    'autoComplete',
    'encType',
    'method',
    'name',
    'noValidate',
    'target',
    'onSubmit',
    'onReset',
    'className',
    'style',
    'children',
    'id',
    'role',
    'aria-label',
    'aria-labelledby',
    // Add any other valid form props as needed
  ];
  const formProps: Record<string, any> = {};
  Object.keys(props).forEach((key) => {
    if (allowed.includes(key)) {
      formProps[key] = (props as any)[key];
    }
  });
  return <form {...formProps}>{props.children}</form>;
};

export const FormField = ({
  label,
  inputId,
  children,
  ...rest
}: {
  label: string;
  inputId: string;
  children: React.ReactNode;
  [key: string]: unknown;
}) => (
  <FormControl {...rest}>
    <label
      htmlFor={inputId}
      style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}
    >
      {label}
    </label>
    {children}
  </FormControl>
);

export const FormItem = ({
  children,
  ...rest
}: {
  children: React.ReactNode;
  [key: string]: unknown;
}) => <div {...rest}>{children}</div>;

export const FormMessage = ({
  children,
  ...rest
}: {
  children: React.ReactNode;
  [key: string]: unknown;
}) => <FormHelperText {...rest}>{children}</FormHelperText>;
