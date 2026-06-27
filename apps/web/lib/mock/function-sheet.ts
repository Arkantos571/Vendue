import { getEventById, type MockEvent } from "@/lib/mock/events";

export interface RunningOrderItem {
  time: string;
  activity: string;
  owner: string;
  notes: string | null;
}

export interface SetupRequirements {
  roomLayout: string;
  furniture: string;
  avRequirements: string;
  signage: string;
  cloakroom: string;
  accessibilityNotes: string;
}

export interface FoodAndBeverage {
  packageMenu: string;
  dietaryRequirements: string;
  barSetup: string;
  drinksReceptionNotes: string;
  serviceStyle: string;
}

export interface StaffingPlanSummary {
  managerOnDuty: string | null;
  supervisors: string[];
  bartenders: string[];
  waiters: string[];
  runners: string[];
  security: string[];
  reception: string[];
}

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface InternalNotes {
  managerNotes: string;
  riskNotes: string;
  clientPreferences: string;
}

export interface FunctionSheet {
  eventId: string;
  runningOrder: RunningOrderItem[];
  setup: SetupRequirements;
  foodAndBeverage: FoodAndBeverage;
  staffingPlan: StaffingPlanSummary;
  checklist: ChecklistItem[];
  internalNotes: InternalNotes;
}

const defaultChecklist: ChecklistItem[] = [
  { id: "chk-1", label: "Confirm final numbers", completed: false },
  { id: "chk-2", label: "Confirm dietary requirements", completed: false },
  { id: "chk-3", label: "Confirm room layout", completed: false },
  { id: "chk-4", label: "Print signage", completed: false },
  { id: "chk-5", label: "Brief team", completed: false },
  { id: "chk-6", label: "Check AV", completed: false },
  { id: "chk-7", label: "Prepare bar stock", completed: false },
  { id: "chk-8", label: "Confirm client arrival time", completed: false },
];

const functionSheets: Record<string, FunctionSheet> = {
  "evt-1": {
    eventId: "evt-1",
    runningOrder: [
      { time: "16:00", activity: "AV and room setup complete", owner: "Events team", notes: "Projector, lectern, stage lighting" },
      { time: "17:30", activity: "Client arrival & walkthrough", owner: "Jordan Lee", notes: "Sarah Chen — Meridian Group" },
      { time: "18:00", activity: "Guest arrival", owner: "Reception", notes: "Name cards on welcome desk" },
      { time: "18:15", activity: "Drinks reception", owner: "Bar team", notes: "Sparkling wine, soft drinks, canapés" },
      { time: "18:30", activity: "Guests seated", owner: "Floor team", notes: "Table plan version 3" },
      { time: "19:00", activity: "Food service — starter", owner: "Kitchen / floor", notes: "Plated service" },
      { time: "19:45", activity: "Food service — main", owner: "Kitchen / floor", notes: "18 vegetarian mains flagged" },
      { time: "20:30", activity: "Speeches", owner: "Events coordinator", notes: "CEO at 20:30, 10 min max" },
      { time: "21:00", activity: "Dessert & coffee", owner: "Floor team", notes: null },
      { time: "22:30", activity: "Last orders", owner: "Bar team", notes: null },
      { time: "23:00", activity: "Event close", owner: "Manager on duty", notes: "Breakdown from 23:15" },
    ],
    setup: {
      roomLayout: "Banquet rounds of 10 — 12 tables across Main Ballroom",
      furniture: "150 chairs, 12 round tables, top table for 8, lectern, dance floor cleared",
      avRequirements: "Dual projector screens, wireless mic ×2, lectern light, background playlist until 20:30",
      signage: "Welcome board at entrance, table plan in foyer, toilet signage, vegetarian markers on tables",
      cloakroom: "Cloakroom staffed from 17:45 — rail capacity 120 coats",
      accessibilityNotes: "Step-free access via east entrance. Reserved table near exit for wheelchair guest.",
    },
    foodAndBeverage: {
      packageMenu: "Three-course corporate dinner — seasonal menu package B",
      dietaryRequirements: "18 vegetarian, 4 vegan, 2 gluten-free, 1 nut allergy (table 4)",
      barSetup: "Main bar + lobby bar. House wine, premium spirits, 2 draft lines",
      drinksReceptionNotes: "45-min reception — sparkling wine, selected cocktails, soft drinks",
      serviceStyle: "Plated service with synchronized clear. Wine served with each course.",
    },
    staffingPlan: {
      managerOnDuty: "Jordan Lee",
      supervisors: ["Daniel Frost"],
      bartenders: ["Sam Patel"],
      waiters: ["Alex Morgan", "Priya Shah"],
      runners: ["Alex Morgan"],
      security: ["Marcus Okafor"],
      reception: ["Sophie Clarke"],
    },
    checklist: defaultChecklist.map((item) => ({
      ...item,
      completed: ["chk-1", "chk-2", "chk-3", "chk-6"].includes(item.id),
    })),
    internalNotes: {
      managerNotes: "AV setup from 16:00 — confirm Meridian branding on screens by 17:00. VIP table 1 near stage.",
      riskNotes: "Nut allergy on table 4 — separate service required. Bar stock check by 17:00.",
      clientPreferences: "Sarah prefers minimal interruptions during speeches. No flash photography during CEO address.",
    },
  },
  "evt-2": {
    eventId: "evt-2",
    runningOrder: [
      { time: "15:00", activity: "Room setup complete", owner: "Events team", notes: "Garden terrace dressed, lawn clear" },
      { time: "16:00", activity: "Client arrival", owner: "Jordan Lee", notes: "Bride party photos in garden" },
      { time: "16:30", activity: "Guest arrival", owner: "Reception", notes: "Drinks on lawn" },
      { time: "17:00", activity: "Drinks reception", owner: "Bar team", notes: "Prosecco, gin bar, mocktails" },
      { time: "18:00", activity: "Guests seated for dinner", owner: "Floor team", notes: "Long tables ×4" },
      { time: "19:00", activity: "Food service", owner: "Kitchen / floor", notes: "Sharing platters then plated main" },
      { time: "20:00", activity: "Speeches & first dance", owner: "Events coordinator", notes: "First dance at 20:00" },
      { time: "21:00", activity: "Evening buffet & bar", owner: "Bar / floor", notes: null },
      { time: "22:30", activity: "Last orders", owner: "Bar team", notes: null },
      { time: "23:00", activity: "Event close", owner: "Manager on duty", notes: "Sparkler send-off 23:15" },
    ],
    setup: {
      roomLayout: "Long banquet tables on terrace with lawn reception area",
      furniture: "4 × 20-seat tables, ceremony arch (external), dance floor on lawn",
      avRequirements: "PA for speeches, wireless mic, playlist DJ from 21:00",
      signage: "Welcome sign, table names, lawn bar menu board",
      cloakroom: "Pop-up cloakroom tent — capacity 90",
      accessibilityNotes: "Ramp access to terrace. Quiet zone near boardroom for sensory breaks.",
    },
    foodAndBeverage: {
      packageMenu: "Wedding package — canapés, three-course dinner, evening buffet",
      dietaryRequirements: "6 vegetarian, 2 vegan, 3 gluten-free",
      barSetup: "Main bar + lawn gin station. Full open bar until 22:30",
      drinksReceptionNotes: "Extended lawn reception — 90 minutes",
      serviceStyle: "Family-style starters, plated mains, buffet dessert",
    },
    staffingPlan: {
      managerOnDuty: null,
      supervisors: ["Daniel Frost"],
      bartenders: ["Sam Patel"],
      waiters: ["Alex Morgan", "Priya Shah"],
      runners: [],
      security: ["Marcus Okafor"],
      reception: ["Sophie Clarke"],
    },
    checklist: defaultChecklist.map((item) => ({
      ...item,
      completed: ["chk-3", "chk-8"].includes(item.id),
    })),
    internalNotes: {
      managerNotes: "Events coordinator slot still open — Daniel covering until assigned.",
      riskNotes: "Weather contingency: move reception to ballroom if rain after 16:00.",
      clientPreferences: "Emily wants sparkler send-off at 23:15 — coordinate with security.",
    },
  },
  "evt-3": {
    eventId: "evt-3",
    runningOrder: [
      { time: "07:00", activity: "Room setup complete", owner: "Events team", notes: "Boardroom theatre style" },
      { time: "07:30", activity: "AV check", owner: "Events team", notes: "Client laptop test" },
      { time: "08:00", activity: "Guest arrival & breakfast", owner: "Floor team", notes: "Continental + hot options" },
      { time: "08:30", activity: "Product presentation", owner: "Client", notes: "AV support on standby" },
      { time: "09:30", activity: "Q&A and networking", owner: "Floor team", notes: "Coffee refill stations" },
      { time: "10:30", activity: "Event close", owner: "Manager on duty", notes: "Reset room by 11:00" },
    ],
    setup: {
      roomLayout: "Theatre style — 40 seats, front presentation area",
      furniture: "40 chairs, 6 high tables at rear for networking",
      avRequirements: "HDMI input, ceiling projector, clip mic, flip chart",
      signage: "Directional signage from reception, branded slide on screen",
      cloakroom: "Self-service coat rack in boardroom lobby",
      accessibilityNotes: "Lift access to floor 2. Hearing loop available on request.",
    },
    foodAndBeverage: {
      packageMenu: "Breakfast briefing — continental and hot breakfast buffet",
      dietaryRequirements: "Awaiting final guest list — confirm by Friday",
      barSetup: "Coffee station ×2, juice, water",
      drinksReceptionNotes: "N/A — breakfast service only",
      serviceStyle: "Buffet breakfast with table service for hot drinks",
    },
    staffingPlan: {
      managerOnDuty: null,
      supervisors: [],
      bartenders: [],
      waiters: [],
      runners: [],
      security: [],
      reception: [],
    },
    checklist: defaultChecklist.map((item) => ({ ...item, completed: false })),
    internalNotes: {
      managerNotes: "Draft event — do not brief team until confirmed.",
      riskNotes: "Final numbers not confirmed. Deposit pending.",
      clientPreferences: "Tom prefers minimal branding — neutral table linen.",
    },
  },
  "evt-4": {
    eventId: "evt-4",
    runningOrder: [
      { time: "17:00", activity: "Room setup complete", owner: "Events team", notes: "Auction tables in foyer" },
      { time: "18:00", activity: "VIP reception", owner: "Jordan Lee", notes: "VIP area — 40 guests" },
      { time: "18:30", activity: "General guest arrival", owner: "Reception", notes: "Silent auction open" },
      { time: "19:00", activity: "Drinks reception", owner: "Bar team", notes: "Champagne on arrival" },
      { time: "19:30", activity: "Guests seated", owner: "Floor team", notes: "200 covers" },
      { time: "20:00", activity: "Food service", owner: "Kitchen / floor", notes: "Plated three-course" },
      { time: "21:00", activity: "Auction & speeches", owner: "Events coordinator", notes: "Live auction lot 12 at 21:30" },
      { time: "22:30", activity: "Last orders", owner: "Bar team", notes: null },
      { time: "00:30", activity: "Event close", owner: "Manager on duty", notes: "Breakdown from 01:00" },
    ],
    setup: {
      roomLayout: "Banquet rounds of 10 plus VIP cabaret tables",
      furniture: "20 round tables, VIP tables ×4, auction display boards in foyer",
      avRequirements: "Stage lighting, auctioneer mic, auctioneer screen, photo backdrop",
      signage: "Auction lot cards, VIP signage, silent auction instructions",
      cloakroom: "Dual cloakroom — main and VIP entrances",
      accessibilityNotes: "Wheelchair spaces at tables 2 and 15. Step-free route signed.",
    },
    foodAndBeverage: {
      packageMenu: "Gala dinner — champagne reception, three-course gala menu",
      dietaryRequirements: "22 vegetarian, 8 vegan, 6 gluten-free, 2 halal",
      barSetup: "Main bar, foyer bar, VIP bar. Premium wine list",
      drinksReceptionNotes: "Champagne on arrival — 45 minutes",
      serviceStyle: "Formal plated service. Wine paired with courses.",
    },
    staffingPlan: {
      managerOnDuty: "Jordan Lee",
      supervisors: ["Daniel Frost"],
      bartenders: ["Sam Patel"],
      waiters: ["Alex Morgan", "Priya Shah"],
      runners: ["Alex Morgan"],
      security: ["Marcus Okafor"],
      reception: ["Sophie Clarke"],
    },
    checklist: defaultChecklist.map((item) => ({
      ...item,
      completed: ["chk-1", "chk-2", "chk-3", "chk-4", "chk-5", "chk-6", "chk-7", "chk-8"].includes(item.id),
    })),
    internalNotes: {
      managerNotes: "Full team brief at 17:00 in green room. Auction IT support on call.",
      riskNotes: "High-value auction lots — security sweep at 17:30.",
      clientPreferences: "Helen Foster — prefers organic wine options where possible.",
    },
  },
  "evt-5": {
    eventId: "evt-5",
    runningOrder: [
      { time: "18:30", activity: "Room setup complete", owner: "Events team", notes: null },
      { time: "19:00", activity: "Guest arrival", owner: "Reception", notes: null },
      { time: "19:30", activity: "Dinner service", owner: "Floor team", notes: "Private dining room" },
      { time: "20:00", activity: "Champagne toast", owner: "Events coordinator", notes: null },
      { time: "21:30", activity: "Cake service", owner: "Floor team", notes: null },
      { time: "22:30", activity: "Event close", owner: "Manager on duty", notes: null },
    ],
    setup: {
      roomLayout: "Single long table — 24 covers",
      furniture: "24 chairs, floral centrepieces",
      avRequirements: "Background music only",
      signage: "Reserved sign on private dining door",
      cloakroom: "Shared with main venue",
      accessibilityNotes: "Ground floor access.",
    },
    foodAndBeverage: {
      packageMenu: "Anniversary tasting menu — five courses",
      dietaryRequirements: "2 gluten-free confirmed",
      barSetup: "Wine pairing service",
      drinksReceptionNotes: "Champagne toast at 20:00",
      serviceStyle: "Fine dining — synchronized service",
    },
    staffingPlan: {
      managerOnDuty: "Jordan Lee",
      supervisors: [],
      bartenders: [],
      waiters: ["Priya Shah"],
      runners: [],
      security: [],
      reception: [],
    },
    checklist: defaultChecklist.map((item) => ({ ...item, completed: true })),
    internalNotes: {
      managerNotes: "Event completed successfully.",
      riskNotes: "None recorded.",
      clientPreferences: "Family requested low lighting during toast.",
    },
  },
  "evt-6": {
    eventId: "evt-6",
    runningOrder: [],
    setup: {
      roomLayout: "N/A — event cancelled",
      furniture: "N/A",
      avRequirements: "N/A",
      signage: "N/A",
      cloakroom: "N/A",
      accessibilityNotes: "N/A",
    },
    foodAndBeverage: {
      packageMenu: "Cancelled",
      dietaryRequirements: "N/A",
      barSetup: "N/A",
      drinksReceptionNotes: "N/A",
      serviceStyle: "N/A",
    },
    staffingPlan: {
      managerOnDuty: null,
      supervisors: [],
      bartenders: [],
      waiters: [],
      runners: [],
      security: [],
      reception: [],
    },
    checklist: defaultChecklist.map((item) => ({ ...item, completed: false })),
    internalNotes: {
      managerNotes: "Event cancelled — weather contingency invoked.",
      riskNotes: "Deposit refund processed.",
      clientPreferences: "Client may rebook for August.",
    },
  },
  "evt-7": {
    eventId: "evt-7",
    runningOrder: [
      { time: "11:30", activity: "Room setup complete", owner: "Events team", notes: "Boardroom reset" },
      { time: "12:15", activity: "Client arrival", owner: "Alex Morgan", notes: "James Wright — Apex Holdings" },
      { time: "12:30", activity: "Lunch service begins", owner: "Floor team", notes: "16 covers" },
      { time: "13:00", activity: "Board meeting in session", owner: "Floor team", notes: "Minimal service interruptions" },
      { time: "14:30", activity: "Coffee & petits fours", owner: "Floor team", notes: null },
      { time: "15:00", activity: "Event close", owner: "Daniel Frost", notes: "Room turnover by 15:30" },
    ],
    setup: {
      roomLayout: "Boardroom — single table 16 covers, presentation screen at head",
      furniture: "16 executive chairs, sideboard for service",
      avRequirements: "Video conference link, HDMI, conference phone",
      signage: "Meeting in progress — do not disturb",
      cloakroom: "Executive coat stand in anteroom",
      accessibilityNotes: "Lift access. Dietary cards on table.",
    },
    foodAndBeverage: {
      packageMenu: "Executive lunch — starter, main, dessert",
      dietaryRequirements: "2 gluten-free, 1 nut allergy",
      barSetup: "Wine service, soft drinks, espresso post-lunch",
      drinksReceptionNotes: "N/A",
      serviceStyle: "Discrete boardroom service — courses between agenda items",
    },
    staffingPlan: {
      managerOnDuty: "Daniel Frost",
      supervisors: ["Daniel Frost"],
      bartenders: [],
      waiters: ["Priya Shah"],
      runners: [],
      security: [],
      reception: [],
    },
    checklist: defaultChecklist.map((item) => ({
      ...item,
      completed: ["chk-1", "chk-2", "chk-3", "chk-5", "chk-8"].includes(item.id),
    })),
    internalNotes: {
      managerNotes: "In progress — board meeting running 15 min ahead of schedule.",
      riskNotes: "Nut allergy — separate prep required.",
      clientPreferences: "James prefers water only during meeting, wine with lunch.",
    },
  },
};

export function buildPlaceholderFunctionSheetFromEvent(event: MockEvent): FunctionSheet {
  return {
    eventId: event.id,
    runningOrder: [
      { time: event.startTime, activity: "Guest arrival", owner: "Events team", notes: null },
      { time: event.endTime, activity: "Event close", owner: "Manager on duty", notes: null },
    ],
    setup: {
      roomLayout: `${event.space} — layout TBC`,
      furniture: "Standard event furniture",
      avRequirements: "To be confirmed with client",
      signage: "Welcome signage required",
      cloakroom: "Standard cloakroom provision",
      accessibilityNotes: "Confirm accessibility requirements with client",
    },
    foodAndBeverage: {
      packageMenu: `${event.eventType} — menu TBC`,
      dietaryRequirements: "Collect dietary requirements from client",
      barSetup: "Standard bar setup",
      drinksReceptionNotes: "TBC",
      serviceStyle: "To be confirmed",
    },
    staffingPlan: {
      managerOnDuty: null,
      supervisors: [],
      bartenders: [],
      waiters: [],
      runners: [],
      security: [],
      reception: [],
    },
    checklist: defaultChecklist.map((item) => ({ ...item, completed: false })),
    internalNotes: {
      managerNotes: event.notes ?? "No manager notes yet.",
      riskNotes: "No risks flagged.",
      clientPreferences: "To be captured during client briefing.",
    },
  };
}

function buildDefaultSheet(eventId: string): FunctionSheet | undefined {
  const event = getEventById(eventId);
  if (!event) return undefined;
  return buildPlaceholderFunctionSheetFromEvent(event);
}

export function getFunctionSheetByEventId(eventId: string): FunctionSheet | undefined {
  if (functionSheets[eventId]) {
    return functionSheets[eventId];
  }
  return buildDefaultSheet(eventId);
}
