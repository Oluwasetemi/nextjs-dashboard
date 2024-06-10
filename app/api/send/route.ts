import { EmailTemplate } from '@/app/ui/components/EmailTemplate';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
  try {
    console.log('here')
    const some = await resend.emails.send({
      from: 'Oluwasetemi <send@oluwasetemi.dev>',
      to: ['setemiojo@gmail.com'],
      subject: 'Hello world',
      react: EmailTemplate({ firstName: 'Oluwasetemi' }) as React.ReactElement,
    });
    console.log(some)

    const error = some.error;
    const data = some.data;

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error }, { status: 500 });
  }
}
