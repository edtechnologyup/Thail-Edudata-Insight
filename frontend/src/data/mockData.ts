export type DatasetStatus = "published" | "draft" | "submitted" | "rejected";

export type DatasetLicense = "open" | "conditional" | "cc";

export type HomeDatasetMock = {
  id: string;
  title: string;
  category: string;
  agency: string;
  status: DatasetStatus;
  downloadCount: number;
  updatedAt: string;
  license: DatasetLicense;
};

export const MOCK_HOME_STATS = {
  totalDatasets: 1234,
  totalDownloads: 56789,
  totalAgencies: 45,
};

export const MOCK_POPULAR_DATASETS: HomeDatasetMock[] = [
  {
    id: "1",
    title: "สถิตินักเรียนรายจังหวัด 2566",
    category: "สถิตินักเรียน",
    agency: "สพฐ.",
    status: "published",
    downloadCount: 12400,
    updatedAt: "2024-01-01T00:00:00Z",
    license: "open",
  },
  {
    id: "2",
    title: "จำนวนนักเรียนรายชั้นเรียน จำแนกตามเพศ ปีการศึกษา 2566",
    category: "สถิติพื้นฐาน",
    agency: "สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน (สพฐ.)",
    status: "published",
    downloadCount: 12400,
    updatedAt: "2025-01-13T00:00:00Z",
    license: "open",
  },
  {
    id: "3",
    title: "รายชื่อโรงเรียนและพิกัดที่ตั้งทั่วประเทศไทย ประจำปี 2567",
    category: "ทรัพยากร",
    agency: "กระทรวงศึกษาธิการ",
    status: "published",
    downloadCount: 8100,
    updatedAt: "2025-01-10T00:00:00Z",
    license: "open",
  },
  {
    id: "4",
    title: "สถิติจำนวนบัณฑิตจบใหม่ แยกตามกลุ่มสาขาวิชา 2562-2566",
    category: "อุดมศึกษา",
    agency: "กระทรวง อว. (MHESI)",
    status: "published",
    downloadCount: 5300,
    updatedAt: "2025-01-06T00:00:00Z",
    license: "conditional",
  },
  {
    id: "5",
    title: "ข้อมูลครูและบุคลากรทางการศึกษา 2566",
    category: "บุคลากร",
    agency: "สพฐ.",
    status: "published",
    downloadCount: 8900,
    updatedAt: "2024-12-15T00:00:00Z",
    license: "open",
  },
  {
    id: "6",
    title: "ผลการเรียน O-NET ระดับประถมศึกษา 2566",
    category: "การประเมิน",
    agency: "สถาบันการประเมินผลการศึกษาแห่งชาติ",
    status: "published",
    downloadCount: 15600,
    updatedAt: "2024-11-20T00:00:00Z",
    license: "cc",
  },
];

export const MOCK_LATEST_DATASETS: HomeDatasetMock[] = [
  {
    id: "7",
    title: "งบประมาณสนับสนุนรายหัวนักเรียนระดับประถมศึกษา 2567",
    category: "งบประมาณ",
    agency: "สำนักงบประมาณ",
    status: "published",
    downloadCount: 320,
    updatedAt: "2025-01-15T08:00:00Z",
    license: "open",
  },
  {
    id: "8",
    title: "รายชื่อสถานประกอบการที่ร่วมจัดการศึกษาทวิภาคี 2566",
    category: "อาชีวศึกษา",
    agency: "สอศ. (OVEC)",
    status: "published",
    downloadCount: 540,
    updatedAt: "2025-01-15T06:00:00Z",
    license: "conditional",
  },
  {
    id: "9",
    title: "จำนวนข้าราชการครูเกษียณอายุราชการรายจังหวัด 2567-2570",
    category: "บุคลากร",
    agency: "ก.ค.ศ. (OTEPC)",
    status: "published",
    downloadCount: 210,
    updatedAt: "2025-01-15T02:15:00Z",
    license: "open",
  },
  {
    id: "10",
    title: "สถิตินักเรียนระดับมัธยมศึกษา ปีการศึกษา 2567",
    category: "สถิตินักเรียน",
    agency: "สพฐ.",
    status: "published",
    downloadCount: 980,
    updatedAt: "2025-01-14T12:00:00Z",
    license: "open",
  },
  {
    id: "11",
    title: "รายชื่อโรงเรียนในเขตกรุงเทพมหานคร",
    category: "โรงเรียน",
    agency: "สพฐ.",
    status: "published",
    downloadCount: 2100,
    updatedAt: "2025-01-14T09:00:00Z",
    license: "open",
  },
  {
    id: "12",
    title: "อัตราการเข้าเรียนต่อเนื่อง ม.3-ม.6",
    category: "นักเรียน",
    agency: "สำนักงานคณะกรรมการส่งเสริมการศึกษาเอกชน",
    status: "published",
    downloadCount: 720,
    updatedAt: "2025-01-13T16:30:00Z",
    license: "open",
  },
];

export type MegaMenuLink = {
  id: string;
  labelTh: string;
  labelEn: string;
  href?: string;
};

export type MegaMenuCategory = MegaMenuLink & {
  children?: MegaMenuLink[];
};

export const MOCK_MEGAMENU_CATEGORIES: MegaMenuCategory[] = [
  {
    id: "cat-students",
    labelTh: "สถิตินักเรียนและนักศึกษา",
    labelEn: "Student statistics",
    children: [
      {
        id: "cat-students-enroll",
        labelTh: "การลงทะเบียนเรียน",
        labelEn: "Enrollment",
      },
      {
        id: "cat-students-region",
        labelTh: "แยกตามภูมิภาค",
        labelEn: "By region",
      },
    ],
  },
  {
    id: "cat-teachers",
    labelTh: "ข้อมูลจำนวนครูและบุคลากร",
    labelEn: "Teachers and staff",
  },
  {
    id: "cat-schools",
    labelTh: "ที่ตั้งสถานศึกษาทั่วประเทศ",
    labelEn: "School locations",
  },
  {
    id: "cat-budget",
    labelTh: "งบประมาณด้านการศึกษา",
    labelEn: "Education budget",
  },
  {
    id: "cat-outcomes",
    labelTh: "ผลสัมฤทธิ์ทางการเรียน",
    labelEn: "Learning outcomes",
  },
];

export const MOCK_MEGAMENU_YEARS: MegaMenuLink[] = [
  { id: "y2567", labelTh: "ปีการศึกษา 2567", labelEn: "Academic year 2567" },
  { id: "y2566", labelTh: "ปีการศึกษา 2566", labelEn: "Academic year 2566" },
  { id: "y2565", labelTh: "ปีการศึกษา 2565", labelEn: "Academic year 2565" },
  { id: "y2564", labelTh: "ปีการศึกษา 2564", labelEn: "Academic year 2564" },
  { id: "y2563", labelTh: "ปีการศึกษา 2563", labelEn: "Academic year 2563" },
];

export const MOCK_MEGAMENU_AGENCIES: MegaMenuLink[] = [
  { id: "obec", labelTh: "สพฐ. (OBEC)", labelEn: "OBEC" },
  { id: "ovec", labelTh: "สอศ. (OVEC)", labelEn: "OVEC" },
  { id: "ohec", labelTh: "สกอ. (OHEC)", labelEn: "OHEC" },
  { id: "onie", labelTh: "กศน. (ONIE)", labelEn: "ONIE" },
];

export type SearchFileFormat = "csv" | "excel" | "json";

export type SearchResultMock = {
  id: string;
  titleTh: string;
  titleEn: string;
  descriptionTh: string;
  descriptionEn: string;
  categoryTh: string;
  categoryEn: string;
  categoryId: string;
  agencyTh: string;
  agencyEn: string;
  agencyId: string;
  status: DatasetStatus;
  downloadCount: number;
  updatedAt: string;
  license: DatasetLicense;
  fileFormats: SearchFileFormat[];
  year: number;
};

export const MOCK_SEARCH_RESULTS: SearchResultMock[] = [
  {
    id: "sr-001",
    titleTh: "สถิตินักเรียนรายจังหวัด 2566",
    titleEn: "Provincial Student Statistics 2023",
    descriptionTh: "ข้อมูลสถิตินักเรียนแยกตามจังหวัดทั่วประเทศ",
    descriptionEn: "Student statistics by province nationwide",
    categoryTh: "สถิตินักเรียน",
    categoryEn: "Student Statistics",
    categoryId: "student-stats",
    agencyTh: "สพฐ.",
    agencyEn: "OBEC",
    agencyId: "obec",
    status: "published",
    downloadCount: 12340,
    updatedAt: "2024-05-01T00:00:00Z",
    license: "open",
    fileFormats: ["csv", "excel"],
    year: 2566,
  },
  {
    id: "sr-002",
    titleTh: "สถิติการลงทะเบียนนักเรียนประถมศึกษา 2566",
    titleEn: "Primary Enrollment Statistics 2023",
    descriptionTh:
      "จำนวนนักเรียนแยกตามระดับชั้นและเพศในโรงเรียนสังกัด สพฐ.",
    descriptionEn:
      "Enrollment by grade and gender in OBEC-affiliated schools",
    categoryTh: "สถิตินักเรียน",
    categoryEn: "Student Statistics",
    categoryId: "student-stats",
    agencyTh: "สพฐ.",
    agencyEn: "OBEC",
    agencyId: "obec",
    status: "published",
    downloadCount: 8900,
    updatedAt: "2024-04-15T00:00:00Z",
    license: "open",
    fileFormats: ["csv", "json"],
    year: 2566,
  },
  {
    id: "sr-003",
    titleTh: "ข้อมูลครูและบุคลากรทางการศึกษา 2566",
    titleEn: "Teacher and Education Personnel 2023",
    descriptionTh: "จำนวนครูแยกตามสาขาวิชาและวุฒิการศึกษา",
    descriptionEn: "Teacher counts by subject and qualification",
    categoryTh: "ข้อมูลครู",
    categoryEn: "Teacher Records",
    categoryId: "teacher-records",
    agencyTh: "สพฐ.",
    agencyEn: "OBEC",
    agencyId: "obec",
    status: "published",
    downloadCount: 5600,
    updatedAt: "2024-03-20T00:00:00Z",
    license: "conditional",
    fileFormats: ["excel"],
    year: 2566,
  },
  {
    id: "sr-004",
    titleTh: "งบประมาณสถาบันอาชีวศึกษา 2566",
    titleEn: "Vocational Institute Budget 2023",
    descriptionTh: "รายงานงบประมาณแยกตามจังหวัดและประเภทสถาบัน",
    descriptionEn: "Budget reports by province and institution type",
    categoryTh: "งบประมาณ",
    categoryEn: "Budget",
    categoryId: "enrollment-secondary",
    agencyTh: "สอศ.",
    agencyEn: "OVEC",
    agencyId: "ovec",
    status: "published",
    downloadCount: 1800,
    updatedAt: "2024-04-01T00:00:00Z",
    license: "cc",
    fileFormats: ["csv", "excel", "json"],
    year: 2566,
  },
  {
    id: "sr-005",
    titleTh: "แผนที่โครงสร้างพื้นฐานดิจิทัลโรงเรียน 2567",
    titleEn: "School Digital Infrastructure Map 2024",
    descriptionTh: "ข้อมูลความพร้อมอินเทอร์เน็ตและห้องปฏิบัติการคอมพิวเตอร์",
    descriptionEn: "Internet readiness and computer lab facilities",
    categoryTh: "โครงสร้างพื้นฐาน",
    categoryEn: "Infrastructure",
    categoryId: "primary",
    agencyTh: "กระทรวงศึกษาธิการ",
    agencyEn: "MOE",
    agencyId: "moe",
    status: "published",
    downloadCount: 850,
    updatedAt: "2025-01-10T00:00:00Z",
    license: "conditional",
    fileFormats: ["json"],
    year: 2567,
  },
  {
    id: "sr-006",
    titleTh: "ผลสัมฤทธิ์ O-NET ระดับมัธยมศึกษาตอนต้น 2566",
    titleEn: "O-NET Lower Secondary Results 2023",
    descriptionTh: "คะแนนเฉลี่ยแยกตามวิชาและภูมิภาค",
    descriptionEn: "Average scores by subject and region",
    categoryTh: "ผลการเรียน",
    categoryEn: "Learning Outcomes",
    categoryId: "secondary",
    agencyTh: "สพฐ.",
    agencyEn: "OBEC",
    agencyId: "obec",
    status: "published",
    downloadCount: 4200,
    updatedAt: "2024-02-10T00:00:00Z",
    license: "open",
    fileFormats: ["csv"],
    year: 2566,
  },
  {
    id: "sr-007",
    titleTh: "รายชื่อสถานประกอบการทวิภาคี 2566",
    titleEn: "Dual Vocational Partner Companies 2023",
    descriptionTh: "รายชื่อสถานประกอบการที่ร่วมจัดการศึกษาทวิภาคี",
    descriptionEn: "Companies participating in dual vocational programs",
    categoryTh: "อาชีวศึกษา",
    categoryEn: "Vocational Education",
    categoryId: "enrollment-secondary",
    agencyTh: "สอศ.",
    agencyEn: "OVEC",
    agencyId: "ovec",
    status: "published",
    downloadCount: 2100,
    updatedAt: "2024-01-28T00:00:00Z",
    license: "open",
    fileFormats: ["excel"],
    year: 2566,
  },
  {
    id: "sr-008",
    titleTh: "จำนวนบัณฑิตจบใหม่ แยกสาขาวิชา 2562-2566",
    titleEn: "New Graduates by Field 2019-2023",
    descriptionTh: "สถิติบัณฑิตจบใหม่ระดับอุดมศึกษา",
    descriptionEn: "Higher education graduate statistics",
    categoryTh: "อุดมศึกษา",
    categoryEn: "Higher Education",
    categoryId: "secondary",
    agencyTh: "กระทรวง อว.",
    agencyEn: "MHESI",
    agencyId: "moe",
    status: "published",
    downloadCount: 5300,
    updatedAt: "2024-01-15T00:00:00Z",
    license: "cc",
    fileFormats: ["csv", "excel"],
    year: 2566,
  },
  {
    id: "sr-009",
    titleTh: "งบประมาณรายหัวนักเรียนประถมศึกษา 2567",
    titleEn: "Per-Student Primary Budget 2024",
    descriptionTh: "งบสนับสนุนรายหัวนักเรียนระดับประถมศึกษา",
    descriptionEn: "Per-capita funding for primary education",
    categoryTh: "งบประมาณ",
    categoryEn: "Budget",
    categoryId: "student-stats",
    agencyTh: "สำนักงบประมาณ",
    agencyEn: "Budget Bureau",
    agencyId: "moe",
    status: "published",
    downloadCount: 980,
    updatedAt: "2025-01-05T00:00:00Z",
    license: "open",
    fileFormats: ["csv", "json"],
    year: 2567,
  },
  {
    id: "sr-010",
    titleTh: "อัตราการเข้าเรียนต่อเนื่อง ม.3-ม.6",
    titleEn: "Continuation Rate Grades 10-12",
    descriptionTh: "อัตราการสำเร็จการศึกษาและเข้าศึกษาต่อระดับที่สูงขึ้น",
    descriptionEn: "Completion and progression rates to higher levels",
    categoryTh: "สถิตินักเรียน",
    categoryEn: "Student Statistics",
    categoryId: "student-stats",
    agencyTh: "สพฐ.",
    agencyEn: "OBEC",
    agencyId: "obec",
    status: "published",
    downloadCount: 3200,
    updatedAt: "2024-06-01T00:00:00Z",
    license: "open",
    fileFormats: ["csv", "excel", "json"],
    year: 2566,
  },
];

export const MOCK_FILTER_CATEGORIES: MegaMenuCategory[] = [
  {
    id: "primary",
    labelTh: "การศึกษาขั้นพื้นฐาน",
    labelEn: "Primary Education",
    children: [
      {
        id: "student-stats",
        labelTh: "สถิตินักเรียน",
        labelEn: "Student Statistics",
      },
      {
        id: "teacher-records",
        labelTh: "ข้อมูลครู",
        labelEn: "Teacher Records",
      },
    ],
  },
  {
    id: "secondary",
    labelTh: "การศึกษาขั้นพื้นฐานตอนปลาย",
    labelEn: "Secondary Education",
    children: [
      {
        id: "enrollment-secondary",
        labelTh: "การลงทะเบียน",
        labelEn: "Enrollment",
      },
    ],
  },
];

export const MOCK_FILTER_AGENCIES = [
  { id: "obec", labelTh: "สพฐ. (OBEC)", labelEn: "OBEC" },
  { id: "ovec", labelTh: "สอศ. (OVEC)", labelEn: "OVEC" },
  { id: "moe", labelTh: "กระทรวงศึกษาธิการ", labelEn: "MOE" },
];

export const MOCK_FILTER_YEARS = ["2567", "2566", "2565"];

export const MOCK_FILTER_FORMATS: { id: SearchFileFormat; label: string }[] = [
  { id: "csv", label: "CSV" },
  { id: "excel", label: "XLSX" },
  { id: "json", label: "JSON" },
];

export const MOCK_SEARCH_TOTAL = 1234;
