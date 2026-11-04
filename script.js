const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".navigation");
const currentYear = document.querySelector("#current-year");
const skillsShuffle = document.querySelector(".skills-shuffle");
const skillStickers = document.querySelector("#skill-stickers");
const skillsShuffleStatus = document.querySelector(".skills-shuffle-status");
const heroOrbit = document.querySelector(".hero-orbit");
const sectionSlider = document.querySelector("#section-slider");
const sectionCount = document.querySelector("#section-count");
const sectionCurrent = document.querySelector("#section-current");
const sectionNext = document.querySelector(".section-journey-next");
const bridgeTransition = document.querySelector(".bridge-transition");
const sectionStops = document.querySelectorAll(".section-journey-stop");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const journeySections = [
  { id: "home", label: "Warm-up" },
  { id: "work", label: "Career" },
  { id: "projects", label: "Projects" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "learning", label: "Education" },
  { id: "contact", label: "Contact" },
]
  .map((section) => ({ ...section, element: document.getElementById(section.id) }))
  .filter((section) => section.element);

let activeSectionIndex = 0;
let transitionTimeouts = [];

if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}

if (heroOrbit) {
  const skills = Array.from(document.querySelectorAll("#skill-stickers .skill-sticker"));

  for (let index = skills.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [skills[index], skills[randomIndex]] = [skills[randomIndex], skills[index]];
  }

  const chips = skills.map((skill) => {
    const chip = document.createElement("span");

    chip.className = "hero-orbit-chip";
    chip.textContent = skill.textContent?.trim() ?? "";
    chip.style.setProperty("--chip-color", getComputedStyle(skill).backgroundColor);
    chip.style.setProperty("--chip-angle", `${Math.round(Math.random() * 14 - 7)}deg`);
    chip.style.setProperty("--chip-opacity", `${(0.34 + Math.random() * 0.22).toFixed(2)}`);
    chip.style.animationDelay = `${-Math.random() * 5}s`;
    return chip;
  });
  heroOrbit.replaceChildren(...chips);
}

if (skillsShuffle && skillStickers) {
  const stickers = Array.from(skillStickers.children);
  stickers.forEach((sticker) => {
    const skillName = sticker.querySelector(".skill-sticker")?.textContent?.trim() ?? "skill";
    sticker.tabIndex = 0;
    sticker.setAttribute("aria-roledescription", "draggable skill sticker");
    sticker.setAttribute(
      "aria-label",
      `${skillName}. Use the arrow keys to move this sticker in the list.`,
    );
  });

  skillsShuffle.addEventListener("click", () => {
    const stickers = Array.from(skillStickers.children);

    for (let index = stickers.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [stickers[index], stickers[randomIndex]] = [stickers[randomIndex], stickers[index]];
    }

    skillStickers.replaceChildren(...stickers);

    if (skillsShuffleStatus) {
      skillsShuffleStatus.textContent = "Skills reshuffled.";
    }
  });

  let pointerDrag = null;

  skillStickers.addEventListener("pointerdown", (event) => {
    const sticker = event.target instanceof Element ? event.target.closest("li") : null;

    if (!sticker || event.button !== 0) {
      return;
    }

    pointerDrag = {
      id: event.pointerId,
      sticker,
      startIndex: Array.from(skillStickers.children).indexOf(sticker),
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };
  });

  document.addEventListener(
    "pointermove",
    (event) => {
      if (!pointerDrag || event.pointerId !== pointerDrag.id) {
        return;
      }

      const distance = Math.hypot(event.clientX - pointerDrag.startX, event.clientY - pointerDrag.startY);

      if (!pointerDrag.moved && distance < 8) {
        return;
      }

      pointerDrag.moved = true;
      event.preventDefault();
      pointerDrag.sticker.classList.add("is-dragging");

      const target = document.elementFromPoint(event.clientX, event.clientY);
      const targetSticker = target instanceof Element ? target.closest("li") : null;

      if (!targetSticker || targetSticker === pointerDrag.sticker || targetSticker.parentElement !== skillStickers) {
        return;
      }

      const bounds = targetSticker.getBoundingClientRect();
      const insertAfter =
        event.clientY > bounds.top + bounds.height / 2 ||
        (Math.abs(event.clientY - (bounds.top + bounds.height / 2)) < bounds.height / 3 &&
          event.clientX > bounds.left + bounds.width / 2);

      skillStickers.insertBefore(pointerDrag.sticker, insertAfter ? targetSticker.nextElementSibling : targetSticker);
    },
    { passive: false },
  );

  const finishPointerDrag = (event) => {
    if (!pointerDrag || event.pointerId !== pointerDrag.id) {
      return;
    }

    const { sticker, moved, startIndex } = pointerDrag;
    sticker.classList.remove("is-dragging");
    const position = Array.from(skillStickers.children).indexOf(sticker) + 1;

    if (moved && position !== startIndex + 1 && skillsShuffleStatus) {
      const skillName = sticker.querySelector(".skill-sticker")?.textContent?.trim() ?? "Skill";
      skillsShuffleStatus.textContent = `${skillName} moved to position ${position} of ${skillStickers.children.length}.`;
    }

    pointerDrag = null;
  };

  document.addEventListener("pointerup", finishPointerDrag);
  document.addEventListener("pointercancel", finishPointerDrag);

  skillStickers.addEventListener("keydown", (event) => {
    const sticker = event.target instanceof Element ? event.target.closest("li") : null;
    const movingBackward = event.key === "ArrowLeft" || event.key === "ArrowUp";
    const movingForward = event.key === "ArrowRight" || event.key === "ArrowDown";

    if (!sticker || (!movingBackward && !movingForward)) {
      return;
    }

    const neighbor = movingBackward ? sticker.previousElementSibling : sticker.nextElementSibling;

    if (!neighbor) {
      return;
    }

    event.preventDefault();
    skillStickers.insertBefore(sticker, movingBackward ? neighbor : neighbor.nextElementSibling);
    sticker.focus();

    if (skillsShuffleStatus) {
      const skillName = sticker.querySelector(".skill-sticker")?.textContent?.trim() ?? "Skill";
      const position = Array.from(skillStickers.children).indexOf(sticker) + 1;
      skillsShuffleStatus.textContent = `${skillName} moved to position ${position} of ${skillStickers.children.length}.`;
    }
  });
}

if (sectionSlider && sectionNext && journeySections.length) {
  sectionSlider.max = String(journeySections.length - 1);

  const updateJourneyControl = (index) => {
    sectionSlider.setAttribute("aria-valuetext", journeySections[index].label);
    const progress = (index / Math.max(1, journeySections.length - 1)) * 93.2;
    sectionSlider.parentElement?.style.setProperty("--journey-progress", `${progress}%`);
    sectionSlider.parentElement?.style.setProperty("--journey-marker-position", `${3.4 + progress}%`);

    if (sectionCount) {
      sectionCount.value = `${String(index + 1).padStart(2, "0")} / ${String(journeySections.length).padStart(2, "0")}`;
    }

    if (sectionCurrent) {
      sectionCurrent.textContent = journeySections[index].label.toUpperCase();
    }

    sectionStops.forEach((stop, stopIndex) => {
      stop.classList.toggle("is-passed", stopIndex < index);
      stop.classList.toggle("is-current", stopIndex === index);
    });
  };

  const setActiveSection = (index) => {
    activeSectionIndex = index;
    sectionSlider.value = String(index);
    updateJourneyControl(index);

    const isLastSection = index === journeySections.length - 1;
    const nextIndex = isLastSection ? 0 : index + 1;
    const nextLabel = isLastSection ? "Back to the top" : `Go to the next section: ${journeySections[nextIndex].label}`;
    sectionNext.setAttribute("aria-label", nextLabel);

    const nextText = sectionNext.querySelector(".section-journey-next-label");
    const nextArrow = sectionNext.querySelector(".section-journey-arrow");

    if (nextText) {
      nextText.textContent = isLastSection ? "TOP" : "NEXT";
    }

    if (nextArrow) {
      nextArrow.textContent = isLastSection ? "↑" : "↓";
    }

    navigation?.querySelectorAll('a[aria-current="location"]').forEach((link) => {
      link.removeAttribute("aria-current");
    });
    navigation?.querySelector(`a[href="#${journeySections[index].id}"]`)?.setAttribute("aria-current", "location");
  };

  const syncActiveSection = () => {
    const activeLine = window.innerHeight * 0.35;
    let activeIndex = 0;

    journeySections.forEach((section, index) => {
      if (section.element.getBoundingClientRect().top <= activeLine) {
        activeIndex = index;
      }
    });

    setActiveSection(activeIndex);
  };

  let scrollFrame = 0;
  window.addEventListener(
    "scroll",
    () => {
      if (sectionSlider.disabled) {
        return;
      }

      window.cancelAnimationFrame(scrollFrame);
      scrollFrame = window.requestAnimationFrame(syncActiveSection);
    },
    { passive: true },
  );

  const navigateToSection = (index) => {
    const destination = journeySections[index];

    if (!destination || index === activeSectionIndex) {
      return;
    }

    transitionTimeouts.forEach((timeout) => window.clearTimeout(timeout));
    transitionTimeouts = [];
    sectionSlider.disabled = true;
    sectionNext.disabled = true;
    setActiveSection(index);

    if (prefersReducedMotion.matches || !bridgeTransition) {
      destination.element.scrollIntoView({ behavior: "auto", block: "start" });
      sectionSlider.disabled = false;
      sectionNext.disabled = false;
      return;
    }

    bridgeTransition.classList.remove("is-lifting");
    void bridgeTransition.offsetWidth;
    bridgeTransition.classList.add("is-lifting");
    transitionTimeouts.push(
      window.setTimeout(() => {
        destination.element.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300),
    );
    transitionTimeouts.push(
      window.setTimeout(() => {
        bridgeTransition.classList.remove("is-lifting");
        sectionSlider.disabled = false;
        sectionNext.disabled = false;
        syncActiveSection();
      }, 880),
    );
  };

  syncActiveSection();

  sectionSlider.addEventListener("input", () => {
    const index = Number(sectionSlider.value);
    updateJourneyControl(index);
  });
  sectionSlider.addEventListener("change", () => navigateToSection(Number(sectionSlider.value)));
  sectionNext.addEventListener("click", () => {
    const nextIndex = (activeSectionIndex + 1) % journeySections.length;
    navigateToSection(nextIndex);
  });

  if ("IntersectionObserver" in window) {
    if (!prefersReducedMotion.matches) {
      const revealItems = document.querySelectorAll(
        ".experience-card, .project-card, .about-layout, .skills-heading, .timeline-row, .education-cassette, .contact-content",
      );

      revealItems.forEach((item, index) => {
        item.classList.add("reveal-item");
        item.style.setProperty("--reveal-delay", `${(index % 3) * 70}ms`);
      });
      document.body.classList.add("has-reveal-motion");

      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
      );

      revealItems.forEach((item) => revealObserver.observe(item));
    }
  }
}

if (menuToggle && navigation) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    navigation.classList.toggle("is-open", !expanded);
  });

  navigation.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      menuToggle.setAttribute("aria-expanded", "false");
      navigation.classList.remove("is-open");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      menuToggle.setAttribute("aria-expanded", "false");
      navigation.classList.remove("is-open");
      menuToggle.focus();
    }
  });
}
