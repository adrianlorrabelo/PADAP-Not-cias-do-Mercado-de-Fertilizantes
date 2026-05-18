export function notify(message: string) {
  window.dispatchEvent(new CustomEvent("padap:toast", { detail: message }));
}

export function simulatedAction(message: string) {
  notify(`${message} Funcionalidade simulada nestá v1.`);
}
