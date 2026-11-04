(function () {
  function syncProcessIconChips() {
    var desktop = window.matchMedia("(min-width: 768px)").matches;
    var rows = document.querySelectorAll(".process-row");
    rows.forEach(function (row) {
      var chip = row.querySelector(".icon-chip");
      var copy = row.querySelector(".process-copy");
      if (!chip || !copy) return;

      chip.style.width = "";
      chip.style.minWidth = "";
      chip.style.height = "";
      row.style.removeProperty("--chip-size");

      if (!desktop) return;

      var size = Math.round(copy.getBoundingClientRect().height);
      if (size < 1) return;

      chip.style.width = size + "px";
      chip.style.minWidth = size + "px";
      chip.style.height = size + "px";
      row.style.setProperty("--chip-size", size + "px");
    });
  }

  var processList = document.querySelector(".process-list");
  if (processList && "ResizeObserver" in window) {
    var processObserver = new ResizeObserver(function () {
      syncProcessIconChips();
    });
    processList.querySelectorAll(".process-copy").forEach(function (copy) {
      processObserver.observe(copy);
    });
  }

  window.addEventListener("load", syncProcessIconChips);
  window.addEventListener("resize", syncProcessIconChips);
  syncProcessIconChips();

  var modelScroll = document.getElementById("model-scroll");
  var modelCopy = document.querySelector(".model-copy");

  function syncOverlayLabels() {
    if (!modelCopy || !modelScroll) return;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var stageBox = modelScroll.getBoundingClientRect();
    var stageVisible = stageBox.top < vh * 0.85 && stageBox.bottom > vh * 0.2;
    modelCopy.classList.toggle("is-visible", stageVisible);
  }

  syncOverlayLabels();
  window.addEventListener("scroll", syncOverlayLabels, { passive: true });
  window.addEventListener("resize", syncOverlayLabels);

  var menuToggle = document.getElementById("menu-toggle");
  var mobileNav = document.getElementById("site-menu");

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
      menuToggle.textContent = open ? "Close" : "Menu";
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileNav.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.textContent = "Menu";
      });
    });
  }

  var moreButton = document.getElementById("view-more");
  var extraWork = document.getElementById("work-extra");

  if (moreButton && extraWork) {
    moreButton.addEventListener("click", function () {
      var open = extraWork.classList.toggle("is-open");
      moreButton.setAttribute("aria-expanded", open ? "true" : "false");
      moreButton.textContent = open ? "Show less" : "Show more";
    });
  }

  var form = document.getElementById("quote-form");
  var success = document.getElementById("quote-success");
  var resetButton = document.getElementById("quote-reset");

  if (!form || !success) return;

  var alertBox = document.getElementById("form-alert");
  var alertList = document.getElementById("form-alert-list");
  var successTitle = document.getElementById("success-title");
  var fieldOrder = ["name", "address", "phone", "email", "description"];

  function clearErrors() {
    fieldOrder.forEach(function (field) {
      var input = document.getElementById(field);
      var error = document.getElementById(field + "-error");
      if (input) input.removeAttribute("aria-invalid");
      if (error) {
        error.textContent = "";
        error.classList.add("hidden");
      }
    });
    if (alertBox) alertBox.classList.add("hidden");
    if (alertList) alertList.innerHTML = "";
  }

  function showError(field, message) {
    var input = document.getElementById(field);
    var error = document.getElementById(field + "-error");
    if (input) input.setAttribute("aria-invalid", "true");
    if (error) {
      error.textContent = message;
      error.classList.remove("hidden");
    }
    return { field: field, message: message };
  }

  function validate() {
    var errors = [];
    var name = document.getElementById("name").value.trim();
    var address = document.getElementById("address").value.trim();
    var phone = document.getElementById("phone").value.trim();
    var email = document.getElementById("email").value.trim();
    var description = document.getElementById("description").value.trim();

    if (name.length < 2) {
      errors.push(showError("name", "Enter the name we should ask for."));
    }
    if (address.length < 5) {
      errors.push(
        showError("address", "Enter the property address so a visit has somewhere to land.")
      );
    }
    if (phone.replace(/\D/g, "").length < 10) {
      errors.push(showError("phone", "Enter a phone number with at least 10 digits."));
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push(
        showError("email", "That email looks incomplete. Clear it if a call is enough.")
      );
    }
    if (description.length > 600) {
      errors.push(showError("description", "Keep the note under 600 characters."));
    }

    return {
      errors: errors,
      values: {
        name: name,
        address: address,
        phone: phone,
        email: email,
        description: description,
      },
    };
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearErrors();
    var result = validate();

    if (result.errors.length) {
      if (alertBox && alertList) {
        alertBox.classList.remove("hidden");
        result.errors.forEach(function (entry) {
          var li = document.createElement("li");
          var a = document.createElement("a");
          a.href = "#" + entry.field;
          a.textContent = entry.message;
          li.appendChild(a);
          alertList.appendChild(li);
        });
      }
      var first = document.getElementById(result.errors[0].field);
      if (first) first.focus();
      return;
    }

    document.getElementById("success-name").textContent = result.values.name;
    document.getElementById("success-address").textContent = result.values.address;
    document.getElementById("success-phone").textContent = result.values.phone;
    document.getElementById("success-email").textContent =
      result.values.email || "Not provided";
    document.getElementById("success-note").textContent =
      result.values.description || "No note added.";

    form.classList.add("hidden");
    success.classList.remove("hidden");
    if (successTitle) successTitle.focus();
  });

  fieldOrder.forEach(function (field) {
    var input = document.getElementById(field);
    if (!input) return;
    input.addEventListener("input", function () {
      var error = document.getElementById(field + "-error");
      input.removeAttribute("aria-invalid");
      if (error) {
        error.textContent = "";
        error.classList.add("hidden");
      }
    });
  });

  if (resetButton) {
    resetButton.addEventListener("click", function () {
      form.reset();
      clearErrors();
      success.classList.add("hidden");
      form.classList.remove("hidden");
      document.getElementById("name").focus();
    });
  }
})();
