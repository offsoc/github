document.addEventListener("DOMContentLoaded", function() {
  document.addEventListener("click", function(e) {
    var toggleElement = e.target.closest(".toggle");
    if (toggleElement) {
      toggleElement.closest(".expander").classList.toggle("expanded");
    }

    var selectMenuButton = e.target.closest(".package-list .select-menu-button");
    if (selectMenuButton) {
      selectMenuButton.closest(".select-menu").classList.toggle("active");
      e.preventDefault();
    }

    if (!e.target.closest("#package-jump-menu")) {
      document.getElementById("package-jump-menu").classList.remove("active");
    }
  });

  // load platform content if we're looking at the base content
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "/site/credits/_platform.html", true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      var data = xhr.responseText;
      var packages = new DOMParser().parseFromString(data, "text/html").querySelectorAll(".packages .section");
      var navs = new DOMParser().parseFromString(data, "text/html").querySelectorAll(".package-list .select-menu-item");

      packages.forEach(function(packageElement) {
        document.querySelector(".packages").appendChild(packageElement);
      });

      navs.forEach(function(navElement) {
        document.querySelector(".package-list .select-menu-list").appendChild(navElement);
      });
    }
  };
  xhr.send();

  document.getElementById('content').classList.remove('d-none');
  document.getElementById('loading').classList.add('d-none');
});
