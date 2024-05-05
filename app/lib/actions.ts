'use server';

import { signIn } from '@/auth';
import { sql } from '@vercel/postgres';
import { AuthError } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { hash } from 'bcrypt';
import { isRedirectError } from 'next/dist/client/components/redirect';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number().gt(0),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

const RegisterSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
});

const Register = RegisterSchema.omit({ confirmPassword: true });
const RegisterType = Register['_output'];

const FullRegisterSchema = RegisterSchema.refine(
  (data) => {
    return data.confirmPassword === data.password;
  },
  {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  },
);

// This is temporary until @types/react-dom is updated
export type CreateInvoiceState = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export type RegisterState = {
  errors?: {
    email?: string[];
    name?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
  message?: string | null;
};

const CreateInvoice = FormSchema.omit({ id: true, date: true });
// console.log('CreateInvoice', CreateInvoice)

export async function createInvoice(
  prevState: CreateInvoiceState,
  formData: FormData,
) {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: Number(formData.get('amount')),
    status: formData.get('status'),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;

  // convert amount to cents
  const amountInCents = amount * 100;
  // create time
  const date = new Date().toISOString().split('T')[0];
  try {
    // insert into database
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // convert amount to cents
  const amountInCents = amount * 100;

  try {
    // update database
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    return {
      message: 'Database Error: Failed to Update Invoice.',
    };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  await sql`
    DELETE FROM invoices
    WHERE id = ${id}
  `;

  revalidatePath('/dashboard/invoices');
}

export async function createUser(formData: typeof RegisterType) {
  const result = await sql`
    INSERT INTO users (email, name, password)
    VALUES (${formData.email}, ${formData.name}, ${formData.password})`;

  console.log('result', result);

  return result.rowCount;
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

export async function register(
  prevState: RegisterState | undefined,
  formData: FormData,
) {
  try {
    const validatedFields = FullRegisterSchema.safeParse({
      email: formData.get('email'),
      name: formData.get('name'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirm-password'),
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Create User.',
      };
    }

    const { email, password, name } = validatedFields.data;

    // hash password
    const hashedPassword = await hash(password, 10);

    const rowCount = await createUser({
      email,
      password: hashedPassword,
      name,
    });

    if (rowCount !== 1) {
      return {
        message: 'Database Error: Failed to Create User.',
      };
    }

    // authenticate user
    await signIn('credentials', { email, password });

    return;
  } catch (error: any) {
    if (error.code === '23505') {
      return {
        message: 'Email already exists.Try Again',
      };
    }
    if (isRedirectError(error)) {
      redirect('/dashboard');
    }
    return {
      message: error.message,
    };
  }
}
