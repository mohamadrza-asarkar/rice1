import React, { useState } from 'react';
import { formatOrderStatus } from '../../../api/orders.api';
import styles from '../admin.module.css';

export function AdminOrders({
  adminOrders = [],
  isLoadingOrders = false,
  onRefreshOrders,
  onUpdateStatus,
  onDeleteOrder
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [previewReceipt, setPreviewReceipt] = useState(null);

  // Tracking Code Modal state
  const [trackingModalOrder, setTrackingModalOrder] = useState(null);
  const [trackingInput, setTrackingInput] = useState('');

  // Reject Reason Modal state
  const [rejectModalOrder, setRejectModalOrder] = useState(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('');

  // Custom Admin Message Modal state
  const [messageModalOrder, setMessageModalOrder] = useState(null);
  const [messageInput, setMessageInput] = useState('');

  const queryText = searchQuery.trim().toLowerCase();

  const filteredOrders = adminOrders.filter((order) => {
    const tracking = order.trackingCode || '';
    const postTracking = order.postTrackingCode || '';
    const customer = order.customerName || order.name || '';
    const phone = order.customerPhone || order.phone || '';

    const matchSearch =
      !queryText ||
      tracking.includes(queryText) ||
      postTracking.includes(queryText) ||
      customer.toLowerCase().includes(queryText) ||
      phone.includes(queryText);

    const statusText = formatOrderStatus(order.status);
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'processing' && statusText === 'در حال پردازش') ||
      (statusFilter === 'shipped' && statusText === 'ارسال شده') ||
      (statusFilter === 'delivered' && statusText === 'تحویل داده شده') ||
      (statusFilter === 'cancelled' && statusText === 'لغو شده');

    return matchSearch && matchStatus;
  });

  const openTrackingModal = (order) => {
    setTrackingModalOrder(order);
    setTrackingInput(order.postTrackingCode || order.trackingCode || '');
  };

  const handleSaveTrackingCode = () => {
    if (!trackingModalOrder) return;
    const orderId = trackingModalOrder.id || trackingModalOrder._id;
    if (onUpdateStatus) {
      onUpdateStatus(orderId, trackingModalOrder.status || 'ارسال شده', trackingInput.trim(), trackingModalOrder.cancelReason, trackingModalOrder.adminNote);
    }
    setTrackingModalOrder(null);
    setTrackingInput('');
  };

  const openRejectModal = (order) => {
    setRejectModalOrder(order);
    setRejectReasonInput(order.cancelReason || '');
  };

  const handleSaveRejectReason = () => {
    if (!rejectModalOrder) return;
    const orderId = rejectModalOrder.id || rejectModalOrder._id;
    if (onUpdateStatus) {
      onUpdateStatus(orderId, 'لغو شده', rejectModalOrder.postTrackingCode, rejectReasonInput.trim(), rejectReasonInput.trim());
    }
    setRejectModalOrder(null);
    setRejectReasonInput('');
  };

  const openMessageModal = (order) => {
    setMessageModalOrder(order);
    setMessageInput(order.adminNote || order.adminMessage || order.cancelReason || '');
  };

  const handleSaveMessage = () => {
    if (!messageModalOrder) return;
    const orderId = messageModalOrder.id || messageModalOrder._id;
    if (onUpdateStatus) {
      onUpdateStatus(
        orderId,
        messageModalOrder.status || 'در حال پردازش',
        messageModalOrder.postTrackingCode,
        messageModalOrder.cancelReason,
        messageInput.trim()
      );
    }
    setMessageModalOrder(null);
    setMessageInput('');
  };

  const handleStatusSelectChange = (order, newStatus) => {
    const orderId = order.id || order._id;
    if (newStatus === 'لغو شده' || newStatus === 'cancelled') {
      openRejectModal(order);
    } else if (newStatus === 'ارسال شده' || newStatus === 'shipped') {
      setTrackingModalOrder(order);
      setTrackingInput(order.postTrackingCode || '');
    } else {
      if (onUpdateStatus) {
        onUpdateStatus(orderId, newStatus, order.postTrackingCode, order.cancelReason, order.adminNote);
      }
    }
  };

  return (
    <section className={styles.card}>
      <div className={styles.toolbar}>
        <div className={styles.titleArea}>
          <h2 className={styles.title}>فهرست سفارشات مشتریان</h2>
          <p className={styles.subtitle}>تغییر وضعیت، ثبت کد رهگیری پستی، ارسال پیام اختصاصی به مشتری، علت رد و بررسی فیش‌ها</p>
        </div>
        <button
          type="button"
          className={styles.secondaryBtn}
          onClick={onRefreshOrders}
          disabled={isLoadingOrders}
        >
          <i className={`fa-solid fa-arrows-rotate ${isLoadingOrders ? 'fa-spin' : ''}`} />
          <span>{isLoadingOrders ? 'در حال بارگذاری...' : 'تازه‌سازی'}</span>
        </button>
      </div>

      <div className={styles.toolbar}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="جستجو با کد رهگیری، نام مشتری یا تلفن..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
        <select
          className={styles.select}
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="all">همه وضعیت‌ها</option>
          <option value="processing">در حال پردازش</option>
          <option value="shipped">ارسال شده</option>
          <option value="delivered">تحویل داده شده</option>
          <option value="cancelled">لغو شده / رد شده</option>
        </select>
      </div>

      <div className={styles.itemsList}>
        {filteredOrders.length === 0 ? (
          <div className={styles.emptyState}>
            <i className="fa-solid fa-bag-shopping" style={{ fontSize: '2rem' }} />
            <p>هیچ سفارشی یافت نشد.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const orderId = order.id || order._id;
            const items = Array.isArray(order.items) ? order.items : [];
            const amount = Number(order.finalAmount || order.totalPrice || 0);
            const currentStatus = formatOrderStatus(order.status);
            const isCancelled = currentStatus === 'لغو شده';
            const isShipped = currentStatus === 'ارسال شده';
            const isDelivered = currentStatus === 'تحویل داده شده';
            const noteText = order.adminNote || order.adminMessage || order.cancelReason;

            return (
              <div key={orderId} className={styles.itemRow}>
                <div className={styles.itemDetails}>
                  <div className={styles.rowCenterWrap}>
                    <h3 className={styles.itemName}>
                      {order.customerName || order.name || 'مشتری بدون نام'}
                    </h3>
                    <span className={`${styles.badge} ${isCancelled ? styles.badgeDanger : (isShipped || isDelivered ? styles.badgeSuccess : styles.badgeWarning)}`}>
                      {currentStatus}
                    </span>
                  </div>

                  <p className={styles.itemMeta}>
                    <span>شناسه سفارش: {order.trackingCode || orderId?.slice(-6)}</span>
                    <span>|</span>
                    <span>مبلغ: {amount.toLocaleString('fa-IR')} تومان</span>
                    <span>|</span>
                    <span>تلفن: {order.customerPhone || order.phone || 'ثبت نشده'}</span>
                  </p>

                  {order.postTrackingCode && (
                    <p className={styles.itemMeta} style={{ color: '#0284c7', fontWeight: 600 }}>
                      <i className="fa-solid fa-truck-fast" style={{ marginLeft: '4px' }} />
                      <span>کد رهگیری پستی: {order.postTrackingCode}</span>
                    </p>
                  )}

                  {noteText && (
                    <p className={styles.itemMeta} style={{ color: isCancelled ? '#e11d48' : '#0d9488', fontWeight: 600 }}>
                      <i className="fa-solid fa-comment-dots" style={{ marginLeft: '4px' }} />
                      <span>پیام/توضیحات مدیر: {noteText}</span>
                    </p>
                  )}

                  {items.length > 0 && (
                    <p className={styles.itemMeta}>
                      <span>اقلام: {items.map((item) => `${item.name || 'محصول'} (${item.quantity} کیسه)`).join('، ')}</span>
                    </p>
                  )}
                </div>

                <div className={styles.itemActions}>
                  {order.paymentReceipt && (
                    <button
                      type="button"
                      className={styles.secondaryBtn}
                      onClick={() => setPreviewReceipt(order.paymentReceipt)}
                      title="مشاهده فیش واریزی"
                    >
                      <i className="fa-solid fa-eye" />
                      <span>فیش واریز</span>
                    </button>
                  )}

                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={() => openMessageModal(order)}
                    title="ارسال پیام یا توضیحات برای مشتری"
                  >
                    <i className="fa-solid fa-comment-medical" />
                    <span>ارسال پیام</span>
                  </button>

                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={() => openTrackingModal(order)}
                    title="ثبت یا ویرایش کد رهگیری پستی"
                  >
                    <i className="fa-solid fa-barcode" />
                    <span>کد رهگیری</span>
                  </button>

                  <select
                    className={styles.select}
                    value={currentStatus}
                    onChange={(event) => handleStatusSelectChange(order, event.target.value)}
                  >
                    <option value="در حال پردازش">در حال پردازش</option>
                    <option value="ارسال شده">ارسال شده</option>
                    <option value="تحویل داده شده">تحویل داده شده</option>
                    <option value="لغو شده">لغو شده / رد شده</option>
                  </select>

                  <button
                    type="button"
                    className={styles.dangerBtn}
                    onClick={() => setOrderToDelete(order)}
                  >
                    <i className="fa-solid fa-trash-can" />
                    <span>حذف</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal 1: Custom Admin Message */}
      {messageModalOrder && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>ارسال پیام / توضیحات به مشتری</h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setMessageModalOrder(null)}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                متن پیام یا توضیحات مربوط به سفارش مشتری ({messageModalOrder.customerName || messageModalOrder.name}):
              </label>
              <textarea
                className={styles.input}
                rows={4}
                placeholder="مثال: سفارش شما بسته‌بندی شده و آماده تحویل به پست پیشتاز می‌باشد..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
              />
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => setMessageModalOrder(null)}
              >
                انصراف
              </button>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={handleSaveMessage}
              >
                ارسال و ذخیره پیام
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Postal Tracking Code */}
      {trackingModalOrder && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>ثبت/ویرایش کد رهگیری پستی</h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setTrackingModalOrder(null)}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>کد ۲۴ رقمی مرسوله پستی اداره پست:</label>
              <input
                type="text"
                className={styles.input}
                placeholder="مثال: 192837465019283746501234"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                style={{ direction: 'ltr', textAlign: 'left', fontFamily: 'monospace' }}
              />
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => setTrackingModalOrder(null)}
              >
                انصراف
              </button>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={handleSaveTrackingCode}
              >
                ذخیره کد رهگیری
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Order Rejection Reason */}
      {rejectModalOrder && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>ثبت دلیل رد / لغو سفارش</h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setRejectModalOrder(null)}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>علت رد یا لغو این سفارش را برای اطلاع مشتری وارد کنید:</label>
              <textarea
                className={styles.input}
                rows={3}
                placeholder="مثال: عدم تطابق فیش واریزی با مبلغ سفارش / اتمام موجودی محصول"
                value={rejectReasonInput}
                onChange={(e) => setRejectReasonInput(e.target.value)}
              />
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => setRejectModalOrder(null)}
              >
                انصراف
              </button>
              <button
                type="button"
                className={styles.dangerBtn}
                onClick={handleSaveRejectReason}
              >
                لغو و ثبت علت
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {orderToDelete && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>تأیید حذف سفارش</h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setOrderToDelete(null)}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <p className={styles.confirmText}>
              آیا از حذف سفارش شماره «{orderToDelete.trackingCode || (orderToDelete.id || orderToDelete._id)?.slice(-6)}» اطمینان دارید؟
            </p>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => setOrderToDelete(null)}
              >
                انصراف
              </button>
              <button
                type="button"
                className={styles.dangerBtn}
                onClick={() => {
                  const id = orderToDelete.id || orderToDelete._id;
                  setOrderToDelete(null);
                  if (onDeleteOrder) onDeleteOrder(id);
                }}
              >
                حذف قطعی
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Receipt Preview Modal */}
      {previewReceipt && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>تصویر فیش واریزی</h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setPreviewReceipt(null)}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <img
              src={previewReceipt}
              alt="فیش واریزی"
              className={styles.receiptImg}
            />
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => setPreviewReceipt(null)}
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminOrders;
