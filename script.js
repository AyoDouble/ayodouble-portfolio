const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".navigation");
const currentYear = document.querySelector("#current-year");
const projectPreview = document.querySelector(".project-preview");
const previewFrame = document.querySelector(".project-preview-frame iframe");
const previewTitle = document.querySelector("#project-preview-title");
const previewLink = document.querySelector(".project-preview-link");
const previewClose = document.querySelector(".project-preview-close");
let activeProjectCard = null;

if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}

if (projectPreview && previewFrame && previewTitle && previewLink && previewClose) {
  document.querySelectorAll(".project-card").forEach((card) => {
    card.addEventListener("click", (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      if (typeof projectPreview.showModal !== "function") {
        return;
      }

      const title = card.querySelector(".project-title")?.textContent?.trim();
      if (!title || !card.href) {
        return;
      }

      event.preventDefault();
      activeProjectCard = card;
      previewTitle.textContent = title;
      previewFrame.title = `Live preview: ${title}`;
      previewLink.href = card.href;
      previewFrame.src = card.href;
      projectPreview.showModal();
    });
  });

  previewClose.addEventListener("click", () => projectPreview.close());

  projectPreview.addEventListener("click", (event) => {
    if (event.target === projectPreview) {
      projectPreview.close();
    }
  });

  projectPreview.addEventListener("close", () => {
    previewFrame.src = "about:blank";
    activeProjectCard?.focus();
    activeProjectCard = null;
  });
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
    if (event.key === "Escape" && (!projectPreview || !projectPreview.open)) {
      menuToggle.setAttribute("aria-expanded", "false");
      navigation.classList.remove("is-open");
      menuToggle.focus();
    }
  });
}
