import { part, question, paper } from "./shared.mjs";

const UNIT = {
  unit: 2,
  unitTitle: "Working in Health and Social Care",
  time: "1 hour 30 minutes",
  totalMarks: 80,
};

export const UNIT2_PAPERS = [
  paper({
    ...UNIT,
    id: "unit2-set-a",
    setLabel: "Set_A",
    questions: [
      question(1, "Oakfield is a mixed urban area. Residents use the GP surgery, a community pharmacy, the local authority adult social care team, a hospital 8 miles away, a British Red Cross loan service for wheelchairs, and a small private homecare agency. Informal carers include neighbours and adult children.", [
        part("a", "Identify two organisations that provide primary care in this case.", 2, [
          "GP surgery; community pharmacy. (Hospital is secondary/tertiary — do not award for hospital as primary.)",
        ]),
        part("b", "Describe the role of the local authority in adult social care.", 4, [
          "Assess needs under the Care Act; arrange or provide care and support; safeguarding adults; information and advice; may charge for some services.",
          "Working with NHS and voluntary sector, not replacing GPs.",
        ]),
        part("c", "Explain the difference between statutory, voluntary and private provision using Oakfield examples.", 6, [
          "Statutory: GP/NHS hospital/local authority — legally required, publicly funded.",
          "Voluntary: Red Cross — not-for-profit, often donations/volunteers, fills gaps (wheelchair loan).",
          "Private: homecare agency — paid by individual or local authority contract, profit-making.",
          "Must use the case, not generic lists only.",
        ]),
        part("d", "Discuss how informal carers and formal services can work together to meet residents’ needs.", 8, [
          "Informal: daily help, knowing the person, but risk of strain and no training.",
          "Formal: clinical/social care skills, regulation, can give informal carers a break.",
          "Partnership: sharing information with consent; carer’s assessment; not assuming family will cope.",
          "Level 3: balanced discussion with a conclusion about better outcomes when both work together.",
        ]),
      ]),
      question(2, "Amira is 82 and has type 2 diabetes and reduced mobility. She sees her GP, a practice nurse for reviews, a podiatrist, and a social worker after a fall. A support worker from the private agency helps her with meals. Amira’s son lives 200 miles away.", [
        part("a", "Identify two health professionals in this case.", 2, [
          "GP; practice nurse; podiatrist. (Social worker is social care; support worker is care/support.)",
        ]),
        part("b", "Outline the role of the social worker after Amira’s fall.", 4, [
          "Assess care and support needs and risks; consider reablement, homecare, equipment; safeguarding if neglect/harm suspected; involve Amira in decisions.",
        ]),
        part("c", "Explain how two professionals could work together to support Amira.", 6, [
          "GP/nurse share diabetes and mobility information (with consent) so the social worker plans realistic care.",
          "Podiatrist and support worker: foot care and prompting medication/meals reduce further falls.",
          "Multidisciplinary communication, not working in silos.",
        ]),
        part("d", "Evaluate possible barriers Amira may face when accessing services.", 8, [
          "Physical: mobility, transport 8 miles to hospital.",
          "Geographical/social: son far away — less informal advocacy.",
          "Psychological: pride, fear of losing independence.",
          "Financial: private homecare charges if not funded.",
          "How barriers might be reduced (transport, advocates, financial assessment).",
          "Level 3: range of barriers applied to Amira with a judgement.",
        ]),
      ]),
      question(3, "The Hayes family includes Jamal, 9, who has a moderate learning disability and epilepsy. He attends a mainstream school with a teaching assistant. His mum wants short-break care. Jamal becomes distressed in noisy waiting rooms.", [
        part("a", "Identify two settings that may support Jamal.", 2, [
          "Mainstream school; GP/paediatrics; children’s social care; short-break/respite; community learning disability team.",
        ]),
        part("b", "Describe two ways staff can communicate effectively with Jamal.", 4, [
          "Simple language, extra time, visual timetables, social stories, involving mum as he wishes, quiet space instead of noisy waiting rooms.",
        ]),
        part("c", "Explain why a person-centred approach is important when planning Jamal’s care.", 6, [
          "Jamal’s preferences, strengths and epilepsy needs, not a standard package.",
          "Mum as expert on his distress in noise — environment should adapt.",
          "Dignity, choice and better engagement/safety (medication, seizures).",
        ]),
        part("d", "Discuss how health, education and social care could work together for Jamal.", 8, [
          "EHCP/school TA, community paediatrician/epilepsy nurse, social care short breaks.",
          "Information sharing with consent; joint reviews.",
          "Challenges: different systems, waiting times; benefits of one plan.",
          "Level 3: applied discussion with a conclusion.",
        ]),
      ]),
      question(4, "A homecare worker notices unexplained bruises on an adult with dementia and that food has been left uneaten. The family ask her not to “make a fuss”. The agency has a safeguarding policy, a confidentiality policy and a whistleblowing procedure.", [
        part("a", "Identify two care values the worker should show.", 2, [
          "Examples: promoting dignity; safeguarding; honesty; person-centred care; respect; not keeping harmful secrets.",
        ]),
        part("b", "Describe the worker’s safeguarding responsibilities in this situation.", 4, [
          "Recognise possible abuse/neglect; record facts; report to the manager/safeguarding lead without investigating alone; do not promise secrecy to the family.",
        ]),
        part("c", "Explain how confidentiality still applies, and when information must be shared.", 6, [
          "Day-to-day personal information stays private (GDPR/Data Protection, Caldicott principles).",
          "Sharing on a need-to-know basis with the safeguarding lead is required if there is a risk of harm — confidentiality is not absolute.",
          "Family request does not override duty to report.",
        ]),
        part("d", "Evaluate the importance of policies and whistleblowing for safe practice.", 8, [
          "Policies give a clear route so workers are not left to decide alone.",
          "Whistleblowing protects people who use services if internal reporting is blocked, and protects the worker who raises concern in good faith.",
          "Limits: policies only work if trained and used; fear of family conflict.",
          "Level 3: judgement that policies are essential but culture and training make them effective.",
        ]),
      ]),
    ],
  }),
  paper({
    ...UNIT,
    id: "unit2-set-b",
    setLabel: "Set_B",
    questions: [
      question(1, "Riverside Children’s Centre offers stay-and-play, health visitor clinics, and parenting groups. Next door is an NHS midwifery team. A local food bank (voluntary) operates on Fridays. Some families also pay for a private baby-massage class in the hall.", [
        part("a", "Identify two services that are part of the NHS in this case.", 2, [
          "Health visitor clinics; midwifery team.",
        ]),
        part("b", "Describe how a children’s centre can promote the health of families.", 4, [
          "Early contact, child development advice, immunisation clinics, reducing isolation, signposting to food bank or social care.",
        ]),
        part("c", "Explain the advantages and disadvantages of using a private baby-massage class alongside NHS care.", 6, [
          "Advantages: extra choice, possibly smaller groups, convenient if NHS groups are full.",
          "Disadvantages: cost excludes some families; not a replacement for clinical midwifery/health visiting; quality varies.",
        ]),
        part("d", "Discuss why partnership between statutory and voluntary organisations matters in this community.", 8, [
          "Food bank meets immediate need NHS does not provide; centres can refer with consent.",
          "Shared aims: children’s wellbeing; different funding and rules.",
          "Risks of duplication or families falling through gaps without communication.",
          "Level 3: applied discussion with a conclusion.",
        ]),
      ]),
      question(2, "Lina is a newly qualified adult nurse on a medical ward. She works with a consultant, a healthcare assistant, a discharge coordinator and a hospital social worker. A patient, Mr Cole, is medically fit but cannot manage stairs at home.", [
        part("a", "Identify two roles that are mainly social care rather than clinical nursing.", 2, [
          "Hospital social worker; possibly discharge coordinator if arranging social care (accept if justified). Healthcare assistant is health support.",
        ]),
        part("b", "Outline the nurse’s responsibilities when preparing Mr Cole for discharge.", 4, [
          "Share clinical information with the team (consent); check understanding of medication; raise concerns about stairs; follow discharge policy.",
        ]),
        part("c", "Explain how effective teamwork could prevent a failed discharge.", 6, [
          "Social worker/OT assess home and stairs; equipment or interim care; consultant agrees medical fitness; nurse notices day-to-day ability.",
          "Without teamwork he may return as an emergency.",
        ]),
        part("d", "Evaluate the impact of poor communication between professionals on people who use services.", 8, [
          "Missed information → unsafe discharge, repeated admissions, distress.",
          "Families get mixed messages; trust falls.",
          "Good handover, records and MDT meetings reduce harm.",
          "Level 3: evaluation with examples applied to Mr Cole and a judgement.",
        ]),
      ]),
      question(3, "Grace is 45 and has been diagnosed with bipolar disorder. She uses a community mental health team (CMHT), her GP, and a peer-support charity. She wants to return to part-time work. She is worried colleagues will treat her unfairly.", [
        part("a", "Identify two organisations that could support Grace’s mental health.", 2, [
          "CMHT; GP; peer-support charity. Award two.",
        ]),
        part("b", "Describe two ways anti-discriminatory practice should be shown if Grace returns to work.", 4, [
          "Equality Act: reasonable adjustments, no harassment; confidential handling of health information; focus on ability not stereotype.",
        ]),
        part("c", "Explain how empowerment can be promoted in Grace’s care.", 6, [
          "Shared decision-making about medication and work; peer support as lived experience; advocacy if needed; not making choices for her.",
        ]),
        part("d", "Discuss barriers people with mental health needs may face when accessing work and care.", 8, [
          "Stigma, fear of disclosure, fluctuating needs, appointment times, waiting lists, financial stress.",
          "Supports: Access to Work, occupational health, flexible CMHT appointments.",
          "Level 3: barriers and how they might be reduced, applied to Grace.",
        ]),
      ]),
      question(4, "A residential care home has a medication policy, a complaints procedure and an equality and diversity policy. A resident, Mrs Adeyemi, says staff ignore her when she asks to wear her own clothes to the dining room. A student on placement hears this.", [
        part("a", "Identify two rights Mrs Adeyemi has as a person using the service.", 2, [
          "Dignity; choice; respect for culture/identity; to complain; to be safe; to be involved in decisions.",
        ]),
        part("b", "Describe how the complaints procedure should be used.", 4, [
          "Listen, record, try informal resolution, escalate per policy, no victimisation, timescales, independent advocacy if needed.",
        ]),
        part("c", "Explain how the student should respond, with reference to professional behaviour.", 6, [
          "Do not ignore; support Mrs Adeyemi to speak to a senior; follow placement reporting; do not gossip; if harm/neglect suspected, safeguarding.",
        ]),
        part("d", "Evaluate how well policies alone can protect people who use services.", 8, [
          "Policies set standards and give routes (complaints, equality).",
          "They fail if staff are rushed, untrained or if culture dismisses residents’ wishes (own clothes).",
          "Inspection, training, leadership and person-centred culture make policies real.",
          "Level 3: judgement that policies are necessary but not sufficient.",
        ]),
      ]),
    ],
  }),
  paper({
    ...UNIT,
    id: "unit2-set-c",
    setLabel: "Set_C",
    questions: [
      question(1, "Westbridge Hospice (voluntary sector) works with an NHS palliative care consultant, district nurses and a local authority carer’s officer. Families can also buy extra night sits from a private agency. A faith group provides volunteer sitting.", [
        part("a", "Identify two types of care shown in this case (for example primary, secondary, tertiary, informal).", 2, [
          "Tertiary/specialist palliative (consultant/hospice); primary (district nurses); informal (faith group); private additional care. Award any two correctly labelled.",
        ]),
        part("b", "Describe the purpose of hospice care.", 4, [
          "Holistic support for life-limiting illness: pain/symptom control, emotional, social and spiritual support, family support, not only end-of-life beds.",
        ]),
        part("c", "Explain why multi-agency working is important in palliative care.", 6, [
          "Needs cross health, social care and spiritual support; 24-hour cover; carer breakdown prevention; consistent plans (DNACPR, preferred place of death) communicated.",
        ]),
        part("d", "Discuss funding and access issues that families may face in this mix of provision.", 8, [
          "NHS/hospice charitable funding vs paying for night sits — inequality.",
          "Eligibility for local authority carer support; waiting times; rural transport (if applied carefully — case does not specify rural).",
          "Level 3: discussion of mixed economy of care with a conclusion about fairness/access.",
        ]),
      ]),
      question(2, "Ben is 28 and has a spinal cord injury. He uses a wheelchair. He sees a physiotherapist, an occupational therapist, a specialist nurse and a personal assistant funded through a direct payment. The GP surgery has steps at the entrance and a bell for assistance.", [
        part("a", "Identify two allied health professionals in this case.", 2, [
          "Physiotherapist; occupational therapist.",
        ]),
        part("b", "Describe how an occupational therapist could support Ben’s independence.", 4, [
          "Home/work adaptations, equipment, energy conservation, practising daily living tasks, advising the PA and GP surgery on access.",
        ]),
        part("c", "Explain two physical barriers Ben may face and how they could be reduced.", 6, [
          "Surgery steps: ramp, accessible entrance, not relying only on a bell.",
          "Transport, narrow doors, inaccessible toilets — reasonable adjustments under the Equality Act.",
        ]),
        part("d", "Evaluate the use of direct payments for people with physical disabilities.", 8, [
          "Control over who supports him and when; person-centred.",
          "Responsibility to employ/manage a PA; risk if unwell; need for information and support to use the payment well.",
          "Level 3: balanced evaluation applied to Ben.",
        ]),
      ]),
      question(3, "A school nurse is supporting Year 10 sessions on consent, confidentiality and where to get sexual health advice. A pupil asks the nurse not to tell anyone they are attending a clinic. The nurse also has a safeguarding duty.", [
        part("a", "Identify two principles of the 6Cs or care values relevant to this work.", 2, [
          "Care, compassion, competence, communication, courage, commitment — or confidentiality, respect, safeguarding. Award two.",
        ]),
        part("b", "Outline when a school nurse may keep a young person’s information confidential.", 4, [
          "If the young person is competent (Gillick/Fraser principles in sexual health contexts), information is kept private unless there is risk of significant harm or exploitation.",
        ]),
        part("c", "Explain how the nurse should balance confidentiality with safeguarding.", 6, [
          "Explain limits of confidentiality at the start; keep routine clinic attendance private; share if abuse, trafficking, or serious risk; share only with those who need to know; record decisions.",
        ]),
        part("d", "Discuss why trust matters when young people use health services.", 8, [
          "Without trust they may not seek contraception/STI care → worse public health and individual harm.",
          "Trust is built by honesty about what will be shared.",
          "Safeguarding still protects those who cannot consent or are at risk.",
          "Level 3: discussion with a justified conclusion.",
        ]),
      ]),
      question(4, "An inspector finds that a day service for adults with learning disabilities has no up-to-date DBS checks for two staff, incomplete accident records, and that activities are the same every week regardless of individual plans. The manager says they are “short-staffed”.", [
        part("a", "Identify two laws or types of regulation that apply to this service.", 2, [
          "Examples: Health and Social Care Act / CQC regulation; DBS/safeguarding requirements; Equality Act; Health and Safety; Data Protection. Award two.",
        ]),
        part("b", "Describe two possible consequences of poor record-keeping.", 4, [
          "Injuries not followed up; cannot evidence care; inspection failure; risk in emergencies; families lose trust.",
        ]),
        part("c", "Explain how person-centred planning should influence daily activities.", 6, [
          "Individual goals, interests and communication needs — not one timetable for all.",
          "Short-staffing is not a reason to ignore plans; must escalate and risk-assess, not quietly drop personalisation.",
        ]),
        part("d", "Evaluate the manager’s responsibilities for safer recruitment and staffing.", 8, [
          "DBS and references before unsupervised work; rotas that allow safe care; reporting vacancies to the provider/local authority if quality is at risk.",
          "“Short-staffed” explains pressure but does not excuse illegal/unsafe practice.",
          "Level 3: clear judgement on accountability.",
        ]),
      ]),
    ],
  }),
];
