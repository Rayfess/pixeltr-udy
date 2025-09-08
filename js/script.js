const tabs = document.querySelectorAll(".tab");
const contents = document.querySelectorAll(".content");

tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        const current = document.querySelector(".content.show.active");
        const target = document.getElementById(tab.dataset.target);
        if (current === target) return;
        if (current) {
            current.classList.remove("active");
            setTimeout(() => {
                current.classList.remove("show");
                current.style.display = "none";
                target.style.display = "grid";
                target.classList.add("show");
                setTimeout(() => target.classList.add("active"), 50);
            }, 600);
        } else {
            target.style.display = "grid";
            target.classList.add("show");
            setTimeout(() => target.classList.add("active"), 50);
        }
    });
});