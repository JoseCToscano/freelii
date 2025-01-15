'use server'

type State = {
  error?: {
    fullName?: string;
    emailOrPhone?: string;
  };
  success?: boolean;
}

export async function joinWaitlist(_: State | null, formData: FormData): Promise<State> {
  const fullName = formData.get('fullName') as string
  const emailOrPhone = formData.get('emailOrPhone') as string

  // Add your validation and database logic here
  
  return { success: true }
} 