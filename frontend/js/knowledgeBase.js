/**
 * knowledgeBase.js
 * Static election knowledge: wizard steps, FAQs, glossary, key dates.
 * This data is used by the wizard and as fallback content for the chat.
 */

const KNOWLEDGE_BASE = {
  steps: [
    {
      id: 1,
      icon: "📋",
      title: "Voter Registration",
      subtitle: "Get your name on the electoral roll",
      color: "#FF9933",
      description:
        "Voter registration is the first and most critical step. You must be registered to participate in any election. The Election Commission of India (ECI) maintains the electoral rolls.",
      checklist: [
        "Confirm eligibility: 18+ years, Indian citizen",
        "Visit voterportal.eci.gov.in or the Voter Helpline App",
        "Fill Form 6 for new registration",
        "Upload Aadhaar, address proof, and passport photo",
        "Check your application status online",
        "Receive your EPIC (Voter ID card)",
      ],
      tips: [
        "Registration closes ~10 weeks before election day",
        "You can also register offline at your BLO (Booth Level Officer)",
        "Check your name on the voter list at nvsp.in",
        "SMS 'EPIC <voter-id>' to 1950 to verify registration",
      ],
      quickQuestion: "How do I register as a voter in India?",
    },
    {
      id: 2,
      icon: "🔍",
      title: "Candidate Research",
      subtitle: "Know who you're voting for",
      color: "#4CAF50",
      description:
        "Understanding the candidates on your ballot is essential for making an informed choice. The ECI mandates candidates to declare their assets, liabilities, and criminal records.",
      checklist: [
        "Find your Lok Sabha / Vidhan Sabha constituency",
        "Check candidate affidavits on affidavit.eci.gov.in",
        "Research candidate backgrounds and past performance",
        "Review party manifestos",
        "Attend local election rallies or debates",
        "Use the Know Your Candidate app by ECI",
      ],
      tips: [
        "All candidates must publicly declare criminal cases, assets & education",
        "NOTA (None of the Above) is always an option on the EVM",
        "Your constituency is determined by your registered address",
        "Voter slips from the Booth Level Officer list your polling station",
      ],
      quickQuestion: "How do I find information about candidates in my constituency?",
    },
    {
      id: 3,
      icon: "🗳️",
      title: "Understand the Ballot",
      subtitle: "Learn how the EVM works",
      color: "#2196F3",
      description:
        "India uses Electronic Voting Machines (EVMs) instead of paper ballots. Understanding how to use them correctly ensures your vote counts.",
      checklist: [
        "Learn to identify the EVM (Ballot Unit + Control Unit)",
        "Understand the VVPAT (paper slip verification)",
        "Familiarise yourself with candidate symbols",
        "Know what NOTA means and how to choose it",
        "Understand the process: press button → confirm VVPAT slip",
        "Check for mock polls at your booth on election morning",
      ],
      tips: [
        "The EVM is tamper-proof and not connected to the internet",
        "VVPAT shows a paper slip of your chosen candidate for 7 seconds",
        "Each voter gets exactly one vote — the EVM locks after each vote",
        "Mock polls are conducted before voting begins to check EVM integrity",
      ],
      quickQuestion: "How does the EVM voting machine work?",
    },
    {
      id: 4,
      icon: "📅",
      title: "Election Day Prep",
      subtitle: "Get ready before you go",
      color: "#9C27B0",
      description:
        "Preparation ensures you can vote without any issues. Know your polling booth, carry the right documents, and plan your visit.",
      checklist: [
        "Check your polling booth on voterportal.eci.gov.in",
        "Note booth address and polling hours (usually 7AM – 6PM)",
        "Carry your Voter ID (EPIC) or any 12 approved alternatives",
        "Download your voter slip from the ECI Voter Helpline App",
        "Wear comfortable clothes — do not display party symbols",
        "Check the Model Code of Conduct (no campaign within 48 hrs of voting)",
      ],
      tips: [
        "12 alternative IDs accepted: Aadhaar, Passport, PAN, Driving Licence, etc.",
        "Senior citizens (80+) and PwD voters get priority queuing",
        "Home voting facility available for PwD and elderly — apply in advance",
        "Polling is a paid holiday — employers must grant time off",
      ],
      quickQuestion: "What documents do I need to bring to vote?",
    },
    {
      id: 5,
      icon: "✅",
      title: "Cast Your Vote",
      subtitle: "Step-by-step at the polling booth",
      color: "#FF5722",
      description:
        "The actual voting process is straightforward. Election officials guide voters through each step. Your vote is completely secret.",
      checklist: [
        "Join the queue at your designated polling booth",
        "Show ID to the Presiding Officer at Table 1",
        "Get your voter slip verified and sign/thumbprint the register",
        "Receive the permission to vote from the officer",
        "Enter the EVM voting compartment alone",
        "Press the button next to your chosen candidate",
        "Verify the VVPAT paper slip (shows for 7 seconds)",
        "Get indelible ink mark on your left index finger",
        "Leave the booth — voting complete!",
      ],
      tips: [
        "The entire process takes about 5 minutes per voter",
        "No mobile phones or cameras allowed inside the booth",
        "Your vote is completely secret — no one can trace your choice",
        "If the EVM malfunctions, inform the Presiding Officer immediately",
      ],
      quickQuestion: "What is the step-by-step voting process at the polling booth?",
    },
    {
      id: 6,
      icon: "📊",
      title: "Results & Beyond",
      subtitle: "How votes are counted and winners declared",
      color: "#00BCD4",
      description:
        "After polling ends, votes are carefully counted under the supervision of ECI observers. The entire process is transparent and observed by candidate representatives.",
      checklist: [
        "Counting starts at 8 AM on the counting date",
        "Counting centres are announced by ECI in advance",
        "Candidate agents and ECI observers monitor counting",
        "Electronic tallies are displayed on ECI results portal",
        "Winner receives a certificate from the Returning Officer",
        "Winning candidate takes oath in Parliament/Assembly",
      ],
      tips: [
        "EVM results are tallied machine-by-machine, not constituency total",
        "Results are updated live on results.eci.gov.in",
        "Candidates can demand an EVM verification if margin is very close",
        "Any disputes are filed in the High Court within 45 days of results",
      ],
      quickQuestion: "How are votes counted after election day in India?",
    },
  ],

  faqs: [
    {
      q: "What is the minimum age to vote in India?",
      a: "You must be 18 years or older as of January 1 of the year of the electoral roll revision.",
    },
    {
      q: "Can NRIs vote in Indian elections?",
      a: "Yes! NRIs can register as overseas voters under Section 20A of the Representation of the People Act, 1950. They must appear in person at their registered constituency to vote.",
    },
    {
      q: "What is NOTA?",
      a: "NOTA stands for None of the Above. It's an option on the EVM that lets voters reject all candidates. If NOTA gets the most votes, the candidate with the next highest votes still wins (NOTA cannot declare a no-contest).",
    },
    {
      q: "What is the Model Code of Conduct?",
      a: "The MCC is a set of guidelines issued by the ECI that comes into force immediately after the election schedule is announced. It restricts political parties and candidates from making promises that may influence voters, using government resources for campaigning, and conducting rallies within 48 hours of polling.",
    },
    {
      q: "How do I find my polling booth?",
      a: "Visit voterportal.eci.gov.in or use the Voter Helpline App. Enter your EPIC number or personal details to find your booth address, booth number, and polling officer's name.",
    },
    {
      q: "What if my name is missing from the voter list?",
      a: "File a complaint with your Booth Level Officer (BLO) or on the National Voters' Service Portal. You can also call the ECI helpline at 1950.",
    },
    {
      q: "Is voting compulsory in India?",
      a: "No, voting is not compulsory in India at the national level. However, it is a fundamental civic duty. Some states like Gujarat have made local body voting compulsory.",
    },
    {
      q: "How many seats are there in Lok Sabha?",
      a: "The Lok Sabha has 543 directly elected seats. A party or coalition needs 272 seats (simple majority) to form the government.",
    },
  ],

  glossary: [
    { term: "ECI", definition: "Election Commission of India — the constitutional body that conducts all elections." },
    { term: "EVM", definition: "Electronic Voting Machine — the tamper-proof device used for casting votes in India." },
    { term: "VVPAT", definition: "Voter Verifiable Paper Audit Trail — prints a paper slip showing the candidate you voted for, visible for 7 seconds." },
    { term: "NOTA", definition: "None of the Above — an EVM option to reject all candidates." },
    { term: "EPIC", definition: "Elector's Photo Identity Card — the official Voter ID card issued by ECI." },
    { term: "MCC", definition: "Model Code of Conduct — ECI guidelines restricting campaigns once elections are announced." },
    { term: "BLO", definition: "Booth Level Officer — local official responsible for maintaining the electoral roll in a polling area." },
    { term: "NVSP", definition: "National Voters' Service Portal — voterportal.eci.gov.in — for all voter services online." },
    { term: "Lok Sabha", definition: "House of the People — lower house of Parliament with 543 elected members." },
    { term: "Vidhan Sabha", definition: "State Legislative Assembly — the state-level elected legislature." },
    { term: "Constituency", definition: "A defined geographical area represented by one elected member." },
    { term: "Returning Officer", definition: "A government official responsible for conducting an election in a constituency." },
    { term: "Affidavit", definition: "A sworn declaration by candidates disclosing criminal cases, assets, and liabilities — mandatory for all candidates." },
  ],

  quickQuestions: [
    "How do I register to vote?",
    "What documents do I need to vote?",
    "How does the EVM work?",
    "What is NOTA and how do I use it?",
    "How do I find my polling booth?",
    "What is the Model Code of Conduct?",
    "How are election results counted?",
    "Can NRIs vote in Indian elections?",
  ],
};
