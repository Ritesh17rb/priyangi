import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const AlertContext = createContext(null);

const TOAST_STYLES = {
  info: {
    accent: 'from-pink/90 via-fuchsia-400 to-purple/90',
    badge: 'bg-white/80 text-pink',
    ring: 'ring-pink/20',
    close: 'text-pink hover:bg-pink-50',
  },
  success: {
    accent: 'from-emerald-400 via-teal-400 to-cyan-400',
    badge: 'bg-white/80 text-emerald-600',
    ring: 'ring-emerald-200/70',
    close: 'text-emerald-600 hover:bg-emerald-50',
  },
  danger: {
    accent: 'from-rose-500 via-pink-500 to-orange-400',
    badge: 'bg-white/80 text-rose-600',
    ring: 'ring-rose-200/70',
    close: 'text-rose-600 hover:bg-rose-50',
  },
};

let nextToastId = 1;

function normalizeToast(input) {
  if (typeof input === 'string') return { title: input };
  return input || {};
}

function normalizeDialog(input) {
  if (typeof input === 'string') return { title: input };
  return input || {};
}

export function AlertProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);
  const toastTimers = useRef(new Map());
  const dialogResolver = useRef(null);

  useEffect(() => () => {
    toastTimers.current.forEach((timer) => window.clearTimeout(timer));
    toastTimers.current.clear();
    if (dialogResolver.current) dialogResolver.current(false);
  }, []);

  function dismissToast(id) {
    const timer = toastTimers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      toastTimers.current.delete(id);
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  function notify(input) {
    const toast = normalizeToast(input);
    const id = nextToastId++;
    const duration = toast.duration ?? 4200;
    const entry = {
      id,
      title: toast.title || 'Notice',
      message: toast.message || '',
      tone: toast.tone || 'info',
    };

    setToasts((current) => [...current, entry]);

    if (duration > 0) {
      const timer = window.setTimeout(() => dismissToast(id), duration);
      toastTimers.current.set(id, timer);
    }
  }

  function confirm(input) {
    const options = normalizeDialog(input);

    if (dialogResolver.current) dialogResolver.current(false);

    return new Promise((resolve) => {
      dialogResolver.current = resolve;
      setDialog({
        title: options.title || 'Are you sure?',
        message: options.message || '',
        confirmText: options.confirmText || 'Continue',
        cancelText: options.cancelText || 'Cancel',
        tone: options.tone || 'danger',
      });
    });
  }

  function closeDialog(result) {
    const resolve = dialogResolver.current;
    dialogResolver.current = null;
    setDialog(null);
    if (resolve) resolve(result);
  }

  return (
    <AlertContext.Provider value={{ notify, confirm }}>
      {children}

      <div className="fixed top-4 right-4 z-[220] w-[min(24rem,calc(100vw-2rem))] space-y-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const styles = TOAST_STYLES[toast.tone] || TOAST_STYLES.info;
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -18, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className={`pointer-events-auto overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/95 shadow-[0_20px_60px_rgba(199,125,255,0.22)] ring-1 backdrop-blur ${styles.ring}`}
              >
                <div className={`h-1.5 w-full bg-gradient-to-r ${styles.accent}`} />
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-2xl text-sm font-bold ${styles.badge}`}>
                      {toast.tone === 'success' ? 'OK' : toast.tone === 'danger' ? '!' : 'i'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-display text-lg leading-5 text-ink">{toast.title}</div>
                      {toast.message && <div className="mt-1 text-sm leading-5 text-ink-light">{toast.message}</div>}
                    </div>
                    <button
                      type="button"
                      onClick={() => dismissToast(toast.id)}
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-lg font-semibold transition ${styles.close}`}
                      aria-label="Dismiss alert"
                    >
                      x
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {dialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[230] flex items-center justify-center bg-[rgba(41,12,47,0.45)] p-4 backdrop-blur-[2px]"
            onClick={() => closeDialog(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-md overflow-hidden rounded-[2rem] border border-white/80 bg-white/95 shadow-[0_24px_80px_rgba(61,26,71,0.2)]"
            >
              <div className={`h-2 w-full bg-gradient-to-r ${(TOAST_STYLES[dialog.tone] || TOAST_STYLES.danger).accent}`} />
              <div className="p-6">
                <div className="inline-flex rounded-full bg-pink-pale px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-pink">
                  Confirm action
                </div>
                <h2 className="mt-4 font-display text-3xl leading-tight text-ink">{dialog.title}</h2>
                {dialog.message && <p className="mt-3 text-sm leading-6 text-ink-light">{dialog.message}</p>}
                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button type="button" onClick={() => closeDialog(false)} className="btn-ghost">
                    {dialog.cancelText}
                  </button>
                  <button
                    type="button"
                    onClick={() => closeDialog(true)}
                    className={dialog.tone === 'danger' ? 'btn bg-rose-500 text-white shadow-soft hover:bg-rose-400' : 'btn-primary'}
                  >
                    {dialog.confirmText}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AlertContext.Provider>
  );
}

export function useAlerts() {
  const context = useContext(AlertContext);
  if (!context) throw new Error('useAlerts must be used inside AlertProvider');
  return context;
}
