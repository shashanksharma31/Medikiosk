export interface IntakeQuestion {
  id: string;
  category: 'chief_complaint' | 'duration' | 'pain_scale' | 'associated_symptoms' | 'vitals';
  question: string;
  promptHindi: string;
  options: {
    label: string;
    labelHindi: string;
    severityScore: number;
    triggersCritical?: boolean;
    nextQuestionId?: string;
  }[];
}

export const INTAKE_QUESTIONS: IntakeQuestion[] = [
  {
    id: 'q_primary_issue',
    category: 'chief_complaint',
    question: 'What is the main reason for your visit today?',
    promptHindi: 'आज अस्पताल आने का मुख्य कारण क्या है?',
    options: [
      {
        label: 'Chest pain or heavy tightness in chest',
        labelHindi: 'छाती में दर्द, भारीपन या दबाव',
        severityScore: 9,
        triggersCritical: true,
        nextQuestionId: 'q_chest_pain_nature',
      },
      {
        label: 'Shortness of breath or heavy breathing',
        labelHindi: 'सांस लेने में तकलीफ या सांस फूलना',
        severityScore: 8,
        triggersCritical: true,
        nextQuestionId: 'q_breath_onset',
      },
      {
        label: 'High fever, chills, or body ache',
        labelHindi: 'तेज बुखार, कंपकंपी या बदन दर्द',
        severityScore: 6,
        triggersCritical: false,
        nextQuestionId: 'q_fever_duration',
      },
      {
        label: 'Abdominal pain, vomiting, or loose motions',
        labelHindi: 'पेट में दर्द, उल्टी या दस्त',
        severityScore: 5,
        triggersCritical: false,
        nextQuestionId: 'q_abdo_pain_location',
      },
      {
        label: 'Regular BP / Sugar / Chronic Medicine Checkup',
        labelHindi: 'नियमित बीपी, शुगर या पुरानी दवाइयों की जांच',
        severityScore: 2,
        triggersCritical: false,
        nextQuestionId: 'q_routine_check',
      },
      {
        label: 'Minor Injury, wound, or skin rash',
        labelHindi: 'मामूली चोट, घाव या त्वचा में खुजली',
        severityScore: 3,
        triggersCritical: false,
        nextQuestionId: 'q_injury_details',
      },
    ],
  },
  {
    id: 'q_chest_pain_nature',
    category: 'associated_symptoms',
    question: 'Does the pain spread to your left arm, neck, or jaw, or cause sweating?',
    promptHindi: 'क्या दर्द बाएं हाथ, गर्दन, जबड़े में जा रहा है या ठंडा पसीना आ रहा है?',
    options: [
      {
        label: 'Yes, spreading to left arm/jaw with sweating',
        labelHindi: 'हां, बाएं हाथ/जबड़े में फैल रहा है और पसीना आ रहा है',
        severityScore: 10,
        triggersCritical: true,
      },
      {
        label: 'Pain increases when taking deep breaths',
        labelHindi: 'गहरी सांस लेने पर चुभन बढ़ती है',
        severityScore: 6,
        triggersCritical: false,
      },
      {
        label: 'Burning sensation in chest after eating (Acidity)',
        labelHindi: 'खाने के बाद जलन होती है (गैस/एसिडिटी जैसा)',
        severityScore: 4,
        triggersCritical: false,
      },
      {
        label: 'Muscle tenderness on touching chest wall',
        labelHindi: 'छाती को छूने पर दर्द महसूस होता है',
        severityScore: 3,
        triggersCritical: false,
      },
    ],
  },
  {
    id: 'q_breath_onset',
    category: 'duration',
    question: 'How quickly did the breathing difficulty start?',
    promptHindi: 'सांस फूलने की समस्या कब और कैसे शुरू हुई?',
    options: [
      {
        label: 'Sudden onset within last hour with blue lips/confusion',
        labelHindi: 'अचानक पिछले 1 घंटे में शुरू हुई, बहुत घबराहट है',
        severityScore: 10,
        triggersCritical: true,
      },
      {
        label: 'Gradual increase over 2-3 days with productive cough',
        labelHindi: '2-3 दिनों से धीरे-धीरे बढ़ रही है, बलगम वाली खांसी है',
        severityScore: 6,
        triggersCritical: false,
      },
      {
        label: 'Only while walking or climbing stairs',
        labelHindi: 'केवल चलने या सीढ़ियां चढ़ने पर फूलती है',
        severityScore: 4,
        triggersCritical: false,
      },
    ],
  },
  {
    id: 'q_fever_duration',
    category: 'duration',
    question: 'How many days have you had the fever?',
    promptHindi: 'बुखार कितने दिनों से है?',
    options: [
      {
        label: 'More than 7 days with severe shivering',
        labelHindi: '7 दिनों से अधिक, तेज ठंड के साथ',
        severityScore: 7,
        triggersCritical: false,
      },
      {
        label: '2 to 3 days, responds to Paracetamol',
        labelHindi: '2 से 3 दिन, पैरासिटामोल लेने पर कम हो जाता है',
        severityScore: 4,
        triggersCritical: false,
      },
      {
        label: 'Started today with mild shivering and sore throat',
        labelHindi: 'आज ही शुरू हुआ, गले में खराश है',
        severityScore: 3,
        triggersCritical: false,
      },
    ],
  },
  {
    id: 'q_abdo_pain_location',
    category: 'associated_symptoms',
    question: 'Where is the abdominal pain located?',
    promptHindi: 'पेट में दर्द किस जगह पर हो रहा है?',
    options: [
      {
        label: 'Severe lower right side with inability to walk (Appendicitis suspected)',
        labelHindi: 'निचले दाएं हिस्से में असहनीय दर्द, सीधा नहीं हुआ जा रहा',
        severityScore: 8,
        triggersCritical: true,
      },
      {
        label: 'Upper middle abdomen burning with nausea',
        labelHindi: 'ऊपरी पेट में जलन और मिचली',
        severityScore: 4,
        triggersCritical: false,
      },
      {
        label: 'Cramps across lower abdomen with loose motions',
        labelHindi: 'निचले पेट में मरोड़ और पतले दस्त',
        severityScore: 4,
        triggersCritical: false,
      },
    ],
  },
  {
    id: 'q_routine_check',
    category: 'chief_complaint',
    question: 'What routine follow-up is needed?',
    promptHindi: 'आज किस जांच या फॉलो-अप के लिए आए हैं?',
    options: [
      {
        label: 'Refill routine monthly medicines for BP & Sugar',
        labelHindi: 'बीपी व शुगर की नियमित मासिक दवाई दोबारा लिखवानी है',
        severityScore: 1,
        triggersCritical: false,
      },
      {
        label: 'Doctor ordered blood test report review',
        labelHindi: 'डॉक्टर द्वारा दी गई खून की जांच रिपोर्ट दिखानी है',
        severityScore: 2,
        triggersCritical: false,
      },
      {
        label: 'Routine antenatal checkup for pregnancy',
        labelHindi: 'गर्भावस्था की नियमित एएनसी (ANC) जांच',
        severityScore: 2,
        triggersCritical: false,
      },
    ],
  },
  {
    id: 'q_injury_details',
    category: 'chief_complaint',
    question: 'Nature of injury or wound:',
    promptHindi: 'चोट या घाव की स्थिति क्या है?',
    options: [
      {
        label: 'Deep cut with active bleeding',
        labelHindi: 'गहरा घाव और खून बह रहा है',
        severityScore: 7,
        triggersCritical: false,
      },
      {
        label: 'Blunt fall with joint swelling, able to move limb',
        labelHindi: 'गिरने से मोच या सूजन, अंग हिला पा रहे हैं',
        severityScore: 4,
        triggersCritical: false,
      },
      {
        label: 'Old scratch / healing abrasion needs dressing',
        labelHindi: 'पुरानी खरोंच, केवल ड्रेसिंग करवानी है',
        severityScore: 1,
        triggersCritical: false,
      },
    ],
  },
];
