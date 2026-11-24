import type { BillTranslationSeed } from "./bill-translations-data";
import { r8_3GianKey, r8_3NinteiKey } from "./shinjuku-r8-3-inventory";

// Reference translations of the composed Japanese normal entries. Human approval
// belongs to Admin; these drafts do not establish reviewed or publication status.
const draft = {
  difficulty_level: "normal",
  locale: "en",
  status: "generated",
  model: "gpt-6.1-sol",
  prompt_version: "r8-3-en-2026-11-24",
} as const;

const passed = `Submitted to the third regular session of 2026 (Reiwa 8), held from September 16 to October 15, this bill was passed as originally proposed (原案可決). This result was confirmed on the city's voting results page, updated October 15, 2026.`;
const certified = `Submitted to the third regular session of 2026 (Reiwa 8), held from September 16 to October 15, this item was certified (認定). This result was confirmed on the city's voting results page, updated October 15, 2026.`;
const unanimous = `According to "Bill Summaries and Deliberation Results," all 9 parliamentary groups voted for it. These are the positions of parliamentary groups.`;
const divided = `The parliamentary group positions in "Bill Summaries and Deliberation Results" are as follows.

- For (7 parliamentary groups): LDP and Sanseito Club (自民・参政クラブ), Komeito, Shinjuku City Council (新宿区議会公明党), Shinjuku Mirai no Kai (新宿未来の会), Constitutional Democratic Party and Independents Club (立憲民主党・無所属クラブ), Japan Innovation Party, Shinjuku City Council Group (日本維新の会・新宿区議団), Shinjuku for the Working Generation, Tax Cut Group (現役世代に優しい新宿・減税の会), Update Shinjuku (アップデート新宿)
- Against (2 parliamentary groups): Japanese Communist Party Group, Shinjuku City Council (日本共産党新宿区議会議員団), Inochi no To Shinjuku (いのちの党 新宿)`;
const voteAbsence = `Neither the voting results page nor "Bill Summaries and Deliberation Results" gives the date of the vote or the votes of individual members of the parliamentary groups.`;
const reasonsAbsence = `The reasons for each parliamentary group's position, their debates, and the content of committee examinations cannot be confirmed.`;

export const r8_3BillTranslationsWithBillSlug: BillTranslationSeed[] = [
  {
    ...draft,
    bill_slug: r8_3GianKey(63),
    source_hash:
      "v1:d2f448280049badd9852ab6f5d6d97dfbddba0067ef63ae8b85f140675656d3b",
    title:
      "Temporary child-rearing support payments and responses to price and fare revisions (General Account supplementary budget No. 4)",
    summary:
      "This supplementary budget adds ¥514,734,000 to the General Account. It includes temporary child-rearing support payments of ¥10,000 per child to child allowance recipients, preparing stockpiled supplies, full subsidies for businesses' loan credit guarantee fees, an increase in welfare taxi vouchers and a response to revised public bath charges, and revised childcare and kindergarten benefit rates. Most funding comes from a withdrawal of ¥437,017,000 from the Fiscal Adjustment Fund.",
    content: `# Temporary child-rearing support payments and responses to price and fare revisions (General Account supplementary budget No. 4)

The Mayor submitted this supplementary budget for the fiscal 2026 (Reiwa 8) General Account on September 16, 2026. It adds 514,734 thousand yen to both revenue and expenditure, bringing the General Account total to 190,097,732 thousand yen.

## What the money is for

### Temporary child-rearing support payments (380,000 thousand yen)

The city's summary materials describe the purpose as "providing temporary payments to households raising children whose household finances are heavily affected by rising prices." (our translation; the same applies to the quotations below)

| Item | Details |
|------|------|
| Eligible recipients | Recipients of the child allowance for September 2026 (Reiwa 8) |
| Payment amount | ¥10,000 per child |

An additional 8,475 thousand yen is allocated for administrative expenses, including bank transfer fees, mailing notices and other materials, contracted system modifications, and staff allowances.

### Improving stockpiled supplies (32,604 thousand yen)

This is for "preparing stockpiled supplies following the provision of relief supplies and other support to areas affected by the 2026 (Reiwa 8) Kumamoto earthquake."

### Support for business loans (46,991 thousand yen)

- Loan credit guarantee fee subsidies, 45,784 thousand yen: These fully subsidize loan credit guarantee fees to support businesses affected by the situation in the Middle East. Eligible programs are commercial and industrial loans, local industry promotion loans, small enterprise loans, special small enterprise loans, business support loans, and debt consolidation loans. The number of subsidies increases from 310 to 453.
- Interest subsidies, totaling 1,207 thousand yen: The number of cases increases with the expansion of guarantee fee subsidies (small enterprise loans: 264→288; special small enterprise loans: 200→218; business support loans: 18→19; debt consolidation loans: 34→37).

### Welfare taxi vouchers and public baths (35,400 thousand yen)

- Taxi fare assistance for people with physical or mental disabilities, 20,470 thousand yen: Following revised taxi fares, the monthly value of welfare taxi vouchers increases from ¥4,000 to ¥4,400.
- Health promotion for older people (community bathing), 14,930 thousand yen: Following revised public bath charges in Tokyo (ages 12 and over: ¥550→¥600), payments to the public bath association under the service contract increase.

### Revised childcare and kindergarten benefit rates (children and family expenditure and education expenditure)

Rates are revised as follows in line with the revised unit rates for benefits for the use of facilities and services.

| Program | Category | Current | Revised |
|------|------|------|------|
| Benefits for facility and service use (unlicensed childcare facilities, etc.) | Classes for ages 0–2 (monthly) | ¥42,000 | ¥45,700 |
| Same as above | Classes for ages 3–5 (monthly) | ¥37,000 | ¥40,300 |
| Subsidy to reduce parents' costs at unlicensed childcare facilities | Classes for ages 0–2 (monthly) | ¥38,000 | ¥34,300 |
| Same as above | Classes for ages 3–5 (monthly) | ¥40,000 | ¥36,700 |
| Benefits for facility and service use (temporary childcare, extended childcare, etc.) | Daily | ¥450 | ¥490 |
| Benefits for facility and service use (private kindergartens, etc.) | Monthly | ¥25,700 | ¥28,000 |
| Childcare fee subsidy for kindergarten-like facilities | Monthly | ¥21,000–¥25,400 | ¥22,800–¥27,200 |
| Extended childcare fee subsidy for children who have turned 3 | Monthly | ¥16,300 | ¥17,700 |

The subsidy to reduce parents' costs decreases by 866 thousand yen for Tokyo-certified childcare centers and by 2,378 thousand yen for other unlicensed childcare facilities.

## Where the money comes from

| Revenue category | Adjustment | Main components |
|------|--------|------|
| National government disbursements | 7,122 thousand yen | Contributions toward benefits for facility and service use |
| Tokyo Metropolitan Government disbursements | 70,595 thousand yen | Temporary regional revitalization grant for priority support in response to rising prices: 59,504 thousand yen; support for evacuees' daily lives and related activities: 9,413 thousand yen; and other items |
| Transfers in | 437,017 thousand yen | Transfers from the Fiscal Adjustment Fund |

This withdrawal of 437,017 thousand yen from the Fiscal Adjustment Fund leaves a projected fiscal 2026 (Reiwa 8) year-end balance of 29,011,119 thousand yen.

## Changes to debt-burden commitments

The ceiling for interest subsidies on commercial and industrial loans increases from 133,073 thousand yen to 143,994 thousand yen (covering fiscal 2027–2036, Reiwa 9–18). The summary materials give the reason as "increasing interest subsidies in response to an increase in the number of loans."

## What happened to this bill

${passed}

${unanimous}

${voteAbsence}

## What the materials do not say

The materials do not state the number of eligible children, when payments will be made, whether an application is required, or the items to be stockpiled. They also do not show how parents' costs will change when the reduction in the cost-reduction subsidy and the increase in benefits for facility and service use are taken together.

${reasonsAbsence}`,
  },
  {
    ...draft,
    bill_slug: r8_3GianKey(64),
    source_hash:
      "v1:267cf3e38e2508827659a67a218517894f6274c70baff029d65cea9987a0782c",
    title:
      "Depositing the previous year's balance in the Fiscal Adjustment Fund and returning excess national and Tokyo disbursements (General Account supplementary budget No. 5)",
    summary:
      "This supplementary budget adds ¥2,592,329,000 to the General Account. Funded mainly by the balance carried forward from fiscal 2025 (Reiwa 7), it deposits ¥1,690,479,000 in the Fiscal Adjustment Fund and returns excess national and Tokyo Metropolitan Government disbursements. It also includes anti-littering patrols and contracted design work for Ushigome Daiichi Junior High School and a community library within the school.",
    content: `# Depositing the previous year's balance in the Fiscal Adjustment Fund and returning excess national and Tokyo disbursements (General Account supplementary budget No. 5)

The Mayor submitted this supplementary budget for the fiscal 2026 (Reiwa 8) General Account on September 16, 2026. It adds 2,592,329 thousand yen to both revenue and expenditure, bringing the General Account total to 192,690,061 thousand yen.

## Where the money comes from

Most funding comes from the balance carried forward from the fiscal 2025 (Reiwa 7) settlement.

| Revenue category | Adjustment | Components |
|------|--------|------|
| Balance carried forward from the previous fiscal year | 2,555,762 thousand yen | This allocation is in addition to 2,000,000 thousand yen already allocated from the fiscal 2025 (Reiwa 7) net balance carried forward of 5,380,958 thousand yen (825,196 thousand yen remains unallocated) |
| Tokyo Metropolitan Government disbursements | 21,831 thousand yen | Maternal and child health support: 1,518 thousand yen / tourism promotion in harmony with local life: 20,313 thousand yen |
| Miscellaneous revenue | 12,771 thousand yen | Refunds of prior-year subsidies, including subsidies for childcare facility development |
| National government disbursements | 1,518 thousand yen | Maternal and child health and hygiene expenditure |
| Donations | 447 thousand yen | Earmarked donations to the Collaboration Promotion Fund, Natsume Soseki Memorial Facility Development Fund, Welfare Activities for People with Disabilities Fund, and Children's Future Fund |

## What the money is for

### Deposit in the Fiscal Adjustment Fund (1,690,479 thousand yen)

The summary materials calculate the deposit as "1/2 of the fiscal 2025 net balance carried forward of ¥5,380,957,580," (our translation; the same applies to the quotations below) less "¥1,000,000,000 allocated in the initial budget (rounded up to the nearest thousand yen)." After the deposit, the projected fiscal 2026 (Reiwa 8) year-end balance is 30,701,598 thousand yen.

### Repayment of excess national and Tokyo disbursements

Amounts received in excess from the national and Tokyo Metropolitan governments are returned.

| Category | Repayment | Main items (summary materials) |
|------|------|------|
| Welfare expenditure | 285,686 thousand yen | Public assistance (national and Tokyo), benefits supporting independence for people with disabilities (national and Tokyo), comprehensive subsidies for measures for older people (Tokyo), etc. |
| Children and family expenditure | 348,639 thousand yen | Babysitter use support (Tokyo), child and child-rearing support grants (national), comprehensive childcare support grants (national), etc. |
| Health expenditure | 160,559 thousand yen | Childbirth and child-rearing support (Tokyo), support benefit grants for pregnant women (national), comprehensive health and medical policy subsidies (Tokyo), etc. |
| Education expenditure | 39,563 thousand yen | Temporary childcare (Tokyo), benefits for facility and service use (national and Tokyo), projects creating opportunities to interact with diverse others (Tokyo), etc. |
| Culture, tourism and industry expenditure | 1,742 thousand yen | Comprehensive subsidies for measures for people with disabilities; temporary regional revitalization grants responding to novel coronavirus infections |
| Community promotion expenditure | 1,168 thousand yen | Comprehensive subsidies for measures for people with disabilities; support for a second life in the era of 100-year lifespans |

### Preventing littering and keeping the city clean (25,393 thousand yen)

Anti-littering measures are strengthened following an amendment to the Shinjuku City Ordinance on Preventing Scattered Empty Cans and Other Litter and Harm from Street Smoking. Anti-littering patrols cover the areas around the east and west exits of Shinjuku Station, from 5 p.m. to 7 a.m. the following morning.

### Design of Ushigome Daiichi Junior High School

- Construction of Ushigome Daiichi Junior High School (contracted design fee): 11,440 thousand yen
- Construction of the community library within Ushigome Daiichi Junior High School (contracted design fee): 1,560 thousand yen

Both use the former site of Tokyo Metropolitan Ichigaya Commercial High School and other land. Because the design work spans 2 fiscal years, debt-burden commitments (債務負担行為) through fiscal 2027 (Reiwa 9) are also established (below).

### Other main items

- Ayumi no Ie (planned repairs), receiving and transforming electrical equipment renovation: 8,300 thousand yen (increase following a change in the construction plan)
- System development to introduce an electronic maternal and child health handbook: 396 thousand yen (based on national guidelines)
- System development to introduce digital coupons for postpartum care: 2,640 thousand yen (to improve convenience for residents)
- Transfers out to the Long-Term Care Insurance Special Account: 3,545 thousand yen (following an increase in combined high-cost medical and long-term care service benefits)
- Transfers out to the Latter-Stage Elderly Medical Care (後期高齢者医療) Special Account: 10,772 thousand yen (following finalization of the previous year's balance carried forward and other factors)
- Depositing donations in funds: Collaboration Promotion Fund, 52 thousand yen; Natsume Soseki Memorial Facility Development Fund, 63 thousand yen; Welfare Activities for People with Disabilities Fund, 210 thousand yen; Children's Future Fund, 122 thousand yen

## Additions and changes to debt-burden commitments

| Item | Period | Ceiling |
|------|------|------|
| Ayumi no Ie receiving and transforming electrical equipment renovation (change) | Fiscal 2027 (Reiwa 9) | 21,718 thousand yen → 34,170 thousand yen |
| Contracted design of Ushigome Daiichi Junior High School using the former Tokyo Metropolitan Ichigaya Commercial High School site and other land (addition) | Fiscal 2027 (Reiwa 9) | 26,705 thousand yen |
| Contracted design of the community library within Ushigome Daiichi Junior High School (same site) (addition) | Fiscal 2027 (Reiwa 9) | 3,642 thousand yen |

The reason for adding the 2 design contracts is that "the design work spans 2 fiscal years and is difficult to divide into separate contracts."

## What happened to this bill

${passed}

${unanimous}

${voteAbsence}

## What the materials do not say

The materials do not state which expenditure is funded by the 20,313 thousand yen for "tourism promotion in harmony with local life" within Tokyo Metropolitan Government disbursements. They also do not show the specific ordinance amendments, the staffing arrangements or duration of the patrols, or the construction schedule for Ushigome Daiichi Junior High School.

${reasonsAbsence}`,
  },
  {
    ...draft,
    bill_slug: r8_3GianKey(65),
    source_hash:
      "v1:54ce2576b84b394865f58ede372e901c8ca0c78f167ec85da20a566ae45a8ae3",
    title:
      "Deposit in the Long-Term Care Benefits Reserve Fund and repayments to the national and Tokyo governments (Long-Term Care Insurance Special Account supplementary budget No. 2)",
    summary:
      "This supplementary budget adds ¥765,739,000 to the Long-Term Care Insurance Special Account. Funded mainly by the previous year's balance carried forward, it deposits ¥573,584,000, including the surplus from allocating long-term care insurance premiums to benefit expenses, in the Long-Term Care Benefits Reserve Fund, and returns excess national government disbursements and other receipts. It also responds to an increase in actual combined high-cost medical and long-term care service benefits.",
    content: `# Deposit in the Long-Term Care Benefits Reserve Fund and repayments to the national and Tokyo governments (Long-Term Care Insurance Special Account supplementary budget No. 2)

The Mayor submitted this supplementary budget for the fiscal 2026 (Reiwa 8) Long-Term Care Insurance Special Account on September 16, 2026. It adds 765,739 thousand yen to both revenue and expenditure, bringing the total to 28,973,460 thousand yen.

## What the money is for

| Expenditure | Adjustment | Explanation in the summary materials |
|------|--------|------|
| Deposit in the Long-Term Care Benefits Reserve Fund | 573,584 thousand yen | Deposit of the surplus from allocating long-term care insurance premiums to benefit expenses and other amounts |
| Repayment of excess national government disbursements, Payment Fund grants, and Tokyo Metropolitan Government disbursements | 167,503 thousand yen | Contributions toward long-term care benefits (national), community support project support grants, community support project grants (national and Tokyo), etc. |
| Combined high-cost medical and long-term care service benefits | 28,363 thousand yen | Increase in actual combined high-cost medical and long-term care service benefits |
| Refunds of overpaid or erroneously paid premiums for Category 1 insured persons | -3,711 thousand yen | Reduction following finalization of refund amounts |

## Where the money comes from

| Revenue | Adjustment | Components |
|------|--------|------|
| Balance carried forward from the previous fiscal year | 737,034 thousand yen | Previous year's balance carried forward |
| Transfers in | 10,591 thousand yen | Transfers from the General Account (for long-term care benefits): 3,545 thousand yen / transfers from the Long-Term Care Benefits Reserve Fund: 7,046 thousand yen |
| Payment Fund grants | 8,000 thousand yen | Long-term care benefit grants (current year): 7,658 thousand yen / same (prior years): 342 thousand yen |
| National government disbursements | 6,569 thousand yen | Contributions toward long-term care benefits (current year): 5,673 thousand yen / adjustment grants: 896 thousand yen |
| Tokyo Metropolitan Government disbursements | 3,545 thousand yen | Contributions toward long-term care benefits (current year) |

The 3,545 thousand yen in transfers from the General Account equals the 3,545 thousand yen in "transfers out to the Long-Term Care Insurance Special Account" (our translation) in Bill No. 64 (General Account supplementary budget No. 5), submitted in the same regular session. This is an increase following higher combined high-cost medical and long-term care service benefits.

## What happened to this bill

${passed}

${unanimous}

${voteAbsence}

## What the materials do not say

The materials do not state the Long-Term Care Benefits Reserve Fund balance after the deposit, how the fund will be used in the future, the effect on long-term care insurance premiums, or changes in the number of people eligible for combined high-cost medical and long-term care service benefits.

${reasonsAbsence}`,
  },
  {
    ...draft,
    bill_slug: r8_3GianKey(66),
    source_hash:
      "v1:3ae41a1340dd62971a7c4d4ff4c5d42f6968d7dc34f2394bdb30e9fe603e5a11",
    title:
      "Additional premium reduction contributions and repayment of entrusted funeral benefit revenue (Latter-Stage Elderly Medical Care (後期高齢者医療) Special Account supplementary budget No. 1)",
    summary:
      "This supplementary budget adds ¥7,108,000 to the Latter-Stage Elderly Medical Care (後期高齢者医療) Special Account. It provides an additional ¥1,459,000 contribution following finalization of premium reduction contributions, and ¥5,649,000 to repay excess revenue from entrusted funeral benefit operations. The budget for the previous year's balance carried forward decreases by ¥9,033,000.",
    content: `# Additional premium reduction contributions and repayment of entrusted funeral benefit revenue (Latter-Stage Elderly Medical Care (後期高齢者医療) Special Account supplementary budget No. 1)

The Mayor submitted this supplementary budget for the fiscal 2026 (Reiwa 8) Latter-Stage Elderly Medical Care (後期高齢者医療) Special Account on September 16, 2026. It adds 7,108 thousand yen to both revenue and expenditure, bringing the total to 9,962,512 thousand yen.

## What the money is for

| Expenditure | Adjustment | Explanation in the summary materials |
|------|--------|------|
| Premium reduction contributions (contributions to the wide-area union) | 1,459 thousand yen | Additional payment following finalization of premium reduction contributions |
| Repayment of excess revenue from entrusted operations (miscellaneous expenditure) | 5,649 thousand yen | Repayment of excess revenue from entrusted funeral benefit operations |

## Where the money comes from

| Revenue | Adjustment | Components |
|------|--------|------|
| Transfers in | 10,772 thousand yen | Transfers from the General Account (administrative expenses): 9,313 thousand yen / transfers from the General Account (premium reduction measures): 1,459 thousand yen |
| Miscellaneous revenue | 5,369 thousand yen | Premium refunds (reimbursement of premium reduction contributions) |
| Balance carried forward from the previous fiscal year | -9,033 thousand yen | Previous year's balance carried forward |

The budget for the balance carried forward decreases from 12,312 thousand yen to 3,279 thousand yen. The 10,772 thousand yen in transfers from the General Account equals the 10,772 thousand yen in "transfers out to the Latter-Stage Elderly Medical Care (後期高齢者医療) Special Account" (our translation) in Bill No. 64 (General Account supplementary budget No. 5), an increase following finalization of the previous year's balance carried forward and other factors.

## What happened to this bill

${passed}

${unanimous}

${voteAbsence}

## What the materials do not say

The materials do not state what the premium reduction measures involve, the official name of the wide-area union receiving contributions, what the entrusted funeral benefit operations involve, or the effect on Latter-Stage Elderly Medical Care (後期高齢者医療) insurance premiums.

${reasonsAbsence}`,
  },
  {
    ...draft,
    bill_slug: r8_3NinteiKey(1),
    source_hash:
      "v1:16d201b30ac50175b8fab0227cf450b1e3c417fa2c93dae12c51e904d42ce8fa",
    title:
      "Certification of the fiscal 2025 (Reiwa 7) General Account settlement",
    summary:
      "This item seeks council certification of Shinjuku City's fiscal 2025 (Reiwa 7) General Account settlement. Revenue received was ¥193,576,411,220 and expenditure paid out was ¥187,801,267,640, leaving a balance of revenue and expenditure of ¥5,775,143,580. The current budget amount was ¥196,812,239,000.",
    content: `# Certification of the fiscal 2025 (Reiwa 7) General Account settlement

The Mayor submitted this fiscal 2025 (Reiwa 7) General Account revenue and expenditure settlement on September 16, 2026. The council votes on whether to certify this settlement.

## The settlement as a whole

| Item | Amount |
|------|------|
| Current budget amount | ¥196,812,239,000 |
| Revenue: assessed amount | ¥196,694,879,708 |
| Revenue: amount received | ¥193,576,411,220 |
| Revenue: amount written off as uncollectible | ¥237,059,073 |
| Revenue: amount not yet received | ¥2,932,533,842 |
| Expenditure: amount paid out | ¥187,801,267,640 |
| Expenditure: amount carried over to the next fiscal year | ¥922,004,000 |
| Expenditure: unused amount | ¥8,088,967,360 |
| Balance of revenue and expenditure | ¥5,775,143,580 (including ¥0 transferred to funds) |

Revenue received was ¥3,235,827,780 below the current budget amount, and unused expenditure was ¥8,088,967,360. The entire ¥300,000,000 contingency reserve was unused.

## Main revenue (amounts received)

| Category | Amount received | Comparison with current budget amount |
|------|------|------|
| Special ward taxes | ¥60,861,374,326 | ¥221,373,326 |
| Special ward grants | ¥33,357,484,000 | ¥1,236,992,000 |
| National government disbursements | ¥31,847,755,789 | -1,796,318,211 yen |
| Tokyo Metropolitan Government disbursements | ¥19,063,049,452 | -89,493,548 yen |
| Local consumption tax grants | ¥14,890,908,000 | ¥449,819,000 |
| Special ward bonds | ¥6,790,000,000 | -289,000,000 yen |

Transfers in (transfers from funds) received were ¥2,252,412,571 against a current budget amount of ¥5,757,248,000.

## Main expenditure (amounts paid out)

| Category | Amount paid out | Unused amount |
|------|------|------|
| Welfare expenditure | ¥47,204,750,736 | ¥1,936,556,264 |
| Children and family expenditure | ¥39,483,684,198 | ¥1,359,612,802 |
| Education expenditure | ¥19,699,868,639 | ¥638,692,361 |
| Health expenditure | ¥18,581,815,884 | ¥1,437,982,116 |
| General administration expenditure | ¥17,357,934,094 | ¥1,164,087,906 |
| Civil engineering expenditure | ¥11,328,595,131 | ¥454,590,869 |

The ¥922,004,000 carried over to the next fiscal year comprises general administration expenditure of ¥467,865,000, civil engineering expenditure of ¥173,252,000, community promotion expenditure of ¥132,679,000, welfare expenditure of ¥130,427,000, education expenditure of ¥9,140,000, and children and family expenditure of ¥8,641,000.

## Settlement documents and performance reports

The submitted item consists of settlement tables by major and minor budget category. It contains no explanations of individual projects. The submitted bill list page directs readers to "the Accounting Office page for settlement documents and performance reports." (our translation)

## What happened to this item

${certified}

${divided}

${voteAbsence}

## What the materials do not say

The bill materials do not state the reasons for differences from the budget, the performance or outcomes of individual projects, or a breakdown of amounts not yet received.

${reasonsAbsence}`,
  },
  {
    ...draft,
    bill_slug: r8_3NinteiKey(2),
    source_hash:
      "v1:1239e84008ed82a70a12e2d5c80e9a83c63d7e383b951e13c8708b881342b7bc",
    title:
      "Certification of the fiscal 2025 (Reiwa 7) National Health Insurance Special Account settlement",
    summary:
      "This item seeks council certification of the fiscal 2025 (Reiwa 7) National Health Insurance Special Account settlement. Revenue received was ¥37,950,394,593 and expenditure paid out was ¥37,446,701,938, leaving a balance of revenue and expenditure of ¥503,692,655. National Health Insurance premiums not yet received totaled ¥3,164,348,001, and premiums written off as uncollectible totaled ¥833,655,338.",
    content: `# Certification of the fiscal 2025 (Reiwa 7) National Health Insurance Special Account settlement

The Mayor submitted this fiscal 2025 (Reiwa 7) National Health Insurance Special Account revenue and expenditure settlement on September 16, 2026.

## The settlement as a whole

| Item | Amount |
|------|------|
| Current budget amount | ¥38,329,733,000 |
| Revenue: assessed amount | ¥41,908,092,100 |
| Revenue: amount received | ¥37,950,394,593 |
| Revenue: amount written off as uncollectible | ¥840,696,918 |
| Revenue: amount not yet received | ¥3,205,891,887 |
| Expenditure: amount paid out | ¥37,446,701,938 |
| Expenditure: unused amount | ¥883,031,062 |
| Balance of revenue and expenditure | ¥503,692,655 (including ¥0 transferred to funds) |

There is no amount carried over to the next fiscal year.

## National Health Insurance premiums

| Item | Amount |
|------|------|
| Current budget amount | ¥10,598,606,000 |
| Assessed amount | ¥14,962,250,881 |
| Amount received | ¥11,053,074,340 |
| Amount written off as uncollectible | ¥833,655,338 |
| Amount not yet received | ¥3,164,348,001 |

The amount received exceeded the current budget amount by ¥454,468,340.

## Main revenue and expenditure

| Revenue category | Amount received |
|------|------|
| Tokyo Metropolitan Government disbursements | ¥21,322,030,156 |
| National Health Insurance premiums | ¥11,053,074,340 |
| Transfers in | ¥4,913,384,649 |
| Balance carried forward from the previous fiscal year | ¥581,061,083 |

| Expenditure category | Amount paid out |
|------|------|
| Insurance benefits | ¥21,040,224,066 |
| National Health Insurance program contributions | ¥14,880,381,258 |
| General administration expenditure | ¥946,113,104 |
| Miscellaneous expenditure | ¥408,956,034 |
| Health programs | ¥171,027,476 |

Insurance benefits include ¥18,162,023,925 for medical treatment and related expenses and ¥2,685,103,079 for high-cost medical benefits. National Health Insurance program contributions consist of ¥10,144,149,929 for medical benefits, ¥3,613,400,064 for support contributions for Latter-Stage Elderly Medical Care (後期高齢者医療) and related items, and ¥1,122,831,265 for long-term care contributions.

## Settlement documents and performance reports

The submitted bill list page directs readers to "the Accounting Office page for settlement documents and performance reports." (our translation)

## What happened to this item

${certified}

${divided}

${voteAbsence}

## What the materials do not say

The bill materials do not state the number of insured people, the number of households with overdue premiums, the reasons for write-offs, or the effect on premium rates.

${reasonsAbsence}`,
  },
  {
    ...draft,
    bill_slug: r8_3NinteiKey(3),
    source_hash:
      "v1:1febb1deaaf8c34846aef4633ef7bf4eeb1c1d3daf0431debce9e58d99428507",
    title:
      "Certification of the fiscal 2025 (Reiwa 7) Long-Term Care Insurance Special Account settlement",
    summary:
      "This item seeks council certification of the fiscal 2025 (Reiwa 7) Long-Term Care Insurance Special Account settlement. Revenue received was ¥28,029,183,356 and expenditure paid out was ¥27,272,698,949, leaving a balance of revenue and expenditure of ¥756,484,407. Most expenditure was for insurance benefits (¥24,300,302,137).",
    content: `# Certification of the fiscal 2025 (Reiwa 7) Long-Term Care Insurance Special Account settlement

The Mayor submitted this fiscal 2025 (Reiwa 7) Long-Term Care Insurance Special Account revenue and expenditure settlement on September 16, 2026.

## The settlement as a whole

| Item | Amount |
|------|------|
| Current budget amount | ¥27,841,480,000 |
| Revenue: assessed amount | ¥28,226,006,880 |
| Revenue: amount received | ¥28,029,183,356 |
| Revenue: amount written off as uncollectible | ¥55,392,350 |
| Revenue: amount not yet received | ¥159,876,594 |
| Expenditure: amount paid out | ¥27,272,698,949 |
| Expenditure: unused amount | ¥568,781,051 |
| Balance of revenue and expenditure | ¥756,484,407 (including ¥0 transferred to funds) |

Revenue received exceeded the current budget amount by ¥187,703,356. There is no amount carried over to the next fiscal year.

## Main revenue and expenditure

| Revenue category | Amount received |
|------|------|
| Payment Fund grants | ¥6,773,529,000 |
| National government disbursements | ¥5,808,461,804 |
| Long-term care insurance premiums | ¥5,710,956,875 |
| Transfers in | ¥5,307,764,793 |
| Tokyo Metropolitan Government disbursements | ¥3,748,492,540 |

| Expenditure category | Amount paid out |
|------|------|
| Insurance benefits | ¥24,300,302,137 |
| Community support programs | ¥1,340,890,276 |
| General administration expenditure | ¥979,993,925 |
| Deposits in funds | ¥475,537,487 |
| Miscellaneous expenditure | ¥175,975,124 |

Long-term care insurance premiums had an amount written off as uncollectible of ¥55,392,350 and an amount not yet received of ¥159,115,345.

## Relationship to Bill No. 65

Bill No. 65 (Long-Term Care Insurance Special Account supplementary budget No. 2), submitted in the same regular session, sets the fiscal 2026 (Reiwa 8) budget for the balance carried forward at 756,484 thousand yen. This matches this settlement's balance of revenue and expenditure of ¥756,484,407 when expressed in thousand yen.

## Settlement documents and performance reports

The submitted bill list page directs readers to "the Accounting Office page for settlement documents and performance reports." (our translation)

## What happened to this item

${certified}

${divided}

${voteAbsence}

## What the materials do not say

The bill materials do not state the number of people certified as needing long-term care, the number of service users, why community support program expenditure had an unused amount, or the effect on the level of long-term care insurance premiums.

${reasonsAbsence}`,
  },
  {
    ...draft,
    bill_slug: r8_3NinteiKey(4),
    source_hash:
      "v1:caa7b58d384b0c2fd9ebefc013788f3e855f10815efce4423f18d45129d844e2",
    title:
      "Certification of the fiscal 2025 (Reiwa 7) Latter-Stage Elderly Medical Care (後期高齢者医療) Special Account settlement",
    summary:
      "This item seeks council certification of the fiscal 2025 (Reiwa 7) Latter-Stage Elderly Medical Care (後期高齢者医療) Special Account settlement. Revenue received was ¥9,315,702,765 and expenditure paid out was ¥9,312,423,258, leaving a balance of revenue and expenditure of ¥3,279,507. Most expenditure was for contributions to the wide-area union (¥8,819,162,591).",
    content: `# Certification of the fiscal 2025 (Reiwa 7) Latter-Stage Elderly Medical Care (後期高齢者医療) Special Account settlement

The Mayor submitted this fiscal 2025 (Reiwa 7) Latter-Stage Elderly Medical Care (後期高齢者医療) Special Account revenue and expenditure settlement on September 16, 2026.

## The settlement as a whole

| Item | Amount |
|------|------|
| Current budget amount | ¥9,395,875,000 |
| Revenue: assessed amount | ¥9,406,015,865 |
| Revenue: amount received | ¥9,315,702,765 |
| Revenue: amount written off as uncollectible | ¥16,450,200 |
| Revenue: amount not yet received | ¥88,182,000 |
| Expenditure: amount paid out | ¥9,312,423,258 |
| Expenditure: unused amount | ¥83,451,742 |
| Balance of revenue and expenditure | ¥3,279,507 (including ¥0 transferred to funds) |

There is no amount carried over to the next fiscal year.

## Main revenue and expenditure

| Revenue category | Amount received |
|------|------|
| Latter-Stage Elderly Medical Care (後期高齢者医療) insurance premiums | ¥5,528,787,300 |
| Transfers in | ¥3,572,471,057 |
| Miscellaneous revenue | ¥198,602,469 |

| Expenditure category | Amount paid out |
|------|------|
| Contributions to the wide-area union | ¥8,819,162,591 |
| General administration expenditure | ¥303,314,423 |
| Latter-Stage Elderly Medical Care (後期高齢者医療) support programs | ¥178,145,544 |
| Miscellaneous expenditure | ¥11,800,700 |

Latter-Stage Elderly Medical Care (後期高齢者医療) insurance premiums had an amount written off as uncollectible of ¥16,450,200 and an amount not yet received of ¥88,182,000.

## Relationship to Bill No. 66

Bill No. 66 (Latter-Stage Elderly Medical Care (後期高齢者医療) Special Account supplementary budget No. 1), submitted in the same regular session, reduces the fiscal 2026 (Reiwa 8) budget for the balance carried forward from 12,312 thousand yen to 3,279 thousand yen. This matches this settlement's balance of revenue and expenditure of ¥3,279,507 when expressed in thousand yen.

## Settlement documents and performance reports

The submitted bill list page directs readers to "the Accounting Office page for settlement documents and performance reports." (our translation)

## What happened to this item

${certified}

${divided}

${voteAbsence}

## What the materials do not say

The bill materials do not state the number of insured people, the number of people with overdue premiums, the reasons for write-offs, or the official name of the wide-area union receiving contributions.

${reasonsAbsence}`,
  },
  {
    ...draft,
    bill_slug: r8_3GianKey(67),
    source_hash:
      "v1:78ac0de8e16896b7e7f7ce3de7558a3a86cb8b03bfb3cb11d51b92bd685ca1e7",
    title:
      "Updating statutory references following amendments to the Whistleblower Protection Act (Ordinance on Reporting for Public Interest Protection)",
    summary:
      "This amendment to the Shinjuku City Ordinance on Reporting for Public Interest Protection changes its reference to the Whistleblower Protection Act from Article 3, item 1 to Article 3, paragraph 1, item 1, following amendments to that Act. It takes effect on December 1, 2026 (Reiwa 8).",
    content: `# Updating statutory references following amendments to the Whistleblower Protection Act (Ordinance on Reporting for Public Interest Protection)

The Mayor submitted this partial amendment to the Shinjuku City Ordinance on Reporting for Public Interest Protection (平成18年新宿区条例第39号) on September 16, 2026.

## What changes

The city's summary materials explain that "statutory references are amended following amendments to the Whistleblower Protection Act." (our translation; the same applies to the quotations below)

There is only 1 textual amendment.

> In Article 3, paragraph 1, replace "Article 3, item 1" with "Article 3, paragraph 1, item 1." (our translation)

The bill's stated reason is that "provisions need to be adjusted" following the entry into force of the Act Partially Amending the Whistleblower Protection Act (令和7年法律第62号).

## When it takes effect

It takes effect on December 1, 2026 (Reiwa 8).

## What happened to this bill

${passed}

${unanimous}

${voteAbsence}

## What the materials do not say

The bill materials do not state the substance of the Whistleblower Protection Act amendments themselves or whether operation of the city's reporting system will change.

${reasonsAbsence}`,
  },
  {
    ...draft,
    bill_slug: r8_3GianKey(71),
    source_hash:
      "v1:f4bf1b4ad9d08b4ce385090a1976fcc2b5b9c5117379f75bc998ba686294fbba",
    title:
      "Updating statutory references following amendments to the Landscape Act (Landscape Community Development Ordinance)",
    summary:
      "This amendment changes the numbering of provisions referenced by the Shinjuku City Landscape Community Development Ordinance, including the items of Article 16, paragraph 7, following amendments to the Landscape Act under the Act Partially Amending the Act on Special Measures concerning Urban Renaissance and Other Acts. It takes effect on the later of that Act's effective date or the ordinance's promulgation date.",
    content: `# Updating statutory references following amendments to the Landscape Act (Landscape Community Development Ordinance)

The Mayor submitted this partial amendment to the Shinjuku City Landscape Community Development Ordinance (平成20年新宿区条例第67号) on September 16, 2026.

## Why it is being amended

The city's summary materials explain as follows.

> References are amended following changes to the Landscape Act, including the addition of a provision deeming notification of extensions and similar work on buildings designated to create distinctive appeal under the Act on Special Measures concerning Urban Renaissance to also constitute notification of such work under the Landscape Act. (our translation)

The bill's stated reason is that "provisions need to be adjusted" (our translation) following amendments to the Landscape Act (平成16年法律第110号) resulting from the entry into force of the Act Partially Amending the Act on Special Measures concerning Urban Renaissance and Other Acts (令和8年法律第23号).

## What changes

| Location | Before | After |
|------|------|------|
| Article 12, paragraph 2 | Items of paragraph 7 of that Article | Items of paragraph 8 of that Article |
| Article 12, paragraph 3 | Article 16, paragraph 7, item 11 | Article 16, paragraph 8, item 12 |
| Article 17 | Items of Article 16, paragraph 7 | Items of Article 16, paragraph 8 |

All are changes to the numbering of provisions referenced by the ordinance.

## When it takes effect

It takes effect on the later of the effective date of the Act Partially Amending the Act on Special Measures concerning Urban Renaissance and Other Acts (令和8年法律第23号) or the promulgation date of this ordinance.

## What happened to this bill

${passed}

${unanimous}

${voteAbsence}

## What the materials do not say

The bill materials do not state the amending Act's effective date, how the city's landscape notification procedures will change, or whether any buildings in the city are covered.

${reasonsAbsence}`,
  },
  {
    ...draft,
    bill_slug: r8_3GianKey(68),
    source_hash:
      "v1:f789f261624ebee86a1e2579d30c2f1f379a2d794eecbc3b2a7db5f709a70e88",
    title:
      "Changing the location, opening hours and closed days when Shinjuku Multicultural Plaza moves",
    summary:
      "This ordinance amendment accompanies the relocation of Shinjuku City Shinjuku Multicultural Plaza. It changes the location from Kabukicho 2-chome to Yotsuya Saneicho, shortens opening hours to 9 a.m.–5 p.m., and changes closed days to Saturdays, Sundays, holidays and the year-end/New Year period. It takes effect on April 5, 2027 (Reiwa 9).",
    content: `# Changing the location, opening hours and closed days when Shinjuku Multicultural Plaza moves

The Mayor submitted this partial amendment to the Shinjuku City Shinjuku Multicultural Plaza Ordinance (平成17年新宿区条例第37号) on September 16, 2026. The stated reason is that "the location, opening hours and closed days need to be changed following the relocation of Shinjuku City Shinjuku Multicultural Plaza." (our translation)

## What changes

The city's summary materials compare the current arrangements and those after relocation as follows.

| Item | Current | After relocation |
|------|------|------|
| Location | 2-chome 44-1, Kabukicho, Shinjuku City, Tokyo | 10-16, Yotsuya Saneicho, Shinjuku City, Tokyo |
| Opening hours | 9 a.m. to 9 p.m. | 9 a.m. to 5 p.m. |
| Closed days | ⑴ The 2nd and 4th Wednesdays of each month ⑵ December 29 through January 3 of the following year | ⑴ Sundays and Saturdays ⑵ Holidays prescribed by the Act on National Holidays ⑶ December 29 through January 3 of the following year (excluding days in the preceding item) |

Daily opening hours decrease from 12 to 8 hours. Closed days change from 2 Wednesdays a month to Saturdays and Sundays every week and holidays.

## When it takes effect

It takes effect on April 5, 2027 (Reiwa 9).

## What happened to this bill

${passed}

${divided}

${voteAbsence}

## What the materials do not say

The bill materials do not state the reason for relocation, an outline of the new facility, whether activities will change, or how long the current location will remain available for use.

${reasonsAbsence}`,
  },
  {
    ...draft,
    bill_slug: r8_3GianKey(69),
    source_hash:
      "v1:2ed4b05f16106e2e9fa28e0abcba14572f431d938a7423699bc0937dc448808c",
    title:
      "Fees for infant attendance support: the Mayor to set separate rules for households in financial hardship and other cases",
    summary:
      "This ordinance amendment changes the rule making the city's infant attendance support service free for public assistance households. Fees will instead be separately determined by the Mayor for public assistance households, households exempt from resident tax, households with a combined income-based resident tax amount below ¥77,101, and cases where the Mayor finds a fee reduction appropriate. It takes effect on the date of promulgation.",
    content: `# Fees for infant attendance support: the Mayor to set separate rules for households in financial hardship and other cases

The Mayor submitted this partial amendment to the Shinjuku City Ordinance on Implementing Infant Attendance Support Services (令和8年新宿区条例第1号) on September 16, 2026.

## Why it is being amended

The city's summary materials explain as follows.

> In light of the application of the standards for calculating the costs of specified infant attendance support (a national public notice) and other factors, fees for users of the city's infant attendance support service whose households are in financial hardship or other qualifying circumstances will be separately determined by the Mayor. (our translation)

## What changes

According to the amendment text, Article 7, paragraph 3 is amended as follows.

- Replace "the parent or guardian is a recipient of protection as prescribed in Article 6, paragraph 1 of the Public Assistance Act (昭和25年法律第144号) on the date the infant attendance support service is used" (our translation; the same applies to the quotations below) with "the following"
- Replace "shall be free of charge" with "shall be as separately determined by the Mayor"
- Add the following 4 items to that paragraph

| Item | Circumstance |
|------|------|
| ⑴ | The parent or guardian is a recipient of protection under Article 6, paragraph 1 of the Public Assistance Act on the date of use |
| ⑵ | The parent or guardian and people in the same household are not subject to municipal resident tax (excluding ⑴) |
| ⑶ | The combined income-based municipal resident tax amount for the parent or guardian and people in the same household is below ¥77,101 (excluding ⑴ and ⑵) |
| ⑷ | The Mayor finds a fee reduction appropriate in light of the physical and mental circumstances of the eligible infant or young child and their parent or guardian, the child-rearing environment, and other factors (excluding ⑴–⑶) |

Article 7, paragraphs 4 through 6 are also deleted.

## When it takes effect

It takes effect on the date of promulgation. Amended Article 7, paragraph 3 applies to fees for use on or after the effective date. Fees for earlier use remain subject to the previous rules.

## What happened to this bill

${passed}

${unanimous}

${voteAbsence}

## What the materials do not say

**The bill materials do not state the fee amounts to be "separately determined by the Mayor."** These materials do not establish whether service will remain free for public assistance households, for whom it was previously specified as "free of charge." They also do not show the contents of Article 7, paragraphs 4 through 6, which are to be deleted.

${reasonsAbsence}`,
  },
  {
    ...draft,
    bill_slug: r8_3GianKey(70),
    source_hash:
      "v1:6acf1f00c6d6241b879ae8315113dfc1fea615aef419fa0fd9aeb41880576123",
    title:
      "Requiring family-based childcare and infant attendance support providers to take measures against sexual violence against children and related acts",
    summary:
      "This bill amends 2 ordinances setting facility and operating standards for family-based childcare and related services and for infant attendance support services. Providers must check the criminal history of staff working with children and take other necessary measures to prevent sexual violence against children and related acts and protect affected children. It also adjusts terminology and other provisions. It takes effect on December 25, 2026 (Reiwa 8).",
    content: `# Requiring family-based childcare and infant attendance support providers to take measures against sexual violence against children and related acts

The Mayor submitted partial amendments to 2 standards ordinances on September 16, 2026.

- Shinjuku City Ordinance Establishing Facility and Operating Standards for Family-Based Childcare and Related Services (平成26年新宿区条例第28号)
- Shinjuku City Ordinance Establishing Facility and Operating Standards for Infant Attendance Support Services (令和7年新宿区条例第45号)

## Why it is being amended

The city's summary materials explain that "new measures to prevent sexual violence against children and related acts are established following amendments to the Cabinet Office Order setting facility and operating standards for family-based childcare and related services, and other changes." (our translation; the same applies to the quotations below)

The bill's stated reason cites amendments to the Standards for Facilities and Operation of Family-Based Childcare and Related Services (平成26年厚生労働省令第61号) resulting from the entry into force of the Enforcement Regulations of the Act on Measures by School Establishers and Private Education and Childcare Service Providers to Prevent Sexual Violence against Children and Related Acts (令和7年内閣府令第104号), and other changes.

## What changes

### Prevention of sexual violence against children and related acts (both ordinances)

Article 14 of the family-based childcare ordinance and a new Article 14-2 of the infant attendance support ordinance provide as follows.

- Providers must take the following measures to prevent sexual violence against children and related acts and appropriately protect infants and young children using their services when such acts occur:
- criminal history checks concerning staff working with children (among those whose work involves contact with infants and young children using the services, those who interact with them in an environment characterized by dominance, continuity and closedness),
- and other necessary measures concerning those staff.

"Sexual violence against children and related acts" and "criminal history checks" follow the definitions in the Act on Measures by School Establishers and Private Education and Childcare Service Providers to Prevent Sexual Violence against Children and Related Acts (令和6年法律第69号).

### Adjusting provisions in the infant attendance support ordinance

- In Articles 10, 11, 14 and 19, replace "infant attendance support service provider" with "infant attendance support service establishment" (the Article 10 heading becomes "General requirements for staff of infant attendance support service establishments")
- In the Article 14 heading, replace "prevention" with "prohibition"
- In Article 17, item 7, replace "and" with "other"
- In Article 21, paragraph 3, add a definition specifying that "capacity" means the capacity set in the confirmation under Article 27, paragraph 1 or Article 29, paragraph 1 of the Act on Child and Childcare Support
- Delete the latter part of Article 27
- Add "of the infant attendance support service establishment" to Article 28

## When it takes effect

It takes effect on December 25, 2026 (Reiwa 8).

## What happened to this bill

${passed}

${unanimous}

${voteAbsence}

## What the materials do not say

The bill materials do not state the specific criminal history check procedures, the number of establishments or staff covered, the contents of the current Article 14 being replaced, or the contents of the latter part of Article 27 being deleted. The summary materials cite a "Cabinet Office Order," while the bill cites "平成26年厚生労働省令第61号," but the materials do not explain their relationship.

${reasonsAbsence}`,
  },
  {
    ...draft,
    bill_slug: r8_3GianKey(72),
    source_hash:
      "v1:a5b2ad1b1873695a0345dc6619364bfe3a0300a01b6b605a3a37fe21be98e5da",
    title:
      "Increasing nursing care and funeral compensation for city school doctors and related professionals",
    summary:
      "This ordinance amendment increases the guaranteed minimum nursing care compensation (constant care: ¥85,490→¥90,790; occasional care: ¥42,700→¥45,400) and the fixed component of funeral compensation (¥315,000→¥330,000) under occupational accident compensation for part-time doctors, dentists and pharmacists at city elementary, junior high and special needs schools. It takes effect on November 1, 2026 (Reiwa 8), and applies from September 1, 2026 (Reiwa 8).",
    content: `# Increasing nursing care and funeral compensation for city school doctors and related professionals

The Mayor submitted this partial amendment to the Ordinance on Occupational Accident Compensation for Part-Time Doctors, Dentists and Pharmacists at Shinjuku City Elementary, Junior High and Special Needs Schools (平成14年新宿区条例第24号) on September 16, 2026.

## Why it is being amended

The city's summary materials explain that the revision is "in line with amendments to the ordinance on occupational accident compensation for doctors, dentists and pharmacists at Tokyo metropolitan schools, which forms the basis for calculating occupational accident compensation for city school doctors and related professionals." (our translation; the same applies to the quotations below)

The bill's stated reason is that "nursing care and funeral compensation amounts need to be revised" following the entry into force of the Cabinet Order Partially Amending the Cabinet Order Establishing Standards for Occupational Accident Compensation for Doctors, Dentists and Pharmacists at Public Schools (令和8年政令第165号), and other changes.

## What the amounts become

### Nursing care compensation

| Recipient | Category | Current | Revised |
|------|------|------|------|
| Person requiring constant care | Maximum | ¥186,050 | Unchanged |
| Person requiring constant care | Guaranteed minimum | ¥85,490 | ¥90,790 |
| Person requiring occasional care | Maximum | ¥92,980 | Unchanged |
| Person requiring occasional care | Guaranteed minimum | ¥42,700 | ¥45,400 |

### Funeral compensation

¥315,000 + basic compensation amount × 30 → ¥330,000 + basic compensation amount × 30

## When the changes apply

- Effective date: November 1, 2026 (Reiwa 8)
- Application date: September 1, 2026 (Reiwa 8)

The revised provisions apply to nursing care and funeral compensation for which grounds for payment arise on or after the application date. Amounts paid at the previous rates between the application date and the day before the effective date are deemed partial payments toward compensation under the revised provisions.

## What happened to this bill

${passed}

${unanimous}

${voteAbsence}

## What the materials do not say

The bill materials do not state the number of people receiving compensation, the projected increase in city expenditure due to the revision, or the substance of the amendments to the metropolitan school ordinance itself.

${reasonsAbsence}`,
  },
  {
    ...draft,
    bill_slug: r8_3GianKey(73),
    source_hash:
      "v1:6c251ad9624488e868f1cb9a43709016f6ce4b23559965222cbe32dd8ae32a48",
    title:
      "ESCO contract to convert lighting to LED at the Disaster Prevention Center and 11 other facilities",
    summary:
      "This bill authorizes a contract for construction and related services to convert lighting to LED at Shinjuku City's Disaster Prevention Center and 11 other facilities through an ESCO project providing comprehensive energy-saving services. The contract is for ¥229,900,000 with 東京ガスリノベーション株式会社 (Tokyo Gas Renovation K.K.), through open competitive bidding with eligibility restrictions. The term runs from the day after the final contract is signed through February 28, 2033 (Reiwa 15), with payments under debt-burden commitments for fiscal 2027–2032 (Reiwa 9–14).",
    content: `# ESCO contract to convert lighting to LED at the Disaster Prevention Center and 11 other facilities

This bill seeks a council resolution authorizing a contract for construction and related services through an ESCO project to convert lighting to LED at Shinjuku City's Disaster Prevention Center and 11 other facilities. The Mayor submitted it on September 16, 2026.

## What an ESCO project is

The city's summary materials describe the work as "LED lighting conversion and related work at Shinjuku City's Disaster Prevention Center and 11 other facilities through an ESCO project providing comprehensive energy-saving services (surveys, design, construction, subsequent verification of energy savings and advice, performance guarantees, etc.)." (our translation)

## Contract details

| Item | Details |
|------|------|
| Work locations | 2-42, Ichigaya Nakanocho, Shinjuku City, Tokyo, and 5 other locations |
| Procurement method | Open competitive bidding with eligibility restrictions |
| Contract amount | ¥229,900,000 |
| Contractor | 東京ガスリノベーション株式会社 (Tokyo Gas Renovation K.K.) (2-chome 9-15, Futaba, Shinagawa City, Tokyo / Representative Director: 高橋 稔 / capital: ¥100,000,000) |
| Contract dates | Provisional contract: Friday, July 31, 2026 (Reiwa 8); final contract: the day after the council vote |
| Contract term | From the day after the final contract is signed through February 28, 2033 (Reiwa 15) |

## Where the money comes from

The bill specifies debt-burden commitments (債務負担行為) for each fiscal year from 2027 (Reiwa 9) through 2032 (Reiwa 14) as the expenditure basis.

## Related bills in the same session

Other contracts for LED lighting conversion using the same ESCO arrangement were submitted as Bill No. 74 (Yotsuya Special Branch Office and 6 other facilities) and Bill No. 75 (Okubo Special Branch Office and 10 other facilities).

## What happened to this bill

${passed}

${unanimous}

${voteAbsence} The summary of submitted items places the final contract on the day after the council vote.

## What the materials do not say

The materials for this bill do not provide a list of the facilities covered, projected electricity cost or energy use reductions from LED conversion, specific performance guarantee terms, annual payment amounts, or the number of bidders or their bid prices.

${reasonsAbsence}`,
  },
  {
    ...draft,
    bill_slug: r8_3GianKey(74),
    source_hash:
      "v1:0349cadc29dd17d5b7bc16445d89583c44d54916647f5b8388d33e7030cd1ed6",
    title:
      "ESCO contract to convert lighting to LED at Yotsuya Special Branch Office and 6 other facilities",
    summary:
      "This bill authorizes a contract for construction and related services to convert lighting to LED at Shinjuku City's Yotsuya Special Branch Office and 6 other facilities through an ESCO project providing comprehensive energy-saving services. The contract is for ¥257,026,000 with 東邦電気工事株式会社 (Toho Denki Koji K.K.), through open competitive bidding with eligibility restrictions. The term runs from the day after the final contract is signed through February 28, 2033 (Reiwa 15), with payments under debt-burden commitments for fiscal 2027–2032 (Reiwa 9–14).",
    content: `# ESCO contract to convert lighting to LED at Yotsuya Special Branch Office and 6 other facilities

This bill seeks a council resolution authorizing a contract for construction and related services through an ESCO project to convert lighting to LED at Shinjuku City's Yotsuya Special Branch Office and 6 other facilities. The Mayor submitted it on September 16, 2026.

## What an ESCO project is

The city's summary materials describe the work as "LED lighting conversion and related work at Shinjuku City's Yotsuya Special Branch Office and 6 other facilities through an ESCO project providing comprehensive energy-saving services (surveys, design, construction, subsequent verification of energy savings and advice, performance guarantees, etc.)." (our translation)

## Contract details

| Item | Details |
|------|------|
| Work locations | 87, Naitomachi, Shinjuku City, Tokyo, and 2 other locations |
| Procurement method | Open competitive bidding with eligibility restrictions |
| Contract amount | ¥257,026,000 |
| Contractor | 東邦電気工事株式会社 (Toho Denki Koji K.K.) (6-chome 7-6, Shinjuku, Shinjuku City, Tokyo / Representative Director and President: 豊岡 良至 / capital: ¥40,000,000) |
| Contract dates | Provisional contract: Friday, July 31, 2026 (Reiwa 8); final contract: the day after the council vote |
| Contract term | From the day after the final contract is signed through February 28, 2033 (Reiwa 15) |

## Where the money comes from

The bill specifies debt-burden commitments (債務負担行為) for each fiscal year from 2027 (Reiwa 9) through 2032 (Reiwa 14) as the expenditure basis.

## Related bills in the same session

Other contracts for LED lighting conversion using the same ESCO arrangement were submitted as Bill No. 73 (Disaster Prevention Center and 11 other facilities) and Bill No. 75 (Okubo Special Branch Office and 10 other facilities).

## What happened to this bill

${passed}

${unanimous}

${voteAbsence} The summary of submitted items places the final contract on the day after the council vote.

## What the materials do not say

The materials for this bill do not provide a list of the facilities covered, projected electricity cost or energy use reductions from LED conversion, specific performance guarantee terms, annual payment amounts, or the number of bidders or their bid prices.

${reasonsAbsence}`,
  },
  {
    ...draft,
    bill_slug: r8_3GianKey(75),
    source_hash:
      "v1:a77873a5893674eb5ff2d217d0b0793ec83738e8800a30ada00fee715fe2bab3",
    title:
      "ESCO contract to convert lighting to LED at Okubo Special Branch Office and 10 other facilities",
    summary:
      "This bill authorizes a contract for construction and related services to convert lighting to LED at Shinjuku City's Okubo Special Branch Office and 10 other facilities through an ESCO project providing comprehensive energy-saving services. The contract is for ¥276,100,000 with 日東電工株式会社 (Nitto Denko K.K.), through open competitive bidding with eligibility restrictions. The term runs from the day after the final contract is signed through February 28, 2033 (Reiwa 15), with payments under debt-burden commitments for fiscal 2027–2032 (Reiwa 9–14).",
    content: `# ESCO contract to convert lighting to LED at Okubo Special Branch Office and 10 other facilities

This bill seeks a council resolution authorizing a contract for construction and related services through an ESCO project to convert lighting to LED at Shinjuku City's Okubo Special Branch Office and 10 other facilities. The Mayor submitted it on September 16, 2026.

## What an ESCO project is

The city's summary materials describe the work as "LED lighting conversion and related work at Shinjuku City's Okubo Special Branch Office and 10 other facilities through an ESCO project providing comprehensive energy-saving services (surveys, design, construction, subsequent verification of energy savings and advice, performance guarantees, etc.)." (our translation)

## Contract details

| Item | Details |
|------|------|
| Work locations | 2-chome 12-7, Okubo, Shinjuku City, Tokyo, and 5 other locations |
| Procurement method | Open competitive bidding with eligibility restrictions |
| Contract amount | ¥276,100,000 |
| Contractor | 日東電工株式会社 (Nitto Denko K.K.) (2-chome 24-10, Hyakunincho, Shinjuku City, Tokyo / Representative Director: 本間 正明 / capital: ¥20,000,000) |
| Contract dates | Provisional contract: Friday, July 31, 2026 (Reiwa 8); final contract: the day after the council vote |
| Contract term | From the day after the final contract is signed through February 28, 2033 (Reiwa 15) |

## Where the money comes from

The bill specifies debt-burden commitments (債務負担行為) for each fiscal year from 2027 (Reiwa 9) through 2032 (Reiwa 14) as the expenditure basis.

## Related bills in the same session

Other contracts for LED lighting conversion using the same ESCO arrangement were submitted as Bill No. 73 (Disaster Prevention Center and 11 other facilities) and Bill No. 74 (Yotsuya Special Branch Office and 6 other facilities).

## What happened to this bill

${passed}

${unanimous}

${voteAbsence} The summary of submitted items places the final contract on the day after the council vote.

## What the materials do not say

The materials for this bill do not provide a list of the facilities covered, projected electricity cost or energy use reductions from LED conversion, specific performance guarantee terms, annual payment amounts, or the number of bidders or their bid prices.

${reasonsAbsence}`,
  },
  {
    ...draft,
    bill_slug: r8_3GianKey(76),
    source_hash:
      "v1:db75cdab60233a38e9e408ce4bf68e1fc213bdbabc8b2fb655501a3505cfabc9",
    title:
      "Construction contract for phase II road improvements on Edogawabashi-dori",
    summary:
      "This construction contract covers phase II road improvements on Edogawabashi-dori, from Tenjincho in Shinjuku City to Sekiguchi 1-chome in Bunkyo City. The contract is for ¥469,700,000 with 常盤工業株式会社東京支店 (Tokiwa Kogyo K.K., Tokyo Branch), through open competitive bidding with eligibility restrictions. The construction period runs from the day after the final contract is signed through December 13, 2028 (Reiwa 10).",
    content: `# Construction contract for phase II road improvements on Edogawabashi-dori

This bill seeks a council resolution authorizing the city to enter into a construction contract for phase II road improvements on Edogawabashi-dori. The Mayor submitted it on September 16, 2026.

## What the construction covers

The city's summary materials outline the work as follows (each as a lump-sum item).

- ⑴ Earthworks / ⑵ Temporary works / ⑶ Drainage facilities / ⑷ Curb and gutter works / ⑸ Paving / ⑹ Traffic safety facilities / ⑺ Sewer facilities

## Contract details

| Item | Details |
|------|------|
| Work location | From in front of 63, Tenjincho, Shinjuku City, Tokyo, to in front of 1-chome 21, Sekiguchi, Bunkyo City |
| Procurement method | Open competitive bidding with eligibility restrictions |
| Contract amount | ¥469,700,000 |
| Contractor | 常盤工業株式会社 東京支店 (Tokiwa Kogyo K.K., Tokyo Branch) (1-chome 14-5, Shinjuku, Shinjuku City, Tokyo / Executive Officer and Branch Manager: 福岳 雄一郎 / capital: ¥100,000,000) |
| Contract dates | Provisional contract: Friday, August 21, 2026 (Reiwa 8); final contract: the day after the council vote |
| Construction period | From the day after the final contract is signed through December 13, 2028 (Reiwa 10) |

## Where the money comes from

The bill specifies that fiscal 2026 (Reiwa 8) expenditure comes from construction contract expenses for new road construction and improvements and for entrusted projects, within civil engineering expenditure for roads and bridges in the city's General Account. Fiscal 2027 (Reiwa 9) and fiscal 2028 (Reiwa 10) expenditure is under debt-burden commitments (債務負担行為).

## What happened to this bill

${passed}

${unanimous}

${voteAbsence} The summary of submitted items places the final contract on the day after the council vote.

## What the materials do not say

The materials for this bill do not state traffic restrictions during construction, annual payment amounts, who entrusted the projects and what they involve, or the number of bidders or their bid prices.

${reasonsAbsence}`,
  },
  {
    ...draft,
    bill_slug: r8_3GianKey(77),
    source_hash:
      "v1:cf6dd232c81fc9be43a36ce61a4fa09c335d7148548e10c67b2c0c044a86b002",
    title:
      "Purchase of Microsoft licenses to continue operating the city's intranet and other systems",
    summary:
      "This bill authorizes the purchase of 21 types of Microsoft software licenses for ¥570,627,369 to continue operating the existing intranet system and integrated information systems infrastructure. The supplier is 株式会社大塚商会 (Otsuka Shokai K.K.), selected through designated competitive bidding. Delivery is due by December 28, 2026 (Reiwa 8).",
    content: `# Purchase of Microsoft licenses to continue operating the city's intranet and other systems

This bill seeks a council resolution authorizing the purchase of Microsoft software licenses to continue operating the existing intranet system and integrated information systems infrastructure. The Mayor submitted it on September 16, 2026.

## What is being purchased

The bill lists 21 types of licenses. The main licenses by use, according to the city's summary materials, are as follows.

| Use (summary materials) | License | Quantity |
|------|------|------|
| Cloud M365 and PC OS licenses for the existing intranet system | M365 E3 Original Sub Gov Per User | 4,382 |
| Security licenses for the existing intranet system | Defender Suite Sub Gov Per User | 4,422 |
| Licenses for shared mailboxes and other uses in the existing intranet system | Exchange Online P1 and others | 795 each |
| Azure usage licenses for the existing intranet system | Azure prepayment | 1,540 |
| CRM licenses for the resident feedback FAQ | D365 Team Members Sub Per User | 4,185 |
| Azure usage licenses for the city's official website environment | Azure prepayment | 100 |
| Server and SystemCenter licenses | CIS Suite Datacenter Core ALng LSA 2L | 210 |

The full list of 21 types is in the Japanese "Detailed" (くわしく) explanation.

## Contract details

| Item | Details |
|------|------|
| Purchase amount | ¥570,627,369 |
| Procurement method | Designated competitive bidding |
| Supplier | 株式会社大塚商会 LA事業部公共グループ (Otsuka Shokai K.K., Public Sector Group, LA Division) (2-chome 18-4, Iidabashi, Chiyoda City, Tokyo / Group Manager: 浅井 秀雄 / capital: ¥10,374,851,000) |
| Delivery location | A location designated by Shinjuku City |
| Contract dates | Provisional contract: Wednesday, August 19, 2026 (Reiwa 8); final contract: the day after the council vote |
| Delivery period | From the day after the final contract is signed through December 28, 2026 (Reiwa 8) |

## What happened to this bill

${passed}

${unanimous}

${voteAbsence} The summary of submitted items places the final contract on the day after the council vote.

## What the materials do not say

The bill materials do not state the license usage period, unit prices by license type, the reason for designated competitive bidding, or the participating businesses.

${reasonsAbsence}`,
  },
  {
    ...draft,
    bill_slug: r8_3GianKey(78),
    source_hash:
      "v1:aeec38cdcfc5ef74e74e6044883724c40cbbb51666554e01ad8243e5445516a0",
    title:
      "Waiving the right to a testamentary gift conditional on use as a graphic design museum",
    summary:
      "This bill waives the right to receive a testamentary gift (遺贈) arising from a will leaving real estate to the city on condition that it be used as a graphic design museum. The city gives as its reason the difficulty of using the real estate in accordance with the testator's wishes.",
    content: `# Waiving the right to a testamentary gift conditional on use as a graphic design museum

This bill seeks a council resolution authorizing the waiver of a right arising for the city from a testamentary gift (遺贈). The Mayor submitted it on September 16, 2026.

## What is being waived

| Item | Details |
|------|------|
| Right to be waived | The right to receive a testamentary gift of property owned by the testator |
| Testator | Resided in Shinjuku City, Tokyo (name and other details removed from the published bill) |
| Main terms of the will | The testator's real estate is left to the city on condition that it be used as a graphic design museum |
| Reason for waiver | It is difficult to use the real estate covered by the testamentary gift in accordance with the testator's wishes |

The bill's stated reason is that "it is necessary to waive a right arising from a testamentary gift." (our translation)

## What happened to this bill

${passed}

${unanimous}

${voteAbsence}

## What the materials do not say

The bill materials do not state the real estate's location, type, area or assessed value, the specific reasons its use was considered difficult, what the city considered, or how the real estate will be handled after the waiver.

${reasonsAbsence}`,
  },
  {
    ...draft,
    bill_slug: r8_3GianKey(79),
    source_hash:
      "v1:fa2694722e6acab4973a0261335dad5f252995cf8de3a5c98e1701d10c457587",
    title: "Setting damages at ¥2,168,065 for a sanitation vehicle accident",
    summary:
      "This bill sets damages at ¥2,168,065 (personal injury: ¥1,106,972; property damage: ¥1,061,093) for an accident on June 28, 2025 (Reiwa 7), when a city sanitation vehicle came into contact with the vehicle ahead on the Metropolitan Expressway.",
    content: `# Setting damages at ¥2,168,065 for a sanitation vehicle accident

This bill seeks a council resolution setting damages for an accident involving a city-owned motor vehicle. The Mayor submitted it on September 16, 2026.

## What happened in the accident

The bill describes the accident as follows.

> At around 9:48 a.m. on June 28, 2025 (Reiwa 7), while the sanitation vehicle was traveling on the Metropolitan Expressway, the vehicle 2 vehicles ahead braked sharply to make an unsafe lane change. The vehicle immediately ahead then braked sharply and stopped suddenly. The sanitation vehicle also braked sharply but could not stop in time and came into contact with the vehicle immediately ahead. (our translation)

The other party's address is in Inagi City, Tokyo. Their name and other details have been removed from the published bill.

## Amount of damages

| Component | Amount |
|------|------|
| Personal injury | ¥1,106,972 |
| Property damage | ¥1,061,093 |
| Total | ¥2,168,065 |

## What happened to this bill

${passed}

${unanimous}

${voteAbsence}

## What the materials do not say

The bill materials do not state the allocation of fault, the source of the damages payment (including whether insurance covers it), the extent of the other party's injuries, or the organizational affiliation of the sanitation vehicle's driver.

${reasonsAbsence}`,
  },
  {
    ...draft,
    bill_slug: r8_3GianKey(80),
    source_hash:
      "v1:fae6b6d2928e6426af90db819a76b675d6746f54652ad5f5d5b24baa707defe6",
    title:
      "Filing a lawsuit seeking surrender of city-owned designated housing and related relief",
    summary:
      "This bill authorizes filing a lawsuit against a user of city-owned designated housing who has overdue charges and has not surrendered the housing after cancellation of permission to use it, and the joint and several guarantor. It seeks surrender of the housing, payment of ¥2,859,100 in arrears and damages until surrender, and a declaration of provisional execution. Settlement and appeal are also permitted if necessary.",
    content: `# Filing a lawsuit seeking surrender of city-owned designated housing and related relief

This bill seeks a council resolution authorizing the filing of a lawsuit concerning a claim for surrender of city-owned housing and related relief. The Mayor submitted it on September 16, 2026.

## Parties to the lawsuit

| Role | Party |
|------|------|
| Plaintiff | Shinjuku City |
| Defendant (tenant) | Address in Shinjuku City, Tokyo (name and other details removed from the published bill) |
| Defendant (joint and several guarantor) | Address in Arakawa City, Tokyo (same redactions) |

## Course of events (according to the bill)

- October 25, 2024 (Reiwa 6): The city permitted use of designated housing established and managed under the Shinjuku City Housing Management Ordinance. The tenant transferred their resident registration on November 7 of the same year and began occupying the housing
- The joint and several guarantor had agreed to guarantee all of the tenant's obligations, up to 3 months of the usage fee as of the date permission was granted
- The tenant fell behind on usage fees and common service charges (collectively, usage fees and related charges) from the time of moving in. Some payments followed city reminders, demands and payment negotiations, but all payments stopped from the amount due for December 2024 (Reiwa 6)
- September 19, 2025 (Reiwa 7): The city entrusted debt collection to a law firm. A demand notice was sent on November 25 of the same year, but there was no contact
- March 16, 2026 (Reiwa 8): The law firm sent a demand notice (final demand). There was no payment or contact by the deadline. The guarantor's new address was identified by obtaining a resident record, and the notice was resent on April 24 of the same year. The guarantor made contact once but could not be reached afterward
- June 19, 2026 (Reiwa 8): The city canceled permission to use the housing under Article 37, paragraph 1, item 11 of the ordinance and demanded surrender by July 10 of the same year
- The tenant has neither surrendered the housing nor paid the arrears as of the bill's account

## What the city is asking for

- Surrender of the housing by the tenant
- Payment by the tenant and joint and several guarantor of usage fees and related charges in arrears totaling ¥2,859,100
- Monthly payment by the tenant and joint and several guarantor of twice the usage fee ceiling, from the day after cancellation of permission through the day of surrender, under Article 38, paragraph 4 of the ordinance
- A declaration of provisional execution

The litigation policy permits settlement and appeal if necessary.

## What happened to this bill

${passed}

${unanimous}

${voteAbsence}

## What the materials do not say

The bill materials do not explain the relationship between the guarantor's liability ceiling (3 months of usage fees) and the demand that the guarantor also pay the full arrears. They also do not state the monthly usage fee or the details of the "designated housing" (our translation) system.

${reasonsAbsence}`,
  },
];
