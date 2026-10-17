import { titles } from "./catalog.js?v=cinema-artwork";

    const groups = [
      { id: "trending", title: "Trending Now", select: item => item.match >= 94 },
      { id: "popular", title: "Popular on Afterglow", select: item => item.kind === "Film" },
      { id: "because", title: "Because You Watched The Last Light", select: item => ["Sci-Fi", "Adventure", "Mystery"].includes(item.genre) },
      { id: "my-list", title: "My List", select: item => myList.has(item.title) }
    ];
    const STORAGE_KEY = "afterglow.my-list";
    let toastTimeout;
    const myList = loadMyList();
    let activeView = "home";
    let activeGenre = "All";
    let searchQuery = "";
    let currentModalTitle = null;
    let previouslyFocusedElement = null;

    const shelves = document.getElementById("shelves");
    const emptyState = document.getElementById("emptyState");
    const modalBackdrop = document.getElementById("modalBackdrop");
    const searchWrap = document.getElementById("searchWrap");
    const searchInput = document.getElementById("searchInput");

    function loadMyList() {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        if (!Array.isArray(saved)) throw new TypeError("Saved list must be an array");
        const knownTitles = new Set(titles.map(item => item.title));
        return new Set(saved.filter(title => typeof title === "string" && knownTitles.has(title)));
      } catch (error) {
        console.error("Could not load your saved titles.", error);
        showToast("Your saved list could not be loaded.");
        return new Set();
      }
    }

    function saveMyList() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...myList]));
        return true;
      } catch (error) {
        console.error("Could not save your list.", error);
        showToast("Your list could not be saved on this device.");
        return false;
      }
    }

    function getVisibleTitles(items) {
      return items.filter(item => {
        const matchesView = activeView === "home"
          || (activeView === "series" && item.kind === "Series")
          || (activeView === "films" && item.kind === "Film")
          || (activeView === "my-list" && myList.has(item.title));
        const matchesGenre = activeGenre === "All" || item.genre === activeGenre;
        const matchesSearch = !searchQuery || `${item.title} ${item.genre} ${item.description}`.toLowerCase().includes(searchQuery);
        return matchesView && matchesGenre && matchesSearch;
      });
    }

    function renderShelves() {
      shelves.replaceChildren();
      let visibleCards = 0;
      const viewGroups = activeView === "series"
        ? [{ id: "series", title: "Series", select: item => item.kind === "Series" }]
        : activeView === "films"
          ? [{ id: "films", title: "Films", select: item => item.kind === "Film" }]
          : activeView === "my-list"
            ? [groups.find(group => group.id === "my-list")]
            : groups;
      viewGroups.forEach(group => {
        const items = getVisibleTitles(titles.filter(group.select));
        if (!items.length && group.id !== "my-list") return;
        visibleCards += items.length;
        const section = document.createElement("section");
        section.className = "shelf";
        section.id = group.id;
        section.innerHTML = `<div class="shelf-heading"><h2>${group.title}</h2><div class="row-controls"><button aria-label="Scroll ${group.title} left" data-scroll="-1">‹</button><button aria-label="Scroll ${group.title} right" data-scroll="1">›</button></div></div><div class="card-row"></div>`;
        const row = section.querySelector(".card-row");
        items.forEach(item => row.append(makeCard(item)));
        if (!items.length && group.id === "my-list") {
          const emptyMessage = document.createElement("p");
          emptyMessage.className = "empty-state visible";
          emptyMessage.textContent = myList.size
            ? "No saved titles match these filters."
            : "Your list is empty. Add titles with + My List to keep them close.";
          section.append(emptyMessage);
        }
        section.querySelectorAll("[data-scroll]").forEach(button => {
          button.addEventListener("click", () => row.scrollBy({ left: Number(button.dataset.scroll) * row.clientWidth * .8, behavior: "smooth" }));
        });
        shelves.append(section);
      });
      emptyState.classList.toggle("visible", visibleCards === 0 && activeView !== "my-list");
    }

    function makeCard(item) {
      const card = document.createElement("article");
      card.className = "card";
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", `More about ${item.title}`);
      card.innerHTML = `<div class="poster"><img class="poster-image" alt="" loading="lazy" decoding="async"><span class="poster-mark">${item.kind}</span><span class="poster-title"></span><span class="poster-action">View details <span aria-hidden="true">↗</span></span></div><div class="card-info"><p class="card-title">${item.genre} · ${item.kind}</p><p class="card-subtitle"><span class="match">${item.match}% Match</span> · ${item.year} · ${item.rating}</p></div>`;
      card.querySelector(".poster").style.setProperty("--poster", item.color);
      card.querySelector(".poster-image").src = item.image;
      card.querySelector(".poster-title").textContent = item.title;
      card.addEventListener("click", () => openDetails(item));
      card.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openDetails(item);
        }
      });
      return card;
    }

    function openDetails(item) {
      previouslyFocusedElement = document.activeElement;
      currentModalTitle = item;
      document.getElementById("modalTitle").textContent = item.title;
      document.getElementById("modalArt").style.setProperty("--poster", item.color);
      document.getElementById("modalArt").style.setProperty("--poster-image", `url("${new URL(item.image, document.baseURI).href}")`);
      document.getElementById("modalMatch").textContent = `${item.match}% Match`;
      document.getElementById("modalYear").textContent = item.year;
      document.getElementById("modalRating").textContent = item.rating;
      document.getElementById("modalGenre").textContent = `${item.genre} · ${item.kind}`;
      document.getElementById("modalDescription").textContent = item.description;
      updateListButton();
      modalBackdrop.classList.add("open");
      document.getElementById("modalClose").focus();
    }

    function closeDetails() {
      modalBackdrop.classList.remove("open");
      currentModalTitle = null;
      if (previouslyFocusedElement instanceof HTMLElement) previouslyFocusedElement.focus();
    }

    function updateListButton() {
      document.getElementById("modalList").textContent = myList.has(currentModalTitle.title) ? "✓ In My List" : "＋ My List";
    }

    function showToast(message) {
      const toast = document.getElementById("toast");
      toast.textContent = message;
      toast.classList.add("show");
      clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => toast.classList.remove("show"), 2300);
    }

    document.getElementById("genreBar").addEventListener("click", event => {
      const button = event.target.closest("[data-genre]");
      if (!button) return;
      if (activeView === "my-list") activeView = "home";
      activeGenre = button.dataset.genre;
      document.querySelectorAll(".genre-chip").forEach(chip => chip.classList.toggle("selected", chip === button));
      document.querySelectorAll(".nav-links a").forEach(link => link.classList.toggle("active", link.dataset.view === activeView));
      renderShelves();
    });

    document.getElementById("searchToggle").addEventListener("click", () => {
      searchWrap.classList.toggle("open");
      if (searchWrap.classList.contains("open")) searchInput.focus();
      else {
        searchInput.value = "";
        searchQuery = "";
        renderShelves();
      }
    });
    searchInput.addEventListener("input", () => {
      searchQuery = searchInput.value.trim().toLowerCase();
      renderShelves();
    });

    document.querySelector(".nav-links").addEventListener("click", event => {
      const link = event.target.closest("[data-view]");
      if (!link) return;
      event.preventDefault();
      activeView = link.dataset.view;
      document.querySelectorAll(".nav-links a").forEach(item => item.classList.toggle("active", item === link));
      activeGenre = "All";
      searchQuery = "";
      searchInput.value = "";
      document.querySelectorAll(".genre-chip").forEach(chip => chip.classList.toggle("selected", chip.dataset.genre === "All"));
      renderShelves();
      if (activeView === "my-list") document.getElementById("my-list").scrollIntoView({ behavior: "smooth" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    });
    document.getElementById("modalClose").addEventListener("click", closeDetails);
    modalBackdrop.addEventListener("click", event => { if (event.target === modalBackdrop) closeDetails(); });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && modalBackdrop.classList.contains("open")) closeDetails();
      if (event.key === "Tab" && modalBackdrop.classList.contains("open")) {
        const focusable = [...modalBackdrop.querySelectorAll("button:not([disabled])")];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
    document.getElementById("modalList").addEventListener("click", () => {
      if (!currentModalTitle) return;
      const title = currentModalTitle.title;
      const wasSaved = myList.has(title);
      if (myList.has(title)) {
        myList.delete(title);
      } else {
        myList.add(title);
      }
      if (!saveMyList()) {
        if (wasSaved) myList.add(title);
        else myList.delete(title);
      } else {
        showToast(wasSaved ? `${title} removed from My List` : `${title} added to My List`);
      }
      updateListButton();
      renderShelves();
    });
    document.getElementById("modalPlay").addEventListener("click", () => {
      if (currentModalTitle) showToast(`Preview for ${currentModalTitle.title} is coming soon`);
    });
    document.getElementById("heroPlay").addEventListener("click", () => showToast("The Last Light preview is coming soon"));
    document.getElementById("heroInfo").addEventListener("click", () => openDetails(titles[0]));
    document.getElementById("bellButton").addEventListener("click", () => showToast("You're all caught up"));
    document.getElementById("profileButton").addEventListener("click", () => showToast("You're watching as Alex"));

    renderShelves();
