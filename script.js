const tabs = document.querySelectorAll(".project-tab");
const panels = document.querySelectorAll(".project-panel");
const mediaCards = document.querySelectorAll(".media-card");
const modal = document.querySelector("#media-modal");
const modalPreview = document.querySelector("#modal-preview");
const modalCloseButtons = document.querySelectorAll("[data-close-modal]");
const modalPrev = document.querySelector("[data-gallery-prev]");
const modalNext = document.querySelector("[data-gallery-next]");
const showMoreProjects = document.querySelector("[data-show-more-projects]");
const toolsGrid = document.querySelector(".tools-grid");
const showMoreTools = document.querySelector("[data-show-more-tools]");
let activeGallery = [];
let activeIndex = 0;
const expandedPanels = new Set();
let areToolsExpanded = false;
const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const revealTargets = document.querySelectorAll(".section, .site-footer");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -14% 0px",
      threshold: 0.12,
    },
  );

  revealTargets.forEach((target) => {
    target.classList.add("reveal-on-scroll");
    revealObserver.observe(target);
  });
} else {
  revealTargets.forEach((target) => {
    target.classList.add("reveal-on-scroll");
    target.classList.add("is-visible");
  });
}

const openPanel = (targetId) => {
  tabs.forEach((tab) => {
    const isActive = tab.dataset.panel === targetId;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  panels.forEach((panel) => {
    const isActive = panel.id === targetId;
    panel.classList.toggle("active", isActive);
    panel.hidden = !isActive;
  });

  updateProjectVisibility();
};

const getVisibleColumnCount = () => {
  if (window.matchMedia("(max-width: 560px)").matches) {
    return 2;
  }

  if (window.matchMedia("(max-width: 900px)").matches) {
    return 4;
  }

  return 6;
};

const getActivePanel = () => document.querySelector(".project-panel.active");

const getVisibleToolColumnCount = () => {
  if (window.matchMedia("(max-width: 560px)").matches) {
    return 2;
  }

  if (window.matchMedia("(max-width: 900px)").matches) {
    return 3;
  }

  return 5;
};

const getToolLimit = () => getVisibleToolColumnCount() * 2;

const applyToolsLimit = (isExpanded) => {
  if (!toolsGrid) {
    return;
  }

  const cards = Array.from(toolsGrid.querySelectorAll(".tool-card"));
  const visibleLimit = getToolLimit();

  cards.forEach((card, index) => {
    card.classList.toggle("is-hidden", !isExpanded && index >= visibleLimit);
  });
};

const measureToolsHeight = (isExpanded) => {
  if (!toolsGrid) {
    return 0;
  }

  const cards = Array.from(toolsGrid.querySelectorAll(".tool-card"));
  const previousHiddenStates = cards.map((card) => card.classList.contains("is-hidden"));

  applyToolsLimit(isExpanded);
  const height = toolsGrid.scrollHeight;

  cards.forEach((card, index) => {
    card.classList.toggle("is-hidden", previousHiddenStates[index]);
  });

  return height;
};

const updateToolsVisibility = () => {
  if (!toolsGrid || !showMoreTools) {
    return;
  }

  const cards = toolsGrid.querySelectorAll(".tool-card");
  const hasMoreItems = cards.length > getToolLimit();

  applyToolsLimit(areToolsExpanded);
  toolsGrid.style.maxHeight = "";
  showMoreTools.hidden = !hasMoreItems;
  showMoreTools.textContent = areToolsExpanded ? "Daha Az Gör" : "Daha Fazla Gör";
  showMoreTools.setAttribute("aria-expanded", String(areToolsExpanded));
};

const scrollToolsSection = (toEnd) => {
  const toolsSection = document.querySelector("#yetenekler");

  if (!toolsSection) {
    return;
  }

  const rect = toolsSection.getBoundingClientRect();
  const targetTop = toEnd
    ? window.scrollY + rect.bottom - window.innerHeight + 24
    : window.scrollY + rect.top - 84;

  window.scrollTo({
    top: Math.max(0, targetTop),
    behavior: reduceMotionQuery.matches ? "auto" : "smooth",
  });
};

const animateToolsGrid = (shouldExpand) => {
  if (!toolsGrid) {
    return;
  }

  const startHeight = toolsGrid.scrollHeight;
  const endHeight = shouldExpand ? measureToolsHeight(true) : measureToolsHeight(false);

  toolsGrid.style.maxHeight = `${startHeight}px`;
  toolsGrid.offsetHeight;

  if (shouldExpand) {
    areToolsExpanded = true;
    applyToolsLimit(true);
  }

  if (showMoreTools) {
    showMoreTools.textContent = shouldExpand ? "Daha Az Gör" : "Daha Fazla Gör";
    showMoreTools.setAttribute("aria-expanded", String(shouldExpand));
  }

  requestAnimationFrame(() => {
    toolsGrid.style.maxHeight = `${endHeight}px`;
  });

  let transitionFinished = false;

  const finishTransition = () => {
    if (transitionFinished) {
      return;
    }

    transitionFinished = true;

    if (!shouldExpand) {
      areToolsExpanded = false;
      applyToolsLimit(false);
    }

    toolsGrid.style.maxHeight = "";
    updateToolsVisibility();
    scrollToolsSection(shouldExpand);
  };

  const onTransitionEnd = (event) => {
    if (event.target !== toolsGrid || event.propertyName !== "max-height") {
      return;
    }

    toolsGrid.removeEventListener("transitionend", onTransitionEnd);
    finishTransition();
  };

  toolsGrid.addEventListener("transitionend", onTransitionEnd);
  window.setTimeout(() => {
    toolsGrid.removeEventListener("transitionend", onTransitionEnd);
    finishTransition();
  }, 520);
};

const applyPanelLimit = (panel, isExpanded) => {
  const cards = Array.from(panel.querySelectorAll(".media-card"));
  const visibleLimit = getVisibleColumnCount() * 2;

  cards.forEach((card, index) => {
    card.classList.toggle("is-hidden", !isExpanded && index >= visibleLimit);
  });
};

const measurePanelHeight = (panel, isExpanded) => {
  const cards = Array.from(panel.querySelectorAll(".media-card"));
  const previousHiddenStates = cards.map((card) => card.classList.contains("is-hidden"));

  applyPanelLimit(panel, isExpanded);
  const height = panel.scrollHeight;

  cards.forEach((card, index) => {
    card.classList.toggle("is-hidden", previousHiddenStates[index]);
  });

  return height;
};

const updateShowMoreButton = () => {
  const activePanel = getActivePanel();

  if (!activePanel) {
    showMoreProjects.hidden = true;
    return;
  }

  const activeCards = activePanel.querySelectorAll(".media-card");
  const hasMoreItems = activeCards.length > getVisibleColumnCount() * 2;
  const isExpanded = expandedPanels.has(activePanel.id);
  showMoreProjects.hidden = !hasMoreItems;
  showMoreProjects.textContent = isExpanded ? "Daha Az Gör" : "Daha Fazla Gör";
  showMoreProjects.setAttribute("aria-expanded", String(isExpanded));
};

const updateProjectVisibility = () => {
  panels.forEach((panel) => {
    applyPanelLimit(panel, expandedPanels.has(panel.id));
    panel.style.maxHeight = "";
  });

  updateShowMoreButton();
};

const scrollProjectSection = (toEnd) => {
  const projectsSection = document.querySelector("#projeler");

  if (!projectsSection) {
    return;
  }

  const rect = projectsSection.getBoundingClientRect();
  const targetTop = toEnd
    ? window.scrollY + rect.bottom - window.innerHeight + 24
    : window.scrollY + rect.top - 84;

  window.scrollTo({
    top: Math.max(0, targetTop),
    behavior: reduceMotionQuery.matches ? "auto" : "smooth",
  });
};

const animateProjectPanel = (panel, shouldExpand) => {
  const startHeight = panel.scrollHeight;
  const endHeight = shouldExpand
    ? measurePanelHeight(panel, true)
    : measurePanelHeight(panel, false);

  panel.style.maxHeight = `${startHeight}px`;
  panel.offsetHeight;

  if (shouldExpand) {
    expandedPanels.add(panel.id);
    applyPanelLimit(panel, true);
  }

  updateShowMoreButton();

  requestAnimationFrame(() => {
    panel.style.maxHeight = `${endHeight}px`;
  });

  let transitionFinished = false;

  const finishTransition = () => {
    if (transitionFinished) {
      return;
    }

    transitionFinished = true;

    if (!shouldExpand) {
      expandedPanels.delete(panel.id);
      applyPanelLimit(panel, false);
    }

    panel.style.maxHeight = "";
    updateShowMoreButton();
    scrollProjectSection(shouldExpand);
  };

  const onTransitionEnd = (event) => {
    if (event.target !== panel || event.propertyName !== "max-height") {
      return;
    }

    panel.removeEventListener("transitionend", onTransitionEnd);
    finishTransition();
  };

  panel.addEventListener("transitionend", onTransitionEnd);
  window.setTimeout(() => {
    panel.removeEventListener("transitionend", onTransitionEnd);
    finishTransition();
  }, 520);
};

const closeModal = () => {
  const activeVideo = modalPreview.querySelector("video");

  if (activeVideo) {
    activeVideo.pause();
    activeVideo.removeAttribute("src");
    activeVideo.load();
  }

  modal.hidden = true;
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  modalPreview.replaceChildren();
  activeGallery = [];
  activeIndex = 0;
};

const renderModal = (card) => {
  modalPreview.replaceChildren();

  if (card.dataset.type === "video") {
    const video = document.createElement("video");
    video.controls = true;
    video.preload = "metadata";
    video.playsInline = true;
    video.src = card.dataset.src;
    modalPreview.append(video);
    video.load();
  } else if (card.dataset.src) {
    const image = document.createElement("img");
    image.src = card.dataset.src;
    image.alt = card.dataset.title || "";
    modalPreview.append(image);
  } else {
    const art = document.createElement("div");
    art.className = `modal-art ${card.dataset.visual || "visual-one"}`;
    modalPreview.append(art);
  }
};

const updateGalleryControls = () => {
  const hasMultipleItems = activeGallery.length > 1;
  modalPrev.hidden = !hasMultipleItems;
  modalNext.hidden = !hasMultipleItems;
};

const showGalleryItem = (index) => {
  if (!activeGallery.length) {
    return;
  }

  activeIndex = (index + activeGallery.length) % activeGallery.length;
  renderModal(activeGallery[activeIndex]);
  updateGalleryControls();
};

const openModal = (card) => {
  const panel = card.closest(".project-panel");
  activeGallery = panel ? Array.from(panel.querySelectorAll(".media-card:not(.is-hidden)")) : [card];
  activeIndex = Math.max(0, activeGallery.indexOf(card));
  showGalleryItem(activeIndex);
  modal.hidden = false;
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
};

tabs.forEach((tab) => {
  tab.addEventListener("click", () => openPanel(tab.dataset.panel));
});

mediaCards.forEach((card) => {
  card.addEventListener("click", () => openModal(card));
});

modalCloseButtons.forEach((button) => {
  button.addEventListener("click", closeModal);
});

modalPrev.addEventListener("click", () => showGalleryItem(activeIndex - 1));
modalNext.addEventListener("click", () => showGalleryItem(activeIndex + 1));

showMoreProjects.addEventListener("click", () => {
  const activePanel = getActivePanel();

  if (!activePanel) {
    return;
  }

  const shouldExpand = !expandedPanels.has(activePanel.id);

  if (reduceMotionQuery.matches) {
    if (shouldExpand) {
      expandedPanels.add(activePanel.id);
    } else {
      expandedPanels.delete(activePanel.id);
    }

    updateProjectVisibility();
    scrollProjectSection(shouldExpand);
    return;
  }

  animateProjectPanel(activePanel, shouldExpand);
});

showMoreTools?.addEventListener("click", () => {
  const shouldExpand = !areToolsExpanded;

  if (reduceMotionQuery.matches) {
    areToolsExpanded = shouldExpand;
    updateToolsVisibility();
    scrollToolsSection(shouldExpand);
    return;
  }

  animateToolsGrid(shouldExpand);
});

window.addEventListener("resize", () => {
  updateProjectVisibility();
  updateToolsVisibility();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.hidden) {
    closeModal();
  }

  if (event.key === "ArrowLeft" && !modal.hidden) {
    showGalleryItem(activeIndex - 1);
  }

  if (event.key === "ArrowRight" && !modal.hidden) {
    showGalleryItem(activeIndex + 1);
  }
});

updateProjectVisibility();
updateToolsVisibility();
