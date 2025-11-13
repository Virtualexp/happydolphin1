// ===============================
//  MAIN BOOTSTRAP MODULE
// ===============================

// Temel sistem modülleri
import { bootMirageNoticeIfNeeded } from "./mirage.js";

// Pencere modülleri
import { createOceanOSWindow }   from "./oceanos.js";
import { createTerminalWindow }  from "./terminal.js";
import { createAboutMeWindow }   from "./about.js";
import { createGalleryWindow }   from "./gallery.js";
import { createMinesweeperWindow } from "./mines.js";

// ============ Uygulama Başlatma ============

// Menü butonları için event binding
document.getElementById("aboutBtn").addEventListener("click", createAboutMeWindow);
document.getElementById("terminalBtn").addEventListener("click", createTerminalWindow);
document.getElementById("oceanosBtn").addEventListener("click", createOceanOSWindow);
document.getElementById("galleryBtn").addEventListener("click", createGalleryWindow);
document.getElementById("minesBtn").addEventListener("click", createMinesweeperWindow);

// Mirage residual açılış efekti
bootMirageNoticeIfNeeded();

// Global close handling (tüm pencereler için)
document.addEventListener("click", (e) => {
  if (e.target.matches(".close-ind")) {
    const win = e.target.closest(".win98");
    if (win) win.remove();
  }
});
