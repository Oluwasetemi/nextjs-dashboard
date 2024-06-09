'use server';

import { signIn } from '@/auth';
import { sql } from '@vercel/postgres';
import { AuthError } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { isRedirectError } from 'next/dist/client/components/redirect';
import bcrypt from 'bcrypt';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // convert amount to cents
  const amountInCents = amount * 100;
  // create time
  const date = new Date().toISOString().split('T')[0];

  // insert into database
  await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;

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

  // update database
  await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;

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

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === 'CredentialsSignin') {
        return 'Invalid credentials';
      } else {
        return 'Something went wrong. Please try again.';
      }
    }
    throw error;
  }
}

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  confirmPassword: z.string().min(6),
});

const Register = RegisterSchema.omit({ confirmPassword: true });
const RegisterType = Register['_output'];

const FullRegisterSchema = RegisterSchema.refine(
  (data) => data.confirmPassword === data.password,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  },
);

export type RegisterState = {
  errors?: {
    email?: string[];
    name?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
  message?: string | null;
};

async function createUser(formData: typeof RegisterType): Promise<number> {
  const result = await sql`
    INSERT INTO users (email, password, name)
    VALUES (${formData.email}, ${formData.password}, ${formData.name})
  `;

  return result.rowCount;
}

export async function register(
  prevState: RegisterState | undefined,
  formData: FormData,
) {
  try {
    // 1. validate form data
    const validatedFields = FullRegisterSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
      name: formData.get('name'),
      confirmPassword: formData.get('confirm-password'),
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing required fields or invalid data.',
      };
    }

    const { email, password, name } = validatedFields.data;

    // 2. hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // 3. create user
    const rowCount = await createUser({
      email,
      password: hashedPassword,
      name,
    });

    if (rowCount !== 1) {
      return {
        message: 'Database error. Failed to create user.',
      };
    }
    // 4. sign in user
    await signIn('credentials', { email, password });
  } catch (error: any) {
    // handle user already exists error
    if (error.code == '23505') {
      console.log('somewhere on the server');
      return {
        message: 'Email already exists. Please sign in.',
      };
    }

    if (isRedirectError(error)) {
      redirect('/dashboard');
    }

    return {
      message: 'Something went wrong. Please try again.',
    };
  }
}
