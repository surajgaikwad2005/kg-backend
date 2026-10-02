import * as store from './store';

// Trailing arg disambiguation: a number is the legacy positional `duration`
// (backward-compatible with every existing call site); an object is the new
// options bag (toastId/icon/action/position/draggable).
function normalizeOptions(durationOrOptions) {
  if (typeof durationOrOptions === 'number') return { duration: durationOrOptions };
  if (durationOrOptions && typeof durationOrOptions === 'object') return durationOrOptions;
  return {};
}

function dispatch(type, title, description, durationOrOptions) {
  const options = normalizeOptions(durationOrOptions);
  return store.addToast({
    type,
    title,
    description,
    duration: options.duration ?? store.getDefaults().duration,
    toastId: options.toastId,
    position: options.position,
    icon: options.icon,
    action: options.action,
    draggable: options.draggable,
  });
}

function success(title, description, durationOrOptions) {
  return dispatch('success', title, description, durationOrOptions);
}
function error(title, description, durationOrOptions) {
  return dispatch('error', title, description, durationOrOptions);
}
function info(title, description, durationOrOptions) {
  return dispatch('info', title, description, durationOrOptions);
}
function warning(title, description, durationOrOptions) {
  return dispatch('warning', title, description, durationOrOptions);
}
function sparkle(title, description, durationOrOptions) {
  return dispatch('sparkle', title, description, durationOrOptions);
}

function loading(title, description, options = {}) {
  return store.addToast({
    type: 'loading',
    title,
    description,
    duration: Infinity,
    toastId: options.toastId,
    position: options.position,
    icon: options.icon,
    draggable: options.draggable ?? false,
  });
}

// Normalizes a promise() message spec (string | {title,description} | fn) into
// a { title, description } patch, invoking function specs with the settled value.
function resolveMessage(spec, data) {
  const resolved = typeof spec === 'function' ? spec(data) : spec;
  if (resolved && typeof resolved === 'object') return resolved;
  return { title: resolved, description: undefined };
}

// A promise toast IS a loading toast that gets updated in place on settle —
// same id, same DOM node, not a separate card.
function promise(promiseOrFn, messages = {}, options = {}) {
  const id = store.addToast({
    type: 'loading',
    ...resolveMessage(messages.pending),
    duration: Infinity,
    toastId: options.toastId,
    position: options.position,
    draggable: options.draggable ?? false,
  });
  const run = typeof promiseOrFn === 'function' ? promiseOrFn() : promiseOrFn;
  return run.then(
    (data) => {
      store.updateToast(id, {
        type: 'success',
        ...resolveMessage(messages.success, data),
        duration: options.duration ?? store.getDefaults().duration,
        draggable: options.draggable,
      });
      return data;
    },
    (err) => {
      store.updateToast(id, {
        type: 'error',
        ...resolveMessage(messages.error, err),
        duration: options.duration ?? store.getDefaults().duration,
        draggable: options.draggable,
      });
      throw err;
    }
  );
}

function update(id, patch) {
  store.updateToast(id, patch);
}

// Fully custom body — `content` is a ReactNode rendered in place of title/description.
function custom(content, options = {}) {
  return store.addToast({
    type: options.type ?? 'custom',
    content,
    duration: options.duration ?? store.getDefaults().duration,
    toastId: options.toastId,
    position: options.position,
    icon: options.icon,
    action: options.action,
    draggable: options.draggable,
  });
}

function dismiss(id) {
  store.dismissToast(id);
}

function dismissAll(position) {
  store.dismissAll(position);
}

// The module-level imperative singleton — importable from ANY file
// (services, utils, event handlers), not just components/hooks, since it
// has no dependency on React context. useToast() returns this exact object.
export const toast = {
  toast: dispatch,
  success,
  error,
  info,
  warning,
  sparkle,
  loading,
  promise,
  update,
  custom,
  dismiss,
  dismissAll,
};
