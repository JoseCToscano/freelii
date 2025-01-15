'use client'

import { useFormStatus } from 'react-dom'
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { joinWaitlist } from '../actions/waitlist'
import { useActionState } from 'react'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white" disabled={pending}>
      {pending ? 'Joining...' : 'Request Early Access'}
    </Button>
  )
}

export function WaitlistForm() {
  const [state, formAction] = useActionState(joinWaitlist, null)

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          required
          placeholder="Your full name"
        />
        {state?.error?.fullName && (
          <p className="mt-1 text-sm text-red-600">{state.error.fullName}</p>
        )}
      </div>
      <div>
        <Label htmlFor="emailOrPhone">Email or Phone</Label>
        <Input
          id="emailOrPhone"
          name="emailOrPhone"
          type="text"
          required
          placeholder="What's the best way to reach you?"
        />
        {state?.error?.emailOrPhone && (
          <p className="mt-1 text-sm text-red-600">{state.error.emailOrPhone}</p>
        )}
      </div>
      <SubmitButton />
      {state?.success && (
        <p className="mt-4 text-sm text-green-600">Successfully joined the banking waitlist!</p>
      )}
    </form>
  )
}

