const defaultStoreInfo = {
  name: 'برنج طلا رایس',
  phone: '۰۷۱-۳۸۳۰۱۵۶۰',
  mobile: '۰۹۱۷-۳۱۴-۷۸۵۲',
  address: 'فارس، مرودشت، منطقه کامفیروز، دفتر مرکزی طلا رایس',
  email: 'info@talarice.ir',
  instagram: 'talarice'
};

const defaultBrandStory = {
  title: 'اصالت و پیشینه برنج کامفیروز',
  description: 'عرضه مستقیم اصیل‌ترین برنج معطر کامفیروز مرودشت از شالیزارهای حوزه سد درودزن استان فارس در گونی‌های نخی سفید و بهداشتی، بدون اختلاط و با خلوص ۱۰۰ درصدی.'
};

const defaultTrustItems = [
  {
    id: 'trust-1',
    title: 'ارسال مستقیم از شالیزار',
    iconClass: 'fa-solid fa-seedling',
    description: 'تمامی کیسه‌ها بدون واسطه و دلال، مستقیماً از مزارع حاصلخیز کامفیروز بسته‌بندی و ارسال می‌شوند.'
  },
  {
    id: 'trust-2',
    title: 'ضمانت ۱۰۰٪ اصالت و عطر',
    iconClass: 'fa-solid fa-circle-check',
    description: 'در صورت عدم رضایت کامل از عطر، ری و کیفیت پخت، وجه پرداختی تا ۷ روز بدون قید و شرط عودت داده می‌شود.'
  },
  {
    id: 'trust-3',
    title: 'کیسه نخی تنفس‌پذیر',
    iconClass: 'fa-solid fa-box-open',
    description: 'بسته‌بندی در گونی‌های پارچه‌ای سفید با دوخت صنعتی جهت حفظ عطر طبیعی و جلوگیری از آفت‌زدگی.'
  }
];

export const storeApi = {
  getStoreInfo: async () => defaultStoreInfo,
  getBrandStory: async () => defaultBrandStory,
  getTrustItems: async () => defaultTrustItems,
  getThemeStyles: async () => ({})
};

export default storeApi;
