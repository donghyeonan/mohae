window.__MOHAE_CONFIG__ = window.__MOHAE_CONFIG__ ?? { naverMapClientId: "" };
window.__MOHAE_CONFIG_READY__ = fetch("./runtime-config.local.json", { cache: "no-store" })
  .then((response) => response.ok ? response.json() : {})
  .then((localConfig) => Object.assign(window.__MOHAE_CONFIG__, localConfig))
  .catch(() => window.__MOHAE_CONFIG__);
