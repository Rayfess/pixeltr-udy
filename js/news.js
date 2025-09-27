$(document).ready(function () {
  const tabs = document.querySelectorAll(".tab");
  const contents = document.querySelectorAll(".content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // reset tab
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      const current = document.querySelector(".content.show.active");
      const target = document.getElementById(tab.dataset.target);

      if (current === target) return; // kalau klik tab yg sama

      if (current) {
        current.classList.remove("active");
        setTimeout(() => {
          current.classList.remove("show");
          current.style.display = "none";

          target.style.display = "grid";
          target.classList.add("show");
          setTimeout(() => target.classList.add("active"), 50);
        }, 600); // sesuai durasi transisi CSS
      } else {
        target.style.display = "grid";
        target.classList.add("show");
        setTimeout(() => target.classList.add("active"), 50);
      }
    });
  });

  //footer
  function animateFooter() {
    $(".animate-footer").each(function () {
      let position = $(this).offset().top;
      let scroll = $(window).scrollTop();
      let windowHeight = $(window).height();

      if (scroll + windowHeight - 100 > position) {
        $(this).addClass("visible");
      }
    });
  }

  // Panggil saat load dan scroll
  animateFooter();
  $(window).scroll(function () {
    animateFooter();
  });

  // Validasi form sederhana
  $("form").submit(function (e) {
    e.preventDefault();
    const email = $(this).find("input[type='email']").val();

    if (email === "") {
      alert("Silakan masukkan alamat email Anda");
      return;
    }

    if (!isValidEmail(email)) {
      alert("Silakan masukkan alamat email yang valid");
      return;
    }

    alert("Terima kasih! Anda telah berlangganan newsletter kami.");
    $(this).find("input[type='email']").val("");
  });

  function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  // Animasi untuk judul footer saat dihover
  $(".footer-title", ".main-title").hover(
    function () {
      $(this).css("transform", "translateY(-2px)");
    },
    function () {
      $(this).css("transform", "translateY(0)");
    }
  );
});
