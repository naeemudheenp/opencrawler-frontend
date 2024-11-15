import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url'); // Get the URL from the query parameter
  console.log(url, "urls");

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    const response = await fetch(url);
    return NextResponse.json({
      status: response.status,
      text: await response.text()
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}