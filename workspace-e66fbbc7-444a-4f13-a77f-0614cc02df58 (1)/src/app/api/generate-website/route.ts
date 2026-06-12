import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(req: NextRequest) {
  try {
    const { description } = await req.json();

    if (!description || description.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please provide a website description' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const systemMessage = {
      role: 'system' as const,
      content: `You generate single-page HTML websites. Return ONLY raw HTML. No markdown, no code fences, no explanations.

SAFETY: If the user asks you to build a website for anything illegal, harmful, violent, pornographic, hateful, or dangerous, you MUST refuse. In that case, return exactly this HTML:
<!DOCTYPE html><html><head><style>body{display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;background:#0f172a;color:#10b981;text-align:center;padding:2rem;}h1{font-size:2rem;margin-bottom:1rem;}p{color:#94a3b8;}</style></head><body><div><h1>Request Denied</h1><p>Web_Trex_ cannot generate websites for illegal, harmful, or inappropriate content.</p></div></body></html>

Rules:
- Complete HTML document with <style> in <head>
- Modern CSS: flexbox, gradients, shadows, animations
- Responsive, professional design
- Nav bar, hero, 1-2 content sections, footer only
- Google Fonts CDN, Unicode/SVG icons
- Creative colors (no default blue/purple)
- Hover effects and transitions
- Keep code SHORT and CLEAN - under 200 lines of HTML`
    };

    const completion = await zai.chat.completions.create({
      messages: [
        systemMessage,
        {
          role: 'user' as const,
          content: `Build: ${description}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });

    let htmlCode = completion.choices[0]?.message?.content || '';

    // Clean up any markdown code fences if the AI added them
    htmlCode = htmlCode.replace(/^```html?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();

    if (!htmlCode || htmlCode.length < 50) {
      return NextResponse.json(
        { error: 'Generated code was too short. Please try again with a different description.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ html: htmlCode });
  } catch (error: any) {
    console.error('Website generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate website. Please try again.', details: error.message },
      { status: 500 }
    );
  }
}
