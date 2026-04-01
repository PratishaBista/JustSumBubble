import Bubble from "./components/Bubble.js";
import AudioSystem from "./systems/AudioSystem.js";
import Particle from "./components/Particle.js";
import config from "./systems/Config.js";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("app-container");
  const cursor = document.getElementById("popper");
  const audio = new AudioSystem();
  let bubbles = [];
  let particles = [];

  const btnFullscreen = document.getElementById("btn-fullscreen");
  const btnInfo = document.getElementById("btn-info");
  const aboutPanel = document.getElementById("about-panel");

  function spawnBubble() {
    const bubble = new Bubble(audio, (x, y) => {
      for (let j = 0; j < 12; j++) {
        particles.push(new Particle(container, x, y));
      }
    });
    bubbles.push(bubble);
    container.appendChild(bubble.element);
    return bubble;
  }

  function initBubbles(count) {
    bubbles.forEach((b) => b.element.remove());
    bubbles = [];
    for (let i = 0; i < count; i++) {
      const startY = Math.random() * (window.innerHeight + 500) - 200;
      const bubble = new Bubble(
        audio,
        (x, y) => {
          for (let j = 0; j < 12; j++) {
            particles.push(new Particle(container, x, y));
          }
        },
        startY,
      );
      bubbles.push(bubble);
      container.appendChild(bubble.element);
    }
  }

  initBubbles(config.bubbleCount);

  const startOverlay = document.getElementById("start-screen");
  const btnStart = document.getElementById("btn-start");
  const typingText = document.getElementById("typing-text");

  const message = "Hi. Ready to release some stress?";
  let charIndex = 0;

  function typeMessage() {
    if (charIndex < message.length) {
      typingText.textContent += message.charAt(charIndex);
      charIndex++;
      setTimeout(typeMessage, 55);
    } else {
      setTimeout(() => {
        btnStart.classList.remove("hidden");
      }, 300);
    }
  }

  setTimeout(typeMessage, 600);

  btnStart.addEventListener("click", () => {
    const unlockAudio = audio.popSound.cloneNode();
    unlockAudio.volume = 0;
    unlockAudio.play().catch((e) => console.log("Audio unlock muted."));

    startOverlay.classList.add("hidden");

    animate();
  });

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  btnFullscreen.addEventListener("click", toggleFullscreen);

  document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "f") {
      toggleFullscreen();
    }
  });
  let aboutTimeout;

  btnInfo.addEventListener("click", (e) => {
    e.stopPropagation();
    aboutPanel.classList.toggle("hidden");

    clearTimeout(aboutTimeout);
    if (!aboutPanel.classList.contains("hidden")) {
      aboutTimeout = setTimeout(() => {
        aboutPanel.classList.add("hidden");
      }, 8000);
    }
  });

  aboutPanel.addEventListener("click", (e) => {
    e.stopPropagation();
    clearTimeout(aboutTimeout);
  });

  const allButtons = document.querySelectorAll("button");
  allButtons.forEach((btn) => {
    btn.addEventListener("mouseenter", () => {
      cursor.style.transition = "opacity 0.2s ease";
      cursor.style.opacity = "0";
      document.body.style.cursor = "default";
    });
    btn.addEventListener("mouseleave", () => {
      cursor.style.opacity = "1";
      document.body.style.cursor = "none";
    });
  });

  document.addEventListener("click", () => {
    aboutPanel.classList.add("hidden");
    clearTimeout(aboutTimeout);
  });

  document.addEventListener("mousemove", (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
    cursor.style.opacity = "1";
  });

  document.addEventListener(
    "touchstart",
    (e) => {
      const touch = e.touches[0];
      cursor.style.left = `${touch.clientX}px`;
      cursor.style.top = `${touch.clientY}px`;
      cursor.style.opacity = "1";
    },
    { passive: false },
  );

  document.addEventListener("mousedown", () => cursor.classList.add("active"));
  document.addEventListener("mouseup", () => cursor.classList.remove("active"));

  function animate() {
    const popperRect = cursor.getBoundingClientRect();
    const popperX = popperRect.left + popperRect.width / 2;
    const popperY = popperRect.top + popperRect.height / 2;
    const isCursorVisible = cursor.style.opacity === "1";

    const isOverAbout =
      !aboutPanel.classList.contains("hidden") &&
      popperX >= aboutPanel.offsetLeft &&
      popperX <= aboutPanel.offsetLeft + aboutPanel.offsetWidth &&
      popperY >= aboutPanel.offsetTop &&
      popperY <= aboutPanel.offsetTop + aboutPanel.offsetHeight;

    const isOverUI = isOverAbout;

    bubbles = bubbles.filter((bubble) => {
      bubble.update();

      bubble._retire = bubble._retire || false;

      if (isCursorVisible && !isOverUI && !bubble.isPopped) {
        const bubbleCX = bubble.x + bubble.size / 2;
        const bubbleCY = bubble.y + bubble.size / 2;
        const radius = bubble.size / 2;

        const dx = popperX - bubbleCX;
        const dy = popperY - bubbleCY;

        if (dx * dx + dy * dy < radius * radius) {
          bubble.pop();
        }
      }

      return true;
    });

    if (bubbles.length < config.bubbleCount) {
      spawnBubble();
    }

    if (bubbles.length > config.bubbleCount) {
      const excess = bubbles.length - config.bubbleCount;
      bubbles
        .filter((b) => !b._retire && !b.isPopped)
        .slice(0, excess)
        .forEach((b) => {
          b._retire = true;
        });
    }

    bubbles = bubbles.filter((b) => {
      if (
        b._retire &&
        (b.y < -300 || b.x < -400 || b.x > window.innerWidth + 400)
      ) {
        b.element.remove();
        return false;
      }
      return true;
    });

    particles = particles.filter((p) => !p.update());

    requestAnimationFrame(animate);
  }
});
