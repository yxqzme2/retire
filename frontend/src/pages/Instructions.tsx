import { useState } from 'react';
import {
  BookOpen, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle,
  Lightbulb, User, Wallet, TrendingUp, Receipt, CalendarDays,
  SlidersHorizontal, GitBranch, LineChart, HelpCircle, ArrowRight,
  Info, Star, Clock, DollarSign,
} from 'lucide-react';

// ─── Section types ────────────────────────────────────────────────────────────

interface Step {
  number: number;
  title: string;
  page: string;
  icon: React.ReactNode;
  color: string;
  summary: string;
  content: React.ReactNode;
}

// ─── Reusable layout pieces ───────────────────────────────────────────────────

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5 bg-emerald-500/8 border border-emerald-500/20 rounded-lg p-3 my-3">
      <Lightbulb size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-emerald-200/90 leading-relaxed">{children}</p>
    </div>
  );
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5 bg-amber-500/8 border border-amber-500/20 rounded-lg p-3 my-3">
      <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-amber-200/90 leading-relaxed">{children}</p>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5 bg-blue-500/8 border border-blue-500/20 rounded-lg p-3 my-3">
      <Info size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-blue-200/90 leading-relaxed">{children}</p>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-slate-100 mt-5 mb-2 flex items-center gap-2">
      <span className="w-1 h-4 bg-blue-500 rounded-full inline-block" />
      {children}
    </h3>
  );
}

function Field({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="flex gap-3 py-2 border-b border-slate-700/40 last:border-0">
      <span className="text-blue-300 font-medium text-xs w-44 flex-shrink-0 pt-0.5">{name}</span>
      <span className="text-slate-300 text-xs leading-relaxed">{desc}</span>
    </div>
  );
}

function QA({ q, children }: { q: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-700/50 rounded-lg overflow-hidden mb-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-700/30 transition-colors"
      >
        <span className="text-sm text-slate-200 font-medium">{q}</span>
        {open ? <ChevronUp size={14} className="text-slate-500 flex-shrink-0" /> : <ChevronDown size={14} className="text-slate-500 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 text-sm text-slate-300 leading-relaxed border-t border-slate-700/40 bg-slate-800/30">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Step content ─────────────────────────────────────────────────────────────

const steps: Step[] = [
  {
    number: 1,
    title: 'Set Up Your Profile',
    page: 'Settings',
    icon: <User size={16} />,
    color: 'blue',
    summary: 'Tell the app who you are — ages, filing status, state, and how far to project.',
    content: (
      <div>
        <p className="text-sm text-slate-300 leading-relaxed mb-3">
          Your profile is the foundation everything else builds on. The engine uses your current age, retirement
          target, and life expectancy to decide how many years to simulate, when contributions stop, when income
          starts, and how taxes are calculated.
        </p>

        <SectionHeading>Go to Settings → Profile</SectionHeading>

        <div className="rounded-lg border border-slate-700/50 overflow-hidden mb-3">
          <Field name="Your Current Age" desc="Your age right now. The simulation starts here and runs year by year. Keep this up to date — update it once a year." />
          <Field name="Spouse's Current Age" desc="Your partner's current age if applicable. Used for joint filing tax brackets and shared income planning." />
          <Field name="Target Retirement Age" desc="The age at which you plan to stop working. This is when contributions stop and income/withdrawals begin. You can test different values by creating multiple scenarios." />
          <Field name="Projection End Age" desc="How far out to simulate — typically 90–95. This is your longevity assumption. Plan conservatively; running out of money at 88 is far worse than having some left over." />
          <Field name="Tax Filing Status" desc="Married Filing Jointly gives you larger tax brackets and deductions. Single filers pay more taxes on the same income. If married, use Jointly unless you have a specific reason not to." />
          <Field name="Retirement State" desc="Your expected state of residence in retirement. This affects state income tax. States like TX, FL, WA, and NV have 0% income tax — a significant benefit." />
        </div>

        <Tip>
          If you're unsure about your retirement age, start with your current target. Later, create a second scenario
          (e.g. 'Retire 2 Years Early') to see the cost of retiring earlier — it's usually more than people expect.
        </Tip>

        <Warning>
          The projection end age matters a lot. A 90-year projection with money running out at 87 looks fine — until
          you realize 1 in 4 people aged 65 lives past 90. Set this to at least 90, ideally 95.
        </Warning>
      </div>
    ),
  },
  {
    number: 2,
    title: 'Add Your Accounts',
    page: 'Accounts',
    icon: <Wallet size={16} />,
    color: 'emerald',
    summary: 'Enter every account you own — 401k, Roth IRA, brokerage, savings, pension, Social Security.',
    content: (
      <div>
        <p className="text-sm text-slate-300 leading-relaxed mb-3">
          Accounts are the assets you're building toward retirement. The engine grows each one at its own
          expected return rate, applies your contributions, and then draws them down intelligently in retirement
          to cover your expenses.
        </p>

        <SectionHeading>Investable Accounts (the ones that grow)</SectionHeading>
        <p className="text-xs text-slate-400 mb-2 leading-relaxed">
          These accounts accumulate money until retirement, then get drawn down to pay for expenses.
        </p>

        <div className="rounded-lg border border-slate-700/50 overflow-hidden mb-3">
          <Field name="401(k) / 403(b)" desc="Your employer-sponsored retirement plan. Pre-tax contributions lower your income tax now. The money grows tax-deferred — you pay taxes when you withdraw in retirement." />
          <Field name="Roth IRA / Roth 401(k)" desc="You pay taxes on contributions now, but all growth and withdrawals are completely tax-free in retirement. Especially valuable if you expect to be in a higher tax bracket later." />
          <Field name="Taxable Brokerage" desc="A regular investment account at a broker like Schwab or Fidelity. No contribution limits, but dividends and gains are taxed each year." />
          <Field name="Cash / HYSA" desc="Cash savings, checking, or high-yield savings accounts. Lower return but liquid and safe. Good for your emergency fund and short-term needs." />
          <Field name="HSA" desc="Health Savings Account — triple tax-advantaged. Contributions are pre-tax, growth is tax-free, and withdrawals for medical expenses are tax-free. After 65, you can withdraw for anything like a traditional IRA." />
        </div>

        <SectionHeading>Income-Type Accounts (pension & Social Security)</SectionHeading>
        <p className="text-xs text-slate-400 mb-2 leading-relaxed">
          These don't have a balance that grows — they're guaranteed income streams that start at a specific age.
        </p>

        <div className="rounded-lg border border-slate-700/50 overflow-hidden mb-3">
          <Field name="Pension" desc="A defined-benefit plan from an employer. You receive a fixed monthly payment starting at a specific age, typically for life. Enter the monthly amount and start age." />
          <Field name="Social Security" desc="Government retirement benefit based on your lifetime earnings. Enter the monthly amount from your SSA statement (ssa.gov/myaccount) and the age you plan to start collecting." />
        </div>

        <SectionHeading>Key fields explained</SectionHeading>
        <div className="rounded-lg border border-slate-700/50 overflow-hidden mb-3">
          <Field name="Current Balance" desc="Today's actual account value. Log into your account or check your last statement. For 401k, use the vested balance." />
          <Field name="Annual Contribution" desc="How much you personally contribute per year. Does not include employer match — enter that separately below." />
          <Field name="Employer Match %" desc="If your employer matches 50 cents per dollar up to 6% of salary, and you contribute the full 6%, enter 50% here. The engine adds that as bonus savings." />
          <Field name="Expected Return %" desc="How much this account grows per year on average. Each account uses its own rate — your HYSA at 4.5% grows differently than your 401k at 7%." />
          <Field name="Withdrawal Priority" desc="When the engine needs cash in retirement, it draws from accounts in priority order. Lower number = draws first. Typically: Cash (1) → Taxable (3) → Pre-Tax 401k (5) → Roth IRA (9)." />
        </div>

        <Tip>
          Add every account — even small ones. A $5,000 savings account might seem trivial but it compounds and
          affects the sequencing of your withdrawals in retirement.
        </Tip>

        <Warning>
          For Pension and Social Security accounts: enter the monthly income and start age in the account form.
          The projection engine will automatically include this as income. You do NOT need to separately add
          it on the Income page — doing both would count it twice.
        </Warning>
      </div>
    ),
  },
  {
    number: 3,
    title: 'Add Income Streams',
    page: 'Income',
    icon: <TrendingUp size={16} />,
    color: 'violet',
    summary: 'Record any income that continues in retirement — part-time work, rental, annuity, etc.',
    content: (
      <div>
        <p className="text-sm text-slate-300 leading-relaxed mb-3">
          Income streams are money coming <em>in</em> during retirement beyond what you draw from your portfolio.
          The engine uses these to reduce how much it needs to withdraw from your accounts each year — which
          directly extends how long your money lasts.
        </p>

        <SectionHeading>When to use Income Streams vs Accounts</SectionHeading>
        <Note>
          <strong>Pension / Social Security:</strong> If you entered these on the Accounts page with a monthly income
          amount, you're done — the engine picks them up automatically. Only add them here if you <em>didn't</em> enter
          them as accounts, or if you have a second pension the Accounts page doesn't capture.
        </Note>

        <SectionHeading>Types of income streams</SectionHeading>
        <div className="rounded-lg border border-slate-700/50 overflow-hidden mb-3">
          <Field name="Pension" desc="Fixed employer benefit. Use this if you have a pension that you haven't already entered as an Account." />
          <Field name="Social Security" desc="Government benefit. Use this if you haven't entered SS as an Account, or to model a spouse's SS separately." />
          <Field name="Part-Time Work" desc="Income from consulting, freelance, or a part-time job in early retirement. Set an end age (e.g. 70) so it stops after a few years." />
          <Field name="Rental Income" desc="Net monthly rent from a rental property after expenses (mortgage, maintenance, taxes). Highly tax-efficient if structured well." />
          <Field name="Annuity" desc="A purchased income contract that pays a fixed amount for life or a set period." />
          <Field name="Other" desc="Any other recurring income — royalties, trust distributions, business income, etc." />
        </div>

        <SectionHeading>Key fields</SectionHeading>
        <div className="rounded-lg border border-slate-700/50 overflow-hidden mb-3">
          <Field name="Annual Amount + Is Monthly" desc="Enter the dollar amount. Toggle 'Is Monthly' if you're thinking in monthly terms — the engine will multiply by 12. Example: $2,000/month becomes $24,000/year." />
          <Field name="Start Age / End Age" desc="When this income begins and ends. Part-time work might run from 60–68. Social Security runs indefinitely (leave end age blank)." />
          <Field name="COLA %" desc="Cost-of-Living Adjustment — annual raise to keep up with inflation. Social Security has historically given ~2–3% COLA. Many pensions are fixed at 0%." />
          <Field name="Taxable / Partially Taxable" desc="Pension income is usually fully taxable. Social Security is partially taxable (up to 85% depending on your total income). Rental income is taxable but you can deduct expenses." />
        </div>

        <Tip>
          Part-time consulting in early retirement is often underestimated. Even $20,000/year from ages 60–65
          can extend your portfolio by 3–5 years because it delays withdrawals during the critical early
          retirement years (when sequence-of-returns risk is highest).
        </Tip>
      </div>
    ),
  },
  {
    number: 4,
    title: 'Add Your Expenses',
    page: 'Expenses',
    icon: <Receipt size={16} />,
    color: 'rose',
    summary: 'Plan your spending in retirement — housing, food, healthcare, travel, and everything else.',
    content: (
      <div>
        <p className="text-sm text-slate-300 leading-relaxed mb-3">
          Expenses are what you'll spend each year in retirement. The engine inflates most of these over time
          so your plan accounts for the fact that $80,000 today won't buy the same lifestyle in 20 years.
          Be honest here — underestimating spending is the #1 planning mistake.
        </p>

        <SectionHeading>Expense categories</SectionHeading>
        <div className="rounded-lg border border-slate-700/50 overflow-hidden mb-3">
          <Field name="Core" desc="Non-negotiable needs: housing, food, utilities, transportation, insurance. You can't cut these in a downturn." />
          <Field name="Flexible" desc="Nice-to-haves you'd reduce first if money gets tight: dining, entertainment, travel, hobbies." />
          <Field name="Irregular" desc="Lumpy or infrequent costs: home maintenance, car replacement, major appliances. Often overlooked but significant over time." />
        </div>

        <SectionHeading>Key fields</SectionHeading>
        <div className="rounded-lg border border-slate-700/50 overflow-hidden mb-3">
          <Field name="Annual Amount + Is Monthly" desc="Enter your expected spend. Toggle 'Is Monthly' to enter a monthly budget and have it annualized automatically." />
          <Field name="Start Age / End Age" desc="When this expense begins and ends. Your mortgage might end at 65 (paid off). Travel peaks at 62–75 (go-go years), then declines. Healthcare increases with age." />
          <Field name="Inflation Linked" desc="Check this for most expenses. The engine will grow this item by the general inflation rate each year. Healthcare gets its own higher inflation rate automatically." />
          <Field name="Custom Inflation Rate" desc="Override the inflation rate for a specific item. Healthcare typically inflates at 5–7%, faster than general CPI. Enter 5 here for your healthcare line item." />
          <Field name="Essential" desc="Marks whether you could cut this in a financial emergency. Used in stress test scenarios to see your 'bare minimum' spending floor." />
        </div>

        <SectionHeading>What to include</SectionHeading>
        <div className="rounded-lg border border-slate-700/50 overflow-hidden mb-4">
          <Field name="Housing" desc="Rent or property taxes + insurance after mortgage payoff. Include HOA, maintenance (~1–2% of home value per year)." />
          <Field name="Food" desc="Groceries + dining out. Be realistic — people often spend more on food in retirement because they have more time to enjoy it." />
          <Field name="Healthcare" desc="This is critical and often severely underestimated. A couple retiring at 65 needs $315,000+ for healthcare in retirement (Fidelity estimate). Include premiums, deductibles, dental, vision, long-term care." />
          <Field name="Transportation" desc="Car payment/replacement, insurance, gas, maintenance. Budget for replacing your vehicle every 8–10 years." />
          <Field name="Travel" desc="Many retirees spend significantly in their 60s and early 70s (the 'go-go years') while they're healthy and active. This often declines in later years." />
          <Field name="Utilities & Subscriptions" desc="Electric, water, internet, phone, streaming, memberships." />
        </div>

        <Warning>
          Healthcare is the biggest wildcard in retirement planning. If you retire before 65, you'll need to buy
          private insurance until Medicare kicks in — this can cost $800–$1,500+/month for a couple. Budget $20,000+/year
          for healthcare in early retirement, increasing with age.
        </Warning>

        <Tip>
          Use the 'Age-Based Adjustments' in Assumptions to model the well-documented 'retirement spending smile':
          spending is high in early retirement (go-go years), dips in your 70s (slow-go years), then rises again
          with healthcare costs in your 80s (no-go years). Set a spending reduction at age 75 of 10–15%.
        </Tip>
      </div>
    ),
  },
  {
    number: 5,
    title: 'One-Time Events',
    page: 'Events',
    icon: <CalendarDays size={16} />,
    color: 'amber',
    summary: 'Plan for large one-off purchases or windfalls — home sale, inheritance, new car, renovation.',
    content: (
      <div>
        <p className="text-sm text-slate-300 leading-relaxed mb-3">
          One-time events are large purchases or receipts that happen at a specific age.
          They don't repeat — they're a single spike in spending or income that affects your
          portfolio at a particular point in time.
        </p>

        <SectionHeading>Common examples</SectionHeading>
        <div className="rounded-lg border border-slate-700/50 overflow-hidden mb-3">
          <Field name="Home sale (inflow)" desc="If you plan to downsize or sell your primary residence, enter the expected net proceeds as an inflow at your planned sale age. This can significantly boost the projection." />
          <Field name="Inheritance (inflow)" desc="If you expect to receive an inheritance, you can model it here. Be conservative — only include amounts you're reasonably certain of, and at a conservative age estimate." />
          <Field name="New vehicle (outflow)" desc="A $40,000 car purchase at age 65, 73, 81, etc. Easier to model as a one-time event than a recurring expense." />
          <Field name="Home renovation (outflow)" desc="A major kitchen/bathroom remodel or aging-in-place modifications in your 70s." />
          <Field name="Long-term care (outflow)" desc="A lump-sum facility cost or in-home care period. Median nursing home stay is about 2 years; private room averages $100,000+/year." />
          <Field name="Helping children (outflow)" desc="A gift for a child's wedding, down payment help, or education support." />
        </div>

        <SectionHeading>Inflow vs Outflow</SectionHeading>
        <p className="text-xs text-slate-400 mb-2">
          <strong className="text-slate-300">Inflow</strong> = money coming in (home sale, inheritance, business sale).
          It gets added to your 'other income' for that year and reduces your withdrawal need.
          <br /><br />
          <strong className="text-slate-300">Outflow</strong> = money going out (large purchase, gift, expense).
          It gets added to your expenses for that year, requiring a larger withdrawal from your portfolio.
        </p>

        <Tip>
          Don't over-optimize events. It's better to model a slightly higher annual expense than to try to time
          every car purchase and home repair exactly. Use events for truly large, age-specific items ($20,000+).
        </Tip>
      </div>
    ),
  },
  {
    number: 6,
    title: 'Review Assumptions',
    page: 'Assumptions',
    icon: <SlidersHorizontal size={16} />,
    color: 'cyan',
    summary: 'Set the rules the engine uses — investment returns, inflation, taxes, and withdrawal strategy.',
    content: (
      <div>
        <p className="text-sm text-slate-300 leading-relaxed mb-3">
          Assumptions control how the projection engine behaves. The defaults are reasonable starting points,
          but reviewing them takes 5 minutes and makes your projection far more accurate and personal.
        </p>

        <SectionHeading>Investment Returns</SectionHeading>
        <div className="rounded-lg border border-slate-700/50 overflow-hidden mb-3">
          <Field name="Baseline Return" desc="Your best estimate of average annual returns in normal conditions. The S&P 500 has averaged ~10% historically, but a balanced portfolio (stocks + bonds) is typically 6–8%. Default 7% is reasonable." />
          <Field name="Conservative Return" desc="A pessimistic scenario — useful for stress-testing. Think 2008-style: your portfolio drops 30–40% and recovers slowly. Default 4% models a very cautious allocation." />
          <Field name="Aggressive Return" desc="An optimistic scenario. All equities, strong bull market. Default 10% reflects historical S&P 500 returns. Good for 'best case' comparison." />
          <Field name="Active Scenario" desc="Which return rate the current projection uses. Switch between Baseline/Conservative/Aggressive to instantly see how market conditions affect your plan." />
        </div>

        <SectionHeading>Withdrawal Strategy</SectionHeading>
        <p className="text-xs text-slate-400 mb-2 leading-relaxed">
          When your expenses exceed your income, the engine draws from your accounts. The order matters
          enormously for your lifetime tax bill.
        </p>
        <div className="rounded-lg border border-slate-700/50 overflow-hidden mb-3">
          <Field name="Taxable First" desc="Draw from your taxable brokerage and cash first, then 401k/IRA, then Roth last. Preserves tax-free Roth growth as long as possible. Best for most people. ★ Recommended default." />
          <Field name="Pre-Tax First" desc="Draw 401k/IRA early to reduce future Required Minimum Distributions (RMDs). Useful if you have a large 401k that will force large taxable withdrawals at 73+ regardless." />
          <Field name="Dividends First" desc="Use dividend income before touching principal. Good if you have a large dividend portfolio designed to fund retirement." />
          <Field name="Custom Priority" desc="Uses the priority number you set on each account (1 = first, 10 = last). Full control for complex situations." />
        </div>

        <SectionHeading>Age-Based Adjustments</SectionHeading>
        <div className="rounded-lg border border-slate-700/50 overflow-hidden mb-3">
          <Field name="Spending Reduction" desc="Many people naturally spend less in their 70s and 80s as travel and activity slow down. Setting a 10% reduction at age 75 models the 'slow-go years' of retirement." />
          <Field name="Medical Cost Increase" desc="Healthcare costs tend to accelerate in your late 70s and 80s. Setting a 20% bump at age 78 models higher long-term care and medical expenses." />
        </div>

        <SectionHeading>Stress Tests</SectionHeading>
        <div className="rounded-lg border border-slate-700/50 overflow-hidden mb-3">
          <Field name="RMDs (Required Minimum Distributions)" desc="At age 73, the IRS forces you to withdraw a minimum amount from pre-tax accounts each year. Leaving this on gives you a realistic picture of your taxable income in your 70s and 80s." />
          <Field name="Bear Market Stress Test" desc="Applies a 30% portfolio drop in your first year of retirement — the worst possible time for a crash. This stress-tests your 'sequence of returns risk.' If your plan survives this, it's resilient." />
          <Field name="Sequence of Returns Risk" desc="Models poor returns in early retirement followed by good returns later. This is more damaging than poor returns in late retirement because early withdrawals permanently deplete your base." />
        </div>

        <Warning>
          Always run the Conservative Return scenario before feeling good about your plan. If the
          conservative projection has you running out of money in your 80s, you need a bigger portfolio or lower
          spending — not a rosier return assumption.
        </Warning>
      </div>
    ),
  },
  {
    number: 7,
    title: 'Create Scenarios',
    page: 'Scenarios',
    icon: <GitBranch size={16} />,
    color: 'fuchsia',
    summary: 'Create multiple "what if" versions of your plan and compare them side by side.',
    content: (
      <div>
        <p className="text-sm text-slate-300 leading-relaxed mb-3">
          A scenario is a complete, independent copy of your plan with its own accounts, income, expenses,
          and assumptions. Scenarios let you answer questions like: "What if I retire 2 years earlier?",
          "What if my wife takes Social Security at 67 instead of 62?", or "What's the difference between
          7% and 5% market returns?"
        </p>

        <SectionHeading>Your base case scenario</SectionHeading>
        <p className="text-xs text-slate-400 mb-3 leading-relaxed">
          When you first open RetireVision, a default scenario called "Base Case" is created. This is your
          primary plan. Anything you enter on the Accounts, Income, Expenses, Events, and Assumptions pages
          goes into the currently active scenario (shown at the bottom of the sidebar).
        </p>

        <SectionHeading>Creating new scenarios</SectionHeading>
        <p className="text-xs text-slate-400 mb-2 leading-relaxed">
          The best way to create a new scenario is to <strong className="text-slate-300">duplicate</strong> an
          existing one (click the copy icon on any scenario card). This gives you an identical starting point
          that you can then modify — change one assumption, adjust one income stream, and re-run to see the difference.
        </p>

        <div className="rounded-lg border border-slate-700/50 overflow-hidden mb-3">
          <Field name="Retire at 60 vs 62 vs 65" desc="Three scenarios with identical data but different retirement ages in Settings. See exactly how much each extra year of work is worth." />
          <Field name="Conservative vs Aggressive Returns" desc="Same scenario, but change Active Return Scenario in Assumptions. Instantly see the range of outcomes without touching other data." />
          <Field name="Social Security at 62 vs 67 vs 70" desc="Change the Social Security income start age across three scenarios. Earlier means smaller checks; later means bigger ones. The breakeven age is typically 82–84." />
          <Field name="With vs Without Spouse Working" desc="One scenario with a spouse income stream, one without. Quantifies the value of a few extra years of dual income." />
          <Field name="Downsize at 70" desc="Add a $150,000 home sale windfall event at age 70 in one scenario. See how much it extends your runway." />
        </div>

        <SectionHeading>The active scenario</SectionHeading>
        <p className="text-xs text-slate-400 mb-2 leading-relaxed">
          The dropdown at the bottom of the sidebar sets which scenario is 'active.' All the data pages
          (Accounts, Income, Expenses, etc.) show and edit data for the <strong className="text-slate-300">active scenario only</strong>.
          Switch scenarios there to view or edit a different plan.
        </p>

        <Tip>
          Name your scenarios clearly: "Base — Retire 62", "Early Retire 60", "Conservative Returns". When you're
          looking at comparison charts later, clear names save a lot of confusion.
        </Tip>
      </div>
    ),
  },
  {
    number: 8,
    title: 'Run & Read Projections',
    page: 'Projections',
    icon: <LineChart size={16} />,
    color: 'teal',
    summary: 'Run the engine and interpret your charts — net worth, income gap, tax drag, and survival age.',
    content: (
      <div>
        <p className="text-sm text-slate-300 leading-relaxed mb-3">
          Once you've entered your data, click <strong className="text-slate-200">Run Projection</strong> on the
          Projections page (or the ▶ play button on any Scenario card). The engine simulates every year of
          your life from now until your projection end age and shows you the results.
        </p>

        <SectionHeading>Dashboard summary cards</SectionHeading>
        <div className="rounded-lg border border-slate-700/50 overflow-hidden mb-3">
          <Field name="Portfolio at Retirement" desc="Your total investable net worth the year you retire. This is the 'nest egg' number everyone talks about. Does NOT include pension or SS — those are income, not assets." />
          <Field name="Monthly Retirement Income" desc="Total income in your first year of retirement divided by 12. Includes pension, SS, dividends, AND portfolio withdrawals needed to cover expenses." />
          <Field name="Monthly Spending Target" desc="Your projected annual expenses in year 1 of retirement divided by 12. Compare this to your income — are they close? Is there a gap?" />
          <Field name="Monthly Surplus / Gap" desc="Income minus expenses minus taxes in your first retirement year. Positive = you have breathing room. Negative = you'll need to reduce spending or save more." />
          <Field name="Portfolio Survival Age" desc="The last age at which your portfolio still has a positive balance. If this is 91 and your projection end age is 90, you're fine. If it's 78, you have a serious gap to address." />
        </div>

        <SectionHeading>The charts</SectionHeading>
        <div className="rounded-lg border border-slate-700/50 overflow-hidden mb-3">
          <Field name="Portfolio Value (Net Worth)" desc="Your total investable assets over time. You'll see it grow pre-retirement, peak at retirement, then decline as you draw it down. The line should stay above zero until your projection end age." />
          <Field name="Account Balances by Type" desc="Stacked by tax bucket: Roth (green), Pre-Tax 401k (blue), Taxable brokerage (amber), Cash (gray). Shows when each bucket depletes and in what order." />
          <Field name="Income vs Expenses" desc="The gap between what comes in and what goes out each year. The shaded area shows your income sources stacked up. The line is your spending. When the line exceeds the area, you're drawing down faster than sustainable." />
          <Field name="Withdrawal Mix" desc="Where your money is coming from each year: pension, SS, dividends, and portfolio withdrawals. A healthy plan has significant pension/SS income that reduces the portfolio withdrawal burden." />
          <Field name="Annual Tax Burden" desc="Federal and state taxes paid each year in retirement. A large pre-tax 401k means large taxable withdrawals — which means large tax bills. The Roth conversion strategy in Assumptions can reduce this." />
        </div>

        <SectionHeading>What to look for</SectionHeading>
        <div className="space-y-2 mb-3">
          <div className="flex gap-2 items-start">
            <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300">Portfolio stays above zero through your projection end age ✓</p>
          </div>
          <div className="flex gap-2 items-start">
            <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300">Monthly income covers monthly spending with some surplus ✓</p>
          </div>
          <div className="flex gap-2 items-start">
            <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300">Plan survives the Conservative return scenario ✓</p>
          </div>
          <div className="flex gap-2 items-start">
            <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300">If portfolio runs out before age 85 — investigate immediately</p>
          </div>
          <div className="flex gap-2 items-start">
            <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300">If tax drag is very high in your 70s — consider a Roth conversion strategy</p>
          </div>
        </div>

        <Note>
          Any time you change accounts, income, or expenses, the projection results become stale. An amber
          banner will appear at the top of the Projections page reminding you to re-run. The Scenario cards
          also show when the last projection was run.
        </Note>
      </div>
    ),
  },
];

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const faqs = [
  {
    q: 'What order should I enter everything?',
    a: (
      <p>
        Follow the 8 steps in this guide in order: <strong>Settings → Accounts → Income → Expenses → Events → Assumptions → Scenarios → Projections</strong>.
        The most important are Accounts (what you have) and Expenses (what you'll spend). Income streams like pension
        and Social Security come next. Assumptions you can revisit anytime — the defaults are reasonable starting points.
      </p>
    ),
  },
  {
    q: 'I added accounts but the projections page shows nothing. Why?',
    a: (
      <p>
        You need to click <strong>Run Projection</strong> (the blue play button on the Projections page or on any
        Scenario card). The engine doesn't run automatically when you add data. After running, if you change any
        data, an amber banner will prompt you to re-run.
      </p>
    ),
  },
  {
    q: "What's the difference between an Account and an Income Stream?",
    a: (
      <p>
        <strong>Accounts</strong> are assets with a balance that grows over time (401k, Roth IRA, brokerage, HYSA).
        <br /><br />
        <strong>Income Streams</strong> are regular payments that start at a specific age (part-time work, rental income).
        <br /><br />
        <strong>Pension and Social Security</strong> sit in between — enter them as Accounts with a monthly income amount
        and start age. The engine automatically converts them to income. Don't add them on both pages or they'll
        be double-counted.
      </p>
    ),
  },
  {
    q: 'When should I take Social Security — 62, 67, or 70?',
    a: (
      <div>
        <p className="mb-2">This is one of the biggest decisions in retirement planning. Here's the math:</p>
        <ul className="list-disc list-inside space-y-1 text-sm mb-2">
          <li><strong>Age 62:</strong> You collect for more years but at ~75% of your full benefit</li>
          <li><strong>Age 67 (full retirement age for most):</strong> 100% of your benefit</li>
          <li><strong>Age 70:</strong> ~132% of your full benefit — the maximum</li>
        </ul>
        <p className="mb-2">The breakeven point (where delayed claiming pays off) is typically around age 82–84.
        If you expect to live past 82 and don't desperately need the income, waiting until 67 or 70 is usually the
        better mathematical choice.</p>
        <p>Create three scenarios with SS starting at 62, 67, and 70 to see exactly how it affects your specific plan.</p>
      </div>
    ),
  },
  {
    q: 'What is the 4% rule and should I use it?',
    a: (
      <div>
        <p className="mb-2">
          The 4% rule says you can safely withdraw 4% of your portfolio in year 1 of retirement, adjusted for
          inflation each year, and historically your money would last 30 years. It's a useful rule of thumb.
        </p>
        <p className="mb-2">
          <strong>Example:</strong> $1,000,000 portfolio × 4% = $40,000/year withdrawal.
        </p>
        <p>
          RetireVision goes beyond this — it models your specific income sources (pension, SS, dividends) which
          <em> reduce</em> how much you need to withdraw from the portfolio. If your pension + SS covers $50,000 of
          a $70,000 spending target, you only need to withdraw $20,000 — a 2% withdrawal rate on a $1M portfolio.
          This is far safer than the blanket 4% rule.
        </p>
      </div>
    ),
  },
  {
    q: 'How do I model retiring earlier to see if it is possible?',
    a: (
      <p>
        Duplicate your base case scenario, then go to Settings and change the Target Retirement Age in the new
        scenario. Re-run the projection and compare the two scenarios side by side. The comparison will show
        you exactly how much earlier retirement costs in portfolio value, income gap, and survival age.
      </p>
    ),
  },
  {
    q: 'Roth IRA vs Traditional 401k — which is better?',
    a: (
      <div>
        <p className="mb-2">
          <strong>Traditional 401k:</strong> You save taxes now (contributions are pre-tax) but pay taxes on every
          dollar you withdraw in retirement. Better if you expect to be in a <em>lower</em> tax bracket in retirement.
        </p>
        <p className="mb-2">
          <strong>Roth IRA/401k:</strong> You pay taxes now but all growth and withdrawals are tax-free forever.
          Better if you expect to be in a <em>higher or equal</em> tax bracket in retirement, or if you want
          flexibility (no RMDs, can pass to heirs tax-free).
        </p>
        <p>
          Most financial planners recommend a mix: maximize your 401k to get the employer match (free money),
          then contribute to a Roth IRA. If your 401k has Roth option, consider splitting contributions.
        </p>
      </div>
    ),
  },
  {
    q: 'What is a Required Minimum Distribution (RMD)?',
    a: (
      <p>
        At age 73, the IRS requires you to withdraw a minimum amount from pre-tax accounts (traditional
        401k, traditional IRA) each year whether you need the money or not. The amount is calculated based
        on your account balance and IRS life expectancy tables. These withdrawals are taxable income, which
        can push you into a higher tax bracket and increase your Medicare premiums. This is why having some
        Roth assets is valuable — Roth accounts have no RMDs.
      </p>
    ),
  },
  {
    q: 'My spouse and I have separate accounts. How do I enter both?',
    a: (
      <p>
        Enter all accounts on the Accounts page and set the <strong>Owner</strong> field to 'Self', 'Spouse',
        or 'Joint'. The projection models the household as a whole — all accounts, all income streams, all
        expenses together. The owner field is primarily for tracking and organization, not for separate
        projections. If you want to model one person's finances independently, create a separate scenario.
      </p>
    ),
  },
  {
    q: 'How accurate are these projections?',
    a: (
      <div>
        <p className="mb-2">
          They're planning tools, not predictions. The projection is as accurate as your inputs and
          assumptions — and the future is genuinely uncertain. Use them to:
        </p>
        <ul className="list-disc list-inside space-y-1 mb-2 text-sm">
          <li>Understand the general shape of your financial future</li>
          <li>Compare decisions (retire earlier vs later, SS at 62 vs 70)</li>
          <li>Stress test your plan against bad scenarios</li>
          <li>Identify specific weaknesses (healthcare gap, sequence of returns, tax drag)</li>
        </ul>
        <p>
          Always run the Conservative scenario. If your plan only works under optimistic assumptions,
          you need to save more or spend less.
        </p>
      </div>
    ),
  },
];

// ─── Main component ───────────────────────────────────────────────────────────

export default function Instructions() {
  const [openStep, setOpenStep] = useState<number | null>(1);

  const colorMap: Record<string, string> = {
    blue:    'bg-blue-500/15 text-blue-400 border-blue-500/30',
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    violet:  'bg-violet-500/15 text-violet-400 border-violet-500/30',
    rose:    'bg-rose-500/15 text-rose-400 border-rose-500/30',
    amber:   'bg-amber-500/15 text-amber-400 border-amber-500/30',
    cyan:    'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    fuchsia: 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30',
    teal:    'bg-teal-500/15 text-teal-400 border-teal-500/30',
  };

  const borderMap: Record<string, string> = {
    blue:    'border-blue-500/40',
    emerald: 'border-emerald-500/40',
    violet:  'border-violet-500/40',
    rose:    'border-rose-500/40',
    amber:   'border-amber-500/40',
    cyan:    'border-cyan-500/40',
    fuchsia: 'border-fuchsia-500/40',
    teal:    'border-teal-500/40',
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20 border border-slate-700 flex items-center justify-center flex-shrink-0">
          <BookOpen size={22} className="text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-100">Getting Started Guide</h1>
          <p className="text-slate-400 text-sm mt-1 leading-relaxed">
            A complete walkthrough for building your retirement plan from scratch.
            Follow the 8 steps in order, then use the FAQ at the bottom for common questions.
          </p>
        </div>
      </div>

      {/* Quick overview strip */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">The 8-step workflow</p>
        <div className="flex flex-wrap gap-2">
          {steps.map((step) => (
            <button
              key={step.number}
              onClick={() => setOpenStep(step.number === openStep ? null : step.number)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${colorMap[step.color]}`}
            >
              <span className="opacity-70">{step.number}.</span>
              {step.title}
            </button>
          ))}
        </div>
      </div>

      {/* Steps */}
      {steps.map((step) => {
        const isOpen = openStep === step.number;
        return (
          <div
            key={step.number}
            className={`border rounded-xl overflow-hidden transition-all ${isOpen ? borderMap[step.color] : 'border-slate-700/50'} bg-slate-800/40`}
          >
            {/* Header row */}
            <button
              onClick={() => setOpenStep(isOpen ? null : step.number)}
              className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-700/20 transition-colors"
            >
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${colorMap[step.color]}`}>
                {step.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs text-slate-500 font-medium">Step {step.number}</span>
                  <ArrowRight size={10} className="text-slate-600" />
                  <span className="text-xs text-slate-500">{step.page}</span>
                </div>
                <h2 className="text-sm font-semibold text-slate-100">{step.title}</h2>
                {!isOpen && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{step.summary}</p>}
              </div>
              {isOpen
                ? <ChevronUp size={16} className="text-slate-500 flex-shrink-0" />
                : <ChevronDown size={16} className="text-slate-500 flex-shrink-0" />}
            </button>

            {/* Body */}
            {isOpen && (
              <div className="px-5 pb-5 border-t border-slate-700/40">
                <div className="pt-4">
                  {step.content}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* FAQ section */}
      <div className="pt-2">
        <div className="flex items-center gap-3 mb-4">
          <HelpCircle size={18} className="text-slate-400" />
          <h2 className="text-base font-semibold text-slate-200">Frequently Asked Questions</h2>
        </div>
        <div>
          {faqs.map((item, i) => (
            <QA key={i} q={item.q}>{item.a}</QA>
          ))}
        </div>
      </div>

      {/* Footer tips */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Star size={14} className="text-amber-400" />
          <p className="text-sm font-semibold text-slate-200">Pro Tips</p>
        </div>
        <div className="flex gap-2.5">
          <Clock size={13} className="text-slate-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400 leading-relaxed">
            <strong className="text-slate-300">Update once a year.</strong> At the start of each year, update your
            account balances, adjust your projected retirement age if it changed, and re-run projections. A 30-minute
            annual review keeps your plan current.
          </p>
        </div>
        <div className="flex gap-2.5">
          <DollarSign size={13} className="text-slate-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400 leading-relaxed">
            <strong className="text-slate-300">Expenses matter more than returns.</strong> A 1% improvement in
            investment returns helps, but a 10% reduction in retirement spending has a 5x larger impact on your plan.
            Know your spending number precisely.
          </p>
        </div>
        <div className="flex gap-2.5">
          <GitBranch size={13} className="text-slate-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400 leading-relaxed">
            <strong className="text-slate-300">Always have a conservative scenario.</strong> Before you feel good
            about your plan, make sure it works with a conservative return assumption (4–5%). If it only works
            at 7%+ returns, you need more buffer.
          </p>
        </div>
      </div>
    </div>
  );
}
