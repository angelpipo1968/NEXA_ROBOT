const UPDATER_CONFIG = {
  MANIFEST_URL: 'http://nexa-ai.dev/neuronex/manifest.json',
  CACHE_NAME: 'neuronex-cache-v1',
  VERSION_KEY: 'neuronex_version'
};

async function initUpdater() {
  console.log("🛡️ Sovereign-Updater: Initializing...");
  
  if ('serviceWorker' in navigator) {
    // Attempt to register SW if we were using one, but for this simple script
    // we'll stick to direct cache manipulation or simulated updates for the demo.
  }

  try {
    const localVersion = localStorage.getItem(UPDATER_CONFIG.VERSION_KEY) || '2.0.0';
    document.getElementById('footer').innerHTML += ` • v${localVersion}`;

    const response = await fetch(UPDATER_CONFIG.MANIFEST_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error("Update server unreachable");

    const manifest = await response.json();
    
    if (isNewerVersion(manifest.version, localVersion)) {
        console.log(`🚀 Update found: ${manifest.version}`);
        notifyUpdate(manifest.version);
        await performUpdate(manifest);
    } else {
        console.log("✅ System is up to date.");
    }

  } catch (err) {
    console.log("⚠️ Offline Mode / Update Check Failed:", err.message);
  }
}

function isNewerVersion(remote, local) {
    return remote !== local; // Simple string comparison for now
}

function notifyUpdate(version) {
    const footer = document.getElementById('footer');
    const updateBadge = document.createElement('span');
    updateBadge.style.color = '#00ff88';
    updateBadge.style.marginLeft = '10px';
    updateBadge.innerHTML = `⬇️ Updating to v${version}...`;
    footer.appendChild(updateBadge);
}

async function performUpdate(manifest) {
    // Simulate verifying GPG signature
    console.log("🔐 Verifying GPG Signature...", manifest.signature);
    await new Promise(r => setTimeout(r, 1000));
    
    // Simulate downloading files
    for (const [file, hash] of Object.entries(manifest.files)) {
        console.log(`📥 Downloading ${file} (SHA256: ${hash.substring(0,8)}...)`);
        // In a real scenario, we would fetch and put into CacheStorage
        // const resp = await fetch(file);
        // const cache = await caches.open(UPDATER_CONFIG.CACHE_NAME);
        // cache.put(file, resp);
    }
    
    await new Promise(r => setTimeout(r, 2000));
    localStorage.setItem(UPDATER_CONFIG.VERSION_KEY, manifest.version);
    
    const footer = document.getElementById('footer');
    footer.innerHTML = footer.innerHTML.replace('Updating...', 'Updated!');
    setTimeout(() => location.reload(), 1000);
}

document.addEventListener('DOMContentLoaded', initUpdater);
