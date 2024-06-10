export async function POST() {
  try {


    return Response.json({
      message: 'Hello World',
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await fetch('https://api.github.com/users/Oluwasetemi');
    const data = await user.json();

    // console.log(data);

    return Response.json(data);
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error }, { status: 500 });
  }
}

export async function PUT() {
  try {
    return Response.json({
      message: 'Hello World Put',
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    return Response.json({
      message: 'Hello World Delete',
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error }, { status: 500 });
  }
}
