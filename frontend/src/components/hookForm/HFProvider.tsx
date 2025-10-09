// Joy UI
import { FormProvider as Form, UseFormReturn } from 'react-hook-form'

type Props = {
  children: React.ReactNode
  methods: UseFormReturn<any>
  onSubmit?: VoidFunction
}

export default function HFProvider({ children, onSubmit, methods }: Props) {
  return (
    <Form {...methods}>
      <form onSubmit={onSubmit}>{children}</form>
    </Form>
  )
}

export { HFProvider }
