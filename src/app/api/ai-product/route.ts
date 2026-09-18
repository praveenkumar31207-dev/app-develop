import { NextRequest, NextResponse } from 'next/server';

interface Product {
  id: string;
  name: string;
  tamilName?: string;
  category: string;
  unit: string;
  price: number;
  wholesalePrice?: number;
  wholesaleCrateSize?: number;
  isActive: boolean;
  sortOrder: number;
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, products } = (await req.json()) as {
      prompt: string;
      products: Product[];
    };

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY is not configured in server environment.' },
        { status: 500 }
      );
    }

    const systemPrompt = `
You are an intelligent product catalogue assistant for a dairy parlour shop named "ShopCalci".
The user can ask you to:
1. Update existing products (e.g. "change double toned milk price to 45", "update FCM 1000 ML price to 75 and wholesale to 71", "rename Curd T.M. cup unit to 200 GMS", "hide FCM 500 ML").
2. Add NEW products to the catalogue (e.g. "add Butter Milk 200ml for 15 rupees", "add Tirumala Paneer 200g at price 90 and wholesale 80", "add Strawberry Ice Cream Cup 100ml price 30 category Ice Cream", "nayi product add karo Badam Milk 200ml price 35").

Allowed categories for products:
- "Milk"
- "Curd & Dairy"
- "Beverages"
- "Ghee & Fats"
- "Paneer & Sweets"
- "Ice Cream"

Allowed fields for UPDATING an existing product:
- "price" (number, retail selling price in ₹)
- "wholesalePrice" (number, bulk wholesale price in ₹)
- "wholesaleCrateSize" (number, integer crates/pack)
- "name" (string, product name)
- "unit" (string, e.g. "500 ML pouch", "1000 ML sachet", "200 GMS cup")
- "tamilName" (string)
- "isActive" (boolean: when user asks to hide, deactivate, or disable a product, set "isActive": false. NEVER set price to 0 to hide a product.)

Fields for ADDING a new product:
- "name" (string, required: full product name)
- "price" (number, required: retail selling price in ₹)
- "category" (string, required: one of the allowed categories above, infer best match if not stated e.g. milk -> "Milk", curd/buttermilk/lassi/butter -> "Curd & Dairy", badam milk/beverage/juice -> "Beverages", ghee/butter oil -> "Ghee & Fats", paneer/kova/pedha -> "Paneer & Sweets", ice cream/kulfi -> "Ice Cream")
- "unit" (string, required: e.g. "200 ML pouch", "500 GMS pack", "100 ML cup", default to sensible pack/cup/pouch size if mentioned or "1 unit")
- "wholesalePrice" (number, optional: wholesale/bulk price in ₹, default to price or 90% of price rounded)
- "wholesaleCrateSize" (number, optional: default 20)
- "tamilName" (string, optional)
- "isActive" (boolean: default true)

Return a JSON object with this EXACT structure (valid JSON only, no markdown):
{
  "explanation": "A friendly short confirmation message explaining what was changed or added (e.g. 'Added new product Butter Milk 200 ML at ₹15.00' or 'Updated Double Toned Milk price to ₹45.00')",
  "updates": [
    {
      "id": "exact_product_id_from_the_list",
      "changes": {
        "price": 45
      }
    }
  ],
  "additions": [
    {
      "name": "Butter Milk 200 ML",
      "tamilName": "மோர் 200 மி.லி",
      "category": "Curd & Dairy",
      "unit": "200 ML pouch",
      "price": 15,
      "wholesalePrice": 13,
      "wholesaleCrateSize": 20,
      "isActive": true
    }
  ]
}

If only updating, keep "additions": [].
If only adding, keep "updates": [].
If nothing can be understood, return:
{
  "explanation": "Could not identify what to update or add. Please specify the product name and price.",
  "updates": [],
  "additions": []
}

Current products catalogue:
${JSON.stringify(
  products.map((p) => ({
    id: p.id,
    name: p.name,
    tamilName: p.tamilName,
    unit: p.unit,
    price: p.price,
    wholesalePrice: p.wholesalePrice,
    wholesaleCrateSize: p.wholesaleCrateSize,
    category: p.category,
    isActive: p.isActive,
  })),
  null,
  2
)}
`;

    const groqResponse = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          temperature: 0.1,
          response_format: { type: 'json_object' },
        }),
      }
    );

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.error('Groq API error:', groqResponse.status, errText);
      return NextResponse.json(
        { error: `Groq API responded with error: ${groqResponse.statusText}` },
        { status: 500 }
      );
    }

    const data = await groqResponse.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'No response received from Groq model.' },
        { status: 500 }
      );
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(content);
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse Groq response as JSON.' },
        { status: 500 }
      );
    }

    // Normalize updates so each item has id and changes object
    if (parsedResult.updates && Array.isArray(parsedResult.updates)) {
      parsedResult.updates = parsedResult.updates.map((u: Record<string, unknown>) => {
        if (!u.changes) {
          const { id, ...rest } = u;
          return { id, changes: rest };
        }
        return u;
      });
    }

    if (!parsedResult.additions || !Array.isArray(parsedResult.additions)) {
      parsedResult.additions = [];
    }

    return NextResponse.json(parsedResult);
  } catch (error: unknown) {
    console.error('API route error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Internal server error: ${msg}` },
      { status: 500 }
    );
  }
}
