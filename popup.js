function applyColorToPage(bgColor, save = true) {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (!tab || !tab.id) return;
  
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        args: [bgColor],
        func: (bg) => {
          document.body.style.backgroundColor = bg;
        },
      });
  
      if (save) {
        chrome.storage.local.set({ lastColor: bgColor });
      }
    });
  }
  
  function saveOriginalColor() {
    chrome.storage.local.get("originalColor", (data) => {
      if (!data.originalColor) {

        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
          if (!tab || !tab.id) return;
  
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => window.getComputedStyle(document.body).backgroundColor,
          }, (results) => {
            if (results && results[0] && results[0].result) {
              const bg = results[0].result;
              chrome.storage.local.set({ originalColor: bg });
            }
          });
        });
      }
    });
  }
  
  function loadLastColor() {
    chrome.storage.local.get("lastColor", (data) => {
      if (data.lastColor) {
        applyColorToPage(data.lastColor, false);
        const customColorInput = document.getElementById("customColor");
        if (customColorInput) {
          try {
            if (data.lastColor.startsWith("rgb")) {
              const rgbValues = data.lastColor.match(/\d+/g);
              if (rgbValues && rgbValues.length >= 3) {
                const hex = "#" + rgbValues.slice(0,3).map(x => {
                  const h = parseInt(x).toString(16);
                  return h.length === 1 ? "0" + h : h;
                }).join("");
                customColorInput.value = hex;
              }
            } else {
              customColorInput.value = data.lastColor;
            }
          } catch {
            // ignore errors, fallback no update
          }
        }
      }
    });
  }
  
  saveOriginalColor();
  loadLastColor();
  
  document.querySelectorAll(".color-box").forEach((box) => {
    box.addEventListener("click", () => {
      const bgColor = box.getAttribute("data-color");
      applyColorToPage(bgColor);
    });
  });
  
  document.getElementById("customColor").addEventListener("input", (event) => {
    const bgColor = event.target.value;
    applyColorToPage(bgColor);
  });
  
  document.getElementById("resetBtn").addEventListener("click", () => {
    chrome.storage.local.get("originalColor", (data) => {
      const originalBg = data.originalColor || "#ffffff";
      applyColorToPage(originalBg, false);
      chrome.storage.local.remove("lastColor");
  
      const customColorInput = document.getElementById("customColor");
      if (customColorInput) {
        if (originalBg.startsWith("rgb")) {
          const rgbValues = originalBg.match(/\d+/g);
          if (rgbValues && rgbValues.length >= 3) {
            const hex = "#" + rgbValues.slice(0,3).map(x => {
              const h = parseInt(x).toString(16);
              return h.length === 1 ? "0" + h : h;
            }).join("");
            customColorInput.value = hex;
          } else {
            customColorInput.value = "#ffffff";
          }
        } else {
          customColorInput.value = originalBg;
        }
      }
    });
  });
  