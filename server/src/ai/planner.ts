import {
  AIGeneratedPlan,
  AIGeneratedPlanSchema,
  BudgetRescueResponse,
  BudgetRescueResponseSchema,
  AIAssistantAction,
  AIAssistantActionSchema,
} from '../schemas/index.js';
import { EventRecord, BudgetItem, TaskItem, VendorItem, EventIdea } from '../types/index.js';
import { inspectPromptSafety, validateAndSanitizeAIPlan, aiCache } from './guardrails.js';

/**
 * Intelligent deterministic AI generator fallback for demo mode or when no LLM API key is provided.
 * Generates culturally and contextually rich, realistic event plans matching user specifications.
 */
export function generateDeterministicPlan(event: EventRecord): AIGeneratedPlan {
  const budget = Number(event.budget) || 50000;
  const guestCount = Number(event.guest_count) || 50;
  const currency = event.currency || 'INR';
  const type = event.event_type;
  const priorities = event.priority_areas || [];
  const cultural = (event.cultural_preference || '').toLowerCase();
  const dietary = (event.dietary_preferences || '').toLowerCase();

  // Determine budget allocations based on event type & priorities
  let venueShare = 0.28;
  let cateringShare = 0.35;
  let decorShare = 0.15;
  let photoShare = 0.10;
  let musicShare = 0.07;
  let miscShare = 0.05;

  if (priorities.includes('food') || priorities.includes('catering')) {
    cateringShare += 0.05;
    venueShare -= 0.03;
    miscShare -= 0.02;
  }
  if (priorities.includes('decoration')) {
    decorShare += 0.05;
    venueShare -= 0.03;
    miscShare -= 0.02;
  }
  if (priorities.includes('venue')) {
    venueShare += 0.06;
    photoShare -= 0.03;
    musicShare -= 0.03;
  }

  // Ensure sum equals 1.0
  const totalShares = venueShare + cateringShare + decorShare + photoShare + musicShare + miscShare;
  const norm = (s: number) => Math.round(((s / totalShares) * budget));

  const venueCost = norm(venueShare);
  const cateringCost = norm(cateringShare);
  const decorCost = norm(decorShare);
  const photoCost = norm(photoShare);
  const musicCost = norm(musicShare);
  const miscCost = budget - (venueCost + cateringCost + decorCost + photoCost + musicCost);

  // Calculate days until event
  const today = new Date();
  const eventDate = new Date(event.event_date);
  const diffTime = eventDate.getTime() - today.getTime();
  const daysUntil = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // Customize based on type and cultural hints
  let summary = '';
  let themeList: Array<{ name: string; description: string; estimatedCost: number }> = [];
  let decorationList: Array<{ title: string; description: string; estimatedCost: number }> = [];
  let menuList: Array<{ title: string; description: string; estimatedCost: number }> = [];
  let activityList: Array<{ title: string; description: string; estimatedCost: number }> = [];

  const isIndianOrSouthAsian = cultural.includes('indian') || cultural.includes('traditional') || currency === 'INR';

  if (type === 'wedding') {
    summary = `Personalized grand wedding celebration for ${guestCount} guests in ${event.location}, harmonizing ${cultural || 'classic'} traditions, bespoke decor, and exquisite dining within ${currency} ${budget.toLocaleString()}.`;
    themeList = [
      {
        name: isIndianOrSouthAsian ? 'Royal Marigold & Sunset Crimson' : 'Ethereal Rose Gold & Ivory Romance',
        description: isIndianOrSouthAsian
          ? 'Opulent floral arches with cascading fresh marigolds, brass urli floating diyas, and royal silk drape accents.'
          : 'Elegant botanical arches, warm fairy light canopies, blush florals, and pristine silk table runners.',
        estimatedCost: Math.round(decorCost * 0.4),
      },
      {
        name: isIndianOrSouthAsian ? 'Mughal Courtyard Elegance' : 'Modern Minimalist Botanical Garden',
        description: isIndianOrSouthAsian
          ? 'Intricate jali backdrops, antique lanterns, pastel floral canopies, and velvet lounge seating.'
          : 'Sleek geometric arches, abundant monstera & eucalyptus greenery, clean warm white palette.',
        estimatedCost: Math.round(decorCost * 0.35),
      },
    ];
    decorationList = [
      {
        title: 'Ceremony Stage & Mandap / Arch',
        description: 'Statement stage backdrop with bespoke floral arrangements, soft ambient uplighting, and coordinated seating.',
        estimatedCost: Math.round(decorCost * 0.45),
      },
      {
        title: 'Guest Tables & Centerpieces',
        description: 'Mirrored trays with candle clusters, miniature floral vases, printed personalized menu cards, and linen napkins.',
        estimatedCost: Math.round(decorCost * 0.3),
      },
      {
        title: 'Entrance Grand Arch & Welcome Board',
        description: 'Illuminated welcome easel with custom typography, cascading greenery garland, and soft pathway lanterns.',
        estimatedCost: Math.round(decorCost * 0.25),
      },
    ];
    menuList = [
      {
        title: dietary.includes('veg') ? 'Gourmet Heritage Pure Vegetarian Banquet' : 'Royal Grand Fusion Feast',
        description: dietary.includes('veg')
          ? 'Live chaat station, artisanal paneer tikkas, slow-cooked dal makhani, Kashmiri pulao, assorted naans, and saffron rasmalai with gulab jamun.'
          : 'Tandoori spiced starters, signature slow-braised delicacies, fragrant biryani, live pasta counter, and assorted artisanal desserts.',
        estimatedCost: cateringCost,
      },
    ];
    activityList = [
      {
        title: 'Interactive Photo Booth & Audio Guestbook',
        description: 'Vintage telephone audio guestbook where guests record voice wishes, paired with polaroid memory station.',
        estimatedCost: Math.round(miscCost * 0.4),
      },
      {
        title: 'First Dance & Sangeet Celebration',
        description: 'Curated dance performances with dry-ice smoke effect and sparkler grand entrance.',
        estimatedCost: Math.round(musicCost * 0.5),
      },
    ];
  } else if (type === 'birthday') {
    summary = `Thrilling birthday party for ${guestCount} guests in ${event.location}, featuring dynamic thematic experiences, gourmet catering, and vibrant entertainment tailored to your budget of ${currency} ${budget.toLocaleString()}.`;
    themeList = [
      {
        name: 'Starlit Neon Glow & Chic Lounge',
        description: 'Modern neon sign focal walls, LED glowing furniture accents, metallic balloon installations, and ambient mood lighting.',
        estimatedCost: Math.round(decorCost * 0.45),
      },
      {
        name: 'Bohemian Sunset Fiesta',
        description: 'Pampas grass clusters, macrame backdrops, low wooden pallet seating with velvet cushions, and fairy light canopies.',
        estimatedCost: Math.round(decorCost * 0.4),
      },
    ];
    decorationList = [
      {
        title: 'Custom Balloon Garland & Photo Backdrop',
        description: 'Multi-sized organic balloon arch with personalized LED neon sign of celebrant.',
        estimatedCost: Math.round(decorCost * 0.5),
      },
      {
        title: 'Themed Dessert & Cake Table Setup',
        description: 'Tiered acrylic cake pedestals, dessert platters, and custom signage.',
        estimatedCost: Math.round(decorCost * 0.3),
      },
    ];
    menuList = [
      {
        title: 'Street-Food & Gourmet Sliders Buffet',
        description: dietary.includes('veg')
          ? 'Crispy corn cones, peri-peri paneer sliders, live taco station, loaded nachos, mocktail bar, and custom tiered birthday cake.'
          : 'Mini brioche gourmet sliders, grilled chicken skewers, loaded truffle fries, taco bar, and artisanal birthday cake.',
        estimatedCost: cateringCost,
      },
    ];
    activityList = [
      {
        title: 'Live DJ & Music Trivia Tournament',
        description: 'High-energy DJ playlist with crowd interactive music quizzes and dance-offs.',
        estimatedCost: musicCost,
      },
      {
        title: 'Custom Cocktail / Mocktail Mixology Bar',
        description: 'Signature personalized welcome drinks with edible smoke bubbles and custom garnishes.',
        estimatedCost: Math.round(cateringCost * 0.15),
      },
    ];
  } else if (type === 'college' || type === 'community') {
    summary = `Vibrant and engaging ${type} festival for ${guestCount} attendees in ${event.location}, prioritizing high-impact sound, stage aesthetics, and food stalls within ${currency} ${budget.toLocaleString()}.`;
    themeList = [
      {
        name: 'Electric Horizon Festival',
        description: 'Festival-style trusses, vibrant flags, high-energy lighting towers, and interactive graffiti boards.',
        estimatedCost: Math.round(decorCost * 0.5),
      },
    ];
    decorationList = [
      {
        title: 'Main Stage Backdrop & Lighting Rig',
        description: 'Branded flex/LED banner with moving beam lights, trussing, and side sponsor banners.',
        estimatedCost: Math.round(decorCost * 0.6),
      },
      {
        title: 'Registration & Entry Archways',
        description: 'Signage, queuing stanchions, directional boards, and registration kiosks.',
        estimatedCost: Math.round(decorCost * 0.3),
      },
    ];
    menuList = [
      {
        title: 'Community Food Trucks & Refreshment Counters',
        description: 'High-throughput food stations offering quick-serve wraps, rice bowls, beverages, and snack boxes.',
        estimatedCost: cateringCost,
      },
    ];
    activityList = [
      {
        title: 'Band Showcase & Open Mic / Keynote',
        description: 'Stage audio system, wireless microphones, monitor setup, and schedule management.',
        estimatedCost: musicCost,
      },
    ];
  } else {
    summary = `Curated anniversary & special celebration for ${guestCount} guests at ${event.location}, emphasizing intimate dining, photography, and stylish ambiance within ${currency} ${budget.toLocaleString()}.`;
    themeList = [
      {
        name: 'Timeless Elegance & Candlelight',
        description: 'Pristine linens, warm candlelight, delicate floral centerpieces, and soft jazz ambient music.',
        estimatedCost: Math.round(decorCost * 0.45),
      },
    ];
    decorationList = [
      {
        title: 'Ambient Lighting & Floral Installations',
        description: 'Fairy light curtain, pillar candles in glass storm lanterns, and fragrant floral arrangements.',
        estimatedCost: decorCost,
      },
    ];
    menuList = [
      {
        title: 'Three-Course Gourmet Dinner',
        description: 'Artisanal appetizers, plated gourmet main courses, wine/mocktail pairings, and decadent dessert.',
        estimatedCost: cateringCost,
      },
    ];
    activityList = [
      {
        title: 'Memory Wall & Toast Speeches',
        description: 'Photo gallery chronicling special milestones with champagne or sparkling cider toast.',
        estimatedCost: Math.round(miscCost * 0.4),
      },
    ];
  }

  // Generate budget items
  const budgetList = [
    {
      category: 'Venue',
      name: `${event.location} Booking & Hall Space`,
      estimatedCost: venueCost,
      reason: `Allocates ~${Math.round((venueCost / budget) * 100)}% of budget for ${guestCount} guests comfort and amenities.`,
    },
    {
      category: 'Catering',
      name: `Food & Beverage Buffet for ${guestCount} guests`,
      estimatedCost: cateringCost,
      reason: `Calculated at ~${currency} ${Math.round(cateringCost / guestCount)} per guest including service and beverages.`,
    },
    {
      category: 'Decoration',
      name: 'Theme Decor, Stage, & Table Centerpieces',
      estimatedCost: decorCost,
      reason: 'Covers backdrop, floral/balloon decor, entrance styling, and ambient lighting.',
    },
    {
      category: 'Photography',
      name: 'Professional Event Photographer & Highlights',
      estimatedCost: photoCost,
      reason: 'Full coverage of ceremony/party plus edited high-resolution digital gallery.',
    },
    {
      category: 'Entertainment',
      name: 'Sound System, DJ / Acoustic Music & Mic Setup',
      estimatedCost: musicCost,
      reason: 'Essential audio equipment, DJ/performer fee, and lighting coordination.',
    },
    {
      category: 'Miscellaneous',
      name: 'Invitations, Favors & Emergency Contingency',
      estimatedCost: miscCost,
      reason: 'Printed/digital invites, guest favors, and 5% contingency reserve.',
    },
  ];

  // Generate timeline tasks based on days remaining
  const timelineTasks = [
    {
      task: 'Finalize venue contract and pay deposit',
      daysBeforeEvent: Math.min(daysUntil, Math.max(7, Math.round(daysUntil * 0.85))),
      priority: 'urgent' as const,
      category: 'Venue',
    },
    {
      task: 'Confirm catering menu tasting and dietary headcounts',
      daysBeforeEvent: Math.min(daysUntil - 1, Math.max(5, Math.round(daysUntil * 0.65))),
      priority: 'high' as const,
      category: 'Catering',
    },
    {
      task: 'Approve theme decor scheme, floral choices, and stage layouts',
      daysBeforeEvent: Math.min(daysUntil - 2, Math.max(4, Math.round(daysUntil * 0.5))),
      priority: 'high' as const,
      category: 'Decoration',
    },
    {
      task: 'Book photographer and provide event run-of-show shot list',
      daysBeforeEvent: Math.min(daysUntil - 2, Math.max(3, Math.round(daysUntil * 0.4))),
      priority: 'medium' as const,
      category: 'Photography',
    },
    {
      task: 'Dispatch invitations and collect RSVP confirmations',
      daysBeforeEvent: Math.min(daysUntil - 3, Math.max(3, Math.round(daysUntil * 0.35))),
      priority: 'medium' as const,
      category: 'Guests',
    },
    {
      task: 'Coordinate music playlist, speeches, and timeline run-through',
      daysBeforeEvent: Math.min(daysUntil - 4, Math.max(2, Math.round(daysUntil * 0.2))),
      priority: 'medium' as const,
      category: 'Entertainment',
    },
    {
      task: 'Final headcount lock with venue and caterer',
      daysBeforeEvent: Math.min(daysUntil - 5, Math.max(1, Math.round(daysUntil * 0.1))),
      priority: 'urgent' as const,
      category: 'Catering',
    },
    {
      task: 'Venue access inspection, decor setup check, and emergency kit assembly',
      daysBeforeEvent: 0,
      priority: 'urgent' as const,
      category: 'Coordination',
    },
  ];

  // General actionable task checklist
  const tasksList = [
    { title: 'Create digital RSVP form & send WhatsApp/email invitations', priority: 'high' as const, category: 'Invitations' },
    { title: 'Prepare customized event signage & welcome board wording', priority: 'medium' as const, category: 'Decor' },
    { title: 'Assemble guest party favors / return gifts', priority: 'medium' as const, category: 'Favors' },
    { title: 'Create master day-of timeline schedule for vendors', priority: 'urgent' as const, category: 'Coordination' },
    { title: 'Designate day-of point of contact for vendor delivery coordination', priority: 'high' as const, category: 'Coordination' },
  ];

  // Vendor categories
  const vendorCategories = [
    { category: 'Venue', estimatedBudget: venueCost, notes: 'Request clarification on catering exclusivity, curfew timings, and generator backup.' },
    { category: 'Catering', estimatedBudget: cateringCost, notes: 'Negotiate per-plate package including live counters and mineral water.' },
    { category: 'Decoration', estimatedBudget: decorCost, notes: 'Ask for photos of previous setups in similar halls and verify floral freshness.' },
    { category: 'Photography', estimatedBudget: photoCost, notes: 'Verify drone camera permissions, deliverables timeline, and teaser video.' },
    { category: 'Music / DJ', estimatedBudget: musicCost, notes: 'Check venue sound limitations, wireless microphone counts, and playlist sync.' },
  ];

  const recommendations = [
    `Lock in the venue at least ${Math.round(daysUntil * 0.8)} days ahead to secure your preferred date and avoid surge pricing.`,
    `Optimize catering costs by choosing a curated 4-course menu with live interactive counters rather than a massive 20-item spread.`,
    `Focus decoration spending on high-impact focal points (stage and photo backdrop) rather than scattering small arrangements.`,
    `Always allocate 5% to 8% of the budget (${currency} ${miscCost.toLocaleString()}) for unexpected logistical costs.`,
    `Request all vendor quotations in writing with clear cancellation and weather backup clauses.`,
  ];

  return {
    eventSummary: summary,
    themes: themeList,
    budget: budgetList,
    timeline: timelineTasks,
    tasks: tasksList,
    vendorCategories,
    decorations: decorationList,
    menus: menuList,
    activities: activityList,
    recommendations,
  };
}

/**
 * Intelligent AI Service that calls LLM API (Gemini or OpenAI) with fallback to deterministic plan
 */
export async function generateAIEventPlan(event: EventRecord): Promise<AIGeneratedPlan> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // 1. Guardrail: Check cache first to eliminate unnecessary LLM cost and latency
  const cacheKey = aiCache.createKey({
    eventId: event.id,
    budget: Number(event.budget),
    guestCount: Number(event.guest_count),
    eventType: event.event_type,
    location: event.location,
    priorities: event.priority_areas || [],
  });

  const cached = aiCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // 2. Guardrail: Inspect inputs for prompt injection attempts
  const reqCheck = inspectPromptSafety(event.additional_requirements || '');
  const themeCheck = inspectPromptSafety(event.theme_preference || '');
  if (!reqCheck.isSafe || !themeCheck.isSafe) {
    aiCache.recordBlockedInjection();
    console.warn('🛡️ Flagged potential prompt injection in event parameters; sanitizing before processing.');
  }

  const safeRequirements = reqCheck.sanitized || 'None';
  const safeTheme = themeCheck.sanitized || 'Standard / Modern';

  if (!geminiKey && !openaiKey) {
    const plan = generateDeterministicPlan(event);
    aiCache.set(cacheKey, plan);
    return plan;
  }

  const prompt = `
You are EventPilot, an elite event planner and financial optimizer.
Create a comprehensive, personalized event plan in valid JSON format according to the specification.

Event Details:
- Title: ${event.title}
- Event Type: ${event.event_type}
- Event Date: ${event.event_date} (Time: ${event.start_time || 'N/A'} to ${event.end_time || 'N/A'})
- Location: ${event.location} (${event.indoor_outdoor})
- Total Budget: ${event.currency} ${event.budget}
- Guest Count: ${event.guest_count}
- Theme Preference: ${safeTheme}
- Cultural Preference: ${event.cultural_preference || 'General'}
- Dietary Preferences: ${event.dietary_preferences || 'None specified'}
- Priority Areas: ${event.priority_areas.join(', ') || 'Balanced across venue and catering'}
- Additional Requirements: ${safeRequirements}

Return ONLY a valid JSON object matching this schema:
{
  "eventSummary": string,
  "themes": [ { "name": string, "description": string, "estimatedCost": number } ],
  "budget": [ { "category": string, "name": string, "estimatedCost": number, "reason": string } ],
  "timeline": [ { "task": string, "daysBeforeEvent": number, "priority": "low"|"medium"|"high"|"urgent", "category": string } ],
  "tasks": [ { "title": string, "priority": "low"|"medium"|"high"|"urgent", "category": string } ],
  "vendorCategories": [ { "category": string, "estimatedBudget": number, "notes": string } ],
  "decorations": [ { "title": string, "description": string, "estimatedCost": number } ],
  "menus": [ { "title": string, "description": string, "estimatedCost": number } ],
  "activities": [ { "title": string, "description": string, "estimatedCost": number } ],
  "recommendations": [ string ]
}

Important Rules:
1. Ensure the sum of budget items is approximately equal to ${event.budget}.
2. Categorize items into: Venue, Catering, Decoration, Photography, Entertainment, Invitations, Transport, Miscellaneous.
3. Label all numbers as estimates.
4. Output raw JSON only, no markdown ticks, no preamble.
`;

  try {
    let rawContent = '';

    if (geminiKey) {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }
      const data: any = await response.json();
      rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else if (openaiKey) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are EventPilot, an expert event planner that always outputs strict JSON.' },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }
      const data: any = await response.json();
      rawContent = data.choices?.[0]?.message?.content || '';
    }

    // Clean JSON markdown if any
    const jsonStr = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(jsonStr);
    const guardrailResult = validateAndSanitizeAIPlan(parsed, Number(event.budget) || 50000);
    if (guardrailResult.valid && guardrailResult.plan) {
      aiCache.set(cacheKey, guardrailResult.plan);
      return guardrailResult.plan;
    }
    throw new Error(guardrailResult.error || 'AI response failed guardrails validation');
  } catch (err) {
    console.warn('âš ï¸ GenAI API call or validation failed, using deterministic high-quality plan:', (err as Error).message);
    return generateDeterministicPlan(event);
  }
}

/**
 * Budget Rescue Mode Engine:
 * Analyzes existing budget items against a newly target budget, calculates savings opportunities,
 * recommends specific lower-cost alternatives honoring user priorities, and formats side-by-side proposals.
 */
export function calculateBudgetRescue(
  event: EventRecord,
  budgetItems: BudgetItem[],
  targetBudget: number
): BudgetRescueResponse {
  const currentTotal = budgetItems.reduce((acc, b) => acc + (Number(b.estimated_cost) || 0), 0);
  const neededReduction = Math.max(0, currentTotal - targetBudget);
  const currency = event.currency || 'INR';
  const priorities = (event.priority_areas || []).map(p => p.toLowerCase());

  if (neededReduction === 0) {
    return {
      analysis: `Your current planned spending (${currency} ${currentTotal.toLocaleString()}) is already within your target budget of ${currency} ${targetBudget.toLocaleString()}. You have a safe surplus of ${currency} ${(targetBudget - currentTotal).toLocaleString()}.`,
      targetBudget,
      currentTotalEstimated: currentTotal,
      proposedTotalEstimated: currentTotal,
      totalSavingsAchieved: 0,
      remainingShortfall: 0,
      proposals: [],
      priorityAdvice: [
        'Consider keeping your surplus in an emergency contingency buffer.',
        'Review quotations from existing vendors to lock in guaranteed pricing.',
      ],
    };
  }

  // Sort items by cost descending, protecting items in priority areas
  const scoredItems = budgetItems.map(item => {
    const isPriority = priorities.some(p => item.category.toLowerCase().includes(p) || item.name.toLowerCase().includes(p));
    const cost = Number(item.estimated_cost) || 0;
    // Lower weight for priority items so we reduce them last
    const reductionWeight = isPriority ? 0.4 : 1.0;
    return { item, cost, isPriority, reductionWeight };
  });

  // Calculate target savings per category
  let remainingToCut = neededReduction;
  const proposals: BudgetRescueResponse['proposals'] = [];
  let achievedSavings = 0;

  // First pass: propose reductions on non-priority items (up to 30-45% reduction)
  for (const entry of scoredItems) {
    if (remainingToCut <= 0) break;
    const { item, cost, isPriority } = entry;
    if (cost < 500) continue;

    const maxReductionFraction = isPriority ? 0.20 : 0.45;
    const targetItemCut = Math.min(cost * maxReductionFraction, remainingToCut);
    const proposedCost = Math.round(cost - targetItemCut);
    const itemSavings = cost - proposedCost;

    if (itemSavings >= 200) {
      let explanation = '';
      let tradeOffOrAlternative = '';
      let recommendedAction: 'reduce' | 'substitute' | 'eliminate' | 'keep' = 'reduce';

      const catLower = item.category.toLowerCase();
      if (catLower.includes('catering') || catLower.includes('food')) {
        explanation = `Streamline menu by replacing complex multi-course buffet with a 4-course curated feast and live chef stations.`;
        tradeOffOrAlternative = `Switch from imported exotic appetizers to crowd-favorite gourmet local specialties. Saves ~${currency} ${itemSavings.toLocaleString()} without sacrificing taste.`;
        recommendedAction = 'substitute';
      } else if (catLower.includes('venue')) {
        explanation = `Negotiate off-peak hours, daylight booking discount, or reduce included ancillary hall rentals.`;
        tradeOffOrAlternative = `Combine ceremony and dinner into single versatile hall layout to eliminate second space surcharge.`;
        recommendedAction = 'reduce';
      } else if (catLower.includes('decor')) {
        explanation = `Shift from imported fresh exotic florals to seasonal local blooms combined with fairy lights and reusable drapery.`;
        tradeOffOrAlternative = `Concentrate decorative budget on the central photo stage and entrance arch; simplify dining table centerpieces to ambient candlelight.`;
        recommendedAction = 'substitute';
      } else if (catLower.includes('photo')) {
        explanation = `Book photographer for 6 peak hours rather than full 10-hour day; opt for high-res digital gallery without immediate luxury physical album.`;
        tradeOffOrAlternative = `Print the physical photo album later as an anniversary gift to defer costs.`;
        recommendedAction = 'reduce';
      } else if (catLower.includes('entertain') || catLower.includes('music')) {
        explanation = `Book a dynamic DJ with own sound kit instead of a 5-piece live band, or hire acoustic duo for key hours.`;
        tradeOffOrAlternative = `Provide a curated high-definition Spotify party playlist for the cocktail hour.`;
        recommendedAction = 'substitute';
      } else {
        explanation = `Trim miscellaneous discretionary line item to fit target ceiling.`;
        tradeOffOrAlternative = `Switch from physical embossed stationery to digital WhatsApp/interactive website invitations.`;
        recommendedAction = 'reduce';
      }

      proposals.push({
        id: item.id,
        name: item.name,
        category: item.category,
        currentEstimatedCost: cost,
        proposedEstimatedCost: proposedCost,
        savings: itemSavings,
        explanation,
        tradeOffOrAlternative,
        recommendedAction,
      });

      achievedSavings += itemSavings;
      remainingToCut -= itemSavings;
    }
  }

  const proposedTotal = currentTotal - achievedSavings;
  const remainingShortfall = Math.max(0, targetBudget - proposedTotal < 0 ? proposedTotal - targetBudget : 0);

  const priorityAdvice = [
    `Preserved your top priority areas (${priorities.join(', ') || 'core experiences'}) with minimal changes.`,
    `Focus reductions on decorative materials and photography package hours to protect guest dining quality.`,
    remainingShortfall > 0
      ? `A remaining gap of ${currency} ${remainingShortfall.toLocaleString()} exists. Consider lowering guest count by ~${Math.ceil(remainingShortfall / ((currentTotal / (Number(event.guest_count) || 50))))} guests.`
      : `All proposed adjustments bring your event fully within the ${currency} ${targetBudget.toLocaleString()} limit!`,
  ];

  return {
    analysis: `To reach your new budget of ${currency} ${targetBudget.toLocaleString()} from your current plan of ${currency} ${currentTotal.toLocaleString()}, EventPilot identified ${currency} ${achievedSavings.toLocaleString()} in smart optimizations across ${proposals.length} budget categories while safeguarding your core event priorities.`,
    targetBudget,
    currentTotalEstimated: currentTotal,
    proposedTotalEstimated: proposedTotal,
    totalSavingsAchieved: achievedSavings,
    remainingShortfall,
    proposals,
    priorityAdvice,
  };
}

/**
 * Interactive AI Assistant message handler:
 * Understands event context and current plan, answers questions, suggests modifications,
 * and outputs structured changes for user approval.
 */
export async function processAssistantMessage(
  event: EventRecord,
  budgetItems: BudgetItem[],
  tasks: TaskItem[],
  userMessage: string
): Promise<AIAssistantAction> {
  // Inspect user message for adversarial injection or prompt hijacking
  const safetyCheck = inspectPromptSafety(userMessage);
  if (!safetyCheck.isSafe) {
    aiCache.recordBlockedInjection();
    return {
      reply: '🛡️ EventPilot AI Safety Guardrail: Your input was flagged for potential prompt instruction override. For security, administrative directives and prompt injection syntax are blocked. Please enter your event request normally.',
      requiresUserApproval: false,
    };
  }

  const lowerMsg = userMessage.toLowerCase();
  const currency = event.currency || 'INR';

  // Check if user is asking to reduce budget e.g. "reduce my budget to 35000"
  const budgetMatch = lowerMsg.match(/(?:reduce|change|cut|set)\s+(?:my\s+)?budget\s+to\s+([â‚¹$â‚¬Â£]?\s*[\d,]+)/i);
  if (budgetMatch) {
    const rawVal = budgetMatch[1].replace(/[â‚¹$â‚¬Â£,\s]/g, '');
    const newBudget = Number(rawVal);
    if (!isNaN(newBudget) && newBudget > 0) {
      const rescue = calculateBudgetRescue(event, budgetItems, newBudget);
      const budgetAdjustments = rescue.proposals.map(p => ({
        budgetItemId: p.id,
        category: p.category,
        name: p.name,
        action: 'update' as const,
        newCost: p.proposedEstimatedCost,
        reason: `${p.explanation} ${p.tradeOffOrAlternative}`,
      }));

      return {
        reply: `I have analyzed your request to adjust your budget to ${currency} ${newBudget.toLocaleString()}. I found ${currency} ${rescue.totalSavingsAchieved.toLocaleString()} in strategic savings across ${rescue.proposals.length} categories while preserving your priorities. Please review and approve these proposed adjustments below:`,
        proposedChanges: {
          budgetAdjustments,
          updatedSummary: `Revised plan aligned with updated budget of ${currency} ${newBudget.toLocaleString()}.`,
        },
        requiresUserApproval: true,
      };
    }
  }

  // Check if asking about timeline / countdown / urgency
  if (lowerMsg.includes('seven days') || lowerMsg.includes('7 days') || lowerMsg.includes('prioritize') || lowerMsg.includes('urgent')) {
    const urgentTasks = tasks.filter(t => t.priority === 'urgent' || t.priority === 'high');
    const taskRecommendations = [
      {
        title: 'Conduct final headcount confirmation with Caterer',
        priority: 'urgent' as const,
        category: 'Catering',
        daysBeforeEvent: 3,
      },
      {
        title: 'Review audio-visual equipment and microphone checks at venue',
        priority: 'high' as const,
        category: 'Venue',
        daysBeforeEvent: 2,
      },
    ];

    return {
      reply: `With the event coming up quickly, here is your high-priority action checklist:\n1. Lock in the final headcount with the caterer to avoid extra plate surcharges.\n2. Reconfirm vendor arrival times (decor, sound/DJ, and photography).\n3. Prepare your emergency day-of kit and assign an on-site point of contact.\n\nWould you like me to add these urgent countdown tasks to your tracker?`,
      proposedChanges: {
        tasksToAdd: taskRecommendations,
      },
      requiresUserApproval: true,
    };
  }

  // Check if asking about vegetarian / dietary menu
  if (lowerMsg.includes('vegetarian') || lowerMsg.includes('vegan') || lowerMsg.includes('menu')) {
    const guestCount = event.guest_count || 50;
    return {
      reply: `Here is a curated vegetarian banquet menu concept for ${guestCount} guests designed to delight all attendees:\n\nâ€¢ Welcome Drinks: Spiced Pomegranate Spritzer & Fresh Mango Basil Cooler\nâ€¢ Live Starters: Tandoori Stuffed Mushrooms, Paneer Malai Tikka, Crispy Lotus Stem Honey Chilli\nâ€¢ Main Courses: Paneer Lababdar, Dal Bukhara (18-hour slow cooked), Vegetable Dum Biryani with Burani Raita, Assorted Clay-Oven Kulchas & Naans\nâ€¢ Desserts: Saffron Angoori Rasmalai & Warm Moong Dal Halwa\n\nWould you like me to save this menu idea to your event plan?`,
      proposedChanges: {
        ideasToAdd: [
          {
            type: 'menu',
            title: `Gourmet Heritage Vegetarian Banquet (${guestCount} guests)`,
            description: 'Curated 4-course vegetarian banquet with live appetiser counters, royal paneer dishes, and traditional slow-cooked desserts.',
            estimatedCost: 0,
          },
        ],
      },
      requiresUserApproval: true,
    };
  }

  // Check if asking for traditional themes
  if (lowerMsg.includes('traditional') || lowerMsg.includes('cultural') || lowerMsg.includes('heritage')) {
    return {
      reply: `To infuse authentic traditional elegance into your ${event.event_type}, I recommend adopting a 'Royal Marigold & Brass Heritage' theme:\n\nâ€¢ Decor: Floral cascades of fresh yellow & orange marigolds, antique brass urlis with floating petals and diyas, and authentic raw silk backdrop drapes.\nâ€¢ Music: Live Shenai / Flute instrumental welcome for the guest arrival.\nâ€¢ Attire Palette: Warm sunset hues, ivory, and deep crimson.\n\nShall I add these ideas and decorative concepts to your event plan?`,
      proposedChanges: {
        ideasToAdd: [
          {
            type: 'theme',
            title: 'Royal Marigold & Brass Heritage Aesthetic',
            description: 'Warm gold, marigold, and raw silk drapery with traditional brass urlis and acoustic Indian instrumental melodies.',
            estimatedCost: 0,
          },
        ],
      },
      requiresUserApproval: true,
    };
  }

  // Default thoughtful contextual assistance
  return {
    reply: `I understand you want to optimize your plan regarding "${userMessage}". EventPilot is ready to help you adjust your budget items, suggest tailored menu items, refine timeline milestones, or negotiate vendor quotations.\n\nCould you specify if you would like me to adjust your budget allocations, add specific timeline tasks, or explore alternative themes?`,
    clarifyingQuestions: [
      'Would you like to decrease your total budget target or reallocate existing funds between categories?',
      'Do you prefer more elaborate decorations or an upgraded gourmet dining experience?',
    ],
    requiresUserApproval: false,
  };
}
