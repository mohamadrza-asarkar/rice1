/**
 * ماژول مدیریت و قالب‌بندی خطاهای سرور و کاربر
 */

export function toPersianDigits(str) {
  if (str === null || str === undefined) return '';
  const s = String(str);
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return s.replace(/\d/g, d => persianDigits[d]);
}

/**
 * پردازش و تفکیک هوشمند خطاها
 * پیام واقعی ارسالی از سرور بدون دستکاری حفظ می‌شود
 */
export function parseApiError(err) {
  if (!err) {
    return {
      statusCode: 500,
      errorType: 'SERVER_ERROR',
      isServerError: true,
      isUserError: false,
      title: 'خطای سرور',
      message: 'سرور در حال حاضر پاسخگو نیست. لطفاً دقایقی بعد تلاش کنید.',
      errors: null,
      displayText: 'سرور در حال حاضر پاسخگو نیست.'
    };
  }

  // در صورتی که خطا قبلاً پردازش شده باشد
  if (err.isProcessed) {
    return err;
  }

  const respData = err.response?.data || (typeof err === 'object' && !err.response ? err : {});
  const rawStatus =
    err.statusCode ||
    respData.statusCode ||
    err.response?.status ||
    (err.code === 'ERR_NETWORK' ? 0 : 500);

  const status = Number(rawStatus) || (rawStatus === 0 ? 0 : 500);

  // استخراج پیام مستقیم سرور بدون دستکاری
  const rawMessage = respData.message || respData.error || err.message || '';
  const errors = respData.errors || err.errors || null;

  // دسته‌بندی نوع خطا
  const isNetwork = status === 0 || err.code === 'ERR_NETWORK' || rawMessage.includes('Network Error');
  const isServerError = isNetwork || (typeof status === 'number' && status >= 500);
  const isValidation = status === 400 || status === 422;
  const isAuth = status === 401 || status === 403;
  const isNotFound = status === 404;
  const isUserError = !isServerError && typeof status === 'number' && status >= 400 && status < 500;

  let errorType = 'UNKNOWN';
  let title = 'خطا در عملیات';
  let message = rawMessage;
  let actionAdvice = '';

  if (isNetwork) {
    errorType = 'NETWORK_ERROR';
    title = 'عدم ارتباط با سرور';
    message = rawMessage || 'ارتباط با سرور برقرار نشد. لطفاً اتصال اینترنت خود را بررسی نمایید.';
    actionAdvice = 'لطفاً وضعیت اتصال اینترنت را چک کرده و مجدداً تلاش فرمایید.';
  } else if (status === 503) {
    errorType = 'SERVER_MAINTENANCE';
    title = 'سرویس در دسترس نیست';
    message = rawMessage || 'سرور در حال حاضر قادر به پاسخگویی نیست (کد ۵۰۳).';
    actionAdvice = 'لطفاً دقایقی دیگر مجدداً تلاش فرمایید.';
  } else if (isServerError) {
    errorType = 'SERVER_ERROR';
    title = 'خطای سرور';
    message = rawMessage || 'مشکلی در پردازش درخواست سمت سرور رخ داده است.';
    actionAdvice = 'لطفاً دقایقی بعد دوباره امتحان کنید.';
  } else if (isValidation) {
    errorType = 'VALIDATION_ERROR';
    title = 'خطا در اطلاعات ارسالی';
    // پیام سرور مستقیماً استفاده می‌شود بدون جایگزینی مصنوعی
    message = rawMessage || 'اطلاعات ورودی نامعتبر است.';
    actionAdvice = 'لطفاً فیلدهای فرم را بررسی کرده و مجدداً ارسال کنید.';
  } else if (isAuth) {
    errorType = 'AUTH_ERROR';
    title = status === 403 ? 'عدم دسترسی' : 'نیاز به ورود';
    message = rawMessage || (status === 403 ? 'شما اجازه دسترسی به این بخش را ندارید.' : 'لطفاً ابتدا وارد حساب کاربری خود شوید.');
    actionAdvice = status === 401 ? 'لطفاً از طریق صفحه ورود اقدام نمایید.' : '';
  } else if (isNotFound) {
    errorType = 'NOT_FOUND';
    title = 'یافت نشد';
    message = rawMessage || 'مورد درخواستی در سامانه یافت نشد.';
  } else {
    errorType = 'CLIENT_ERROR';
    title = 'خطای درخواست';
    message = rawMessage || 'درخواست نامعتبر است.';
  }

  // قالب‌بندی جزئیات فیلدها در صورت وجود
  let fieldDetails = '';
  if (errors && typeof errors === 'object' && Object.keys(errors).length > 0) {
    fieldDetails = Object.entries(errors)
      .map(([field, msg]) => {
        const faField =
          field === 'phone' ? 'شماره موبایل' :
          field === 'password' ? 'کلمه عبور' :
          field === 'name' ? 'نام و نام خانوادگی' :
          field === 'address' ? 'آدرس' : field;
        return `${faField}: ${msg}`;
      })
      .join(' | ');
  }

  return {
    isProcessed: true,
    statusCode: status,
    errorType,
    isServerError,
    isUserError,
    title,
    userFriendlyTitle: title,
    message,
    actionAdvice,
    errors,
    fieldDetails,
    displayText: message
  };
}

export default parseApiError;
