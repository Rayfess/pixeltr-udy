$(document).ready(function () {
  // Membuat partikel efek
  function createParticles() {
    const particlesContainer = $("#particles");
    const particleCount = 12;

    for (let i = 0; i < particleCount; i++) {
      const particle = $('<div class="particle"></div>');
      const angle = (i / particleCount) * Math.PI * 2;
      const distance = 50 + Math.random() * 30;

      // Set posisi awal dan akhir partikel
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;

      particle.css({
        "--tx": `${tx}px`,
        "--ty": `${ty}px`,
        left: "50%",
        top: "50%",
        animationDelay: `${i * 0.1}s`,
      });

      particlesContainer.append(particle);
    }
  }

  createParticles();

  // Efek klik tombol
  $(".btn-heroPage").on("click", function () {
    // Tambahkan efek "ditekan"
    $(this).css("transform", "scale(0.95)");

    // Kembalikan setelah 150ms
    setTimeout(() => {
      $(this).css("transform", "");
    }, 150);
  });

  // Efek hover untuk ikon
  $(".button-wrapper").hover(
    function () {
      // Saat hover masuk
      $(this).find(".icon-circle").css({
        transform: "scale(1.1) rotate(15deg)",
        "box-shadow": "0 6px 15px rgba(255, 106, 0, 0.4)",
      });
    },
    function () {
      // Saat hover keluar
      $(this).find(".icon-circle").css({
        transform: "",
        "box-shadow": "0 4px 10px rgba(0, 0, 0, 0.2)",
      });
    }
  );
});
