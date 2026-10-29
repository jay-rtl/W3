const { gsap, ScrollTrigger } = window;

const header = document.querySelector("#site-header");
const menuButton = document.querySelector("#menu-toggle");
const nav = document.querySelector("#primary-nav");
const navLinks = [...nav.querySelectorAll("a")];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function updateHeader() { header.classList.toggle("scrolled", window.scrollY > 12); }
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

function closeMenu() {
  nav.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open menu");
}
menuButton.addEventListener("click", () => {
  const open = !nav.classList.contains("open");
  nav.classList.toggle("open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
});
navLinks.forEach(link => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", event => { if (event.key === "Escape") closeMenu(); });
document.addEventListener("click", event => {
  if (!nav.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
});
window.addEventListener("resize", () => { if (window.innerWidth > 900) closeMenu(); });

function setupMotion() {
  if (!gsap || !ScrollTrigger) return;
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  gsap.killTweensOf(".title-line, .hero-description, .hero-actions, .mockup, .reveal");
  if (reducedMotion.matches) {
    gsap.set(".title-line, .hero-description, .hero-actions, .mockup, .reveal", { clearProps: "all" });
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  gsap.from(".hero-eyebrow", { y: 16, opacity: 0, duration: .65, ease: "power2.out" });
  gsap.from(".title-line", { yPercent: 115, stagger: .11, duration: .85, ease: "power3.out", delay: .08 });
  gsap.from(".hero-description, .hero-actions", { y: 22, opacity: 0, stagger: .13, duration: .65, ease: "power2.out", delay: .38 });
  gsap.from(".mockup", { y: 42, opacity: 0, stagger: .13, duration: .9, ease: "power2.out", delay: .25 });
  document.querySelectorAll(".reveal").forEach((element) => {
    gsap.from(element, {
      y: 42, duration: .85, ease: "power2.out",
      scrollTrigger: { trigger: element, start: "top 91%", end: "top 65%", scrub: .85 }
    });
  });
  if (document.querySelector(".hero-monogram")) gsap.to(".hero-monogram", {
    y: 28, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1.2 }
  });
}
setupMotion();
reducedMotion.addEventListener("change", setupMotion);
window.addEventListener("load", () => ScrollTrigger?.refresh(), { once: true });

document.querySelector("#year").textContent = new Date().getFullYear();

const form = document.querySelector("#inquiry-form");
const status = document.querySelector("#form-status");
const prepared = document.querySelector("#prepared");
const preparedText = document.querySelector("#prepared-text");
const copyStatus = document.querySelector("#copy-status");
const fields = form ? [...form.querySelectorAll("input, select, textarea:not([readonly])")] : [];
const labels = { "full-name": "Full Name", email: "Email Address", business: "Business Name", service: "Service Needed", details: "Project Details" };

function fieldMessage(field) {
  const value = field.value.trim();
  if (field.required && !value) return `Enter ${labels[field.id].toLowerCase()}.`;
  if (field.id === "full-name" && value.length < 2) return "Enter at least 2 characters.";
  if (field.id === "email" && value && !field.validity.valid) return "Enter a valid email address.";
  if (field.id === "details" && value.length < 20) return "Please provide at least 20 characters.";
  return "";
}
function showFieldError(field) {
  const message = fieldMessage(field);
  field.toggleAttribute("aria-invalid", Boolean(message));
  field.setAttribute("aria-describedby", `${field.id}-error`);
  document.querySelector(`#${field.id}-error`).textContent = message;
  return message;
}
fields.forEach(field => field.addEventListener("input", () => {
  if (field.hasAttribute("aria-invalid")) showFieldError(field);
}));
form?.addEventListener("submit", event => {
  event.preventDefault();
  const invalid = fields.filter(showFieldError);
  if (invalid.length) {
    status.className = "form-status error";
    status.textContent = "Please correct the highlighted fields. No information has been sent.";
    invalid[0].focus();
    prepared.hidden = true;
    return;
  }
  const values = Object.fromEntries(new FormData(form));
  preparedText.value = [
    "W3 PROJECT INQUIRY",
    "",
    `Full Name: ${values.fullName.trim()}`,
    `Email Address: ${values.email.trim()}`,
    `Business Name: ${values.business.trim() || "Not provided"}`,
    `Service Needed: ${values.service}`,
    "",
    "Project Details:",
    values.details.trim()
  ].join("\n");
  prepared.hidden = false;
  status.className = "form-status ready";
  status.textContent = "Your brief is ready below. No message was sent or stored.";
  copyStatus.textContent = "";
  preparedText.focus();
});
document.querySelector("#copy-brief")?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(preparedText.value);
    copyStatus.textContent = "Brief copied. No message was sent.";
  } catch {
    preparedText.select();
    copyStatus.textContent = "Select and copy the brief above manually. No message was sent.";
  }
});
